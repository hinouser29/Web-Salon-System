import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminRevenueReport, getAdminTopServices } from '../../api/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award } from 'lucide-react';

export default function AdminReports() {
  const [timeframe, setTimeframe] = useState('month');
  const { data: revRes, isLoading: loadingRev } = useQuery({
    queryKey: ['adminRevenue', timeframe],
    queryFn: () => getAdminRevenueReport(timeframe)
  });

  const { data: topRes, isLoading: loadingTop } = useQuery({
    queryKey: ['adminTopServices'],
    queryFn: () => getAdminTopServices(5)
  });

  const revDataRaw = revRes?.data?.data || { totalRevenue: 0, labels: [], data: [] };
  const totalRevenue = revDataRaw.totalRevenue || 0;
  const revenueData = (revDataRaw.labels || []).map((label, index) => ({
    name: label,
    revenue: revDataRaw.data?.[index] || 0
  }));

  const topServices = topRes?.data?.data || [];
  const loading = loadingRev || loadingTop;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: 12, border: '1px solid #ddd', borderRadius: 8, boxShadow: 'var(--shadow-soft)' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 0, color: 'var(--pink)', fontWeight: 500 }}>
            Doanh thu: {new Intl.NumberFormat('vi-VN').format(payload[0].value)} ₫
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="section-head" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-title">Báo cáo & Phân tích</h2>
          <p className="muted">Theo dõi hiệu quả kinh doanh của Spa.</p>
        </div>
        <select 
          className="input-field" 
          value={timeframe} 
          onChange={e => setTimeframe(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="week">7 Ngày qua</option>
          <option value="month">30 Ngày qua</option>
          <option value="year">12 Tháng qua</option>
        </select>
      </div>

      <div className="dashboard-card" style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-soft)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} color="var(--pink)" /> Biểu đồ Doanh thu
            </h3>
            <p className="muted" style={{ margin: 0 }}>
              Tổng doanh thu: <strong style={{ color: '#000' }}>{new Intl.NumberFormat('vi-VN').format(totalRevenue)} ₫</strong>
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải biểu đồ...</div>
        ) : (
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f9fa' }} />
                <Bar dataKey="revenue" fill="var(--pink)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="dashboard-card" style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-soft)' }}>
        <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={20} color="#f59e0b" /> Top Dịch vụ nổi bật
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>Đang tải danh sách...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)' }}>Xếp hạng</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)' }}>Dịch vụ</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>Số lượt đặt</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>Doanh thu mang lại</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((service, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: index < 3 ? '#f59e0b' : '#666' }}>
                    #{index + 1}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{service.name}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>{service.bookings}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>
                    {new Intl.NumberFormat('vi-VN').format(service.revenue)} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
