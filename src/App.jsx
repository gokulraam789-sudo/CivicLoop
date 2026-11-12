import { Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/Shell'
import { Protected } from './context/AuthContext'
import Landing from './pages/Landing'
import { Login, Register } from './pages/Auth'
import Public from './pages/Public'
import Explore from './pages/Explore'
import ComplaintDetail from './pages/ComplaintDetail'
import CitizenDashboard from './pages/citizen/Dashboard'
import Report from './pages/citizen/Report'
import MyComplaints from './pages/citizen/MyComplaints'
import DeptDashboard from './pages/dept/Dashboard'
import DeptComplaints from './pages/dept/Complaints'
import AdminDashboard from './pages/admin/Dashboard'
import AdminComplaints from './pages/admin/Complaints'
import Departments from './pages/admin/Departments'

const P = (roles, el) => <Protected roles={roles}>{el}</Protected>

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="public" element={<Public />} />
        <Route path="explore" element={<Explore />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="citizen" element={P(['citizen'], <CitizenDashboard />)} />
        <Route path="citizen/report" element={P(['citizen'], <Report />)} />
        <Route path="citizen/complaints" element={P(['citizen'], <MyComplaints />)} />
        <Route path="dept" element={P(['department'], <DeptDashboard />)} />
        <Route path="dept/complaints" element={P(['department'], <DeptComplaints />)} />
        <Route path="admin" element={P(['admin'], <AdminDashboard />)} />
        <Route path="admin/complaints" element={P(['admin'], <AdminComplaints />)} />
        <Route path="admin/departments" element={P(['admin'], <Departments />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
