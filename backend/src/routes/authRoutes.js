const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');

// 1. Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Configure Storage for Profile Pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Unique filename: profile-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 3. File Filter (Restrict to Images)
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images (JPG, PNG, WebP) are allowed!"));
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB Limit
});

// --- HELPER MIDDLEWARE: Handle Multer Errors ---
// This prevents the app from crashing if the user uploads a file that's too big
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

// Registration (with image upload)
router.post('/register', handleUpload('profileImage'), authController.register);

// Authentication
router.post('/login', authController.login);

// Employee Management
router.get('/employees', authController.getAllEmployees);
router.get('/search-users', authController.getAllUsersForSearch);

// Update Employee (with image upload)
// 'profileImage' must match the key used in Frontend FormData.append('profileImage', file)
router.patch('/employees/:id', handleUpload('profileImage'), authController.updateEmployee);

router.get('/employees/:id/history', authController.getEmployeeHistory);

// Delete Employee
router.delete('/employees/:id', authController.deleteEmployee);

// Metadata (For dropdowns)
router.get('/departments', authController.getDepartments);
router.get('/positions', authController.getPositions);

module.exports = router;