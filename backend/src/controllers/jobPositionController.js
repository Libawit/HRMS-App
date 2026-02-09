const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET ALL
// jobPositioncontroller.js

// GET ALL POSITIONS
// jobPositioncontroller.js

// jobPositionController.js

exports.getPositions = async (req, res) => {
    try {
        const positions = await prisma.jobPosition.findMany({
            // THIS IS THE CRITICAL MISSING PIECE
            include: {
                department: true 
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(positions);
    } catch (error) {
        console.error("Error fetching positions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// CREATE
exports.createPosition = async (req, res) => {
    try {
        const { title, type, salary, requirements, description, departmentId } = req.body;
        const newPos = await prisma.jobPosition.create({
            data: { 
                title, type, salary, requirements, description,
                department: { connect: { id: departmentId } }
            },
            include: { department: true }
        });
        res.status(201).json(newPos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// UPDATE (This is likely where your 'put' error is coming from)
exports.updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, salary, requirements, description, departmentId } = req.body;
        const updated = await prisma.jobPosition.update({
            where: { id },
            data: { 
                title, type, salary, requirements, description,
                department: { connect: { id: departmentId } }
            },
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