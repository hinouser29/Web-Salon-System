import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GuestLayout from './GuestLayout';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, UserCog, Settings, FileText, Menu, X, LogOut, Tags } from 'lucide-react';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/admin/services', label: 'Dịch vụ & Combo', icon: Tags },
    { path: '/admin/employees', label: 'Quản lý Nhân sự', icon: Users },
    { path: '/admin/customers', label: 'Khách hàng', icon: Users },
    { path: '/admin/roles', label: 'Phân quyền', icon: UserCog },
    { path: '/admin/reports', label: 'Báo cáo', icon: FileText },
    { path: '/admin/settings', label: 'Cài đặt', icon: Settings },
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
          {children}
        </main>
      </div>
    </GuestLayout>
  );
}
