const { Telegraf, session, Markup } = require('telegraf');
const prisma = require('../config/db');
const attendanceController = require('../controllers/attendanceController');

if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN missing in .env");
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

// UPDATE THIS LINK to the one that worked in your browser
const SCANNER_URL = 'https://libawit.github.io/HRMS-Backend/public/scan.html';

async function executePunch(ctx, userId, stationId) {
    const req = { user: { id: userId }, body: { stationId: stationId } };
    const res = {
        status: () => res, 
        json: (data) => {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const icon = data.message.toLowerCase().includes('in') ? '🌅' : '🌇';
            ctx.reply(`${icon} ${data.message}\n🕒 Time: ${time}`);
        }
    };
    try {
        await attendanceController.punch(req, res);
    } catch (err) {
        ctx.reply("❌ Server error during punch.");
    }
}

// 1. /start Handler
bot.start(async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const stationPayload = ctx.startPayload; 

    try {
        const user = await prisma.user.findFirst({ where: { telegramId } });

        if (!user) {
            ctx.session = { step: 'WAITING_FOR_EMAIL', payload: stationPayload };
            // EXACT MESSAGE YOU REQUESTED
            return ctx.reply("Welcome! 🤖\nPlease enter your company email to link your account:");
        }

        return ctx.reply(`Welcome back, ${user.firstName}!`, 
            Markup.keyboard([
                [Markup.button.webApp('🚀 Scan QR Code', SCANNER_URL)],
                ['My Status', 'Switch Account']
            ]).resize()
        );

    } catch (error) {
        ctx.reply("❌ Database connection error.");
    }
});

// 2. Email & Text Handler
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    const telegramId = ctx.from.id.toString();

    if (ctx.session?.step === 'WAITING_FOR_EMAIL') {
        try {
            const targetUser = await prisma.user.findUnique({ where: { email: text.toLowerCase() } });
            
            if (!targetUser) {
                return ctx.reply("❌ Email not found. Please enter your registered company email:");
            }

            const updatedUser = await prisma.user.update({
                where: { email: text.toLowerCase() },
                data: { telegramId, telegramVerified: true }
            });

            const savedStation = ctx.session.payload;
            ctx.session = null; 
            
            // EXACT SUCCESS MESSAGE AND BUTTON YOU REQUESTED
            await ctx.reply(`✅ Link Successful! Welcome ${updatedUser.firstName}.`, 
                Markup.keyboard([
                    [Markup.button.webApp('🚀 Scan QR Code', SCANNER_URL)],
                    ['My Status', 'Switch Account']
                ]).resize()
            );

            if (savedStation) await executePunch(ctx, updatedUser.id, savedStation);

        } catch (error) {
            ctx.reply("❌ Error linking account.");
        }
        return;
    }

    if (text === 'My Status') {
        const user = await prisma.user.findUnique({ where: { telegramId } });
        if (!user) return ctx.reply("Please link first.");
        
        const req = { user: { id: user.id } };
        const res = {
            status: () => res,
            json: (data) => {
                const time = data.checkIn ? new Date(data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';
                ctx.reply(data.checkIn ? `✅ Status: Punched In (${time})` : "❌ Not Punched In");
            }
        };
        await attendanceController.getTodayStatus(req, res);
    }

    if (text === 'Switch Account') {
        ctx.session = { step: 'WAITING_FOR_EMAIL' };
        ctx.reply("Please enter the NEW email:");
    }
});

// 3. WebApp Data Handler (Receives QR data from scan.html)
bot.on('web_app_data', async (ctx) => {
    const stationId = ctx.message.web_app_data.data;
    const user = await prisma.user.findUnique({ where: { telegramId: ctx.from.id.toString() } });
    if (user) await executePunch(ctx, user.id, stationId);
});

bot.launch().catch(err => console.error("Launch Error:", err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;