import { useState, useEffect, useCallback } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { CalendarCheck, Phone, CheckCircle, Clock, Search } from 'lucide-react';
import {
  getTodayAppointments,
  confirmAppointment,
  completeAppointment,
  cancelAppointment,
} from '../../api/salonApi';
import AppointmentCalendar from '../../components/AppointmentCalendar';

const STATUS_LABELS = {
  PENDING: 'Cho xac nhan',
  CONFIRMED: 'Da xac nhan',
  CANCELLED: 'Da huy',
  COMPLETED: 'Hoan tat',
  NO_SHOW: 'Khong den',
};

const STATUS_COLORS = {
  PENDING: { bg: '#fff9c4', color: '#f57f17' },
  CONFIRMED: { bg: '#e3f2fd', color: '#1565c0' },
  CANCELLED: { bg: '#fce4ec', color: '#c62828' },
  COMPLETED: { bg: '#e8f5e9', color: '#2e7d32' },
  NO_SHOW: { bg: '#f3e5f5', color: '#6a1b9a' },
};

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTodayAppointments();
      setAppointments(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAction = async (id, action) => {
    try {
      setProcessingId(id);
      if (action === 'confirm') await confirmAppointment(id);
      else if (action === 'complete') await completeAppointment(id);
      else if (action === 'cancel') {
        if (!window.confirm('Huy lich hen nay?')) return;
        await cancelAppointment(id);
      }
      await fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Thao tac that bai');
    } finally {
      setProcessingId(null);
    }
  };

  const pending = appointments.filter(a => a.status === 'PENDING').length;
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;

  const filtered = appointments.filter(a => {
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const line = a.lines?.[0];
    const matchSearch = !searchText
      || (line?.serviceName || '').toLowerCase().includes(searchText.toLowerCase())
      || (line?.technicianName || '').toLowerCase().includes(searchText.toLowerCase())
      || (a.branchName || '').toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <StaffLayout>
      <div className="section-head" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Ban lam viec Le tan</h2>
          <p className="muted">Quan ly lich hen va don tiep khach hang hom nay.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchAppointments} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Lam moi
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Cho xac nhan', value: pending, icon: Phone, bg: '#fff9c4', color: '#f57f17' },
          { label: 'Da xac nhan', value: confirmed, icon: CalendarCheck, bg: '#e3f2fd', color: '#1565c0' },
          { label: 'Hoan thanh', value: completed, icon: CheckCircle, bg: '#e8f5e9', color: '#2e7d32' },
          { label: 'Tong hom nay', value: appointments.length, icon: Clock, bg: '#fff4f8', color: 'var(--pink)' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>{label}</p>
                <h3 style={{ margin: '4px 0 0', fontSize: 26 }}>{value}</h3>
              </div>
              <div style={{ background: bg, padding: 10, borderRadius: 10, color }}><Icon size={22} /></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button 
          className={`btn ${viewMode === 'list' ? '' : 'btn-outline'}`}
          onClick={() => setViewMode('list')}
        >
          Danh sach
        </button>
        <button 
          className={`btn ${viewMode === 'calendar' ? '' : 'btn-outline'}`}
          onClick={() => setViewMode('calendar')}
        >
          Lich (Calendar)
        </button>
      </div>

      {/* Filters (only in list view) */}
      {viewMode === 'list' && (
      <div className="dashboard-card" style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              className="input-field"
              style={{ paddingLeft: 36 }}
              placeholder="Tim kiem dich vu, ky thuat vien..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          <select className="input-field" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">Tat ca trang thai</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      )}

      {/* Content */}
      {viewMode === 'calendar' ? (
        <AppointmentCalendar appointments={appointments} />
      ) : (
      <div className="dashboard-card" style={{ background: '#fff', padding: 0, borderRadius: 12, boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Dang tai...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p className="muted">Khong co lich hen nao{filterStatus !== 'ALL' ? ' voi trang thai nay' : ' hom nay'}.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>Gio</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>Dich vu</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>Ky thuat vien</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>Trang thai</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(appt => {
                const line = appt.lines?.[0];
                const statusStyle = STATUS_COLORS[appt.status] || {};
                const isProcessing = processingId === appt.id;
                return (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>{appt.startTime}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 500 }}>{line?.serviceName || 'Dich vu'}</div>
                      {appt.notes && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{appt.notes}</div>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>{line?.technicianName || <span className="muted">Chua phan cong</span>}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: statusStyle.bg, color: statusStyle.color
                      }}>
                        {STATUS_LABELS[appt.status] || appt.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {appt.status === 'PENDING' && (
                          <button className="btn" style={{ padding: '6px 14px', fontSize: 13 }}
                            disabled={isProcessing} onClick={() => handleAction(appt.id, 'confirm')}>
                            Xac nhan
                          </button>
                        )}
                        {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                          <button className="btn" style={{ padding: '6px 14px', fontSize: 13, background: '#2e7d32' }}
                            disabled={isProcessing} onClick={() => handleAction(appt.id, 'complete')}>
                            Hoan thanh
                          </button>
                        )}
                        {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                          <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 13, color: '#c62828', borderColor: '#c62828' }}
                            disabled={isProcessing} onClick={() => handleAction(appt.id, 'cancel')}>
                            Huy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      )}
    </StaffLayout>
  );
}
