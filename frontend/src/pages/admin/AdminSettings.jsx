import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminConfigs, updateAdminConfigs } from '../../api/adminApi';
import { Save, Settings } from 'lucide-react';

export default function AdminSettings() {
  const [configs, setConfigs] = useState({
    spa_name: '',
    spa_phone: '',
    spa_email: '',
    loyalty_point_rate: '',
    open_time: '',
    close_time: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const res = await getAdminConfigs();
        setConfigs(res.data.data || {});
      } catch (err) {
        setError('Không thể tải cấu hình hệ thống');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfigs(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');
      
      await updateAdminConfigs({ configs });
      setMessage('Lưu cấu hình thành công!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Cài đặt Hệ thống</h2>
          <p className="muted">Cấu hình thông tin liên hệ và chính sách của Spa.</p>
        </div>
      </div>

      <div className="dashboard-card" style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-soft)', maxWidth: 800 }}>
        <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={20} color="var(--pink)" /> Thông số cơ bản
        </h3>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>
        ) : (
          <form onSubmit={handleSave}>
            {message && <p style={{ color: '#2e7d32', background: '#e8f5e9', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>{message}</p>}
            {error && <p className="auth-error" style={{ marginBottom: 16 }}>{error}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tên thương hiệu Spa</label>
                <input 
                  type="text" 
                  name="spa_name"
                  className="input-field" 
                  value={configs.spa_name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tỷ lệ điểm thưởng (VND = 1 điểm)</label>
                <input 
                  type="number" 
                  name="loyalty_point_rate"
                  className="input-field" 
                  value={configs.loyalty_point_rate || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Số điện thoại Hotline</label>
                <input 
                  type="text" 
                  name="spa_phone"
                  className="input-field" 
                  value={configs.spa_phone || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email liên hệ</label>
                <input 
                  type="email" 
                  name="spa_email"
                  className="input-field" 
                  value={configs.spa_email || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Giờ mở cửa</label>
                <input 
                  type="time" 
                  name="open_time"
                  className="input-field" 
                  value={configs.open_time || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Giờ đóng cửa</label>
                <input 
                  type="time" 
                  name="close_time"
                  className="input-field" 
                  value={configs.close_time || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu Thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
