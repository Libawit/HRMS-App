const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveTypeController');

// All paths here are prefixed with /api/admin in server.js
router.get('/leave-types', leaveController.getLeaveTypes);
router.post('/leave-types', leaveController.createLeaveType);
router.delete('/leave-types/:id', leaveController.deleteLeaveType);
router.put('/leave-types/:id', leaveController.updateLeaveType);

module.exports = router;