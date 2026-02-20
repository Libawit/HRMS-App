const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');

const fs = require('fs');
const uploadDir = 'uploads';

// The "Shield": Only attempt to create the folder if NOT on Vercel
if (!fs.existsSync(uploadDir)) {
    if (process.env.NODE_ENV !== 'production') {
        fs.mkdirSync(uploadDir);
    }
}

// 1. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    // Save file with timestamp to avoid name collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  }
});

// 2. Apply middleware to the POST route
router.route('/')
  .get(documentController.getDocuments)
  .post(upload.single('file'), documentController.createDocument); // 'file' matches the frontend key


router.route('/:id')
  .patch(upload.single('file'), documentController.updateDocument) // 'file' matches the frontend key
  .delete(documentController.deleteDocument);

module.exports = router;