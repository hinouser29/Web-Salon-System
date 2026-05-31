import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Plus, Edit, Trash2, Search, UserCheck, Shield, X } from 'lucide-react';
import { getAdminEmployees, createAdminEmployee, updateAdminEmployee, deleteAdminEmployee } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';

export default function AdminEmployees() {
  const { user, hasPermission } = useAuth();
  const canManage = hasPermission('EMPLOYEE_MANAGE');
  const isManager = user?.role === 'MANAGER';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: null,
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'STAFF',
    position: '',
    salary: 0,
    commissionRate: 0
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await getAdminEmployees();
      setEmployees(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu nhân sự');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getRoleBadge = (role) => {
    switch(role) {
      case 'MANAGER': return <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: '#e8eaf6', color: '#3f51b5' }}><Shield size={12} style={{marginRight: 4, verticalAlign: 'text-bottom'}} /> Quản lý</span>;
      case 'TECHNICIAN': return <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: '#e0f7fa', color: '#0097a7' }}>Kỹ thuật viên</span>;
      case 'RECEPTIONIST': return <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: '#f3e5f5', color: '#8e24aa' }}>Lễ tân</span>;
      case 'STAFF': return <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: '#e8f5e9', color: '#2e7d32' }}>Nhân viên</span>;
      default: return <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: '#eeeeee', color: '#616161' }}>{role}</span>;
    }
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setForm({
        id: emp.id,
        fullName: emp.fullName,
        email: emp.email,
        password: '', // Don't fetch password
        phone: emp.phone || '',
        role: emp.role || 'STAFF',
        position: emp.position || '',
        salary: emp.salary || 0,
        commissionRate: emp.commissionRate || 0
      });
    } else {
      setForm({
        id: null,
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'STAFF',
        position: '',
        salary: 0,
        commissionRate: 0
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
        await updateAdminEmployee(form.id, form);
      } else {
        await createAdminEmployee(form);
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu hồ sơ nhân viên');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn vô hiệu hóa tài khoản của "${name}"?`)) return;
    try {
      await deleteAdminEmployee(id);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể vô hiệu hóa');
    }
  };

  return (
    <AdminLayout>
      <div className="section-head" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-title">Quản lý Nhân sự</h2>
          <p className="muted">Quản lý tài khoản, vai trò và thông tin nhân viên.</p>
        </div>
        {canManage && (
          <button className="btn" onClick={() => handleOpenModal()}><Plus size={18} /> Thêm Nhân viên</button>
        )}
      </div>

      <div className="dashboard-card" style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Tìm kiếm nhân viên (tên, email, SĐT)..." className="input-field" style={{ paddingLeft: 36, width: '100%' }} />
          </div>
          <select className="input-field" style={{ width: 200 }}>
            <option value="">Tất cả Vai trò</option>
            <option value="TECHNICIAN">Kỹ thuật viên</option>
            <option value="RECEPTIONIST">Lễ tân</option>
            <option value="MANAGER">Quản lý</option>
          </select>
        </div>

        {error && !showModal && <p className="auth-error" style={{ margin: '12px 20px' }}>{error}</p>}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Nhân viên</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Chức vụ</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Vai trò (Role)</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Trạng thái</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{emp.fullName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{emp.email} • {emp.phone}</div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{emp.position || '—'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {getRoleBadge(emp.role)}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      {emp.status === 'ACTIVE' ? (
                        <UserCheck size={18} color="#2e7d32" title="Đang làm việc" />
                      ) : (
                        <span style={{ fontSize: 12, color: '#c62828', background: '#ffebee', padding: '4px 8px', borderRadius: 4 }}>Đã nghỉ</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {canManage ? (
                          (!isManager || (emp.role !== 'MANAGER' && emp.role !== 'ADMIN' && emp.role !== 'SUPER_ADMIN')) ? (
                            <>
                              <button onClick={() => handleOpenModal(emp)} className="btn-icon" style={{ padding: 6, color: '#1976d2', background: '#e3f2fd', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete(emp.id, emp.fullName)} className="btn-icon" style={{ padding: 6, color: '#d32f2f', background: '#ffebee', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: '#9e9e9e' }}>Không có quyền</span>
                          )
                        ) : (
                          <span style={{ fontSize: 12, color: '#9e9e9e' }}>Chỉ xem</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && !loading && (
                  <tr><td colSpan="5" className="muted" style={{ textAlign: 'center', padding: '32px' }}>Không có nhân viên nào</td></tr>
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
          <div className="card" style={{ width: '100%', maxWidth: 600, background: '#fff', padding: 24, borderRadius: 16, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{form.id ? 'Sửa Thông tin Nhân viên' : 'Thêm Nhân viên Mới'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            {error && <p className="auth-error" style={{ marginBottom: 16 }}>{error}</p>}
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Họ và Tên *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={form.fullName}
                    onChange={e => setForm({...form, fullName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Số điện thoại</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email (Dùng đăng nhập) *</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    disabled={!!form.id} // Cannot edit email once created
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Mật khẩu {form.id ? '(Bỏ trống nếu không đổi)' : '*'}</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required={!form.id}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Vai trò hệ thống (Role) *</label>
                  <select 
                    className="input-field"
                    value={form.role}
                    onChange={e => setForm({...form, role: e.target.value})}
                    required
                  >
                    <option value="STAFF">Nhân viên chung (STAFF)</option>
                    <option value="TECHNICIAN">Kỹ thuật viên (TECHNICIAN)</option>
                    <option value="RECEPTIONIST">Lễ tân (RECEPTIONIST)</option>
                    {!isManager && (
                      <>
                        <option value="MANAGER">Quản lý (MANAGER)</option>
                        <option value="ADMIN">Quản trị viên (ADMIN)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Chức danh hiển thị</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={form.position}
                    onChange={e => setForm({...form, position: e.target.value})}
                    placeholder="VD: Kỹ thuật viên Trưởng"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Mức lương cơ bản</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.salary}
                    onChange={e => setForm({...form, salary: Number(e.target.value)})}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>% Hoa hồng (0-100)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={form.commissionRate}
                    onChange={e => setForm({...form, commissionRate: Number(e.target.value)})}
                    min="0" max="100" step="0.1"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu Hồ sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
