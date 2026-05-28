import { useEffect, useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import axiosClient, { resolveFileUrl } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

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
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = form.avatarUrl ? resolveFileUrl(form.avatarUrl) : '';

  return (
    <CustomerLayout>
      <div className="section-head">
        <div>
          <div className="eyebrow">Customer Profile</div>
          <h2 className="section-title">Hồ sơ cá nhân</h2>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card">Đang tải hồ sơ...</div>
      ) : (
        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-avatar image-avatar">
              {avatarSrc ? <img src={avatarSrc} alt="Avatar" /> : (form.fullName ? form.fullName.charAt(0).toUpperCase() : 'K')}
            </div>
            <h3>{form.fullName || 'Khách hàng'}</h3>
            <p className="muted">{form.email}</p>

            <label className="btn outline avatar-upload">
              {uploading ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>

            <div className="profile-info-list">
              <div><span>Hạng thành viên</span><strong>{form.membershipLevel}</strong></div>
              <div><span>Điểm thưởng</span><strong>{form.loyaltyPoints}</strong></div>
            </div>
          </div>

          <form className="profile-form dashboard-card" onSubmit={handleSubmit}>
            {message && <div className="alert success">{message}</div>}
            {error && <div className="alert error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nhập họ tên" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" value={form.email} disabled />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Nhập số điện thoại" />
              </div>
              <div className="form-group">
                <label>Giới tính</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày sinh</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ" />
              </div>
            </div>

            <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </form>
        </div>
      )}
    </CustomerLayout>
  );
}
