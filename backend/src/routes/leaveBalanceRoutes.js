// src/routes/leaveBalanceRoutes.js
const express = require('express');
const router = express.Router();
const leaveBalanceController = require('../controllers/leaveBalanceControllers');
const authController = require('../controllers/authController');

// This matches the call: /api/auth/leave-balances
router.get('/leave-balances', leaveBalanceController.getAllBalances);
router.post('/leave-balances', leaveBalanceController.createBalance);
router.get('/users', authController.getAllUsersForSearch);
router.delete('/leave-balances/:id', leaveBalanceController.deleteBalance);

module.exports = router;