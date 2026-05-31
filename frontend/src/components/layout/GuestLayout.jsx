import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

export default function GuestLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return <>
    <div className="topbar">
      <div>🎁 Ưu đãi tháng 5: Giảm 20% tất cả dịch vụ</div>
      <div>☎ Hotline: 0123 456 789 &nbsp;&nbsp;&nbsp; 📍 Tìm chi nhánh</div>
    </div>
    <header className="navbar" style={{ position: 'relative' }}>
      <Link to="/" className="logo"><span className="logo-icon">🌸</span><div>Beauty<span>Salon & Spa</span></div></Link>
      
      <button 
        className="mobile-nav-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pink)' }}
      >
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
        <NavLink to="/" onClick={closeMenu}>Trang chủ</NavLink>
        <NavLink to="/services" onClick={closeMenu}>Dịch vụ</NavLink>
        <a href="/#promotion" onClick={closeMenu}>Khuyến mãi</a>
        <a href="/#technicians" onClick={closeMenu}>Kỹ thuật viên</a>
        <a href="/#about" onClick={closeMenu}>Về chúng tôi</a>
        <a href="/#contact" onClick={closeMenu}>Liên hệ</a>

        {user ? (
          <>
            <Link className="btn btn-outline" to="/customer" onClick={closeMenu}>Tài khoản</Link>
            <button className="btn" type="button" onClick={() => { handleLogout(); closeMenu(); }}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link className="btn btn-outline" to="/login" onClick={closeMenu}>Đăng nhập</Link>
            <Link className="btn" to="/register" onClick={closeMenu}>Đăng ký</Link>
          </>
        )}
      </nav>
    </header>
    {children}
  </>;
}
