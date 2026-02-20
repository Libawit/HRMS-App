const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// 1. Protect: Verifies the JWT and attaches the user to the request
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token: "Bearer <token>" -> "<token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');

      // Fetch user from DB (excluding sensitive data)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          departmentId: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }

      // Attach user to the request object
      req.user = user;
      return next(); // Exit correctly to the controller
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      // If token is expired or tampered with
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  // If no token was found at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 2. Admin: Checks if the attached user has admin or HR privileges
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'HR Manager')) {
    next();
  } else {
    // 403 Forbidden is better than 401 here because the user IS logged in, 
    // they just don't have the right permissions.
    res.status(403).json({ message: 'Access denied: Requires Admin or HR permissions' });
  }
};

// 3. Manager: Checks if the user is a Manager, Admin, or HR
const manager = (req, res, next) => {
  const allowedRoles = ['Admin', 'HR Manager', 'Manager'];
  
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Manager permissions' });
  }
};

module.exports = { protect, admin, manager };