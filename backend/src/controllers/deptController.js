const prisma = require('../config/db');

// --- GET ALL DEPARTMENTS (Hierarchical Data) ---
exports.getAllDepartments = async (req, res) => {
  try {
    const depts = await prisma.department.findMany({
      include: {
        // Get the parent's name for the table view
        parent: { 
          select: { id: true, name: true } 
        },
        // Get immediate children for tree traversal
        subDepts: {
          select: { id: true, name: true, manager: true }
        },
        // Get users assigned to this specific department
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            // Deep link to get their job title
            jobPositionRel: { 
              select: { title: true } 
            }
          }
        },
        // Meta-data for the UI count badges
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(depts);
  } catch (error) {
    console.error("Fetch Structure Error:", error);
    res.status(500).json({ message: "Failed to fetch organizational structure" });
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