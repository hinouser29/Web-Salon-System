import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { Search, Eye } from 'lucide-react';
import { getAllCustomers } from '../../api/usersApi';

export default function AdminCustomers() {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['adminCustomers'],
    queryFn: getAllCustomers
  });

  const customers = data?.data?.data || [];
  const errorMessage = error ? (error.response?.data?.message || 'Không thể tải dữ liệu khách hàng') : '';

  return (
    <AdminLayout>
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Quản lý Khách hàng</h2>
          <p className="muted">Xem danh sách khách hàng và lịch sử tương tác.</p>
        </div>
      </div>

      <div className="dashboard-card" style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Tìm kiếm khách hàng (tên, SĐT, email)..." className="input-field" style={{ paddingLeft: 36, width: '100%' }} />
          </div>
          <select className="input-field" style={{ width: 200 }}>
            <option value="">Lọc hạng thành viên</option>
            <option value="bronze">Đồng</option>
            <option value="silver">Bạc</option>
            <option value="gold">Vàng</option>
          </select>
        </div>

        {errorMessage && <p className="auth-error" style={{ margin: '12px 20px' }}>{errorMessage}</p>}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Khách hàng</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Ngày sinh</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Điểm tích lũy</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Ngày đăng ký</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(cust => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{cust.fullName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cust.phone} • {cust.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>{cust.birthday || '—'}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--pink)', fontWeight: 600 }}>
                      {cust.loyaltyPoints}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button className="btn-icon" style={{ padding: 6, color: '#1976d2', background: '#e3f2fd', borderRadius: 6, border: 'none', cursor: 'pointer' }} title="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && !loading && (
                  <tr><td colSpan="5" className="muted" style={{ textAlign: 'center', padding: '32px' }}>Không có khách hàng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
