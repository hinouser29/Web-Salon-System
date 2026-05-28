import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

function parseHash() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.substring(1)
    : window.location.hash;
  return Object.fromEntries(new URLSearchParams(hash));
}

function redirectByRole(navigate, role) {
  if (role === 'ADMIN' || role === 'MANAGER') navigate('/admin');
  else if (role === 'RECEPTIONIST') navigate('/receptionist');
  else if (role === 'TECHNICIAN') navigate('/technician');
  else navigate('/customer');
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = parseHash();
    const accessToken = params.accessToken;
    const refreshToken = params.refreshToken;

    if (!accessToken) {
      setError('Đăng nhập Google không trả về token. Vui lòng thử lại.');
      return;
    }

    localStorage.setItem('token', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    axiosClient.get('/users/me')
      .then((res) => {
        const user = res.data?.data;
        login({ accessToken, user });
        redirectByRole(navigate, user?.role);
      })
      .catch(() => {
        setError('Không thể tải hồ sơ sau đăng nhập Google.');
      });
  }, [login, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {error ? <p className="auth-error">{error}</p> : <p className="muted">Đang hoàn tất đăng nhập...</p>}
      </div>
    </div>
  );
}
