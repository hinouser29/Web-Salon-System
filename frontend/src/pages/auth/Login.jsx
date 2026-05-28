import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { API_BASE_URL } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

function redirectByRole(navigate, role) {
  if (role === 'ADMIN' || role === 'MANAGER') navigate('/admin');
  else if (role === 'RECEPTIONIST') navigate('/receptionist');
  else if (role === 'TECHNICIAN') navigate('/technician');
  else navigate('/customer');
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axiosClient.post('/auth/login', form);
      const authData = res.data?.data;
      login(authData);
      redirectByRole(navigate, authData?.user?.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu chưa đúng.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  return <div className="auth-page">
    <form className="auth-card" onSubmit={submit}>
      <div className="eyebrow">Welcome back</div>
      <h2>Đăng nhập</h2>
      {error && <p className="auth-error">{error}</p>}

      <label>Email</label>
      <input
        placeholder="Nhập email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <label>Mật khẩu</label>
      <input
        placeholder="Nhập mật khẩu"
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button className="btn" style={{width:'100%',marginTop:10}}>Đăng nhập</button>

      <div className="auth-links">
        <Link className="see-all" to="/forgot-password">Quên mật khẩu?</Link>
        <Link className="see-all" to="/verify-email">Xác thực email</Link>
      </div>

      <div className="auth-divider"><span>hoặc</span></div>
      <div className="google-box">
        <button type="button" className="btn outline" onClick={handleGoogleLogin}>
          Đăng nhập với Google
        </button>
      </div>

      <p className="muted">Chưa có tài khoản? <Link className="see-all" to="/register">Đăng ký ngay</Link></p>
    </form>
  </div>;
}
