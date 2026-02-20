const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// --- HELPER: CONSTRUCT URL ---
const getFileUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// --- HELPER: CREATE AUDIT LOG ---
// This internal helper ensures we can track events without repeating code
const createAuditLog = async (userId, action, description, category = "GENERAL") => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        description,
        category,
        performedBy: "System Admin" 
      }
    });
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
};

// --- LOGIN LOGIC ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        departmentRel: true,
        jobPositionRel: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    const token = jwt.sign(
  { id: user.id, role: user.role }, // This "role" is frozen in the token
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage, 
        department: user.departmentRel?.name || "Unassigned",
        jobPosition: user.jobPositionRel?.title || "No Position"
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- REGISTER LOGIC ---
exports.register = async (req, res) => {
  try {
    const { 
      email, password, firstName, lastName, employeeId, 
      role, departmentId, jobPositionId, dateOfBirth, gender,
      nationalId, maritalStatus, workPhone, address,
      emergencyContactName, emergencyRelationship, emergencyPhone,
      hireDate, allowLogin
    } = req.body;

    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { employeeId }, { nationalId }] }
    });

    if (existing) {
        if (req.file) fs.unlinkSync(req.file.path); 
        return res.status(400).json({ message: 'Email, Employee ID, or National ID already exists' });
    }

    let profileImageUrl = null;
    if (req.file) {
      profileImageUrl = getFileUrl(req, req.file.filename);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        employeeId,
        profileImage: profileImageUrl, 
        role: role || 'Employee',
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        hireDate: hireDate ? new Date(hireDate) : null,
        nationalId,
        maritalStatus,
        workPhone,
        address,
        emergencyContactName,
        emergencyRelationship,
        emergencyPhone,
        isActive: allowLogin === 'true' || allowLogin === true,
        departmentRel: (departmentId && departmentId !== "null" && departmentId !== "") 
          ? { connect: { id: departmentId } } 
          : undefined,
        jobPositionRel: (jobPositionId && jobPositionId !== "null" && jobPositionId !== "") 
          ? { connect: { id: jobPositionId } } 
          : undefined
      }
    });

    // --- AUTOMATIC HISTORY LOGS ---
    await createAuditLog(newUser.id, "Record Created", "New employee profile added to system", "SECURITY");
    if (hireDate) {
      await createAuditLog(newUser.id, "Hire Date", `Official start date recorded as ${new Date(hireDate).toDateString()}`, "CAREER");
    }

    res.status(201).json({ message: 'Employee Created Successfully!', user: newUser });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("REGISTRATION ERROR:", error); 
    res.status(400).json({ message: 'Registration failed', detail: error.message });
  }
};

// --- GET ALL EMPLOYEES ---
exports.getAllEmployees = async (req, res) => {
  try {
    let whereClause = {};

    // 1. ROLE-BASED ACCESS CONTROL
    // If the user is an ADMIN, the whereClause remains {} (unfiltered).
    
    if (req.user && req.user.role === 'Manager') {
      // MANAGER LOGIC: Filter by their assigned Department
      const managerData = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { departmentId: true }
      });

      if (managerData && managerData.departmentId) {
        whereClause.departmentId = managerData.departmentId;
      } else {
        // Fallback: If manager has no dept assigned, show empty to be safe
        whereClause.id = 'none'; 
      }
    } 
    
    else if (req.user && req.user.role === 'Employee') {
      // EMPLOYEE LOGIC: Filter specifically to their own ID
      // This ensures the "Directory" returns only their information
      whereClause.id = req.user.id;
    }

    // 2. FETCH DATA
    const employees = await prisma.user.findMany({
      where: whereClause,
      include: {
        departmentRel: true,
        jobPositionRel: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. SECURE RESPONSE
    const safeEmployees = employees.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(safeEmployees);
  } catch (error) {
    console.error("DETAILED BACKEND ERROR:", error);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// --- UPDATE EMPLOYEE LOGIC ---
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    // 1. Destructure to extract the fields that need special handling
    const { 
      departmentId, 
      jobPositionId, 
      allowLogin, 
      dateOfBirth, 
      hireDate, 
      telegramVerified, // Extracted to fix the String vs Boolean crash
      // Explicitly pull these out so they DON'T go into 'otherData'
      department, 
      jobPosition, 
      auditLogs, 
      departmentRel, 
      jobPositionRel,
      otpCode,
      otpExpires,
      telegramId,
      ...otherData 
    } = data;

    // 2. Build the main update object
    const updatePayload = {
      ...otherData,
      // Handle the Booleans (FormData sends them as strings "true"/"false")
      isActive: allowLogin === 'true' || allowLogin === true,
    };

    // 3. FIX: Handle telegramVerified conversion specifically
    if (telegramVerified !== undefined) {
      updatePayload.telegramVerified = telegramVerified === 'true' || telegramVerified === true;
    }

    // 4. Handle Profile Image
    if (req.file) {
      // Assuming getFileUrl is a helper function you have defined
      updatePayload.profileImage = getFileUrl(req, req.file.filename);
    }

    // 5. Clean up specific fields that cause Prisma crashes
    delete updatePayload.id;
    delete updatePayload.createdAt;
    delete updatePayload.updatedAt;
    delete updatePayload.password; // Never update password via this route

    // 6. Safe Date Conversion
    if (dateOfBirth && dateOfBirth !== "" && dateOfBirth !== "null") {
      updatePayload.dateOfBirth = new Date(dateOfBirth);
    } else {
      updatePayload.dateOfBirth = null;
    }

    if (hireDate && hireDate !== "" && hireDate !== "null") {
      updatePayload.hireDate = new Date(hireDate);
    } else {
      updatePayload.hireDate = null;
    }

    // 7. Execute the Update with Relationship Logic
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        ...updatePayload,
        // Only attempt to connect if the ID is a valid string (not empty)
        departmentRel: (departmentId && departmentId.trim() !== "") 
          ? { connect: { id: departmentId } } 
          : { disconnect: true },
        jobPositionRel: (jobPositionId && jobPositionId.trim() !== "") 
          ? { connect: { id: jobPositionId } } 
          : { disconnect: true }
      },
      include: {
        departmentRel: true,
        jobPositionRel: true
      }
    });

    res.json({ 
      message: "Employee updated successfully", 
      employee: updatedUser 
    });

  } catch (error) {
    // If there's a file upload and a crash happens, delete the local file to save space
    if (req.file && req.file.path) {
        try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Unlink error:", e); }
    }
    
    console.error("CRITICAL BACKEND ERROR:", error); 
    
    res.status(500).json({ 
      message: "Server Crash", 
      detail: error.message 
    });
  }
};

