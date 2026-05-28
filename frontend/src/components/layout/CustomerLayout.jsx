import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GuestLayout from './GuestLayout';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, History, CreditCard, User, KeyRound, Menu, X, LogOut } from 'lucide-react';

export default function CustomerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/customer', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/customer/booking', label: 'Đặt lịch hẹn', icon: Calendar },
    { path: '/customer/appointments', label: 'Lịch hẹn của tôi', icon: History },
    { path: '/customer/payments', label: 'Thanh toán', icon: CreditCard },
    { path: '/customer/profile', label: 'Hồ sơ cá nhân', icon: User },
    { path: '/customer/change-password', label: 'Đổi mật khẩu', icon: KeyRound },
  ];

  return (
    <GuestLayout>
      <div className="dashboard-container">
        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <h3 className="sidebar-title">Tài khoản khách hàng</h3>
          <nav className="sidebar-nav">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <button className="sidebar-link logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </aside>
        
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </GuestLayout>
  );
}
