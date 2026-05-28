import { useEffect, useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { cancelAppointment, getMyAppointments } from '../../api/salonApi';

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn tất',
  NO_SHOW: 'Không đến',
};

function formatDateTime(date, time) {
  if (!date) return '—';
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('vi-VN');
  return time ? `${dateStr} ${time}` : dateStr;
}

export default function MyAppointments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyAppointments();
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await cancelAppointment(id);
      await fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy lịch hẹn');
    }
  };

  return (
    <CustomerLayout>
      <h2 className="section-title">Lịch hẹn của tôi</h2>
      {error && <p className="auth-error">{error}</p>}
      {loading ? (
        <p className="muted">Đang tải...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Kỹ thuật viên</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const line = r.lines?.[0];
              return (
                <tr key={r.id}>
                  <td>{line?.serviceName || '—'}</td>
                  <td>{line?.technicianName || '—'}</td>
                  <td>{formatDateTime(r.appointmentDate, r.startTime)}</td>
                  <td><span className="status">{STATUS_LABELS[r.status] || r.status}</span></td>
                  <td>
                    {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                      <button type="button" className="card-btn" onClick={() => handleCancel(r.id)}>
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan="5" className="muted">Chưa có lịch hẹn nào</td></tr>
            )}
          </tbody>
        </table>
      )}
    </CustomerLayout>
  );
}