// --- DELETE EMPLOYEE ---
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profileImage) {
      const filename = user.profileImage.split('/').pop();
      const filePath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// --- GET EMPLOYEE HISTORY (Timeline Feed) ---
exports.getEmployeeHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        departmentRel: true,
        jobPositionRel: true,
        auditLogs: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.json({
      details: {
        id: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        role: employee.jobPositionRel?.title || "No Position",
        dept: employee.departmentRel?.name || "Unassigned",
        hireDate: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
      },
      logs: employee.auditLogs.map(log => ({
        date: new Date(log.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        title: log.action,
        desc: log.description,
        category: log.category
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
};

// --- METADATA & SEARCH ---
exports.getDepartments = async (req, res) => {
  try {
    // Admin sees all, or you could filter these too if needed
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments" });
  }
};

exports.getPositions = async (req, res) => {
  try {
    const positions = await prisma.jobPosition.findMany({
      include: { department: true },
      orderBy: { title: 'asc' }
    }); 
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsersForSearch = async (req, res) => {
  try {
    // 1. Destructure deptId from query (it will be undefined on other pages)
    const { q, role, deptId } = req.query; 
    let whereClause = {};

    // 2. Name Search Logic
    if (q) {
      whereClause.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ];
    }

    // 3. Role Logic
    if (role) {
      whereClause.role = { equals: role, mode: 'insensitive' };
    }

    // 4. Department Logic (SAFE: only triggers if deptId is passed)
    if (deptId) {
      whereClause.departmentId = deptId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        profileImage: true, 
        role: true,
        departmentId: true 
      },
      take: 50 
    });

    res.json(users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      firstName: u.firstName, // Helpful for avatar letters
      lastName: u.lastName,
      image: u.profileImage,
      role: u.role,
      departmentId: u.departmentId 
    })));
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Search error" });
  }
};

// --- STRUCTURE DATA ---
exports.getStructureData = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        profileImage: true,
        departmentRel: { select: { name: true } },
        jobPositionRel: { select: { title: true } },
        reportsTo: { select: { firstName: true, lastName: true } },
        telegramVerified: true
      }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// --- GET ME ---
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { departmentRel: true, jobPositionRel: true }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...userData } = user;
    res.json({
      ...userData,
      department: user.departmentRel?.name || "Unassigned",
      jobPosition: user.jobPositionRel?.title || "No Position"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const id = req.user.id; // Get ID from the 'protect' middleware, not the URL
    const { firstName, lastName, email, phone, address, password } = req.body;

    const updatePayload = {
      firstName,
      lastName,
      email,
      workPhone: phone, // Map frontend 'phone' to DB 'workPhone'
      address,
    };

    // 1. Handle Password Hashing
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password, salt);
    }

    // 2. Handle Profile Image
    if (req.file) {
      // Use your existing helper getFileUrl if you have it
      updatePayload.profileImage = `/uploads/${req.file.filename}`;
    }

    // 3. Update only the allowed fields
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updatePayload,
      include: {
        departmentRel: true,
        jobPositionRel: true
      }
    });

    // Remove password before sending back
    delete updatedUser.password;

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server Error", detail: error.message });
  }
};

// --- GET DASHBOARD STATS ---
exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await prisma.user.count();
    const totalDepartments = await prisma.department.count();
    const totalPositions = await prisma.jobPosition.count();
    const activeEmployees = await prisma.user.count({ where: { isActive: true } });
    
    // FETCH REAL PENDING LEAVES
    const pendingLeaves = await prisma.leaveRequest.count({
      where: { status: "PENDING" }
    });
    
    const activePercentage = totalEmployees > 0 
      ? Math.round((activeEmployees / totalEmployees) * 100) 
      : 0;

    res.json({
      totalEmployees,
      totalDepartments,
      totalPositions,
      activeEmployees,
      activePercentage,
      pendingLeaves // This is now real data from your LeaveRequest model
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

