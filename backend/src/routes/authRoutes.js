const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');

// 1. FAIL-SAFE: If storage is undefined, this stops the app from using the 'uploads' folder
if (!storage) {
  throw new Error("❌ CLOUDINARY STORAGE IS UNDEFINED. Check src/config/cloudinary.js exports and file paths.");
}

// This is the ONLY 'upload' variable you should have in this file
const upload = multer({ storage: storage }); 

const handleUpload = (field) => {
  const uploadMiddleware = upload.single(field);
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      // ... your existing error handling ...
      next();
    });
  };
};

// --- API ROUTES ---

// Registration (with Cloudinary image upload)
router.post('/register', handleUpload('profileImage'), authController.register);

// Authentication
router.post('/login', authController.login);

// Employee Management
router.get('/employees', protect, authController.getAllEmployees);
router.get('/search-users', authController.getAllUsersForSearch);

// Update Employee (with Cloudinary image upload)
router.patch('/employees/:id', handleUpload('profileImage'), authController.updateEmployee);

router.get('/employees/:id/history', protect, authController.getEmployeeHistory);

// Delete Employee
router.delete('/employees/:id', authController.deleteEmployee);

router.get('/me', protect, authController.getMe);
router.patch('/update-me', protect, handleUpload('profileImage'), authController.updateProfile);

router.get('/dashboard-stats', protect, authController.getDashboardStats);

// Metadata (For dropdowns)
router.get('/structure', authController.getStructureData);
router.get('/departments', protect, authController.getDepartments);
router.get('/positions', authController.getPositions);

module.exports = router;