const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// --- Start Telegram Bot ---
require('./src/services/telegramBot'); 

// --- Route Imports ---
const authRoutes = require('./src/routes/authRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const jobPositionRoutes = require('./src/routes/jobPositionRoutes');
const structureRoutes = require('./src/routes/structureRoutes');
const leaveTypeRoutes = require('./src/routes/leaveTypeRoutes');
const leaveBalanceRoutes = require('./src/routes/leaveBalanceRoutes');
const leaveRequestRoutes = require('./src/routes/leaveRequestRoutes');
const documentRoutes = require('./src/routes/documentRoute');
const salaryRoutes = require('./src/routes/salaryRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');

const app = express();

// --- 1. UPDATED HELMET FOR PRODUCTION ---
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      // Add your Vercel frontend URL here once you deploy it
      "frame-ancestors": ["'self'", "http://localhost:3000", "http://localhost:5173", "https://your-frontend.vercel.app"],
      "frame-src": ["'self'", "http://localhost:5000", "https://your-backend.vercel.app"],
      "script-src": ["'self'", "'unsafe-inline'"],
    },
  },
}));

// --- 2. UPDATED CORS FOR PRODUCTION ---
app.use(cors({
  origin: [
    "http://localhost:5173",           // Local development
    "https://your-frontend.vercel.app" // Placeholder for your future live site
  ], 
  credentials: true
})); 

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'public'))); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: (req, res) => {
    if (process.env.NODE_ENV === 'development') return 99999;
    return 100; 
  },
  standardHeaders: true, 
  legacyHeaders: false,
  message: "Too many requests, please try again later."
});
app.use('/api/', limiter);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/auth', departmentRoutes);
app.use('/api/positions', jobPositionRoutes);
app.use('/api/structure', structureRoutes);
app.use('/api/auth', leaveTypeRoutes);
app.use('/api/auth', leaveBalanceRoutes); 
app.use('/api/auth', leaveRequestRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: "HRMS Backend is running!" });
});

// --- 3. UPDATED SERVER STARTUP FOR VERCEL ---
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on http://localhost:${PORT}`);
  });
}

// CRITICAL: Export for Vercel
module.exports = app;