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
const leaveTypeRoutes = require('./src/routes/leaveTypeRoutes');
const leaveBalanceRoutes = require('./src/routes/leaveBalanceRoutes');
const leaveRequestRoutes = require('./src/routes/leaveRequestRoutes');
const documentRoutes = require('./src/routes/documentRoute');
const salaryRoutes = require('./src/routes/salaryRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');

const app = express();

/**
 * --- NGROK/LOCALTUNNEL BYPASS MIDDLEWARE ---
 * This header tells the tunnel service to skip the warning page.
 * This makes the camera open INSTANTLY for your users.
 */


// --- Middleware ---
app.use(helmet({
  // Allows the Telegram Mini App and images to load without security blocks
  crossOriginResourcePolicy: false,
}));
app.use(cors()); 

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Static File Serving ---
// Place your scan.html inside a folder named 'public' in your backend root
app.use(express.static(path.join(__dirname, 'public'))); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api/', limiter);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/auth', departmentRoutes);
app.use('/api/auth/positions', jobPositionRoutes);
app.use('/api/auth', leaveTypeRoutes);
app.use('/api/auth', leaveBalanceRoutes); 
app.use('/api/auth', leaveRequestRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/attendance', attendanceRoutes);

// --- Health Check ---
app.get('/', (req, res) => {
  res.status(200).json({ message: "HRMS Backend is running!" });
});

// --- Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 Server running on http://localhost:${PORT}
  📂 Static Uploads: http://localhost:${PORT}/uploads
  📂 Auth Routes:    http://localhost:${PORT}/api/auth
  📂 Dept Routes:    http://localhost:${PORT}/api/auth/departments
  📂 Job Routes:     http://localhost:${PORT}/api/auth/positions
  📂 Salaries:       http://localhost:${PORT}/api/salaries
  📂 Documents:      http://localhost:${PORT}/api/documents
  📂 Attendance:     http://localhost:${PORT}/api/attendance
  📂 Static Scanner:   http://localhost:${PORT}/scan.html
  📂 Static Uploads:   http://localhost:${PORT}/uploads
  📂 API Base:         http://localhost:${PORT}/api
  `);
});