const express = require('express');
const router = express.Router();
const deptController = require('../controllers/deptController');
const { protect } = require('../middleware/authMiddleware'); // <--- CRITICAL for req.user

// GET all departments (Filtered by Role inside the controller)
router.get('/departments', protect, deptController.getAllDepartments);

router.get('/my-department', protect, deptController.getManagerDepartment);

// CREATE a new department
router.post('/departments', protect, deptController.createDepartment);

// UPDATE a department
router.put('/departments/:id', protect, deptController.updateDepartment);

// DELETE a department
router.delete('/departments/:id', protect, deptController.deleteDepartment);

module.exports = router;