import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoleById, getGroupedPermissions, assignPermissions, revokePermission } from '../../api/adminApi';

export default function RolePermissionsPage() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [grouped, setGrouped] = useState({});
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roleRes, permRes] = await Promise.all([
        getRoleById(id),
        getGroupedPermissions()
      ]);
      const roleData = roleRes.data.data;
      setRole(roleData);
      setGrouped(permRes.data.data || {});
      setAssignedIds(new Set((roleData.permissions || []).map(p => p.id)));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleToggle = async (permId, isAssigned) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (isAssigned) {
        await revokePermission(id, permId);
        setAssignedIds(prev => { const s = new Set(prev); s.delete(permId); return s; });
        setSuccess('Đã thu hồi permission');
      } else {
        await assignPermissions(id, [permId]);
        setAssignedIds(prev => new Set(prev).add(permId));
        setSuccess('Đã gán permission');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-rbac-page"><p className="muted" style={{ textAlign: 'center', padding: 40 }}>Đang tải...</p></div>;

  return (
    <div className="admin-rbac-page">
      <div className="rbac-header">
        <div>
          <Link to="/admin/roles" className="rbac-back">← Quay lại danh sách Roles</Link>
          <h2>Phân quyền cho: <span className="badge badge-lg">{role?.name}</span></h2>
          <p className="muted">{role?.displayName} — {role?.description || 'Không có mô tả'}</p>
        </div>
      </div>

      {error && <p className="auth-error" style={{ margin: '8px 0' }}>{error}</p>}
      {success && <p className="auth-success" style={{ margin: '8px 0' }}>{success}</p>}

      <div className="permission-groups">
        {Object.entries(grouped).sort().map(([resource, perms]) => (
          <div key={resource} className="card permission-group">
            <h3 className="permission-resource-title">
              <span className="resource-icon">📁</span> {resource}
            </h3>
            <div className="permission-list">
              {perms.map(perm => {
                const isAssigned = assignedIds.has(perm.id);
                return (
                  <label key={perm.id} className={`permission-item ${isAssigned ? 'assigned' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      disabled={saving}
                      onChange={() => handleToggle(perm.id, isAssigned)}
                    />
                    <div className="permission-info">
                      <span className="permission-code">{perm.code}</span>
                      <span className="permission-desc muted">{perm.description || perm.action}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
