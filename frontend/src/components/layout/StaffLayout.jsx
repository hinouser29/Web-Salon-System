import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GuestLayout from './GuestLayout';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, CalendarCheck, Clock, Bell, Menu, X, LogOut, Users } from 'lucide-react';
import NotificationBell from '../NotificationBell';

export default function StaffLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Receptionist/Technician have slightly different routes, but we can combine or genericize
  const basePath = user?.role === 'TECHNICIAN' ? '/technician' : '/receptionist';
  
  const navLinks = [
    { path: basePath, label: 'Bàn làm việc', icon: LayoutDashboard },
    { path: `${basePath}/appointments`, label: 'Quản lý Lịch hẹn', icon: CalendarCheck },
    { path: `${basePath}/schedule`, label: 'Ca làm việc', icon: Clock },
    { path: `${basePath}/customers`, label: 'Khách hàng', icon: Users },
    { path: `${basePath}/notifications`, label: 'Thông báo', icon: Bell },
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
          <h3 className="sidebar-title">Nhân viên</h3>
          <nav className="sidebar-nav">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`sidebar-link ${isActive && link.path !== basePath ? 'active' : (isActive && location.pathname === basePath ? 'active' : '')}`}
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
            <NotificationBell />
          </div>
          <div style={{ padding: '24px' }}>
            {children}
          </div>
        </main>
      </div>
    </GuestLayout>
  );
}
