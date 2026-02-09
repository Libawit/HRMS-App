const { Telegraf, session, Markup } = require('telegraf');
const prisma = require('../config/db');
const attendanceController = require('../controllers/attendanceController');

// Ensure token exists
if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN missing in .env");
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

/**
 * CONFIGURATION: 
 * Put your scan.html URL here. Since you don't want ngrok,
 * host this simple file on GitHub Pages, Vercel, or your public IP.
 */
const SCANNER_URL = 'https://your-domain.com/scan.html'; 

/**
 * REUSABLE PUNCH HANDLER
 */
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
        console.error("Punch Error:", err);
        ctx.reply("❌ Server error during punch.");
    }
}

/**
 * COMMAND: /start
 */
bot.start(async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const stationPayload = ctx.startPayload; 

    try {
        const user = await prisma.user.findFirst({ where: { telegramId } });

        if (!user) {
            ctx.session = { step: 'WAITING_FOR_EMAIL', payload: stationPayload };
            return ctx.reply("Welcome! 🤖\nPlease enter your company email to link your account:");
        }

        if (stationPayload) {
            return await executePunch(ctx, user.id, stationPayload);
        }

        return ctx.reply(`✅ Linked as ${user.firstName}`, 
            Markup.keyboard([
                [Markup.button.webApp('🚀 Scan QR Code', SCANNER_URL)],
                ['My Status', 'Switch Account']
            ]).resize()
        );

    } catch (error) {
        ctx.reply("❌ Database connection error.");
    }
});

/**
 * TEXT HANDLER
 */
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    const telegramId = ctx.from.id.toString();

    if (ctx.session?.step === 'WAITING_FOR_EMAIL') {
        try {
            const targetUser = await prisma.user.findUnique({ where: { email: text.toLowerCase() } });
            if (!targetUser) return ctx.reply("❌ Email not found. Try again:");

            const updatedUser = await prisma.user.update({
                where: { email: text.toLowerCase() },
                data: { telegramId, telegramVerified: true }
            });

            const savedStation = ctx.session.payload;
            ctx.session = null; 
            
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

/**
 * NATIVE SCANNER DATA HANDLER
 * Triggered when scan.html sends data back
 */
bot.on('web_app_data', async (ctx) => {
    const stationId = ctx.message.web_app_data.data;
    const user = await prisma.user.findUnique({ where: { telegramId: ctx.from.id.toString() } });

    if (user) {
        await executePunch(ctx, user.id, stationId);
    } else {
        ctx.reply("❌ User not linked.");
    }
});

// Replace your current bot.launch() with this:
// Replace your old bot.launch() with this "Safe" version
bot.launch()
    .then(() => console.log('✅ Telegram Bot is Online'))
    .catch(err => {
        console.log('-------------------------------------------------------');
        console.log('⚠️ TELEGRAM BOT NOTICE:');
        console.log('Could not connect to Telegram. Your website will still work,');
        console.log('but the Bot will be offline. Check your network/VPN.');
        console.log('-------------------------------------------------------');
    });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;