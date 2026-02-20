const prisma = require('../config/db');

// --- 1. Get all records with filters & stats (Admin) ---
// --- 1. Get all records with filters & stats (Admin) ---
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, status, search, departmentId } = req.query;
    const { role, departmentId: userDeptId } = req.user; // Extract from protect middleware

    // Normalize dates
    const startOfDay = new Date(date || new Date());
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date || new Date());
    endOfDay.setHours(23, 59, 59, 999);

    // --- ENFORCEMENT LOGIC ---
    let finalDeptId = departmentId;

    // If user is a Manager, they are LOCKED to their own department.
    // Admin/HR can still use the departmentId from the query string.
    if (role === 'Manager') {
      finalDeptId = userDeptId;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        user: {
          // Use finalDeptId which is now role-aware
          ...(finalDeptId && finalDeptId !== 'All' ? { departmentId: finalDeptId } : {}),
          ...(search ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          } : {})
        },
        ...(status && status !== 'All Status' ? { status: status } : {})
      },
      include: { 
        user: { 
          include: { departmentRel: true } 
        } 
      },
      orderBy: { user: { firstName: 'asc' } }
    });

    // Format for Frontend
    const records = attendanceRecords.map(record => ({
      id: record.id,
      name: `${record.user.firstName} ${record.user.lastName}`,
      departmentName: record.user.departmentRel?.name || 'General',
      checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      workHours: record.workHours || 0,
      status: record.status,
      isPlaceholder: false 
    }));

    const stats = {
      presentToday: records.filter(r => ['On Time', 'Late', 'Half Day'].includes(r.status)).length,
      lateEntries: records.filter(r => r.status === 'Late').length,
      totalAbsent: records.filter(r => r.status === 'Absent').length,
      avgWorkDay: records.length > 0 
        ? (records.reduce((acc, curr) => acc + curr.workHours, 0) / records.length).toFixed(1) + 'h'
        : '0h'
    };

    res.json({ records, stats });

  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// --- 2. Manual Record Creation (HR/Admin) ---
