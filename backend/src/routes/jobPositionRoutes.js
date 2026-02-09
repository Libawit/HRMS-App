const express = require('express');
const router = express.Router();
const jobPositionController = require('../controllers/jobPositionController');

// Ensure these names match the "exports.name" in the controller exactly
router.get('/', jobPositionController.getPositions);
router.post('/', jobPositionController.createPosition);
router.put('/:id', jobPositionController.updatePosition); // <-- The crash was likely here
router.delete('/:id', jobPositionController.deletePosition);

module.exports = router;