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
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey123',
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
    const employees = await prisma.user.findMany({
      // THIS BLOCK IS THE FIX
      include: {
        departmentRel: true,   // Connects to the Department model
        jobPositionRel: true   // Connects to the JobPosition model
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // We strip passwords before sending to frontend
    const safeEmployees = employees.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(safeEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employee directory" });
  }
};

// --- UPDATE EMPLOYEE LOGIC ---
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingUser = await prisma.user.findUnique({ 
      where: { id },
      include: { departmentRel: true, jobPositionRel: true } 
    });
    
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const { 
      departmentId, jobPositionId, allowLogin, 
      employeeId, nationalId, ...otherData 
    } = data;

    // ... (Keep your existing ID conflict detection logic here)

    let profileImageUrl = existingUser.profileImage;
    if (req.file) {
      // (Keep your existing file deletion logic here)
      profileImageUrl = getFileUrl(req, req.file.filename);
    }

    const updatePayload = {
        ...otherData,
        employeeId,
        nationalId,
        profileImage: profileImageUrl,
        isActive: allowLogin === 'true' || allowLogin === true,
    };

    if (otherData.dateOfBirth) updatePayload.dateOfBirth = new Date(otherData.dateOfBirth);
    if (otherData.hireDate) updatePayload.hireDate = new Date(otherData.hireDate);

    delete updatePayload.id;
    delete updatePayload.createdAt;

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        ...updatePayload,
        departmentRel: (departmentId && departmentId !== "null" && departmentId !== "") 
          ? { connect: { id: departmentId } } 
          : undefined,
        jobPositionRel: (jobPositionId && jobPositionId !== "null" && jobPositionId !== "") 
          ? { connect: { id: jobPositionId } } 
          : undefined
      },
      include: {
        departmentRel: true,
        jobPositionRel: true
      }
    });

    // --- SELF-EDIT LOGIC: Generate New Token if editing self ---
    // If the ID in the URL matches the ID from the JWT (req.user.id)
    let newToken = null;
    if (req.user && req.user.id === id) {
        newToken = jwt.sign(
            { id: updatedUser.id, role: updatedUser.role },
            process.env.JWT_SECRET || 'supersecretkey123',
            { expiresIn: '1d' }
        );
    }

    // --- AUDIT LOGS ---
    await createAuditLog(id, "Record Updated", `Profile updated by ${req.user?.id === id ? 'Self' : 'Admin'}`, "GENERAL");

    res.json({ 
      message: "Employee updated successfully", 
      employee: {
        ...updatedUser,
        department: updatedUser.departmentRel?.name || "Unassigned",
        jobPosition: updatedUser.jobPositionRel?.title || "No Position"
      },
      token: newToken // Send this back so frontend can update local storage
    });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
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
    const { q } = req.query; // Get search term from URL: ?q=name
    
    const users = await prisma.user.findMany({
      where: q ? {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { employeeId: { contains: q, mode: 'insensitive' } }
        ]
      } : {}, // If no query, return all or empty
      select: { id: true, firstName: true, lastName: true, email: true, employeeId: true, profileImage: true },
      take: 10 // Limit results for performance
    });

    const formatted = users.map(u => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email,
      employeeId: u.employeeId,
      image: u.profileImage
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Search error", error: error.message });
  }
};



// --- GET LOGGED-IN USER PROFILE ---
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        departmentRel: true,
        jobPositionRel: true
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...userData } = user;

    // We "flatten" the related names so the frontend can easily find them
    const responseData = {
      ...userData,
      department: user.departmentRel?.name || user.department || "Unassigned",
      jobPosition: user.jobPositionRel?.title || user.jobPosition || "No Position"
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

