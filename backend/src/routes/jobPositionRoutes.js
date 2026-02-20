const express = require('express');
const router = express.Router();
const jobPositionController = require('../controllers/jobPositionController');
const { protect } = require('../middleware/authMiddleware'); // Import the guard

// Use protect on the GET route
router.get('/', protect, jobPositionController.getPositions); 
router.post('/', protect, jobPositionController.createPosition);
router.put('/:id', protect, jobPositionController.updatePosition);
router.delete('/:id', protect, jobPositionController.deletePosition);

module.exports = router;