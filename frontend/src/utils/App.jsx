import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Employee from './pages/admin/Employee'
import AddEmployee from './pages/admin/AddEmployee'
import EmployeeHistory from './pages/admin/EmployeeHistory'
import Department from './pages/admin/Department'
import JobPosition from './pages/admin/JobPosition'
import LeaveType from './pages/admin/LeaveType'
import LeaveBalance from './pages/admin/LeaveBalance'
import LeaveRequest from './pages/admin/LeaveRequest'
import LeaveCalendar from './pages/admin/LeaveCalendar'
import AttendanceRecord from './pages/admin/AttendanceRecord'
import TimeTracking from './pages/admin/TimeTracking'
import Documents from './pages/admin/Documents'
import Profile from './pages/admin/Profile'
import Salary from './pages/admin/Salary'
import Structure from './pages/admin/Structure'
import SideBar from './components/manager/SideBar'
// Import other pages as you create them

function App() {
  return (
    <Routes>
      {/* 1. FIX: Handle the root path. Redirects "/" to "/admin/dashboard" */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Admin Routes wrapped in Layout */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* 2. FIX: Handle the base "/admin" path. Redirects "/admin" to "/admin/dashboard" */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<Dashboard />} />

        {/* Employee Routes */}
        <Route path="employee" element={<Employee />} />
        <Route path="add-employee" element={<AddEmployee />} />
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