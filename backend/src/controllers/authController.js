const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../config/cloudinary'); 

// --- HELPER: CREATE AUDIT LOG ---
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

    if (!user) return res.status(401).json({ message: 'Invalid Email or Password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid Email or Password' });

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
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
        // Cloudinary cleanup if registration fails due to existing user
        if (req.file) await cloudinary.uploader.destroy(req.file.filename); 
        return res.status(400).json({ message: 'Email, Employee ID, or National ID already exists' });
    }

    // req.file.path is the secure HTTPS Cloudinary URL
    const profileImageUrl = req.file ? req.file.path : null;
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

    await createAuditLog(newUser.id, "Record Created", "New employee profile added to system", "SECURITY");
    res.status(201).json({ message: 'Employee Created Successfully!', user: newUser });
  } catch (error) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(400).json({ message: 'Registration failed', detail: error.message });
  }
};

// --- GET ALL EMPLOYEES ---
exports.getAllEmployees = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user?.role === 'Manager') {
      const manager = await prisma.user.findUnique({ where: { id: req.user.id } });
      whereClause.departmentId = manager?.departmentId || 'none';
    } else if (req.user?.role === 'Employee') {
      whereClause.id = req.user.id;
    }

    const employees = await prisma.user.findMany({
      where: whereClause,
      include: { departmentRel: true, jobPositionRel: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(employees.map(({ password, ...u }) => u));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- UPDATE EMPLOYEE ---
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const { 
      departmentId, jobPositionId, allowLogin, dateOfBirth, hireDate, 
      telegramVerified, department, jobPosition, auditLogs, 
      departmentRel, jobPositionRel, otpCode, otpExpires, telegramId, ...otherData 
    } = req.body;

    const updatePayload = {
      ...otherData,
      isActive: allowLogin === 'true' || allowLogin === true,
    };

    if (telegramVerified !== undefined) {
      updatePayload.telegramVerified = telegramVerified === 'true' || telegramVerified === true;
    }

    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (existingUser.profileImage) {
        const publicId = existingUser.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`hrms_uploads/${publicId}`).catch(() => {});
      }
      updatePayload.profileImage = req.file.path;
    }

    delete updatePayload.id; delete updatePayload.createdAt; delete updatePayload.updatedAt; delete updatePayload.password;

    updatePayload.dateOfBirth = (dateOfBirth && dateOfBirth !== "null") ? new Date(dateOfBirth) : null;
    updatePayload.hireDate = (hireDate && hireDate !== "null") ? new Date(hireDate) : null;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updatePayload,
        departmentRel: (departmentId?.trim()) ? { connect: { id: departmentId } } : { disconnect: true },
        jobPositionRel: (jobPositionId?.trim()) ? { connect: { id: jobPositionId } } : { disconnect: true }
      },
      include: { departmentRel: true, jobPositionRel: true }
    });

    res.json({ message: "Employee updated successfully", employee: updatedUser });
  } catch (error) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    res.status(500).json({ message: "Update failed", detail: error.message });
  }
};

// --- DELETE EMPLOYEE ---
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profileImage) {
      const publicId = user.profileImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`hrms_uploads/${publicId}`).catch(() => {});
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// --- REMAINING METHODS (REFACTORED) ---
exports.getEmployeeHistory = async (req, res) => {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { departmentRel: true, jobPositionRel: true, auditLogs: { orderBy: { createdAt: 'desc' } } }
    });
    if (!employee) return res.status(404).json({ message: "Not found" });
    res.json({
      details: {
        id: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        role: employee.jobPositionRel?.title || "No Position",
        dept: employee.departmentRel?.name || "Unassigned",
        hireDate: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'
      },
      logs: employee.auditLogs.map(log => ({
        date: new Date(log.createdAt).toLocaleDateString(),
        title: log.action, desc: log.description, category: log.category
      }))
    });
  } catch (e) { res.status(500).json({ message: "Error" }); }
};

exports.getDepartments = async (req, res) => {
  const depts = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  res.json(depts);
};

exports.getPositions = async (req, res) => {
  const pos = await prisma.jobPosition.findMany({ include: { department: true }, orderBy: { title: 'asc' } });
  res.json(pos);
};

exports.getAllUsersForSearch = async (req, res) => {
  try {
    const { q, role, deptId } = req.query;
    let where = {};
    if (q) where.OR = [{ firstName: { contains: q, mode: 'insensitive' } }, { lastName: { contains: q, mode: 'insensitive' } }];
    if (role) where.role = { equals: role, mode: 'insensitive' };
    if (deptId) where.departmentId = deptId;

    const users = await prisma.user.findMany({ where, take: 50 });
    res.json(users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, image: u.profileImage, role: u.role })));
  } catch (e) { res.status(500).json({ message: "Search error" }); }
};

exports.getStructureData = async (req, res) => {
  const employees = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, role: true, profileImage: true, departmentRel: { select: { name: true } }, jobPositionRel: { select: { title: true } } }
  });
  res.json(employees);
};

exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { departmentRel: true, jobPositionRel: true } });
  const { password, ...userData } = user;
  res.json({ ...userData, department: user.departmentRel?.name || "Unassigned", jobPosition: user.jobPositionRel?.title || "No Position" });
};

// authController.js

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, password } = req.body;
    
    // Build update object dynamically to avoid sending undefined fields
    const updatePayload = {};
    if (firstName) updatePayload.firstName = firstName;
    if (lastName) updatePayload.lastName = lastName;
    if (email) updatePayload.email = email;
    if (phone) updatePayload.workPhone = phone;
    if (address) updatePayload.address = address;

    // Handle Password
    if (password && password.trim() !== "") {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    // Handle Cloudinary Image
    if (req.file) {
      updatePayload.profileImage = req.file.path; // req.file.path is the URL from Cloudinary
    }

    const updated = await prisma.user.update({ 
      where: { id: req.user.id }, 
      data: updatePayload 
    });

    // Remove password before sending response
    const { password: _, ...userWithoutPassword } = updated;
    
    res.json({ 
      message: "Profile updated successfully", 
      user: userWithoutPassword 
    });
  } catch (e) {
    console.error("Update Profile Error:", e);
    res.status(500).json({ message: "Update failed", detail: e.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  const [totalEmployees, totalDepartments, totalPositions, activeEmployees, pendingLeaves] = await Promise.all([
    prisma.user.count(), prisma.department.count(), prisma.jobPosition.count(),
    prisma.user.count({ where: { isActive: true } }), prisma.leaveRequest.count({ where: { status: "PENDING" } })
  ]);
  res.json({ totalEmployees, totalDepartments, totalPositions, activeEmployees, pendingLeaves, activePercentage: totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0 });
};