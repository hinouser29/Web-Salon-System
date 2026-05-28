import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import {
  createAppointment,
  getBranches,
  getServices,
  getTechnicians,
} from '../../api/salonApi';

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn tất',
  NO_SHOW: 'Không đến',
};

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('serviceId') || '';

  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [form, setForm] = useState({
    serviceId: preselectedService,
    branchId: '',
    technicianId: '',
    appointmentDate: '',
    startTime: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [svcRes, branchRes] = await Promise.all([getServices(), getBranches()]);
        const svcList = svcRes.data?.data || [];
        const branchList = branchRes.data?.data || [];
        setServices(svcList);
        setBranches(branchList);
        setForm((prev) => ({
          ...prev,
          branchId: prev.branchId || branchList[0]?.id || '',
        }));
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu đặt lịch');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!form.branchId) {
      setTechnicians([]);
      return;
    }
    getTechnicians(form.branchId)
      .then((res) => setTechnicians(res.data?.data || []))
      .catch(() => setTechnicians([]));
  }, [form.branchId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.serviceId || !form.appointmentDate || !form.startTime) {
      setError('Vui lòng chọn dịch vụ, ngày và giờ.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await createAppointment({
        serviceId: form.serviceId,
        branchId: form.branchId || null,
        technicianId: form.technicianId || null,
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        notes: form.notes || null,
      });
      const appt = res.data?.data;
      setSuccess(
        `Đặt lịch thành công! Trạng thái: ${STATUS_LABELS[appt?.status] || appt?.status}`
      );
      setTimeout(() => navigate('/customer/appointments'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lịch. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="dashboard-card">
        <div className="eyebrow">Appointment</div>
        <h2 className="section-title">Đặt lịch hẹn</h2>

        {loading ? (
          <p className="muted">Đang tải...</p>
        ) : (
          <form className="form-grid" onSubmit={submit}>
            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              required
            >
              <option value="">Chọn dịch vụ</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {Number(s.price).toLocaleString('vi-VN')}đ ({s.durationMinutes} phút)
                </option>
              ))}
            </select>

            <select
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value, technicianId: '' })}
            >
              <option value="">Chọn chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select
              value={form.technicianId}
              onChange={(e) => setForm({ ...form, technicianId: e.target.value })}
            >
              <option value="">Kỹ thuật viên (tùy chọn)</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>

            <input
              type="date"
              value={form.appointmentDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
              required
            />
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />

            <textarea
              style={{ gridColumn: '1 / -1', minHeight: 100, border: '1px solid #f6dbe5', borderRadius: 10, padding: 14 }}
              placeholder="Ghi chú yêu cầu của bạn"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <button className="btn" type="submit" disabled={submitting} style={{ gridColumn: '1 / -1' }}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          </form>
        )}
      </div>
    </CustomerLayout>
  );
}
