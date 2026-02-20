const prisma = require('../config/db');

// --- GET ALL DEPARTMENTS (Hierarchical Data) ---

exports.getAllDepartments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const userDeptId = req.user.departmentId;

    let whereClause = {};

    if (userRole !== 'admin' && userRole !== 'hr manager') {
      if (!userDeptId) return res.json([]);
      whereClause = { id: userDeptId };
    }

    const depts = await prisma.department.findMany({
      where: whereClause,
      include: {
        parent: { select: { name: true } },
        _count: { select: { users: true } }
      }
    });

    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- CREATE DEPARTMENT ---
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, manager, managerId, parentId } = req.body;
    
    const newDept = await prisma.department.create({
      data: {
        name,
        description,
        manager,
        managerId,
        // Ensure "No Parent" or empty strings are saved as null
        parentId: (parentId && parentId !== 'No Parent' && parentId !== "") ? parentId : null
      }
    });
    res.status(201).json(newDept);
  } catch (error) {
    res.status(400).json({ message: "Department name must be unique", error: error.message });
  }
};

// --- UPDATE DEPARTMENT ---
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, manager, managerId, parentId } = req.body;

    // Safety: Prevent a department from being its own parent
    if (parentId === id) {
      return res.status(400).json({ message: "Circular reference: A department cannot be its own parent." });
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name,
        description,
        manager,
        managerId,
        parentId: (parentId && parentId !== 'No Parent' && parentId !== "") ? parentId : null
      }
    });
    res.json(updated);
  } catch (error) {
    console.error("Update Dept Error:", error);
    res.status(400).json({ message: "Update failed. Ensure the ID is valid and name is unique." });
  }
};

// --- DELETE DEPARTMENT ---
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department has children to avoid orphaned records
    const hasChildren = await prisma.department.findFirst({
      where: { parentId: id }
    });

    if (hasChildren) {
      return res.status(400).json({ 
        message: "This department has sub-units. Please move or delete sub-units first." 
      });
    }

    await prisma.department.delete({ where: { id } });
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Delete Dept Error:", error);
    res.status(500).json({ 
      message: "Cannot delete department while it contains employees. Reassign them first." 
    });
  }
};

exports.getManagerDepartment = async (req, res) => {
  try {
    // 1. req.user comes from 'protect' middleware
    const userRole = req.user.role.toLowerCase();
    const userDeptId = req.user.departmentId;

    // 2. If Admin, show everything
    if (userRole === 'admin') {
      const allDepts = await prisma.department.findMany({
        include: { parent: true, _count: { select: { users: true } } }
      });
      return res.json(allDepts);
    }

    // 3. If Manager, ONLY show their assigned department
    if (!userDeptId) {
      return res.status(404).json({ message: "No department assigned to this manager" });
    }

    const myDept = await prisma.department.findMany({
      where: { id: userDeptId }, // This is the filter!
      include: {
        parent: { select: { name: true } },
        _count: { select: { users: true } }
      }
    });

    res.json(myDept);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};