const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

// Main routes: /api/salaries
router.route('/')
  .get(salaryController.getSalaries)
  .post(salaryController.createSalary);

// Individual routes: /api/salaries/:id
router.route('/:id')
  .patch(salaryController.updateSalary) 
  .delete(salaryController.deleteSalary);


module.exports = router;