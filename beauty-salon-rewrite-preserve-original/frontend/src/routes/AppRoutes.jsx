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
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import BookingPage from '../pages/customer/BookingPage';
import MyAppointments from '../pages/customer/MyAppointments';
import PaymentHistory from '../pages/customer/PaymentHistory';
import CustomerProfile from '../pages/customer/CustomerProfile';
import ChangePassword from '../pages/customer/ChangePassword';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import TechnicianDashboard from '../pages/technician/TechnicianDashboard';

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
    <Route path="/customer" element={<CustomerDashboard />} />
    <Route path="/customer/booking" element={<BookingPage />} />
    <Route path="/customer/appointments" element={<MyAppointments />} />
    <Route path="/customer/payments" element={<PaymentHistory />} />
    <Route path="/customer/profile" element={<CustomerProfile />} />
    <Route path="/customer/change-password" element={<ChangePassword />} />
    <Route path="/receptionist" element={<ReceptionistDashboard />} />
    <Route path="/technician" element={<TechnicianDashboard />} />
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>;
}
