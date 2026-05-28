import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// Translate English backend error messages to Vietnamese
function translateError(msg) {
  if (!msg) return 'Không thể đăng ký. Vui lòng kiểm tra lại thông tin.';
  const map = {
    'Email is already registered': 'Email này đã được đăng ký. Vui lòng dùng email khác.',
    'Password must be at least 8 characters long': 'Mật khẩu phải có ít nhất 8 ký tự.',
    'Password must not exceed 100 characters': 'Mật khẩu không được vượt quá 100 ký tự.',
    'Password must contain at least one uppercase letter': 'Mật khẩu phải có ít nhất 1 chữ hoa (A-Z).',
    'Password must contain at least one lowercase letter': 'Mật khẩu phải có ít nhất 1 chữ thường (a-z).',
    'Password must contain at least one digit': 'Mật khẩu phải có ít nhất 1 chữ số (0-9).',
    'Password must contain at least one special character': 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (vd: @, #, !).',
    'Email is required': 'Vui lòng nhập email.',
    'Invalid email format': 'Định dạng email không hợp lệ.',
    'Password is required': 'Vui lòng nhập mật khẩu.',
  };
  return map[msg] || msg;
}

// Client-side password validation
function validatePassword(password) {
  if (!password || password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ hoa (A-Z).';
  if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường (a-z).';
  if (!/\d/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ số (0-9).';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@, #, !, ...).';
  return null;
}

// Password strength checker
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Yếu', color: '#d93025' };
  if (score <= 3) return { score, label: 'Trung bình', color: '#f29900' };
  if (score === 4) return { score, label: 'Khá', color: '#1a73e8' };
  return { score, label: 'Mạnh', color: '#188038' };
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    role: 'USER'
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!form.email.trim()) {
      setIsError(true);
      setMessage('Vui lòng nhập email.');
      return;
    }
    const pwdError = validatePassword(form.password);
    if (pwdError) {
      setIsError(true);
      setMessage(pwdError);
      return;
    }

    try {
      setLoading(true);
      setIsError(false);
      setMessage('');
      const res = await axiosClient.post('/auth/register', {
        ...form,
        dateOfBirth: form.dateOfBirth || null
      });
      setMessage(res.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(form.email)}`), 1500);
    } catch (err) {
      setIsError(true);
      const backendMsg = err.response?.data?.message;
      setMessage(translateError(backendMsg));
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = [
    { label: 'Ít nhất 8 ký tự', ok: form.password.length >= 8 },
    { label: 'Có chữ hoa (A-Z)', ok: /[A-Z]/.test(form.password) },
    { label: 'Có chữ thường (a-z)', ok: /[a-z]/.test(form.password) },
    { label: 'Có chữ số (0-9)', ok: /\d/.test(form.password) },
    { label: 'Có ký tự đặc biệt (@, #, !...)', ok: /[^A-Za-z0-9]/.test(form.password) },
  ];

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="eyebrow">Create account</div>
        <h2>Đăng ký</h2>
        {message && <p className={isError ? 'auth-error' : 'auth-success'}>{message}</p>}

        <input
          name="fullName"
          placeholder="Họ tên"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={handleChange}
        />

        <div style={{ position: 'relative' }}>
          <input
            name="password"
            placeholder="Mật khẩu"
            type="password"
            value={form.password}
            onChange={handleChange}
            onFocus={() => setShowPasswordHints(true)}
            onBlur={() => setShowPasswordHints(false)}
            required
            style={{ margin: '8px 0 4px', width: '100%', height: 46, border: '1px solid var(--border)', borderRadius: 10, padding: '0 14px' }}
          />

          {/* Strength bar */}
          {form.password && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: i <= strength.score ? strength.color : '#e0e0e0',
                    transition: 'background 0.2s'
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: strength.color, fontWeight: 600 }}>
                Mức độ bảo mật: {strength.label}
              </span>
            </div>
          )}

          {/* Password requirements checklist */}
          {(showPasswordHints || form.password) && (
            <div style={{
              background: '#fff8fc', border: '1px solid #fce4ec', borderRadius: 8,
              padding: '8px 12px', marginBottom: 10, fontSize: 13
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#555' }}>Yêu cầu mật khẩu:</div>
              {passwordChecks.map((check, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: check.ok ? '#188038' : '#999', marginBottom: 2
                }}>
                  <span style={{ fontSize: 14 }}>{check.ok ? '✅' : '○'}</span>
                  {check.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <select name="role" value={form.role} onChange={handleChange} required style={{ marginBottom: 10 }}>
          <option value="USER">Người dùng</option>
          <option value="SUPPORT">Hỗ trợ viên (Support)</option>
          <option value="STAFF">Nhân viên (Staff)</option>
          <option value="SUPER_ADMIN">Quản trị viên (Super Admin)</option>
        </select>

        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">Chọn giới tính</option>
          <option value="Male">Nam</option>
          <option value="Female">Nữ</option>
          <option value="Other">Khác</option>
        </select>

        <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
        <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} />

        <button className="btn" style={{ width: '100%', marginTop: 10 }} disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        <p className="muted">Đã có tài khoản? <Link className="see-all" to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}