exports.addManualRecord = async (req, res) => {
  try {
    let { employeeId, date, checkIn, checkOut, status, note } = req.body;

    // Safety: Map "Present" to "On Time" to match your DB schema
    if (status === "Present") status = "On Time";

    const checkDate = new Date(date);
    const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));

    // 1. Check for existing record
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        userId: employeeId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existingRecord) {
      return res.status(400).json({ 
        message: "Attendance already logged for this employee on this date." 
      });
    }

    // 2. Calculate Work Hours
    let hours = 0;
    let finalCheckIn = null;
    let finalCheckOut = null;

    if (status !== 'Absent' && checkIn && checkOut) {
      finalCheckIn = new Date(checkIn);
      finalCheckOut = new Date(checkOut);
      hours = parseFloat(((finalCheckOut - finalCheckIn) / 3600000).toFixed(2));
    }

    // 3. Create Record
    const newRecord = await prisma.attendance.create({
      data: {
        userId: employeeId,
        date: new Date(date),
        checkIn: finalCheckIn,
        checkOut: finalCheckOut,
        status: status, // "On Time", "Late", "Absent", "Half Day"
        notes: note,
        workHours: hours
      }
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("ADD ERROR:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// --- 3. Employee Check-In ---
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Define the "Late" threshold: 9:05 AM today
    const lateThreshold = new Date();
    lateThreshold.setHours(9, 5, 0, 0); 

    const existing = await prisma.attendance.findFirst({
      where: { 
        userId, 
        date: { gte: new Date().setHours(0,0,0,0) } 
      }
    });

    if (existing) return res.status(400).json({ message: "Already checked in" });

    const record = await prisma.attendance.create({
      data: {
        userId,
        date: new Date().setHours(0,0,0,0),
        checkIn: now,
        // If current time is > 9:05 AM, mark as Late, else On Time
        status: now > lateThreshold ? 'Late' : 'On Time'
      }
    });

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. Employee Check-Out ---
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const record = await prisma.attendance.findFirst({
      where: { userId, date: todayStart }
    });

    if (!record) return res.status(404).json({ message: "No check-in found" });

    const checkOutTime = new Date();
    const diffInMs = checkOutTime - new Date(record.checkIn);
    const hours = parseFloat((diffInMs / 3600000).toFixed(2));

    let finalStatus = record.status; // Keep 'Late' or 'On Time'
    
    // If they worked less than 4 hours, it's a Half Day regardless of arrival time
    if (hours < 4) {
      finalStatus = 'Half Day';
    }

    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOut: checkOutTime,
        workHours: hours,
        status: finalStatus
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 5. Get Today's Status ---
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

    if (!record) {
      return res.json({ checkIn: null, checkOut: null, workHours: 0 });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 6. Unified Punch Toggle (Fixed for Manual Sync) ---
exports.punch = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find any existing record for this employee today
    const existing = await prisma.attendance.findFirst({
      where: { 
        userId: userId, 
        date: {
          gte: today,
          lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    });

    // 2. LOGIC: If a record exists, we handle Punch-Out or Block
    if (existing) {
      // If the record already has a check-out, they are done for the day.
      if (existing.checkOut) {
        return res.status(400).json({ 
          message: "Attendance already logged for this employee on this date." 
        });
      }

      // If check-in exists but no check-out, perform Punch-Out
      const checkOutTime = new Date();
      const diffMs = checkOutTime - new Date(existing.checkIn);

      // Safety: Prevent accidental double-clicks (2 minute buffer)
      if (diffMs < 120000) { 
        return res.status(400).json({ 
          message: "Attendance already logged. Please wait before punching out." 
        });
      }

      const hours = parseFloat((diffMs / 3600000).toFixed(2));
      
      // Determine final status (e.g., maintain 'Late' or check for 'Half Day')
      let finalStatus = existing.status;
      if (hours < 4) finalStatus = 'Half Day';

      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkOut: checkOutTime,
          workHours: hours,
          status: finalStatus
        }
      });

      return res.json({ message: "Punched Out Successfully", record: updated });
    }

    // 3. SCENARIO: No record exists at all -> Perform "Punch In"
    const now = new Date();
    // 9:05 AM Threshold
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 5);
    
    const newRecord = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: now,
        status: isLate ? 'Late' : 'On Time'
      }
    });

    return res.json({ message: "Punched In Successfully", record: newRecord });

  } catch (error) {
    console.error("PUNCH ERROR:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
// --- 7. Update Record ---
exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, notes } = req.body;

    // 1. Handle Placeholder (temp-) records
    if (id.startsWith('temp-')) {
      const userId = id.replace('temp-', '');
      
      let workHours = 0;
      // Calculate hours only if it's not an Absent status
      if (status !== 'Absent' && checkIn && checkOut) {
        workHours = parseFloat(((new Date(checkOut) - new Date(checkIn)) / 3600000).toFixed(2));
      }

      const newRecord = await prisma.attendance.create({
        data: {
          userId: userId,
          date: new Date().setHours(0,0,0,0), // Defaults to today
          status: status || 'Absent',
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          workHours: workHours,
          notes: notes
        }
      });
      return res.json(newRecord);
    }

    // 2. Logic for existing records
    const existingRecord = await prisma.attendance.findUnique({ where: { id } });
    if (!existingRecord) return res.status(404).json({ message: "Record not found" });

    const data = { status, notes };
    
    // Set times to null if Absent, otherwise convert to Date objects
    if (status === 'Absent') {
      data.checkIn = null;
      data.checkOut = null;
      data.workHours = 0;
    } else {
      if (checkIn) data.checkIn = new Date(checkIn);
      if (checkOut) data.checkOut = new Date(checkOut);
      
      if (data.checkIn && data.checkOut) {
        data.workHours = parseFloat(((new Date(checkOut) - new Date(checkIn)) / 3600000).toFixed(2));
      }
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating record", error: error.message });
  }
};

// --- 8. Delete Record ---
exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.attendance.delete({ where: { id } });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 9. My Personal History ---
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

exports.triggerDailyCleanup = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

    const user = req.user; // From protect middleware
    const { departmentId } = req.body; // From the Manager frontend button

    // 1. Define Filter Criteria
    // If manager, we ONLY look for users in their department.
    // If admin/hr, we look for everyone (unless a specific deptId was passed).
    let userFilter = {};
    if (user.role === 'manager') {
      userFilter.departmentId = user.departmentId;
    } else if (departmentId) {
      userFilter.departmentId = departmentId;
    }

    // 2. Get the targeted users
    const targetUsers = await prisma.user.findMany({
      where: userFilter
    });

    // 3. Get userIds who already have a record for today (in the target group)
    const existingRecords = await prisma.attendance.findMany({
      where: {
        date: { gte: today, lte: endOfDay },
        userId: { in: targetUsers.map(u => u.id) }
      },
      select: { userId: true }
    });

    const presentUserIds = existingRecords.map(a => a.userId);

    // 4. Find users who are NOT in the present list
    const absentUsers = targetUsers.filter(u => !presentUserIds.includes(u.id));

    if (absentUsers.length === 0) {
      return res.json({ message: "No missing records to process for this scope." });
    }

    // 5. Create "Absent" records
    const absentData = absentUsers.map(u => ({
      userId: u.id,
      date: today,
      status: 'Absent',
      workHours: 0,
      notes: `Cleanup by ${user.role} (${user.name}) at ${new Date().toLocaleTimeString()}`
    }));

    await prisma.attendance.createMany({ data: absentData });

    res.json({ 
      message: `Cleanup successful. Created ${absentUsers.length} absent records.`,
      count: absentUsers.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cleanup failed", error: error.message });
  }
};

