import { useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axiosClient from '../../api/axiosClient';
import { Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle, Save } from 'lucide-react';

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setIsError(true);
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    if (form.newPassword.length < 6) {
      setIsError(true);
      setMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setSaving(true);
      setIsError(false);
      setMessage('');
      const res = await axiosClient.post('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setMessage(res.data.message || 'Đổi mật khẩu thành công');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const toggleShow = (field) => {
    setShowPwd(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <CustomerLayout>
      <div className="section-head" style={{ marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--pink)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>SECURITY</div>
          <h2 className="section-title" style={{ fontSize: 28, margin: 0 }}>Đổi mật khẩu</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Info Card */}
        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #2c3e50, #3498db)', borderRadius: 16, padding: 32, color: '#fff', boxShadow: '0 8px 24px rgba(52,152,219,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <ShieldCheck size={48} style={{ marginBottom: 24, opacity: 0.9 }} />
          <h3 style={{ margin: '0 0 12px', fontSize: 22 }}>Bảo vệ tài khoản</h3>
          <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.6 }}>
            Mật khẩu mạnh là tuyến phòng thủ đầu tiên bảo vệ thông tin cá nhân của bạn. Vui lòng sử dụng kết hợp chữ hoa, chữ thường và số để đảm bảo an toàn tối đa.
          </p>
        </div>

        {/* Form Card */}
        <form className="dashboard-card" onSubmit={submit} style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          
          {message && (
            <div className={`alert ${isError ? 'error' : 'success'}`} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              {isError ? <AlertCircle size={18}/> : <CheckCircle size={18}/>} {message}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Mật khẩu hiện tại</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field"
                type={showPwd.old ? 'text' : 'password'} 
                value={form.oldPassword} 
                onChange={e => setForm({ ...form, oldPassword: e.target.value })} 
                style={{ padding: '12px 16px', borderRadius: 10, width: '100%', paddingRight: 40 }}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button 
                type="button" 
                onClick={() => toggleShow('old')}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                {showPwd.old ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Mật khẩu mới</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field"
                type={showPwd.new ? 'text' : 'password'} 
                value={form.newPassword} 
                onChange={e => setForm({ ...form, newPassword: e.target.value })} 
                style={{ padding: '12px 16px', borderRadius: 10, width: '100%', paddingRight: 40 }}
                placeholder="Ít nhất 6 ký tự"
              />
              <button 
                type="button" 
                onClick={() => toggleShow('new')}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                {showPwd.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Nhập lại mật khẩu mới</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field"
                type={showPwd.confirm ? 'text' : 'password'} 
                value={form.confirmPassword} 
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} 
                style={{ padding: '12px 16px', borderRadius: 10, width: '100%', paddingRight: 40 }}
                placeholder="Xác nhận mật khẩu mới"
              />
              <button 
                type="button" 
                onClick={() => toggleShow('confirm')}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                {showPwd.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="btn primary" disabled={saving || !form.oldPassword || !form.newPassword || !form.confirmPassword} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', fontSize: 16 }}>
            <Save size={18} /> {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </CustomerLayout>
  );
}
