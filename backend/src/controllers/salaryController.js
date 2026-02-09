const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- 1. GET ALL SALARIES (With Filters) ---
exports.getSalaries = async (req, res) => {
  try {
    const { month, year, departmentId, search } = req.query;

    let where = {};

    // 1. Handle Date Filters (Must be Integers)
    if (month !== undefined && month !== '') {
      where.month = parseInt(month);
    }
    if (year !== undefined && year !== '') {
      where.year = parseInt(year);
    }

    // 2. Handle Department Filter
    // Only apply if it's a valid ID and not the string "All"
    if (departmentId && departmentId !== 'All' && departmentId !== 'undefined') {
      where.departmentId = departmentId;
    }

    // 3. Handle Search Filter
    // Your schema has firstName and lastName, NOT name.
    if (search && search.trim() !== '') {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const salaries = await prisma.salary.findMany({
      where,
      include: {
        user: {
          select: { 
            firstName: true, 
            lastName: true, 
            employeeId: true 
          }
        },
        department: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(salaries);
  } catch (error) {
    // This will print the EXACT reason in your terminal/console
    console.error("CRITICAL PRISMA ERROR:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// --- 2. CREATE SALARY ENTRY ---
// --- 2. CREATE SALARY ENTRY ---
exports.createSalary = async (req, res) => {
  try {
    const { userId, amountBasic, amountBonus, deductions, month, year, status } = req.body;

    // 1. VALIDATION: Check if this employee already has a salary for this specific month/year
    const existingSalary = await prisma.salary.findFirst({
      where: {
        userId: userId,
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    if (existingSalary) {
      // This is the message that will show up in your 'toast.error' on the frontend
      return res.status(400).json({ 
        message: "This employee already has a salary record for the selected month and year." 
      });
    }

    // 2. Find the user to get their departmentId
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return res.status(404).json({ message: "Employee not found" });

    // 3. Calculate financial values
    const basic = parseFloat(amountBasic) || 0;
    const bonus = parseFloat(amountBonus) || 0;
    const deduct = parseFloat(deductions) || 0;
    const netPay = (basic + bonus) - deduct;

    // 4. Create the new record
    const newSalary = await prisma.salary.create({
      data: {
        userId,
        departmentId: user.departmentId,
        amountBasic: basic,
        amountBonus: bonus,
        deductions: deduct,
        netPay,
        month: parseInt(month),
        year: parseInt(year),
        status: status || 'PENDING'
      },
      include: {
        user: { 
          select: { 
            firstName: true, 
            lastName: true, 
            employeeId: true 
          } 
        },
        department: { select: { name: true } }
      }
    });

    res.status(201).json(newSalary);
  } catch (error) {
    // Standard error handling
    console.error("PRISMA CREATE ERROR:", error);
    res.status(500).json({ 
      message: "An error occurred while creating the record.", 
      error: error.message 
    });
  }
};

// --- 3. UPDATE SALARY ENTRY ---
exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountBasic, amountBonus, deductions, month, year, status } = req.body;

    const basic = parseFloat(amountBasic) || 0;
    const bonus = parseFloat(amountBonus) || 0;
    const deduct = parseFloat(deductions) || 0;
    const netPay = (basic + bonus) - deduct;

    const updatedSalary = await prisma.salary.update({
      where: { id },
      data: {
        amountBasic: basic,
        amountBonus: bonus,
        deductions: deduct,
        netPay,
        month: parseInt(month),
        year: parseInt(year),
        status: status || 'PENDING'
      },
      include: {
        user: { 
          select: { firstName: true, lastName: true, employeeId: true } 
        }
      }
    });

    res.status(200).json(updatedSalary);
  } catch (error) {
    console.error("PRISMA UPDATE ERROR:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.salary.delete({ where: { id } });
    res.status(200).json({ message: "Salary record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};