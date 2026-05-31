import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GuestLayout from './GuestLayout';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, UserCog, Settings, FileText, Menu, X, LogOut, Tags, CalendarCheck } from 'lucide-react';
import NotificationBell from '../NotificationBell';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminOrSuper = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const navLinks = [
    { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard }
  ];

  if (hasPermission('APPOINTMENT_READ_ALL')) {
    navLinks.push({ path: '/admin/appointments', label: 'Quản lý Lịch hẹn', icon: CalendarCheck });
  }
  if (hasPermission('SERVICE_READ')) {
    navLinks.push({ path: '/admin/services', label: 'Dịch vụ & Combo', icon: Tags });
  }
  if (hasPermission('EMPLOYEE_READ') || hasPermission('EMPLOYEE_MANAGE')) {
    navLinks.push({ path: '/admin/employees', label: 'Quản lý Nhân sự', icon: Users });
  }
  if (hasPermission('USER_READ_ALL') || hasPermission('USER_MANAGE')) {
    navLinks.push({ path: '/admin/customers', label: 'Khách hàng', icon: Users });
  }
  if (hasPermission('ROLE_MANAGE')) {
    navLinks.push({ path: '/admin/roles', label: 'Phân quyền', icon: UserCog });
  }
  
  if (isAdminOrSuper) {
    navLinks.push({ path: '/admin/reports', label: 'Báo cáo', icon: FileText });
    navLinks.push({ path: '/admin/system-logs', label: 'Nhật ký hệ thống', icon: FileText });
    navLinks.push({ path: '/admin/settings', label: 'Cài đặt', icon: Settings });
  }

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
          <h3 className="sidebar-title">Quản trị viên</h3>
          <nav className="sidebar-nav">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`sidebar-link ${isActive && link.path !== '/admin' ? 'active' : (isActive && location.pathname === '/admin' ? 'active' : '')}`}
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
