import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { cancelAppointment, getMyAppointments } from '../../api/appointmentsApi';
import ReviewModal from '../../components/ReviewModal';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';
import { Calendar, Clock, User as UserIcon, XCircle, Star, AlertCircle, Sparkles } from 'lucide-react';

function formatDateTime(date, time) {
  if (!date) return '—';
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('vi-VN');
  return time ? `${dateStr} lúc ${time}` : dateStr;
}

export default function MyAppointments() {
  const [reviewApptId, setReviewApptId] = useState(null);

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: getMyAppointments,
  });

  const rows = data?.data?.data || [];
  const errorMessage = error ? (error.response?.data?.message || 'Không thể tải lịch hẹn') : '';

  const handleCancel = async (id) => {
    // Custom confirm via window.confirm but styled or just keeping it simple for now, can be replaced with custom Modal later
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.')) return;
    try {
      await cancelAppointment(id);
      alert('Đã hủy lịch hẹn thành công.');
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy lịch hẹn');
    }
  };

  return (
    <CustomerLayout>
      <div className="section-head" style={{ marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--pink)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>HISTORY</div>
          <h2 className="section-title" style={{ fontSize: 28, margin: 0 }}>Lịch hẹn của tôi</h2>
        </div>
      </div>
      
      {errorMessage && <div className="alert error" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={18}/> {errorMessage}</div>}
      
      {loading ? (
        <p className="muted" style={{ textAlign: 'center', padding: 40 }}>Đang tải lịch hẹn...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {rows.map((r) => {
            const line = r.lines?.[0];
            const statusStyle = STATUS_COLORS[r.status] || { bg: '#eee', color: '#666' };
            
            return (
              <div key={r.id} className="dashboard-card appointment-card" style={{ 
                background: '#fff', 
                borderRadius: 16, 
                padding: 24, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)', 
                border: '1px solid #f0f0f0',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={18} color="var(--pink)" /> {line?.serviceName || 'Dịch vụ'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 14, marginBottom: 4 }}>
                      <Calendar size={14} /> {formatDateTime(r.appointmentDate)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 14 }}>
                      <Clock size={14} /> {r.startTime}
                    </div>
                  </div>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: 20, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    background: statusStyle.bg, 
                    color: statusStyle.color,
                    whiteSpace: 'nowrap'
                  }}>
                    {STATUS_LABELS[r.status] || r.status}
                  </span>
                </div>

                <div style={{ 
                  background: '#fafafa', 
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ background: '#e3f2fd', padding: 8, borderRadius: '50%', color: '#1565c0' }}>
                    <UserIcon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Chuyên viên phụ trách</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{line?.technicianName || 'Spa sắp xếp'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                    <button 
                      type="button" 
                      onClick={() => handleCancel(r.id)}
                      style={{ 
                        flex: 1, 
                        padding: '10px', 
                        borderRadius: 8, 
                        background: '#fff0f0', 
                        color: '#d32f2f', 
                        border: '1px solid #ffdcdb', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#ffe5e5'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff0f0'}
                    >
                      <XCircle size={16} /> Hủy lịch
                    </button>
                  )}
                  {r.status === 'COMPLETED' && (
                    <button 
                      type="button" 
                      onClick={() => setReviewApptId(r.id)}
                      style={{ 
                        flex: 1, 
                        padding: '10px', 
                        borderRadius: 8, 
                        background: 'var(--pink)', 
                        color: '#fff', 
                        border: 'none', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'background 0.2s',
                        boxShadow: '0 4px 12px rgba(226,56,120,0.2)'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#d81b60'}
                      onMouseOut={e => e.currentTarget.style.background = 'var(--pink)'}
                    >
                      <Star size={16} fill="currentColor" /> Đánh giá
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fafafa', borderRadius: 16 }}>
              <div style={{ background: '#fff', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Calendar size={40} color="#ccc" />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#333' }}>Chưa có lịch hẹn</h3>
              <p className="muted" style={{ margin: 0 }}>Bạn chưa thực hiện bất kỳ đặt lịch nào. Hãy trải nghiệm dịch vụ của chúng tôi ngay hôm nay!</p>
            </div>
          )}
        </div>
      )}

      <ReviewModal 
        isOpen={!!reviewApptId} 
        appointmentId={reviewApptId} 
        onClose={() => setReviewApptId(null)} 
        onSuccess={() => {
          alert('Cảm ơn bạn đã gửi đánh giá!');
          refetch();
        }}
      />
      <style>{`
        .appointment-card:hover {
          border-color: #ffd1e3 !important;
          box-shadow: 0 8px 24px rgba(226,56,120,0.08) !important;
        }
      `}</style>
    </CustomerLayout>
  );
}
