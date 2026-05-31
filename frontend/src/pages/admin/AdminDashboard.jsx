import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, CreditCard, CalendarCheck, TrendingUp } from 'lucide-react';
import { getAdminDashboardStats } from '../../api/adminApi';

export default function AdminDashboard() {
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await getAdminDashboardStats();
      return res.data.data;
    },
    initialData: { totalCustomers: 0, monthlyRevenue: 0, todayAppointments: 0 },
  });

  return (
    <AdminLayout>
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Tổng quan Hệ thống</h2>
          <p className="muted">Chào mừng trở lại, Quản trị viên!</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu tổng quan...</div>
      ) : (
        <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>Tổng Khách hàng</p>
                <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>{stats.totalCustomers.toLocaleString()}</h3>
              </div>
              <div style={{ background: '#e8f5e9', padding: 10, borderRadius: 10, color: '#2e7d32' }}><Users size={24} /></div>
            </div>
          </div>

          <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>Doanh thu Tháng này</p>
                <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>{new Intl.NumberFormat('vi-VN').format(stats.monthlyRevenue)} ₫</h3>
              </div>
              <div style={{ background: '#fff4f8', padding: 10, borderRadius: 10, color: 'var(--pink)' }}><CreditCard size={24} /></div>
            </div>
          </div>

          <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>Lịch hẹn Hôm nay</p>
                <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>{stats.todayAppointments}</h3>
              </div>
              <div style={{ background: '#e3f2fd', padding: 10, borderRadius: 10, color: '#1565c0' }}><CalendarCheck size={24} /></div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
