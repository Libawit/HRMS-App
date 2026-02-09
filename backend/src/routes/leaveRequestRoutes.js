const express = require('express');
const leaveRequestController = require('../controllers/leaveRequestController');
const router = express.Router();


router.get('/leave-requests/calendar', leaveRequestController.getCalendarLeaves);

router.get('/leave-requests', leaveRequestController.getLeaveRequests);

router.post('/leave-requests', leaveRequestController.createLeaveRequest);

router.patch('/leave-requests/:id/status', leaveRequestController.updateLeaveStatus);  
router.delete('/leave-requests/:id', leaveRequestController.deleteLeaveRequest);

module.exports = router;