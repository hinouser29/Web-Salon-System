import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminSystemLogs } from '../../api/adminApi';
import { Activity, Search, Clock, User, Info } from 'lucide-react';

export default function AdminSystemLogs() {
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['systemLogs', page],
    queryFn: () => getAdminSystemLogs({ page, size: 20 }),
    keepPreviousData: true
  });

  const logs = data?.data?.data?.content || [];
  const totalPages = data?.data?.data?.totalPages || 0;
  const errorMessage = error ? (error.response?.data?.message || 'Không thể tải lịch sử hệ thống') : '';

  return (
    <AdminLayout>
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Nhật ký Hệ thống (System Logs)</h2>
          <p className="muted">Lịch sử giám sát các thao tác nhạy cảm do quản trị viên hoặc hệ thống thực hiện.</p>
        </div>
      </div>

      <div className="dashboard-card" style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Tìm kiếm hành động..." className="input-field" style={{ paddingLeft: 36, width: '100%' }} />
          </div>
        </div>

        {errorMessage && <p className="auth-error" style={{ margin: '12px 20px' }}>{errorMessage}</p>}
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Thời gian</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Người thực hiện</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Hành động</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                      <Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={14} /> {log.userFullName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 20 }}>{log.userEmail}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                        background: '#e3f2fd', color: '#1976d2' 
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#424242' }}>
                      <Info size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--text-muted)' }} />
                      {log.description}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !isLoading && (
                  <tr><td colSpan="4" className="muted" style={{ textAlign: 'center', padding: '32px' }}>Không có lịch sử nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button 
              className="btn btn-outline" 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
            >
              Trang trước
            </button>
            <span style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, fontWeight: 500 }}>
              {page + 1} / {totalPages}
            </span>
            <button 
              className="btn btn-outline" 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
