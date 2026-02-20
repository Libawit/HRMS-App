const { Telegraf, session, Markup } = require('telegraf');
const prisma = require('../config/db');
const attendanceController = require('../controllers/attendanceController');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

const SCANNER_URL = 'https://libawit.github.io/HRMS/'; 
const DEFAULT_STATION = 'COMPANY-MAIN-STATION-001';

/**
 * KEYBOARDS
 */
const mobileMenu = () => Markup.keyboard([
    [Markup.button.webApp('🚀 Scan QR Code', SCANNER_URL)],
    ['📊 My Status', '💻 Use Desktop Mode'],
    ['🔄 Switch Account']
]).resize();

const desktopMenu = () => Markup.keyboard([
    ['⚡ Quick Punch In/Out'],
    ['📊 My Status', '📱 Use Mobile Mode'],
    ['🔄 Switch Account']
]).resize();

/**
 * REUSABLE PUNCH HANDLER
 * Modified to handle the strict manual record check
 */
async function executePunch(ctx, userId, stationId) {
    const req = { user: { id: userId }, body: { stationId: stationId } };
    
    // We create a mock response object to capture the controller's output
    const res = {
        statusCode: 200, // Default status
        status: function(code) {
            this.statusCode = code;
            return this;
        }, 
        json: function(data) {
            // Case 1: Blocked by logic (400 Bad Request)
            // This catches "Attendance already logged..." or "Please wait..."
            if (this.statusCode === 400) {
                return ctx.reply(`⚠️ *Action Denied*\n\n${data.message}`, { parse_mode: 'Markdown' });
            }

            // Case 2: Success (Punched In or Out)
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const isPunchIn = data.message.toLowerCase().includes('in');
            const icon = isPunchIn ? '🌅' : '🌇';
            const statusText = isPunchIn ? 'CHECKED IN' : 'CHECKED OUT';

            ctx.reply(`${icon} *${statusText} SUCCESSFUL*\n\n🕒 Time: \`${time}\`\n📍 Station: \`${stationId}\`\n\n${data.message}`, { parse_mode: 'Markdown' });
        }
    };

    try {
        await attendanceController.punch(req, res);
    } catch (err) {
        console.error("BOT PUNCH ERROR:", err);
        ctx.reply("❌ *Server Error*\nUnable to process punch at this time.", { parse_mode: 'Markdown' });
    }
}

/**
 * COMMAND: /start (Deep Linking Support)
 * If user scans the QR via standard camera, it opens: t.me/bot?start=STATION_ID
 */
bot.start(async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const startPayload = ctx.startPayload; // Captures STATION-001 from the QR link

    try {
        const user = await prisma.user.findFirst({ where: { telegramId } });

        if (!user) {
            ctx.session = { step: 'WAITING_FOR_EMAIL' };
            return ctx.reply("Welcome to the Employee Portal! 🤖\n\nPlease enter your *company email* to link your account:", { parse_mode: 'Markdown' });
        }

        // If user used the QR code directly to /start
        if (startPayload) {
            return await executePunch(ctx, user.id, startPayload);
        }

        return ctx.reply(`Welcome back, ${user.firstName}!`, mobileMenu());
    } catch (error) {
        ctx.reply("❌ Database error.");
    }
});

/**
 * TEXT HANDLER
 */
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const telegramId = ctx.from.id.toString();

    // 1. Link Account Logic
    if (ctx.session?.step === 'WAITING_FOR_EMAIL') {
        try {
            const email = text.toLowerCase().trim();
            const user = await prisma.user.findUnique({ where: { email } });
            
            if (!user) return ctx.reply("❌ Email not found. Please enter the email registered in the HR Portal:");

            const updated = await prisma.user.update({
                where: { email },
                data: { telegramId, telegramVerified: true }
            });

            ctx.session = null;
            return ctx.reply(`✅ Link Successful! Welcome ${updated.firstName}.`, mobileMenu());
        } catch (e) {
            return ctx.reply("❌ Error linking account. It might be already linked.");
        }
    }

    // 2. Mode Switchers
    if (text === '💻 Use Desktop Mode') return ctx.reply("Switched to Desktop Mode. Manual button enabled.", desktopMenu());
    if (text === '📱 Use Mobile Mode') return ctx.reply("Switched to Mobile Mode. QR Scanner enabled.", mobileMenu());

    // 3. Desktop Quick Punch
    if (text === '⚡ Quick Punch In/Out') {
        const user = await prisma.user.findFirst({ where: { telegramId } });
        if (user) return await executePunch(ctx, user.id, DEFAULT_STATION);
        else return ctx.reply("Please link your account first using /start");
    }

    // 4. Detailed Status
    if (text === '📊 My Status') {
        const user = await prisma.user.findFirst({ where: { telegramId } });
        if (!user) return ctx.reply("Link your account first.");

        const req = { user: { id: user.id } };
        const res = {
            status: () => res,
            json: (data) => {
                const checkIn = data.checkIn ? new Date(data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '---';
                const checkOut = data.checkOut ? new Date(data.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '---';
                const statusIcon = data.checkIn && !data.checkOut ? '🟢 Working' : '🔴 Off-Duty';
                
                ctx.reply(`📊 *Attendance Summary Today*\n\nStatus: ${statusIcon}\n🌅 *In:* \`${checkIn}\`\n🌇 *Out:* \`${checkOut}\`\n⏱ *Hours:* \`${data.workHours || 0}h\``, { parse_mode: 'Markdown' });
            }
        };
        await attendanceController.getTodayStatus(req, res);
    }

    if (text === '🔄 Switch Account') {
        await prisma.user.updateMany({
            where: { telegramId: telegramId },
            data: { telegramId: null, telegramVerified: false }
        });
        ctx.session = { step: 'WAITING_FOR_EMAIL' };
        ctx.reply("🔄 Account unlinked. Please enter the NEW company email to link:");
    }
});

/**
 * WEB APP DATA (QR SCAN)
 */
bot.on('web_app_data', async (ctx) => {
    const stationId = ctx.message.web_app_data.data;
    const user = await prisma.user.findFirst({ where: { telegramId: ctx.from.id.toString() } });
    if (user) await executePunch(ctx, user.id, stationId);
});

bot.launch().then(() => console.log("✅ Bot Started Successfully"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;