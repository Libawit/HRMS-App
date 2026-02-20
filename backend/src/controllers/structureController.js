const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// 1. Sync or Update an employee's place in the hierarchy
exports.getFullStructure = async (req, res) => {
  try {
    const { departmentId } = req.query; // Capture the filter from the URL

    // Build the filter object: 
    // If departmentId exists, filter the rows. If not, get everything (Admin mode).
    const filter = departmentId ? {
      OR: [
        { departmentId: departmentId },
        { employee: { departmentId: departmentId } }
      ]
    } : {};

    const structure = await prisma.organizationStructure.findMany({
      where: filter, // Apply the filter here
      include: {
        employee: {
          include: {
            departmentRel: true, 
            jobPositionRel: true  
          }
        },
        manager: {
          select: { 
            id: true,
            firstName: true, 
            lastName: true 
          }
        },
        department: true,
        jobPosition: true
      }
    });
    res.status(200).json(structure);
  } catch (error) {
    console.error("GET_STRUCTURE_ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Sync or Update - No changes needed to logic, 
// just ensure your Admin and Manager pages send the correct body.
exports.syncStructure = async (req, res) => {
  try {
    const { employeeId, managerId, departmentId, jobPositionId } = req.body;

    if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });
    if (employeeId === managerId) {
       return res.status(400).json({ message: "An employee cannot report to themselves." });
    }

    const employeeProfile = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { departmentId: true, jobPositionId: true }
    });

    if (!employeeProfile) return res.status(404).json({ message: "Employee profile not found" });

    if (managerId && managerId !== 'none') {
      const circularCheck = await prisma.organizationStructure.findFirst({
        where: { employeeId: managerId, managerId: employeeId }
      });

      if (circularCheck) {
        return res.status(400).json({ message: "Circular Reporting Error." });
      }

      const managerProfile = await prisma.user.findUnique({
        where: { id: managerId },
        select: { departmentId: true }
      });

      if (employeeProfile.departmentId !== managerProfile.departmentId) {
        return res.status(400).json({ message: "Manager and Employee must belong to the same department." });
      }
    }

    let finalDeptId = departmentId || employeeProfile.departmentId;
    let finalPosId = jobPositionId || employeeProfile.jobPositionId;

    const structure = await prisma.organizationStructure.upsert({
      where: { employeeId: employeeId },
      update: {
        managerId: managerId === 'none' ? null : managerId,
        departmentId: finalDeptId || undefined, // use undefined so Prisma doesn't overwrite if null
        jobPositionId: finalPosId || undefined,
      },
      create: {
        employeeId: employeeId,
        managerId: managerId === 'none' ? null : managerId,
        departmentId: finalDeptId || null,
        jobPositionId: finalPosId || null,
      },
    });

    res.status(200).json({ message: "Structure updated successfully", data: structure });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// 3. EDIT the full organization data
exports.updateReportingLine = async (req, res) => {
  try {
    const { employeeId, managerId, departmentId, jobPositionId } = req.body;

    if (!employeeId) return res.status(400).json({ message: "Employee ID is required." });

    // 1. Prevent self-reporting
    if (employeeId === managerId) {
      return res.status(400).json({ message: "An employee cannot report to themselves." });
    }

    // 2. Circular reference check
    if (managerId && managerId !== 'none') {
      const isManagerReportingToEmployee = await prisma.organizationStructure.findFirst({
        where: {
          employeeId: managerId,
          managerId: employeeId
        }
      });

      if (isManagerReportingToEmployee) {
        return res.status(400).json({ 
          message: "Hierarchy Error: The selected manager already reports to this employee." 
        });
      }
    }

    // 3. Logic for handling 'none' or null
    let managerValue = managerId;
    if (managerId === 'none' || !managerId) {
        managerValue = null;
    }

    // 4. Use UPSERT instead of UPDATE
    // This ensures that if an employee didn't have a manager before, a record is created.
    const updatedStructure = await prisma.organizationStructure.upsert({
      where: { employeeId: employeeId },
      update: {
        managerId: managerValue,
        departmentId: departmentId || undefined,
        jobPositionId: jobPositionId || undefined,
      },
      create: {
        employeeId: employeeId,
        managerId: managerValue,
        departmentId: departmentId || null,
        jobPositionId: jobPositionId || null,
      },
    });

    res.status(200).json({
      message: "Reporting line updated successfully",
      data: updatedStructure
    });

  } catch (error) {
    console.error("UPDATE_ERROR:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// 4. Remove a reporting relationship
exports.removeReportingLine = async (req, res) => {
  try {
    const { id } = req.params;

    // Use delete to actually remove the row from the organizationStructure table
    const deletedRecord = await prisma.organizationStructure.delete({
      where: { id: id }
    });

    console.log("Deleted Record:", deletedRecord); // Check your terminal for this!
    res.status(200).json({ message: "Relationship deleted successfully" });
  } catch (error) {
    console.error("DETAILED ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};