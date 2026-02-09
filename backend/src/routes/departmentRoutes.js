// routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/db'); // Path to your prisma client
const deptController = require('../controllers/deptController');

router.post('/departments', async (req, res) => {
  try {
    const { name, description, manager, parentId } = req.body;

    const newDept = await prisma.department.create({
      data: {
        name,
        description,
        manager,
        // If parentId is an empty string, Prisma will fail unless you set it to null
        parentId: parentId || null, 
      }
    });

    res.status(201).json(newDept);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Could not create department. Check if name exists." });
  }
});


// PUT /api/auth/departments/:id
router.put('/departments/:id', async (req, res) => {
  const { id } = req.params;
  const { name, parentId, manager, description } = req.body;

  try {
    // 1. Basic Validation: Ensure we aren't creating a circular reference
    if (parentId && parentId === id) {
      return res.status(400).json({ message: "A department cannot be its own parent." });
    }

    // 2. Update Database (Example using Prisma)
    const updatedDepartment = await prisma.department.update({
      where: { id: id },
      data: {
        name,
        parentId: parentId || null, // Ensure empty parent is null
        manager,
        description
      }
    });

    res.json(updatedDepartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update department" });
  }
});

router.get('/departments', deptController.getAllDepartments);
router.post('/departments', deptController.createDepartment);
router.delete('/departments/:id', deptController.deleteDepartment);

module.exports = router;