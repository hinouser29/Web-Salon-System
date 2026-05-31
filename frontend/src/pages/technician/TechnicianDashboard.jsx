import { useState, useEffect, useCallback, useRef } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { ClipboardList, Clock, CheckCircle, Sparkles, ChevronRight } from 'lucide-react';
import { getTodayAppointments, completeAppointment, getTechnicianKPI } from '../../api/salonApi';
import axiosClient from '../../api/axiosClient';
import { motion } from 'framer-motion';

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn tất',
  NO_SHOW: 'Không đến',
};

const STATUS_COLORS = {
  PENDING: { bg: '#fff9c4', color: '#f57f17' },
  CONFIRMED: { bg: '#e3f2fd', color: '#1565c0' },
  CANCELLED: { bg: '#fce4ec', color: '#c62828' },
  COMPLETED: { bg: '#e8f5e9', color: '#2e7d32' },
};

function SwipeToComplete({ onComplete, isProcessing }) {
  const [swiped, setSwiped] = useState(false);
  const containerRef = useRef(null);

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 150) {
      setSwiped(true);
      onComplete();
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative', width: 280, height: 50, background: 'rgba(255,255,255,0.2)',
        borderRadius: 25, overflow: 'hidden', margin: '0 auto'
      }}
    >
      <div style={{ position: 'absolute', width: '100%', textAlign: 'center', lineHeight: '50px', color: '#fff', fontSize: 14, fontWeight: 500, opacity: 0.8 }}>
        {isProcessing ? 'Đang xử lý...' : swiped ? 'Hoàn thành!' : 'Vuốt để Hoàn thành >>>'}
      </div>
      {!swiped && !isProcessing && (
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 50, height: 50, background: '#fff', borderRadius: 25,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <ChevronRight color="var(--pink)" size={24} />
        </motion.div>
      )}
    </div>
  );
}

export default function TechnicianDashboard() {
  const [schedule, setSchedule] = useState([]);
  const [profile, setProfile] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, apptRes, kpiRes] = await Promise.all([
        axiosClient.get('/users/me'),
        getTodayAppointments(),
        getTechnicianKPI().catch(e => ({ data: { data: null } }))
      ]);
      setProfile(profileRes.data?.data || null);
      if (kpiRes?.data?.data) {
        setKpi(kpiRes.data.data);
      }

      const allToday = apptRes.data?.data || [];
      const myName = profileRes.data?.data?.fullName || '';

      const mySchedule = allToday.filter(appt =>
        appt.lines?.some(line => line.technicianName && myName && line.technicianName === myName)
      );
      setSchedule(mySchedule.length > 0 ? mySchedule : allToday);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleComplete = async (id) => {
    try {
      setProcessingId(id);
      await completeAppointment(id);
      await fetchSchedule();
    } catch (err) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  const totalToday = schedule.length;
  const completedCount = schedule.filter(a => a.status === 'COMPLETED').length;
  const pendingCount = schedule.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
  const nextAppointment = schedule.find(a => a.status === 'PENDING' || a.status === 'CONFIRMED');

  return (
    <StaffLayout>
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Lịch làm việc hôm nay</h2>
          <p className="muted">Xin chào, {profile?.fullName || 'Kỹ thuật viên'}!</p>
        </div>
      </div>

      {/* Stats - Mobile Friendly Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Cần phục vụ', value: pendingCount, icon: Clock, bg: '#fff4f8', color: 'var(--pink)' },
          { label: 'Đã hoàn thành', value: completedCount, icon: CheckCircle, bg: '#e8f5e9', color: '#2e7d32' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="dashboard-card" style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ background: bg, padding: 8, borderRadius: 8, color, display: 'inline-block', marginBottom: 8 }}><Icon size={20} /></div>
            <h3 style={{ margin: '0 0 4px', fontSize: 24 }}>{value}</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Next Appointment Card (Mobile First) */}
      {nextAppointment && (
        <div style={{
          background: 'linear-gradient(135deg, var(--pink), #c0396b)',
          color: '#fff', padding: 24, borderRadius: 16, marginBottom: 24,
          boxShadow: '0 8px 24px rgba(226,56,120,0.25)'
        }}>
          <p style={{ margin: '0 0 8px', opacity: 0.9, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Khách hàng tiếp theo</p>
          <h3 style={{ margin: '0 0 8px', fontSize: 24, lineHeight: 1.2 }}>{nextAppointment.lines?.[0]?.serviceName || 'Dịch vụ'}</h3>
          <p style={{ margin: '0 0 24px', opacity: 0.9, fontSize: 15 }}>
            <Clock size={16} style={{ verticalAlign: 'text-bottom', marginRight: 6 }}/>
            {nextAppointment.startTime} — {nextAppointment.endTime}
          </p>
          
          <SwipeToComplete 
            isProcessing={processingId === nextAppointment.id}
            onComplete={() => handleComplete(nextAppointment.id)} 
          />
        </div>
      )}

      {/* Schedule List (Mobile First Cards) */}
      <h3 style={{ margin: '0 0 16px' }}>Tất cả lịch hẹn hôm nay</h3>
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><p className="muted">Đang tải...</p></div>
      ) : schedule.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center' }}><p className="muted">Bạn chưa có lịch hẹn nào hôm nay.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {schedule.map(appt => {
            const line = appt.lines?.[0];
            const statusStyle = STATUS_COLORS[appt.status] || {};
            return (
              <div key={appt.id} className="dashboard-card" style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16 }}>{line?.serviceName || 'Dịch vụ'}</h4>
                    <span style={{ color: 'var(--pink)', fontWeight: 600, fontSize: 15 }}>{appt.startTime}</span>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: statusStyle.bg, color: statusStyle.color
                  }}>
                    {STATUS_LABELS[appt.status] || appt.status}
                  </span>
                </div>
                {appt.notes && <p className="muted" style={{ fontSize: 13, margin: '0 0 12px' }}>Ghi chú: {appt.notes}</p>}
                
                {appt.id !== nextAppointment?.id && (appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', padding: '8px', fontSize: 14 }}
                    disabled={processingId === appt.id}
                    onClick={() => {
                      if (window.confirm('Xác nhận hoàn thành?')) handleComplete(appt.id);
                    }}
                  >
                    {processingId === appt.id ? 'Đang xử lý...' : 'Hoàn thành'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </StaffLayout>
  );
}
