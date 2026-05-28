import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserRoles, assignUserRole, revokeUserRole, getRoles } from '../../api/adminApi';

export default function UserRolesPage() {
  const { userId } = useParams();
  const [userRoles, setUserRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, userRolesRes] = await Promise.all([
        getRoles(),
        getUserRoles(userId)
      ]);
      setAllRoles(rolesRes.data.data || []);
      setUserRoles(userRolesRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const assignedRoleIds = new Set(userRoles.map(ur => ur.roleId));
  const availableRoles = allRoles.filter(r => !assignedRoleIds.has(r.id));

  const handleAssign = async () => {
    if (!selectedRoleId) return;
    try {
      setSaving(true);
      setError('');
      await assignUserRole(userId, { roleId: selectedRoleId, expiresAt: null });
      setSuccess('Đã gán role thành công');
      setSelectedRoleId('');
      setShowAssign(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gán role');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (roleId, roleName) => {
    if (!window.confirm(`Bạn có chắc muốn thu hồi role "${roleName}" của user này?`)) return;
    try {
      setError('');
      await revokeUserRole(userId, roleId);
      setSuccess(`Đã thu hồi role ${roleName}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thu hồi role');
    }
  };

  if (loading) return <div className="admin-rbac-page"><p className="muted" style={{ textAlign: 'center', padding: 40 }}>Đang tải...</p></div>;

  return (
    <div className="admin-rbac-page">
      <div className="rbac-header">
        <div>
          <Link to="/admin/roles" className="rbac-back">← Quay lại</Link>
          <h2>Quản lý Role của User</h2>
          <p className="muted">User ID: <code>{userId}</code></p>
        </div>
        <button className="btn" onClick={() => setShowAssign(!showAssign)} disabled={availableRoles.length === 0}>
          {showAssign ? '✕ Đóng' : '＋ Gán Role'}
        </button>
      </div>

      {error && <p className="auth-error" style={{ margin: '8px 0' }}>{error}</p>}
      {success && <p className="auth-success" style={{ margin: '8px 0' }}>{success}</p>}

      {showAssign && (
        <div className="card rbac-assign-form">
          <h3>Gán Role mới</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Chọn Role</label>
              <select value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)}>
                <option value="">— Chọn role —</option>
                {availableRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.displayName} ({r.name})</option>
                ))}
              </select>
            </div>
            <button className="btn" onClick={handleAssign} disabled={saving || !selectedRoleId}>
              {saving ? 'Đang gán...' : 'Gán'}
            </button>
          </div>
        </div>
      )}

      <div className="rbac-table-wrap">
        <table className="rbac-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Tên hiển thị</th>
              <th>Trạng thái</th>
              <th>Ngày gán</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {userRoles.map(ur => (
              <tr key={ur.id}>
                <td><span className="badge">{ur.roleName}</span></td>
                <td>{ur.roleDisplayName}</td>
                <td>
                  <span className={`badge ${ur.active ? 'badge-active' : 'badge-expired'}`}>
                    {ur.active ? 'Đang hoạt động' : 'Hết hạn'}
                  </span>
                </td>
                <td className="muted">{new Date(ur.assignedAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button className="btn-sm btn-danger" onClick={() => handleRevoke(ur.roleId, ur.roleName)}>
                    🗑 Thu hồi
                  </button>
                </td>
              </tr>
            ))}
            {userRoles.length === 0 && (
              <tr><td colSpan="5" className="muted" style={{ textAlign: 'center' }}>User chưa có role nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
