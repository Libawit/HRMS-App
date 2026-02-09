const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET Requests (Table View with Filters)
// Locate your getLeaveRequests function and update the include section:
exports.getLeaveRequests = async (req, res) => {
    const { month, year } = req.query;
    
    try {
        let whereClause = {};
        if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
            whereClause = {
                startDate: { gte: startOfMonth, lte: endOfMonth },
            };
        }

        const requests = await prisma.leaveRequest.findMany({
            where: whereClause,
            include: {
                user: { 
                    select: { 
                        firstName: true, 
                        lastName: true, 
                        email: true, 
                        employeeId: true,
                        departmentId: true // <--- ADD THIS LINE
                    } 
                },
                leaveType: { select: { name: true, color: true } },
            },
            orderBy: { appliedAt: 'desc' },
        });

        res.json(requests);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. GET Calendar Specific
// 2. GET Calendar Specific (Updated to include departmentId)
exports.getCalendarLeaves = async (req, res) => {
    try {
        const { year, month, status } = req.query;
        
        if (!year || !month) {
            return res.status(400).json({ error: "Year and Month are required." });
        }

        const yr = parseInt(year);
        const mo = parseInt(month);

        const startOfMonth = new Date(yr, mo - 1, 1);
        const endOfMonth = new Date(yr, mo, 0, 23, 59, 59, 999);

        // Build where clause based on status
        let whereClause = {
            AND: [
                { startDate: { lte: endOfMonth } },
                { endDate: { gte: startOfMonth } }
            ]
        };

        // If status is not 'ALL', filter by status (default to APPROVED if not specified)
        if (status !== 'ALL') {
            whereClause.status = status ? status.toUpperCase() : 'APPROVED';
        }

        const requests = await prisma.leaveRequest.findMany({
            where: whereClause,
            include: {
                user: { 
                    select: { 
                        firstName: true, 
                        lastName: true, 
                        departmentId: true // <--- IMPORTANT: Needed for Calendar Filtering
                    } 
                },
                leaveType: { select: { name: true, color: true } },
            }
        });

        res.status(200).json(requests);
    } catch (error) {
        console.error("PRISMA ERROR:", error); 
        res.status(500).json({ error: error.message });
    }
};

// 3. PATCH Status & Dates (The Fixed Update Logic)
exports.updateLeaveStatus = async (req, res) => {
    const { id } = req.params;
    // EXTRACT ALL FIELDS: Now receiving dates and daysRequested from the frontend
    const { status, startDate, endDate, daysRequested } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get the existing record to know the old 'daysRequested'
            const oldRequest = await tx.leaveRequest.findUnique({
                where: { id }
            });

            if (!oldRequest) throw new Error("Request not found");

            // 2. Update the Leave Request with new dates and status
            const updatedRequest = await tx.leaveRequest.update({
                where: { id },
                data: { 
                    status: status ? status.toUpperCase() : oldRequest.status,
                    startDate: startDate ? new Date(startDate) : oldRequest.startDate,
                    endDate: endDate ? new Date(endDate) : oldRequest.endDate,
                    daysRequested: daysRequested !== undefined ? daysRequested : oldRequest.daysRequested
                },
            });

            // 3. Handle Leave Balance adjustment
            // If it was already approved and is still approved, adjust for the difference in days
            if (updatedRequest.status === 'APPROVED') {
                const leaveYear = new Date(updatedRequest.startDate).getFullYear();
                
                // Calculate difference: new days - old days
                // If new is 5 and old was 3, we increment by 2.
                // If new is 2 and old was 5, increment by -3 (which decreases used).
                const diff = updatedRequest.daysRequested - (oldRequest.status === 'APPROVED' ? oldRequest.daysRequested : 0);

                await tx.leaveBalance.updateMany({
                    where: {
                        userId: updatedRequest.userId,
                        leaveTypeId: updatedRequest.leaveTypeId,
                        year: leaveYear,
                    },
                    data: { 
                        used: { increment: diff } 
                    },
                });
            }
            
            return updatedRequest;
        });

        res.json(result);
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(400).json({ error: error.message || "Update failed." });
    }
};

// 4. POST Create
exports.createLeaveRequest = async (req, res) => {
    try {
        const newRequest = await prisma.leaveRequest.create({
            data: {
                ...req.body,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
                appliedAt: new Date(),
            }
        });
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 5. DELETE Request
exports.deleteLeaveRequest = async (req, res) => {
    try {
        await prisma.leaveRequest.delete({ where: { id: req.params.id } });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};