import CustomerLayout from '../../components/layout/CustomerLayout';
import { CalendarCheck, Award, Package, Sparkles } from 'lucide-react';

export default function CustomerDashboard() {
  return <CustomerLayout>
    <div className="section-head" style={{ marginBottom: 24 }}><div><div className="eyebrow">Customer</div><h2 className="section-title">Tổng quan tài khoản</h2></div></div>
    
    <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
      <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div><p className="muted" style={{ margin: 0, fontSize: 14 }}>Lịch hẹn</p><h3 style={{ margin: '4px 0 0', fontSize: 24 }}>3</h3></div>
          <div style={{ background: '#e3f2fd', padding: 10, borderRadius: 10, color: '#1565c0' }}><CalendarCheck size={24} /></div>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#555' }}>Đang chờ / đã xác nhận</p>
      </div>

      <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div><p className="muted" style={{ margin: 0, fontSize: 14 }}>Điểm thưởng</p><h3 style={{ margin: '4px 0 0', fontSize: 24 }}>850</h3></div>
          <div style={{ background: '#fff4f8', padding: 10, borderRadius: 10, color: 'var(--pink)' }}><Award size={24} /></div>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#555' }}>Hạng Silver</p>
      </div>

      <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div><p className="muted" style={{ margin: 0, fontSize: 14 }}>Combo đã mua</p><h3 style={{ margin: '4px 0 0', fontSize: 24 }}>2</h3></div>
          <div style={{ background: '#e8f5e9', padding: 10, borderRadius: 10, color: '#2e7d32' }}><Package size={24} /></div>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#555' }}>Còn hiệu lực</p>
      </div>

      <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div><p className="muted" style={{ margin: 0, fontSize: 14 }}>AI Gợi ý</p><h3 style={{ margin: '4px 0 0', fontSize: 24 }}>4</h3></div>
          <div style={{ background: '#f3e5f5', padding: 10, borderRadius: 10, color: '#7b1fa2' }}><Sparkles size={24} /></div>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#555' }}>Dịch vụ phù hợp</p>
      </div>
    </div>
    
    <h2 className="section-title" style={{fontSize:28,marginTop:32}}>Gợi ý cho bạn</h2>
    <div className="grid">
      <div className="dashboard-card"><h3>Chăm sóc da mặt</h3><p className="muted">Phù hợp với lịch sử dịch vụ gần đây.</p><button className="btn" style={{marginTop:12}}>Đặt ngay</button></div>
      <div className="dashboard-card"><h3>Combo Spa + Nail</h3><p className="muted">Tiết kiệm 15% khi đặt combo.</p><button className="btn btn-outline" style={{marginTop:12}}>Xem combo</button></div>
    </div>
  </CustomerLayout>;
}
