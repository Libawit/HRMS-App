import { Routes, Route, Navigate } from 'react-router-dom'
import ManagerLayout from './components/manager/ManagerLayout'
import Dashboard from './pages/manager/Dashboard'
import Employee from './pages/manager/Employee'
import EmployeeHistory from './pages/manager/EmployeeHistory'
import Department from './pages/manager/Department'
import JobPosition from './pages/manager/JobPosition'
import LeaveType from './pages/manager/LeaveType'
import LeaveBalance from './pages/manager/LeaveBalance'
import LeaveRequest from './pages/manager/LeaveRequest'
import LeaveCalendar from './pages/manager/LeaveCalendar'
import AttendanceRecord from './pages/manager/AttendanceRecord'
import TimeTracking from './pages/manager/TimeTracking'
import Documents from './pages/manager/Documents'
import Profile from './pages/manager/Profile'
import Salary from './pages/manager/Salary'
import Structure from './pages/manager/Structure'

// Import other pages as you create them

function App() {
  return (
    <Routes>
      {/* 1. FIX: Handle the root path. Redirects "/" to "/admin/dashboard" */}
      <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />

      {/* Admin Routes wrapped in Layout */}
      <Route path="/manager" element={<ManagerLayout />}>
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