import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/employee/Dashboard'
import Employee from './pages/employee/Employee'
import EmployeeHistory from './pages/employee/EmployeeHistory'
import Department from './pages/employee/Department'
import JobPosition from './pages/employee/JobPosition'
import LeaveType from './pages/employee/LeaveType'
import LeaveBalance from './pages/employee/LeaveBalance'
import LeaveRequest from './pages/employee/LeaveRequests'
import LeaveCalendar from './pages/employee/LeaveCalendar'
import AttendanceRecord from './pages/employee/AttendanceRecord'
import TimeTracking from './pages/employee/TimeTracking'
import Documents from './pages/employee/Documents'
import Profile from './pages/employee/Profile'
import Salary from './pages/employee/Salary'
import Structure from './pages/employee/Structure'
import EmployeeLayout from './components/employee/EmployeeLayout'
// Import other pages as you create them

function App() {
  return (
    <Routes>
      {/* 1. FIX: Handle the root path. Redirects "/" to "/admin/dashboard" */}
      <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />

      {/* Admin Routes wrapped in Layout */}
      <Route path="/employee" element={<EmployeeLayout />}>
        {/* 2. FIX: Handle the base "/admin" path. Redirects "/admin" to "/admin/dashboard" */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<Dashboard />} />

        {/* Employee Routes */}
        <Route path="employee" element={<Employee />} />
        <Route path="employee-history" element={<EmployeeHistory />} />

        {/* Organization Routes */}
        <Route path="department" element={<Department />} />
        <Route path="job-position" element={<JobPosition />} />
        <Route path="structure" element={<Structure />} />
        
        {/* Leave Routes */}
        <Route path="leave-type" element={<LeaveType />} />
        <Route path="leave-balance" element={<LeaveBalance />} />
        <Route path="leave-request" element={<LeaveRequest />} /> 
        <Route path="leave-calendar" element={<LeaveCalendar />} />

        {/* Attendance Routes */}
        <Route path="attendance-record" element={<AttendanceRecord />} />
        <Route path="time-tracking" element={<TimeTracking />} />

        {/* Document Routes */}
        <Route path="documents" element={<Documents />} />

        {/* Salary Routes */}
        <Route path="salary" element={<Salary />} />
        {/* Add more nested routes here
        
        */}
        
        {/* Profile Route */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Auth Route */}
      {/* <Route path="/login" element={<Login />} /> */}
      
      {/* 3. OPTIONAL: Catch-all for 404 - Redirects any unknown URL to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App