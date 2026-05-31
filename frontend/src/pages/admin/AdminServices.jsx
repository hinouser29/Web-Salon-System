import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { getAllAdminServices, createService, updateService, deleteService } from '../../api/servicesApi';
import { useAuth } from '../../context/AuthContext';

export default function AdminServices() {
  const { user, hasPermission } = useAuth();
  
  const canCreate = hasPermission('SERVICE_CREATE');
  const canUpdate = hasPermission('SERVICE_UPDATE');
  const canDelete = hasPermission('SERVICE_DELETE');
  const [error, setError] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    durationMinutes: 60,
    price: 0,
    active: true
  });

  const { data, isLoading: loading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminServices'],
    queryFn: getAllAdminServices
  });

  const services = data?.data?.data || [];
  const errorMessage = fetchError ? (fetchError.response?.data?.message || 'Không thể tải dữ liệu dịch vụ') : error;

  const handleOpenModal = (service = null) => {
    if (service) {
      setForm({
        id: service.id,
        name: service.name,
        description: service.description || '',
        durationMinutes: service.durationMinutes,
        price: service.price,
        active: service.active
      });
    } else {
      setForm({
        id: null,
        name: '',
        description: '',
        durationMinutes: 60,
        price: 0,
        active: true
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      if (form.id) {
        await updateService(form.id, form);
      } else {
        await createService(form);
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu dịch vụ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ "${name}"?`)) return;
    try {
      await deleteService(id);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa dịch vụ');
    }
  };

  return (
    <AdminLayout>
      <div className="section-head" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-title">Quản lý Dịch vụ</h2>
          <p className="muted">Thêm, sửa, xóa các dịch vụ và combo của Spa.</p>
        </div>
        {canCreate && (
          <button className="btn" onClick={() => handleOpenModal()}><Plus size={18} /> Thêm Dịch vụ</button>
        )}
      </div>

      <div className="dashboard-card" style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Tìm kiếm dịch vụ..." className="input-field" style={{ paddingLeft: 36, width: '100%' }} />
          </div>
          <select className="input-field" style={{ width: 200 }}>
            <option value="">Tất cả danh mục</option>
            <option value="skin">Chăm sóc da</option>
            <option value="massage">Massage</option>
          </select>
        </div>

        {errorMessage && !showModal && <p className="auth-error" style={{ margin: '12px 20px' }}>{errorMessage}</p>}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Tên dịch vụ</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Danh mục</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Thời gian</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Giá (VND)</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Trạng thái</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 500 }}>{service.name}</td>
                    <td style={{ padding: '16px 20px' }}>{service.categoryName || service.category || '—'}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>{service.durationMinutes}p</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--pink)', fontWeight: 600 }}>
                      {new Intl.NumberFormat('vi-VN').format(service.price)}đ
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                        background: service.active ? '#e8f5e9' : '#ffebee', 
                        color: service.active ? '#2e7d32' : '#c62828' 
                      }}>
                        {service.active ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {canUpdate && (
                          <button onClick={() => handleOpenModal(service)} className="btn-icon" style={{ padding: 6, color: '#1976d2', background: '#e3f2fd', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                            <Edit size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(service.id, service.name)} className="btn-icon" style={{ padding: 6, color: '#d32f2f', background: '#ffebee', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                        {!canUpdate && !canDelete && (
                          <span style={{ fontSize: 12, color: '#9e9e9e' }}>Chỉ xem</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && !loading && (
                  <tr><td colSpan="6" className="muted" style={{ textAlign: 'center', padding: '32px' }}>Không có dịch vụ nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, background: '#fff', padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{form.id ? 'Sửa Dịch vụ' : 'Thêm Dịch vụ Mới'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            {error && <p className="auth-error" style={{ marginBottom: 16 }}>{error}</p>}
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tên dịch vụ *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Thời gian (phút) *</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.durationMinutes}
                    onChange={e => setForm({...form, durationMinutes: Number(e.target.value)})}
                    required min="5"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Giá (VND) *</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.price}
                    onChange={e => setForm({...form, price: Number(e.target.value)})}
                    required min="0"
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Mô tả</label>
                <textarea 
                  className="input-field" 
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                ></textarea>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.active}
                    onChange={e => setForm({...form, active: e.target.checked})}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>Đang hoạt động (Hiển thị cho khách)</span>
                </label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu Dịch vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
