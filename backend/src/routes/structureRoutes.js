const express = require('express');
const router = express.Router();
const structureController = require('../controllers/structureController');
// Import your auth middleware if you have one
// const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get all structure data
router.get('/', structureController.getFullStructure);

// Sync hierarchy (Update or Create)
router.post('/sync', structureController.syncStructure); 

// Remove manager assignment (Set managerId to null)
router.delete('/:id', structureController.removeReportingLine);
router.put('/:id', structureController.updateReportingLine);

module.exports = router;