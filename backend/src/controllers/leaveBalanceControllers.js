const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



// --- Get All Balances (Year-based) ---
exports.getAllBalances = async (req, res) => {
  try {
    const { year } = req.query;
    const filterYear = year ? parseInt(year) : new Date().getFullYear();

    const balances = await prisma.leaveBalance.findMany({
      where: {
        year: filterYear,
      },
      include: {
        user: true, // This pulls the user record, which contains the departmentId
        leaveType: true 
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    });

    const formattedBalances = balances.map(b => ({
      id: b.id,
      userId: b.userId,
      // CRITICAL: We must pass the departmentId from the user object 
      // so the frontend filter can see it, just like in your Salary logic.
      departmentId: b.user.departmentId, 
      leaveTypeId: b.leaveTypeId,
      name: `${b.user.firstName} ${b.user.lastName}`,
      email: b.user.email,
      type: b.leaveType.name,
      color: b.leaveType.color || '#7c3aed',
      alloc: b.allocated, 
      used: b.used,        
      avail: b.allocated - b.used,
      carry: b.carryOver, 
      year: b.year
    }));

    res.status(200).json(formattedBalances);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ error: "Failed to fetch balances" });
  }
};



// --- Create/Update Balance (Upsert) ---
exports.createBalance = async (req, res) => {
  try {
    const { userId, leaveTypeId, year, allocated, used, carriedOver } = req.body;

    const targetYear = parseInt(year);

    const result = await prisma.leaveBalance.upsert({
      where: {
        userId_leaveTypeId_year: {
          userId,
          leaveTypeId,
          year: targetYear,
        }
      },
      update: {
        allocated: parseFloat(allocated) || 0,
        used: parseFloat(used) || 0,
        carryOver: parseFloat(carriedOver) || 0
        // We don't update 'month' here because it's part of the initial record
      },
      create: {
        userId,
        leaveTypeId,
        year: targetYear,
        month: 0, // IMPORTANT: Added this to prevent the 500 error since it's required in your schema
        allocated: parseFloat(allocated) || 0,
        used: parseFloat(used) || 0,
        carryOver: parseFloat(carriedOver) || 0
      }
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("UPSERT ERROR:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "A balance for this year already exists for this user." });
    }
    res.status(500).json({ error: "Database error: " + error.message });
  }
};

// --- Delete Balance ---
exports.deleteBalance = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({ error: "No ID provided" });
    }

    await prisma.leaveBalance.delete({
      where: { id: id }
    });

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: "Failed to delete: " + error.message });
  }
};