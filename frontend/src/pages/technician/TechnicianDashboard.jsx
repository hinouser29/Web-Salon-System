import StaffLayout from '../../components/layout/StaffLayout';
import { ClipboardList, Clock, Sparkles } from 'lucide-react';

export default function TechnicianDashboard() {
  return (
    <StaffLayout>
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Bàn làm việc Kỹ thuật viên</h2>
          <p className="muted">Xem lịch phục vụ khách hàng trong ca làm.</p>
        </div>
      </div>

      <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>Ca hiện tại</p>
              <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>08:00 - 16:00</h3>
            </div>
            <div style={{ background: '#fff4f8', padding: 10, borderRadius: 10, color: 'var(--pink)' }}><Clock size={24} /></div>
          </div>
        </div>

        <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>Dịch vụ cần làm</p>
              <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>6</h3>
            </div>
            <div style={{ background: '#e3f2fd', padding: 10, borderRadius: 10, color: '#1565c0' }}><ClipboardList size={24} /></div>
          </div>
        </div>

        <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>Điểm đánh giá (KPI)</p>
              <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>4.8/5</h3>
            </div>
            <div style={{ background: '#fff9c4', padding: 10, borderRadius: 10, color: '#f57f17' }}><Sparkles size={24} /></div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card" style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: 16 }}>Khách hàng tiếp theo</h3>
        <p className="muted">Chi tiết khách hàng và dịch vụ sẽ được hiển thị tại đây.</p>
      </div>
    </StaffLayout>
  );
}
