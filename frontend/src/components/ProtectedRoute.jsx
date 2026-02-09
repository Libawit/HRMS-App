import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation(); // Helps remember where the user was trying to go

  // 1. Strict check: No token or corrupted user data? Back to login.
  if (!token || !user || !user.role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check: Is the user's role in the allowed list?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are an Admin trying to access a Manager page, send them to Admin Dashboard
    // If they are an Employee trying to access Admin, send them to Employee Dashboard
    const fallbackPath = 
      user.role === 'Admin' ? '/admin/dashboard' : 
      user.role === 'Manager' ? '/manager/dashboard' : 
      '/employee/dashboard';
      
    console.warn(`Access denied for role: ${user.role}. Redirecting to ${fallbackPath}`);
    return <Navigate to={fallbackPath} replace />;
  }

  // 3. Authorized: Render the requested page
  return <Outlet />;
};

export default ProtectedRoute;