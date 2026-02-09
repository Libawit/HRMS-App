const prisma = require('../config/db');
const crypto = require('crypto');

// 1. Initiate Verification (User types email in bot)
exports.initiateTelegramVerify = async (req, res) => {
  const { email, telegramId } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "Employee email not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  await prisma.user.update({
    where: { email },
    data: { 
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10 * 60000) // 10 mins
    }
  });

  // SEND EMAIL LOGIC HERE (using nodemailer)
  console.log(`Sending OTP ${otp} to ${email}`); 

  res.json({ message: "OTP sent to your company email" });
};

// 2. Finalize Verification (User types OTP in bot)
exports.finalizeTelegramVerify = async (req, res) => {
  const { telegramId, otpCode } = req.body;

  const user = await prisma.user.findFirst({ where: { otpCode } });

  if (!user || user.otpExpires < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { 
      telegramId: telegramId.toString(),
      telegramVerified: true,
      otpCode: null 
    }
  });

  res.json({ message: "Account linked to Telegram successfully!" });
};

// 3. The Punch Action (Triggered when Bot scans the Web QR)
exports.processTelegramPunch = async (req, res) => {
  const { telegramId, qrData } = req.body; 

  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user || !user.telegramVerified) {
    return res.status(403).json({ message: "Unauthorized. Please verify your email first." });
  }

  // qrData will be "COMPANY-MAIN-STATION-001" from your frontend
  if (qrData !== "COMPANY-MAIN-STATION-001") {
    return res.status(400).json({ message: "Invalid Station QR" });
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  // Check if already checked in today
  let record = await prisma.attendance.findFirst({
    where: { userId: user.id, date: { gte: today } }
  });

  if (!record) {
    // PUNCH IN
    record = await prisma.attendance.create({
      data: {
        userId: user.id,
        checkIn: new Date(),
        status: "On Time", // Logic for "Late" can be added
      }
    });
    return res.json({ action: "IN", time: record.checkIn });
  } else {
    // PUNCH OUT
    const checkOutTime = new Date();
    const diff = (checkOutTime - new Date(record.checkIn)) / (1000 * 60 * 60); // Hours
    
    await prisma.attendance.update({
      where: { id: record.id },
      data: { 
        checkOut: checkOutTime,
        workHours: parseFloat(diff.toFixed(2))
      }
    });
    return res.json({ action: "OUT", time: checkOutTime });
  }
};