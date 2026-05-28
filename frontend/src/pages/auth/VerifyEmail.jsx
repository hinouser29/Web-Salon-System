import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

function translateError(msg) {
  if (!msg) return 'Xác thực thất bại. Vui lòng thử lại.';
  const map = {
    'Invalid or expired token': 'Mã OTP không hợp lệ hoặc đã hết hạn.',
    'Token has already been used': 'Mã OTP này đã được sử dụng rồi.',
    'OTP does not match the provided email.': 'Mã OTP không khớp với email. Vui lòng kiểm tra lại.',
    'Unauthorized': 'Phiên làm việc không hợp lệ. Vui lòng thử lại.',
  };
  return map[msg] || msg;
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialEmail = useMemo(() => params.get('email') || '', [params]);
  const [form, setForm] = useState({ email: initialEmail, otp: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    if (!form.otp || form.otp.trim().length !== 6) {
      setIsError(true);
      setMessage('Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }
    try {
      setLoading(true);
      setIsError(false);
      setMessage('');
      // Backend endpoint: POST /api/auth/verify-otp, body: { email, otp }
      const res = await axiosClient.post('/auth/verify-otp', {
        email: form.email.trim(),
        otp: form.otp.trim()
      });
      setMessage(res.data.message || 'Xác thực email thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setIsError(true);
      const backendMsg = err.response?.data?.message;
      setMessage(translateError(backendMsg));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!form.email) {
      setIsError(true);
      setMessage('Vui lòng nhập email trước khi gửi lại mã.');
      return;
    }
    try {
      setResending(true);
      setIsError(false);
      setMessage('');
      // Backend endpoint: POST /api/auth/resend-verification, body: { email }
      const res = await axiosClient.post('/auth/resend-verification', {
        email: form.email.trim()
      });
      setMessage(res.data.message || 'Đã gửi lại mã OTP. Vui lòng kiểm tra hộp thư email của bạn.');
    } catch (err) {
      setIsError(true);
      const backendMsg = err.response?.data?.message;
      setMessage(translateError(backendMsg));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={verify}>
        <div className="eyebrow">Email verification</div>
        <h2>Xác thực email</h2>

        {/* Info box */}
        <div style={{
          background: '#fff8fc', border: '1px solid #fce4ec',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#555'
        }}>
          Mã OTP đã được gửi đến email <strong>{form.email || 'của bạn'}</strong>.
          Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).
        </div>

        {message && (
          <p className={isError ? 'auth-error' : 'auth-success'} style={{ marginBottom: 12 }}>
            {message}
          </p>
        )}

        <label style={{ fontWeight: 600, fontSize: 14 }}>Email</label>
        <input
          value={form.email}
          type="email"
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="Nhập email"
          required
        />

        <label style={{ fontWeight: 600, fontSize: 14 }}>Mã xác thực</label>
        <input
          value={form.otp}
          onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
          placeholder="Nhập mã 6 chữ số"
          inputMode="numeric"
          maxLength={6}
          style={{ letterSpacing: 8, fontSize: 20, textAlign: 'center' }}
        />

        <button className="btn" style={{ width: '100%', marginTop: 10 }} disabled={loading}>
          {loading ? 'Đang xác thực...' : 'Xác thực'}
        </button>
        <button
          type="button"
          className="btn outline"
          style={{ width: '100%', marginTop: 10 }}
          onClick={resend}
          disabled={resending}
        >
          {resending ? 'Đang gửi lại...' : 'Gửi lại mã'}
        </button>
        <p className="muted">
          <Link className="see-all" to="/login">Quay lại đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
