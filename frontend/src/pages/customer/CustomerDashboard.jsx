import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { CalendarCheck, Award, CreditCard, Clock, ChevronRight, Star } from 'lucide-react';
import { getProfile } from '../../api/usersApi';
import { getMyAppointments } from '../../api/appointmentsApi';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

function getTierLabel(points) {
  if (points >= 5000) return { label: 'Hạng Vàng', color: '#d4af37', bg: '#fbf5e6', icon: <Award size={24} color="#d4af37"/> };
  if (points >= 2000) return { label: 'Hạng Bạc', color: '#8892b0', bg: '#f0f2f5', icon: <Award size={24} color="#8892b0"/> };
  return { label: 'Hạng Đồng', color: '#cd7f32', bg: '#fdf3ed', icon: <Award size={24} color="#cd7f32"/> };
}

export default function CustomerDashboard() {
  const { data: profileRes, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { data: apptRes, isLoading: loadingAppt } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: getMyAppointments,
  });

  const loading = loadingProfile || loadingAppt;
  const profile = profileRes?.data?.data || null;
  const appointments = apptRes?.data?.data || [];

  const activeAppointments = appointments.filter(
    a => a.status === 'PENDING' || a.status === 'CONFIRMED'
  );
  const upcomingAppointments = [...appointments]
    .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
    .slice(0, 3);

  const loyaltyPoints = profile?.loyaltyPoints ?? 0;
  const tier = getTierLabel(loyaltyPoints);

  return (
    <CustomerLayout>
      <div className="section-head" style={{ marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--pink)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>TỔNG QUAN</div>
          <h2 className="section-title" style={{ fontSize: 28, margin: 0 }}>
            Xin chào, {profile?.fullName?.split(' ').pop() || 'Quý khách'}!
          </h2>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div className="dashboard-card stat-card" style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p className="muted" style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Lịch hẹn đang chờ</p>
                  <h3 style={{ margin: '8px 0 0', fontSize: 32, color: '#111' }}>{activeAppointments.length}</h3>
                </div>
                <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 12, color: '#1565c0' }}>
                  <CalendarCheck size={28} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Đang chờ / Đã xác nhận</p>
            </div>

            <div className="dashboard-card stat-card" style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p className="muted" style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Điểm thưởng</p>
                  <h3 style={{ margin: '8px 0 0', fontSize: 32, color: '#111' }}>{loyaltyPoints.toLocaleString('vi-VN')}</h3>
                </div>
                <div style={{ background: tier.bg, padding: 12, borderRadius: 12 }}>
                  {tier.icon}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600, color: tier.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {tier.label}
                </span>
              </p>
            </div>

            <div className="dashboard-card stat-card" style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p className="muted" style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Tổng lịch sử hẹn</p>
                  <h3 style={{ margin: '8px 0 0', fontSize: 32, color: '#111' }}>{appointments.length}</h3>
                </div>
                <div style={{ background: '#e8f5e9', padding: 12, borderRadius: 12, color: '#2e7d32' }}>
                  <CreditCard size={28} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Tất cả lịch hẹn từ trước tới nay</p>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="dashboard-card" style={{ background: '#fff', padding: '24px 24px 32px', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                <Clock size={22} color="var(--pink)" /> Lịch hẹn sắp tới
              </h3>
              <Link to="/customer/appointments" style={{ color: 'var(--pink)', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                Xem tất cả <ChevronRight size={16} />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', background: '#fafafa', borderRadius: 12 }}>
                <div style={{ background: '#fff', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <CalendarCheck size={32} color="#ccc" />
                </div>
                <p style={{ color: '#666', marginBottom: 16 }}>Bạn chưa có lịch hẹn nào sắp tới.</p>
                <Link to="/customer/booking" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Đặt lịch ngay
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {upcomingAppointments.map(appt => {
                  const line = appt.lines?.[0];
                  const statusStyle = STATUS_COLORS[appt.status] || {};
                  return (
                    <div key={appt.id} style={{
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      background: '#fafafa',
                      transition: 'background 0.2s',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 16 }}>{line?.serviceName || 'Dịch vụ'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#666', fontSize: 13 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarCheck size={14} /> {appt.appointmentDate}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {appt.startTime}</span>
                          {line?.technicianName && <span style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 12, borderLeft: '1px solid #ddd' }}><Star size={14} color="var(--pink)" /> KTV: {line.technicianName}</span>}
                        </div>
                      </div>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        whiteSpace: 'nowrap'
                      }}>
                        {STATUS_LABELS[appt.status] || appt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, var(--pink), #c0396b)', padding: 32, borderRadius: 16, color: '#fff', boxShadow: '0 8px 24px rgba(226,56,120,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 22 }}>Bạn cần thư giãn?</h3>
              <p style={{ margin: '0 0 24px', opacity: 0.9, fontSize: 15, lineHeight: 1.5 }}>Đặt lịch ngay hôm nay để tận hưởng những dịch vụ chăm sóc sức khỏe và sắc đẹp tuyệt vời nhất.</p>
              <div>
                <Link to="/customer/booking" style={{ background: '#fff', color: 'var(--pink)', padding: '12px 24px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'transform 0.2s' }}>
                  Đặt lịch mới <ChevronRight size={18} />
                </Link>
              </div>
            </div>
            
            <div className="dashboard-card" style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 20 }}>Lịch sử thanh toán</h3>
              <p className="muted" style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.5 }}>Theo dõi các hóa đơn và thực hiện thanh toán trực tuyến nhanh chóng, tiện lợi.</p>
              <div>
                <Link to="/customer/payments" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Xem hóa đơn <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </CustomerLayout>
  );
}
