const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- ADMIN ROUTES ---
// Fetch all records with filters (Date, Status, Search)
router.get('/', protect, admin, attendanceController.getAllAttendance);

// Manual record creation/modification by HR
router.post('/manual', protect, admin, attendanceController.addManualRecord);
router.put('/:id', protect, admin, attendanceController.updateRecord);
router.delete('/:id', protect, admin, attendanceController.deleteRecord);

// --- EMPLOYEE SELF-SERVICE ---

router.get('/me/today', protect, attendanceController.getTodayStatus);
router.post('/punch', protect, attendanceController.punch);
// Check-in for the current day
router.post('/check-in', protect, attendanceController.checkIn);

// Check-out for the current day
router.post('/check-out', protect, attendanceController.checkOut);

// Get my personal attendance history
router.get('/my-history', protect, attendanceController.getMyAttendance);

module.exports = router;