const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // Import your Cloudinary config
const documentController = require('../controllers/documentController');

// 1. Configure Multer with Cloudinary Storage
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Keep your PDF-only restriction for documents
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // PDFs can be large, allowing up to 10MB
});

// --- ROUTES ---

router.route('/')
  .get(documentController.getDocuments)
  // 'file' matches the key used in your Frontend FormData.append('file', ...)
  .post(upload.single('file'), documentController.createDocument); 

router.route('/:id')
  .patch(upload.single('file'), documentController.updateDocument)
  .delete(documentController.deleteDocument);

module.exports = router;