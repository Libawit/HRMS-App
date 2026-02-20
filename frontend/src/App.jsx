import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

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
import ManagerDashboard from './pages/manager/Dashboard'
import ManagerEmployee from './pages/manager/Employee'
import ManagerEmployeeHistory from './pages/manager/EmployeeHistory'
import ManagerDepartment from './pages/manager/Department'
import ManagerJobPosition from './pages/manager/JobPosition'
import ManagerStructure from './pages/manager/Structure'
import ManagerLeaveType from './pages/manager/LeaveType'
import ManagerLeaveBalance from './pages/manager/LeaveBalance'
import ManagerLeaveRequest from './pages/manager/LeaveRequest'
import ManagerLeaveCalendar from './pages/manager/LeaveCalendar'
import ManagerAttendanceRecord from './pages/manager/AttendanceRecord'
import ManagerTimeTracking from './pages/manager/TimeTracking'
import ManagerDocuments from './pages/manager/Documents'
import ManagerSalary from './pages/manager/Salary'
import ManagerProfile from './pages/manager/Profile'

// Employee Imports
import EmployeeLayout from './components/employee/EmployeeLayout'
import EmployeeDashboard from './pages/employee/Dashboard'
import MyInformation from './pages/employee/Employee'
import MyHistory from './pages/employee/EmployeeHistory'
import MyDepartment from './pages/employee/Department'
import MyJobPosition from './pages/employee/JobPosition'
import MyStructure from './pages/employee/Structure'
import EmployeeLeaveType from './pages/employee/LeaveType'
import MyLeaveBalance from './pages/employee/LeaveBalance'
import MyLeaveRequest from './pages/employee/LeaveRequests'
import MyLeaveCalendar from './pages/employee/LeaveCalendar'
import MyAttendanceRecord from './pages/employee/AttendanceRecord'
import EmployeeTimeTracking from './pages/employee/TimeTracking'
import MyDocuments from './pages/employee/Documents'
import MySalary from './pages/employee/Salary'
import MyProfile from './pages/employee/Profile'

/**
 * Helper component to handle the root (/) path.
 * It intelligently redirects users based on their login status and role.
 */
const RootRedirector = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'Manager') return <Navigate to="/manager/dashboard" replace />;
    if (user.role === 'Employee') return <Navigate to="/employee/dashboard" replace />;
    return <Navigate to="/login" replace />;
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Routes>
      {/* 1. ROOT & PUBLIC ROUTES */}
      <Route path="/" element={<RootRedirector />} />
      <Route path="/login" element={<Login />} />

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
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="employee" element={<ManagerEmployee />} />
          <Route path="employee-history" element={<ManagerEmployeeHistory />} />
          <Route path="department" element={<ManagerDepartment />} />
          <Route path="job-position" element={<ManagerJobPosition />} />
          <Route path="structure" element={<ManagerStructure />} />
          <Route path="leave-type" element={<ManagerLeaveType />} />
          <Route path="leave-balance" element={<ManagerLeaveBalance />} />
          <Route path="leave-request" element={<ManagerLeaveRequest />} />
          <Route path="leave-calendar" element={<ManagerLeaveCalendar />} />
          <Route path="attendance-record" element={<ManagerAttendanceRecord />} />
          <Route path="time-tracking" element={<ManagerTimeTracking />} />
          <Route path="documents" element={<ManagerDocuments />} />
          <Route path="salary" element={<ManagerSalary />} />
          <Route path="profile" element={<ManagerProfile />} />
        </Route>
      </Route>

      {/* 4. EMPLOYEE PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['Employee', 'Manager', 'Admin']} />}>
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="employee" element={<MyInformation />} />
          <Route path="employee-history" element={<MyHistory />} /> 
          <Route path="department" element={<MyDepartment />} />
          <Route path="job-position" element={<MyJobPosition />} />
          <Route path="structure" element={<MyStructure />} />
          <Route path="leave-type" element={<EmployeeLeaveType />} />
          <Route path="leave-balance" element={<MyLeaveBalance />} />
          <Route path="leave-request" element={<MyLeaveRequest />} />
          <Route path="leave-calendar" element={<MyLeaveCalendar />} />
          <Route path="attendance-record" element={<MyAttendanceRecord />} />
          <Route path="time-tracking" element={<EmployeeTimeTracking />} />
          <Route path="documents" element={<MyDocuments />} />
          <Route path="salary" element={<MySalary />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>
      </Route>

      {/* 5. CATCH-ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App