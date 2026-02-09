import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute' // Import the gatekeeper

// Admin Imports
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

// Manager Imports
import ManagerLayout from './components/manager/ManagerLayout'
import ManagerEmployee from './pages/manager/Employee'
import ManagerLeaveType from './pages/manager/LeaveType'

function App() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 2. ADMIN PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employee" element={<Employee />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="employee-history" element={<EmployeeHistory />} />
          <Route path="department" element={<Department />} />
          <Route path="job-position" element={<JobPosition />} />
          <Route path="structure" element={<Structure />} />
          <Route path="leave-type" element={<LeaveType />} />
          <Route path="leave-balance" element={<LeaveBalance />} />
          <Route path="leave-request" element={<LeaveRequest />} /> 
          <Route path="leave-calendar" element={<LeaveCalendar />} />
          <Route path="attendance-record" element={<AttendanceRecord />} />
          <Route path="time-tracking" element={<TimeTracking />} />
          <Route path="salary" element={<Salary />} />
          <Route path="documents" element={<Documents />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 3. MANAGER PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['Manager', 'Admin']} />}>
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<div>Manager Dashboard</div>} />
          <Route path="employee" element={<ManagerEmployee />} />
          <Route path="leave-type" element={<ManagerLeaveType />} />
        </Route>
      </Route>

      {/* 4. EMPLOYEE PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']} />}>
        <Route path="/employee" element={<div>Employee Layout Placeholder</div>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<div>Employee Dashboard</div>} />
        </Route>
      </Route>

      {/* 5. CATCH-ALL */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App