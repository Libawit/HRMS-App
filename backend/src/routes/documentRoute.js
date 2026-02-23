const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // Import your Cloudinary config
const documentController = require('../controllers/documentController');

// 1. SAFETY CHECK: Ensure storage isn't undefined before creating the multer instance
if (!storage) {
  console.error("❌ Document Routes: Cloudinary storage is undefined!");
}

// 2. Configure Multer with Cloudinary Storage
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // PDF-only restriction for documents
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      // Using an Error object ensures your catch blocks in the controller handle this properly
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // Allowing up to 10MB for PDFs
});

// --- ROUTES ---

router.route('/')
  .get(documentController.getDocuments)
  // Ensure the frontend uses .append('file', yourFile)
  .post(upload.single('file'), documentController.createDocument); 

router.route('/:id')
  .patch(upload.single('file'), documentController.updateDocument)
  .delete(documentController.deleteDocument);

module.exports = router;