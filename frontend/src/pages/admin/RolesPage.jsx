import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRoles, createRole, deleteRole } from '../../api/adminApi';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', displayName: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      setRoles(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await createRole(form);
      setForm({ name: '', displayName: '', description: '' });
      setShowForm(false);
      await fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa role "${name}"?`)) return;
    try {
      await deleteRole(id);
      await fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa role');
    }
  };

  return (
    <div className="admin-rbac-page">
      <div className="rbac-header">
        <div>
          <div className="eyebrow">Administration</div>
          <h2>Quản lý Vai trò (Roles)</h2>
        </div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Đóng' : '＋ Tạo Role mới'}
        </button>
      </div>

      {error && <p className="auth-error" style={{ margin: '12px 0' }}>{error}</p>}

      {showForm && (
        <form className="rbac-form card" onSubmit={handleCreate}>
          <h3>Tạo Role mới</h3>
          <div className="rbac-form-grid">
            <div>
              <label>Mã role (viết hoa, không dấu)</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="VD: BRANCH_MANAGER"
                required
              />
            </div>
            <div>
              <label>Tên hiển thị</label>
              <input
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                placeholder="VD: Quản lý chi nhánh"
                required
              />
            </div>
          </div>
          <label>Mô tả</label>
          <input
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả vai trò"
          />
          <button className="btn" style={{ marginTop: 12 }} disabled={saving}>
            {saving ? 'Đang tạo...' : 'Tạo Role'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted" style={{ textAlign: 'center', padding: 40 }}>Đang tải...</p>
      ) : (
        <div className="rbac-table-wrap">
          <table className="rbac-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên hiển thị</th>
                <th>Mô tả</th>
                <th>Loại</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td><span className="badge">{role.name}</span></td>
                  <td>{role.displayName}</td>
                  <td className="muted">{role.description || '—'}</td>
                  <td>
                    <span className={`badge ${role.system ? 'badge-system' : 'badge-custom'}`}>
                      {role.system ? 'Hệ thống' : 'Tùy chỉnh'}
                    </span>
                  </td>
                  <td className="rbac-actions">
                    <Link to={`/admin/roles/${role.id}/permissions`} className="btn-sm">
                      🔑 Permissions
                    </Link>
                    {!role.system && (
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(role.id, role.name)}>
                        🗑 Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr><td colSpan="5" className="muted" style={{ textAlign: 'center' }}>Chưa có role nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
