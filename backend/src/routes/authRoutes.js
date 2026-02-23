const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');// Import your Cloudinary config

// 1. Configure Multer with Cloudinary Storage
// No more local 'uploads' folder logic needed!
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (JPG, PNG, WebP) are allowed!"));
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB Limit
});

// --- HELPER MIDDLEWARE: Handle Multer Errors ---
const handleUpload = (field) => {
  const uploadMiddleware = upload.single(field);
  
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File is too large. Max limit is 2MB." });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
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