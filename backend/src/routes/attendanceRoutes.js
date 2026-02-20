const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
// Added 'manager' to the imports
const { protect, admin, manager } = require('../middleware/authMiddleware');

// --- SHARED MANAGEMENT ROUTES ---
// Now accessible by Managers, HR, and Admins to prevent 403 error
router.get('/', protect, manager, attendanceController.getAllAttendance);

// Allow Managers to manage records (Log Entry, Edit, Delete)
router.post('/manual', protect, manager, attendanceController.addManualRecord);
router.put('/:id', protect, manager, attendanceController.updateRecord);
router.delete('/:id', protect, manager, attendanceController.deleteRecord);


// --- EMPLOYEE SELF-SERVICE ---
router.get('/me/today', protect, attendanceController.getTodayStatus);
router.post('/punch', protect, attendanceController.punch);
router.post('/check-in', protect, attendanceController.checkIn);
router.post('/check-out', protect, attendanceController.checkOut);
router.get('/my-history', protect, attendanceController.getMyAttendance);


// --- STRICTLY ADMIN ROUTES ---
// This now allows Admins (on Admin page) AND Managers (on Manager page)
router.post('/cleanup', protect, manager, attendanceController.triggerDailyCleanup);


module.exports = router;