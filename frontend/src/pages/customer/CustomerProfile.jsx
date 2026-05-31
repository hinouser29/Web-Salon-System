import { useEffect, useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axiosClient, { resolveFileUrl } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { Camera, CheckCircle, AlertCircle, Save, Award } from 'lucide-react';

export default function CustomerProfile() {
  const { login, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    loyaltyPoints: 0,
    membershipLevel: 'Normal'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formatDate = (value) => value ? value.substring(0, 10) : '';

  const mapProfileToForm = (profile) => ({
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    avatarUrl: profile.avatarUrl || '',
    gender: profile.gender || '',
    dateOfBirth: formatDate(profile.birthday),
    address: profile.address || '',
    loyaltyPoints: profile.loyaltyPoints || 0,
    membershipLevel: profile.membershipLevel || 'Normal'
  });

  const syncAuthUser = (profile) => {
    const newUser = {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      role: profile.role
    };

    login({ user: newUser, accessToken: localStorage.getItem('token') });
    updateUser(newUser);
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError('');
        const res = await axiosClient.get('/users/me');
        const profile = res.data.data || res.data;
        setForm(mapProfileToForm(profile));
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải hồ sơ cá nhân');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      setMessage('');
      const data = new FormData();
      data.append('file', file);
      const res = await axiosClient.put('/users/avatar', data);
      const profile = res.data.data || res.data;
      setForm(mapProfileToForm(profile));
      syncAuthUser(profile);
      setMessage('Cập nhật ảnh đại diện thành công');
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const res = await axiosClient.put('/users/me', {
        fullName: form.fullName,
        phone: form.phone,
        gender: form.gender,
        birthday: form.dateOfBirth || null,
        address: form.address
      });

      const updatedProfile = res.data.data || res.data;
      setForm(mapProfileToForm(updatedProfile));
      syncAuthUser(updatedProfile);
      setMessage('Cập nhật hồ sơ thành công');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = form.avatarUrl ? resolveFileUrl(form.avatarUrl) : '';

  return (
    <CustomerLayout>
      <div className="section-head" style={{ marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--pink)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>SETTINGS</div>
          <h2 className="section-title" style={{ fontSize: 28, margin: 0 }}>Hồ sơ cá nhân</h2>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card" style={{ padding: 40, textAlign: 'center', color: '#666' }}>Đang tải hồ sơ...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          
          {/* Avatar and Level Section */}
          <div className="dashboard-card" style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: 120, height: 120, borderRadius: '50%', background: '#f5f5f5', border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--pink)', overflow: 'hidden'
              }}>
                {avatarSrc ? <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (form.fullName ? form.fullName.charAt(0).toUpperCase() : 'K')}
              </div>
              
              <label style={{ 
                position: 'absolute', bottom: 0, right: 0, background: 'var(--pink)', color: '#fff', 
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', boxShadow: '0 4px 8px rgba(226,56,120,0.4)', transition: 'transform 0.2s'
              }} className="avatar-upload-btn">
                {uploading ? <div className="spinner" style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Camera size={18} />}
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 24 }}>{form.fullName || 'Khách hàng'}</h3>
              <p style={{ margin: '0 0 16px', color: '#666' }}>{form.email}</p>
              
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ background: '#fdf3ed', padding: '10px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={20} color="#cd7f32" />
                  <div>
                    <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>HẠNG THÀNH VIÊN</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#cd7f32' }}>{form.membershipLevel}</div>
                  </div>
                </div>
                <div style={{ background: '#fafafa', padding: '10px 16px', borderRadius: 10, border: '1px solid #eee' }}>
                  <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>ĐIỂM THƯỞNG</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{form.loyaltyPoints}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form className="dashboard-card" onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>Thông tin liên hệ</h3>
            
            {message && <div className="alert success" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={18}/> {message}</div>}
            {error && <div className="alert error" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={18}/> {error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Họ và tên</label>
                <input className="input-field" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nhập họ tên" style={{ padding: '12px 16px', borderRadius: 10 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Email (Không thể đổi)</label>
                <input className="input-field" name="email" value={form.email} disabled style={{ padding: '12px 16px', borderRadius: 10, background: '#f5f5f5', color: '#888' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Số điện thoại</label>
                <input className="input-field" name="phone" value={form.phone} onChange={handleChange} placeholder="Nhập số điện thoại" style={{ padding: '12px 16px', borderRadius: 10 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Giới tính</label>
                <select className="input-field" name="gender" value={form.gender} onChange={handleChange} style={{ padding: '12px 16px', borderRadius: 10 }}>
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Ngày sinh</label>
                <input className="input-field" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} style={{ padding: '12px 16px', borderRadius: 10 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#444' }}>Địa chỉ</label>
                <input className="input-field" name="address" value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ" style={{ padding: '12px 16px', borderRadius: 10 }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn primary" type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 16 }}>
                <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}
      <style>{`
        .avatar-upload-btn:hover {
          transform: scale(1.1);
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </CustomerLayout>
  );
}
