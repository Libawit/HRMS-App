const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all leave types
exports.getLeaveTypes = async (req, res) => {
  try {
    const types = await prisma.leaveType.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(types);
  } catch (error) {
    console.error("Fetch Leave Error:", error);
    res.status(500).json({ message: "Failed to fetch leave types" });
  }
};

// POST create new leave type
exports.createLeaveType = async (req, res) => {
  try {
    const { name, color, description, requiresApproval, maxDays, accrual } = req.body;

    // Check if name already exists
    const existing = await prisma.leaveType.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "A leave type with this name already exists" });
    }

    const newLeave = await prisma.leaveType.create({
      data: {
        name,
        color,
        description,
        requiresApproval: Boolean(requiresApproval),
        maxDays: parseInt(maxDays) || 0,
        accrual
      }
    });

    res.status(201).json(newLeave);
  } catch (error) {
    console.error("Create Leave Error:", error);
    res.status(500).json({ message: "Internal server error while creating leave type" });
  }
};

// DELETE leave type
exports.deleteLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.leaveType.delete({ where: { id } });
    res.json({ message: "Leave type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete. It might be linked to employee records." });
  }
};

exports.updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.leaveType.update({
      where: { id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating leave type" });
  }
};