import StaffLayout from '../../components/layout/StaffLayout';
import { CalendarCheck, Phone, CheckCircle } from 'lucide-react';

export default function ReceptionistDashboard() {
  return (
    <StaffLayout>
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Bàn làm việc Lễ tân</h2>
          <p className="muted">Quản lý lịch hẹn và đón tiếp khách hàng.</p>
        </div>
      </div>

      <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>Khách chờ phục vụ</p>
              <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>5</h3>
            </div>
            <div style={{ background: '#fff4f8', padding: 10, borderRadius: 10, color: 'var(--pink)' }}><Phone size={24} /></div>
          </div>
        </div>

        <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>Lịch hẹn sắp tới</p>
              <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>12</h3>
            </div>
            <div style={{ background: '#e3f2fd', padding: 10, borderRadius: 10, color: '#1565c0' }}><CalendarCheck size={24} /></div>
          </div>
        </div>

        <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>Đã hoàn thành</p>
              <h3 style={{ margin: '4px 0 0', fontSize: 24 }}>28</h3>
            </div>
            <div style={{ background: '#e8f5e9', padding: 10, borderRadius: 10, color: '#2e7d32' }}><CheckCircle size={24} /></div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card" style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: 16 }}>Danh sách Lịch hẹn (Đang chờ)</h3>
        <p className="muted">Chi tiết lịch hẹn sẽ được hiển thị tại đây.</p>
      </div>
    </StaffLayout>
  );
}
