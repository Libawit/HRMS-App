const prisma = require('../config/db');

// --- 1. Get all records with filters & stats (Admin) ---

exports.getAllAttendance = async (req, res) => {
  try {
    const { date, status, search, departmentId } = req.query;
    
    // 1. Build the main where clause
    let where = {};

    // Date filtering (Matches schema.prisma: date is DateTime)
    if (date && date.trim() !== '') {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      where.date = {
        gte: dayStart,
        lte: dayEnd,
      };
    }

    // Status filtering
    if (status && status.trim() !== '' && status !== 'All Status') {
      where.status = status;
    }

    // 2. User-related filters (Handling departmentId and search)
    let userConditions = {};

    // Search filter
    if (search && search.trim() !== '') {
      userConditions.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Department filter (Matches schema.prisma: User -> departmentId)
    // IMPORTANT: We check if it's a non-empty string to avoid 500 errors
    if (departmentId && departmentId.trim() !== '' && departmentId !== 'All') {
      userConditions.departmentId = departmentId;
    }

    // Only apply user filter if there are conditions
    if (Object.keys(userConditions).length > 0) {
      where.user = userConditions;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          include: {
            departmentRel: true, // Use the name from your schema: departmentRel
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // 3. Transform for Frontend
    const formattedRecords = attendanceRecords.map((rec) => ({
      id: rec.id,
      name: `${rec.user?.firstName} ${rec.user?.lastName}`,
      email: rec.user?.email,
      departmentName: rec.user?.departmentRel?.name || 'General',
      date: rec.date.toISOString().split('T')[0],
      checkIn: rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      checkOut: rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      status: rec.status,
      workHours: rec.workHours || 0,
    }));

    // 4. Calculate Stats
    const stats = {
      presentToday: formattedRecords.filter(r => r.status === 'On Time' || r.status === 'Late').length,
      lateEntries: formattedRecords.filter(r => r.status === 'Late').length,
      totalAbsent: formattedRecords.filter(r => r.status === 'Absent').length,
      avgWorkDay: "8h" // Placeholder or calculate dynamically
    };

    res.json({ records: formattedRecords, stats });

  } catch (error) {
    console.error("PRISMA ERROR DETAILS:", error); // Check your terminal for this!
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
};
// --- 2. Manual Record Creation (HR/Admin) ---
// --- Manual Record Creation (With Single-Entry Enforcement) ---
exports.addManualRecord = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, note } = req.body;

    // 1. Define the start and end of the selected day for the check
    const checkDate = new Date(date);
    const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));

    // 2. CHECK: Does a record already exist for this user on this day?
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        userId: employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingRecord) {
      return res.status(400).json({ 
        message: "Attendance already logged for this employee on the selected date. Please edit the existing record instead." 
      });
    }

    // 3. Calculate work hours
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const hours = ((end - start) / 3600000).toFixed(2);

    // 4. Create the new record
    const newRecord = await prisma.attendance.create({
      data: {
        userId: employeeId,
        date: new Date(date),
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        status: status,
        notes: note,
        workHours: parseFloat(hours)
      }
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("ADD ERROR:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// --- 3. Employee Check-In (Self-service) ---
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0,0,0,0);

    const existing = await prisma.attendance.findFirst({
      where: { userId, date: today }
    });

    if (existing) return res.status(400).json({ message: "Already checked in today" });

    // Mark Late if after 09:05 AM
    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 5);

    const record = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: new Date(),
        status: isLate ? 'Late' : 'On Time'
      }
    });

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. Employee Check-Out (Self-service) ---
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0,0,0,0);

    const record = await prisma.attendance.findFirst({
      where: { userId, date: today }
    });

    if (!record) return res.status(404).json({ message: "No check-in found for today" });

    const checkOutTime = new Date();
    const hours = ((checkOutTime - new Date(record.checkIn)) / 3600000).toFixed(2);

    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOut: checkOutTime,
        workHours: parseFloat(hours)
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- Get Today's Status for the logged-in user ---
exports.getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        date: {
          gte: today,
          lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    });

    // If no record, return a default "empty" state instead of 404
    if (!record) {
      return res.json({ checkIn: null, checkOut: null, workHours: 0 });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Unified Punch Toggle (In/Out) ---
exports.punch = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check if record for today exists
    const existing = await prisma.attendance.findFirst({
      where: { userId, date: today }
    });

    // 2. If NO record exists -> Perform Check-In
    if (!existing) {
      const now = new Date();
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 5);
      
      const newRecord = await prisma.attendance.create({
        data: {
          userId,
          date: today,
          checkIn: new Date(),
          status: isLate ? 'Late' : 'On Time'
        }
      });
      return res.json({ message: "Punched In", record: newRecord });
    }

    // 3. If record exists but already has checkOut -> Block
    if (existing.checkOut) {
      return res.status(400).json({ message: "Already punched out for today." });
    }

    // 4. If record exists and no checkOut -> Perform Check-Out
    const checkOutTime = new Date();
    const hours = ((checkOutTime - new Date(existing.checkIn)) / 3600000).toFixed(2);

    const updated = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: checkOutTime,
        workHours: parseFloat(hours)
      }
    });

    res.json({ message: "Punched Out", record: updated });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Add these to attendanceController.js

// --- Update Record ---
exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, notes } = req.body;

    // 1. Fetch current record to get existing times if one isn't provided in req.body
    const existingRecord = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    const data = {};
    if (status) data.status = status;
    if (notes) data.notes = notes;
    
    // Convert to Date objects if provided, otherwise use existing
    const newCheckIn = checkIn ? new Date(checkIn) : existingRecord.checkIn;
    const newCheckOut = checkOut ? new Date(checkOut) : existingRecord.checkOut;

    if (checkIn) data.checkIn = newCheckIn;
    if (checkOut) data.checkOut = newCheckOut;

    // 2. Recalculate work hours using the final set of times
    if (newCheckIn && newCheckOut) {
      const start = new Date(newCheckIn);
      const end = new Date(newCheckOut);
      
      // Handle night shifts (if end time is before start time)
      let diffMs = end - start;
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; 

      data.workHours = parseFloat((diffMs / 3600000).toFixed(2));
    }

    // 3. Update the database
    const updated = await prisma.attendance.update({
      where: { id },
      data,
      include: {
        user: true // Optional: include user data for the response
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      details: error.message 
    });
  }
};

// --- Delete Record ---
exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.attendance.delete({
      where: { id }
    });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- 7. My Personal History ---
exports.getMyAttendance = async (req, res) => {
  try {
    const history = await prisma.attendance.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};