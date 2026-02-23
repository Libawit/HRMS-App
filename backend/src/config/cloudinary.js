const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the folder and resource type based on file extension
    const isPDF = file.mimetype === 'application/pdf';
    
    return {
      folder: 'hrms_uploads',
      // 'auto' allows Cloudinary to detect if it's an image or a PDF
      resource_type: 'auto', 
      // Allowed formats for both use cases
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
      // Optional: Give PDFs specific flags if needed
      flags: isPDF ? 'attachment' : undefined 
    };
  },
});

module.exports = { cloudinary, storage };