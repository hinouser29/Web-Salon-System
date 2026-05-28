import { Routes, Route } from 'react-router-dom';
import GuestLayout from '../components/layout/GuestLayout';
import Home from '../pages/guest/Home';
import ServiceList from '../pages/guest/ServiceList';
import ServiceDetail from '../pages/guest/ServiceDetail';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import OAuthCallback from '../pages/auth/OAuthCallback';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import BookingPage from '../pages/customer/BookingPage';
import MyAppointments from '../pages/customer/MyAppointments';
import PaymentHistory from '../pages/customer/PaymentHistory';
import CustomerProfile from '../pages/customer/CustomerProfile';
import ChangePassword from '../pages/customer/ChangePassword';
import AdminDashboard from '../pages/admin/AdminDashboard';
import RolesPage from '../pages/admin/RolesPage';
import RolePermissionsPage from '../pages/admin/RolePermissionsPage';
import UserRolesPage from '../pages/admin/UserRolesPage';
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import TechnicianDashboard from '../pages/technician/TechnicianDashboard';
import ProtectedRoute from './ProtectedRoute';

function PublicPage({ children }) {
  return <GuestLayout>{children}</GuestLayout>;
}

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<PublicPage><Home /></PublicPage>} />
    <Route path="/services" element={<PublicPage><ServiceList /></PublicPage>} />
    <Route path="/services/:id" element={<PublicPage><ServiceDetail /></PublicPage>} />
    <Route path="/login" element={<PublicPage><Login /></PublicPage>} />
    <Route path="/register" element={<PublicPage><Register /></PublicPage>} />
    <Route path="/verify-email" element={<PublicPage><VerifyEmail /></PublicPage>} />
    <Route path="/forgot-password" element={<PublicPage><ForgotPassword /></PublicPage>} />
    <Route path="/reset-password" element={<PublicPage><ResetPassword /></PublicPage>} />
    <Route path="/oauth/callback" element={<PublicPage><OAuthCallback /></PublicPage>} />
    <Route path="/customer" element={<ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}><CustomerDashboard /></ProtectedRoute>} />
    <Route path="/customer/booking" element={<ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}><BookingPage /></ProtectedRoute>} />
    <Route path="/customer/appointments" element={<ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}><MyAppointments /></ProtectedRoute>} />
    <Route path="/customer/payments" element={<ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}><PaymentHistory /></ProtectedRoute>} />
    <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}><CustomerProfile /></ProtectedRoute>} />
    <Route path="/customer/change-password" element={<ProtectedRoute allowedRoles={['CUSTOMER', 'USER']}><ChangePassword /></ProtectedRoute>} />
    <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'STAFF', 'MANAGER', 'SUPPORT']}><ReceptionistDashboard /></ProtectedRoute>} />
    <Route path="/technician" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'STAFF', 'SUPPORT']}><TechnicianDashboard /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><RolesPage /></ProtectedRoute>} />
    <Route path="/admin/roles/:id/permissions" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><RolePermissionsPage /></ProtectedRoute>} />
    <Route path="/admin/users/:userId/roles" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><UserRolesPage /></ProtectedRoute>} />
  </Routes>;
}
