const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET ALL

// src/controllers/jobPositionController.js

exports.getPositions = async (req, res) => {
    try {
        // --- PASTE THE DEBUG LOGS HERE ---
        console.log("--- DEBUG START ---");
        console.log("Logged User Role:", req.user?.role);
        console.log("Logged User DeptID:", req.user?.departmentId);
        console.log("--- DEBUG END ---");
        // ---------------------------------

        const userRole = req.user?.role?.toLowerCase() || '';
        const userDeptId = req.user?.departmentId;

        let whereClause = {};

        if (userRole === 'admin' || userRole === 'hr manager') {
            whereClause = {};
        } else {
            if (!userDeptId) {
                return res.json([]); 
            }
            whereClause = { departmentId: userDeptId };
        }

        const positions = await prisma.jobPosition.findMany({
            where: whereClause,
            include: {
                department: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(positions);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// CREATE
exports.createPosition = async (req, res) => {
    try {
        const { title, type, salary, requirements, description } = req.body;
        
        // Use the ID from the logged-in user, not the form
        const departmentId = req.user.role.toLowerCase() === 'admin' 
            ? req.body.departmentId 
            : req.user.departmentId;

        const newPos = await prisma.jobPosition.create({
            data: { 
                title, type, salary, requirements, description,
                department: { connect: { id: departmentId } }
            }
        });
        res.status(201).json(newPos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Optimized Backend updatePosition
exports.updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, salary, requirements, description, departmentId } = req.body;

        const dataToUpdate = { title, type, salary, requirements, description };

        // Only add the department connection if departmentId is actually sent
        if (departmentId) {
            dataToUpdate.department = { connect: { id: departmentId } };
        }

        const updated = await prisma.jobPosition.update({
            where: { id },
            data: dataToUpdate,
            include: { department: true }
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE
exports.deletePosition = async (req, res) => {
    try {
        await prisma.jobPosition.delete({ where: { id: req.params.id } });
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};