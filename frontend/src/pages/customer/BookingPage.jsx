import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { getBranches } from '../../api/salonApi';
import { getActiveServices } from '../../api/servicesApi';
import { getTechnicians } from '../../api/techniciansApi';
import { createAppointment } from '../../api/appointmentsApi';
import { resolveFileUrl } from '../../api/axiosClient';
import { STATUS_LABELS } from '../../utils/constants';
import { ChevronRight, ChevronLeft, CheckCircle, Clock, MapPin, User as UserIcon, Calendar, Info } from 'lucide-react';

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('serviceId') || '';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    branchId: '',
    serviceId: preselectedService,
    technicianId: '',
    appointmentDate: '',
    startTime: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Data
  const { data: branchRes, isLoading: loadingBranch } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });
  const branches = branchRes?.data?.data || [];

  const { data: svcRes, isLoading: loadingSvc } = useQuery({
    queryKey: ['services'],
    queryFn: getActiveServices,
  });
  const services = svcRes?.data?.data || [];

  const { data: techRes } = useQuery({
    queryKey: ['technicians', form.branchId],
    queryFn: () => getTechnicians(form.branchId),
    enabled: !!form.branchId,
  });
  const technicians = techRes?.data?.data || [];

  const loading = loadingSvc || loadingBranch;

  const nextStep = () => {
    setError('');
    setStep(s => Math.min(s + 1, 3));
  };
  const prevStep = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.serviceId || !form.appointmentDate || !form.startTime || !form.branchId) {
      setError('Vui lòng hoàn thiện tất cả thông tin.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await createAppointment({
        serviceId: form.serviceId,
        branchId: form.branchId,
        technicianId: form.technicianId || null,
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        notes: form.notes || null,
      });
      const appt = res.data?.data;
      setSuccess(`Đặt lịch thành công! Trạng thái: ${STATUS_LABELS[appt?.status] || appt?.status}`);
      setTimeout(() => navigate('/customer/appointments'), 1500);
    } catch (err) {
      const errCode = err.response?.data?.errorCode;
      if (errCode === 'APPOINTMENT_SLOT_UNAVAILABLE') {
        setError('Chuyên viên đã có lịch vào thời gian này. Vui lòng chọn khung giờ hoặc chuyên viên khác.');
      } else {
        setError(err.response?.data?.message || 'Không thể đặt lịch. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBranchObj = branches.find(b => b.id === form.branchId);
  const selectedServiceObj = services.find(s => s.id === form.serviceId);

  // Time slots generation based on branch open/close time
  const timeSlots = useMemo(() => {
    const slots = [];
    let startHour = 9;
    let endHour = 20;

    const parseHour = (timeVal) => {
      if (!timeVal) return null;
      if (Array.isArray(timeVal)) return parseInt(timeVal[0], 10);
      if (typeof timeVal === 'string') return parseInt(timeVal.split(':')[0], 10);
      return null;
    };

    if (selectedBranchObj) {
      const parsedStart = parseHour(selectedBranchObj.openTime);
      if (parsedStart !== null && !isNaN(parsedStart)) startHour = parsedStart;
      
      const parsedEnd = parseHour(selectedBranchObj.closeTime);
      if (parsedEnd !== null && !isNaN(parsedEnd)) endHour = parsedEnd;
    }

    if (startHour > endHour || isNaN(startHour) || isNaN(endHour)) {
      startHour = 9;
      endHour = 20;
    }

    for (let h = startHour; h <= endHour; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      if (h !== endHour) { // Don't add :30 for the exact closing hour usually
        slots.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  }, [selectedBranchObj]);

  const formatTime = (timeVal) => {
    if (!timeVal) return '';
    if (Array.isArray(timeVal)) return `${timeVal[0].toString().padStart(2, '0')}:${(timeVal[1]||0).toString().padStart(2, '0')}`;
    if (typeof timeVal === 'string') return timeVal.substring(0, 5);
    return String(timeVal);
  };

  return (
    <CustomerLayout>
      <div className="dashboard-card" style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="eyebrow">Booking Wizard</div>
          <h2 className="section-title" style={{ margin: 0 }}>Trải nghiệm Spa của bạn</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><p className="muted">Đang tải dữ liệu...</p></div>
        ) : (
          <div>
            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 2, background: '#ffe4ee', zIndex: 1 }} />
              {[
                { id: 1, label: 'Cửa hàng' },
                { id: 2, label: 'Dịch vụ' },
                { id: 3, label: 'Thời gian & KTV' }
              ].map(s => (
                <div key={s.id} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: step >= s.id ? 'var(--pink)' : '#fff',
                    border: `2px solid ${step >= s.id ? 'var(--pink)' : '#ffe4ee'}`,
                    color: step >= s.id ? '#fff' : '#ccc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', transition: 'all 0.3s'
                  }}>
                    {step > s.id ? <CheckCircle size={18} /> : s.id}
                  </div>
                  <span style={{ marginTop: 8, fontSize: 13, fontWeight: step >= s.id ? 600 : 400, color: step >= s.id ? '#000' : '#888' }}>{s.label}</span>
                </div>
              ))}
            </div>

            {error && <div className="alert error" style={{ marginBottom: 20 }}>{error}</div>}
            {success && <div className="alert success" style={{ marginBottom: 20 }}>{success}</div>}

            {/* STEP 1: Branch */}
            <div style={{ display: step === 1 ? 'block' : 'none', animation: 'fadeIn 0.5s' }}>
              <h3 style={{ marginBottom: 16 }}>Chọn Chi nhánh</h3>
              <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>Vui lòng chọn cửa hàng bạn muốn đến để chúng tôi phục vụ tốt nhất.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
                {branches.map(b => (
                  <div 
                    key={b.id}
                    onClick={() => setForm({ ...form, branchId: b.id, technicianId: '', startTime: '' })}
                    style={{
                      padding: 20, borderRadius: 12, border: `2px solid ${form.branchId === b.id ? 'var(--pink)' : '#eee'}`,
                      background: form.branchId === b.id ? '#fff4f8' : '#fff', cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: form.branchId === b.id ? '0 4px 12px rgba(226, 56, 120, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ background: form.branchId === b.id ? 'var(--pink)' : '#f0f0f0', color: form.branchId === b.id ? '#fff' : '#666', padding: 10, borderRadius: 10 }}>
                        <MapPin size={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: form.branchId === b.id ? 'var(--pink)' : '#333' }}>{b.name}</div>
                        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{b.address}</div>
                        {(b.openTime || b.closeTime) && (
                          <div style={{ fontSize: 12, color: '#888', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> {formatTime(b.openTime) || '09:00'} - {formatTime(b.closeTime) || '20:00'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                <button type="button" className="btn" onClick={nextStep} disabled={!form.branchId}>
                  Tiếp tục <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* STEP 2: Service */}
            <div style={{ display: step === 2 ? 'block' : 'none', animation: 'fadeIn 0.5s' }}>
              <h3 style={{ marginBottom: 16 }}>Chọn Dịch vụ</h3>
              <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>Lựa chọn liệu trình phù hợp với nhu cầu của bạn tại {selectedBranchObj?.name}.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, maxHeight: 400, overflowY: 'auto', padding: 4 }}>
                {services.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => setForm({ ...form, serviceId: s.id })}
                    style={{
                      border: `2px solid ${form.serviceId === s.id ? 'var(--pink)' : '#eee'}`,
                      borderRadius: 12, padding: 16, cursor: 'pointer',
                      transition: 'all 0.2s', background: form.serviceId === s.id ? '#fff4f8' : '#fff',
                      boxShadow: form.serviceId === s.id ? '0 4px 12px rgba(226, 56, 120, 0.15)' : 'none'
                    }}
                  >
                    {s.imageUrl ? (
                      <img src={resolveFileUrl(s.imageUrl)} alt={s.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                    ) : (
                      <div style={{ width: '100%', height: 120, background: '#f5f5f5', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Info color="#ccc" size={32} />
                      </div>
                    )}
                    <h4 style={{ margin: '0 0 8px', fontSize: 15 }}>{s.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 14, alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {s.durationMinutes}p</span>
                      <strong style={{ color: 'var(--pink)' }}>{Number(s.price).toLocaleString('vi-VN')}đ</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                <button type="button" className="btn btn-outline" onClick={prevStep}>
                  <ChevronLeft size={18} /> Quay lại
                </button>
                <button type="button" className="btn" onClick={nextStep} disabled={!form.serviceId}>
                  Tiếp tục <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* STEP 3: Time and Technician */}
            <div style={{ display: step === 3 ? 'block' : 'none', animation: 'fadeIn 0.5s' }}>
              <h3 style={{ marginBottom: 16 }}>Chuyên viên & Thời gian</h3>
              
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>Chuyên viên (Tùy chọn)</label>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, marginBottom: 24, paddingLeft: 4 }}>
                <div 
                  onClick={() => setForm({ ...form, technicianId: '' })}
                  style={{
                    minWidth: 100, padding: 12, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${!form.technicianId ? 'var(--pink)' : '#eee'}`,
                    background: !form.technicianId ? '#fff4f8' : '#fff',
                    boxShadow: !form.technicianId ? '0 4px 8px rgba(226, 56, 120, 0.1)' : 'none'
                  }}
                >
                  <UserIcon size={24} style={{ margin: '0 auto 8px', color: !form.technicianId ? 'var(--pink)' : '#666' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: !form.technicianId ? 'var(--pink)' : '#333' }}>Spa sắp xếp</div>
                </div>
                {technicians.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setForm({ ...form, technicianId: t.id })}
                    style={{
                      minWidth: 100, padding: 12, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                      border: `2px solid ${form.technicianId === t.id ? 'var(--pink)' : '#eee'}`,
                      background: form.technicianId === t.id ? '#fff4f8' : '#fff',
                      boxShadow: form.technicianId === t.id ? '0 4px 8px rgba(226, 56, 120, 0.1)' : 'none'
                    }}
                  >
                    <img src={t.avatarUrl ? resolveFileUrl(t.avatarUrl) : 'https://ui-avatars.com/api/?name=' + t.fullName} alt={t.fullName} style={{ width: 40, height: 40, borderRadius: '50%', marginBottom: 8, objectFit: 'cover' }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.technicianId === t.id ? 'var(--pink)' : '#333' }}>{t.fullName.split(' ').pop()}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}><Calendar size={16} style={{ verticalAlign: 'middle', marginRight: 6 }}/>Ngày hẹn</label>
                  <input 
                    type="date" 
                    className="input-field"
                    style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #eee' }}
                    value={form.appointmentDate} 
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({...form, appointmentDate: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}><Clock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }}/>Giờ hẹn (Tại {selectedBranchObj?.name})</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                    {timeSlots.map(time => (
                      <div 
                        key={time}
                        onClick={() => setForm({...form, startTime: time})}
                        style={{
                          padding: '10px 0', textAlign: 'center', borderRadius: 8, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                          border: `1px solid ${form.startTime === time ? 'var(--pink)' : '#ddd'}`,
                          background: form.startTime === time ? 'var(--pink)' : '#fff',
                          color: form.startTime === time ? '#fff' : '#333',
                          fontWeight: form.startTime === time ? 'bold' : '500',
                          boxShadow: form.startTime === time ? '0 4px 8px rgba(226, 56, 120, 0.2)' : 'none'
                        }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Ghi chú thêm</label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Ví dụ: Da tôi khá nhạy cảm..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{ marginBottom: 24, borderRadius: 10, border: '2px solid #eee', padding: '12px 16px' }}
              />

              {/* Summary */}
              {selectedServiceObj && selectedBranchObj && (
                <div style={{ background: 'linear-gradient(to right, #fdfbfb, #ebedee)', padding: 20, borderRadius: 12, marginBottom: 24, border: '1px solid #e0e0e0' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: 16 }}>Tóm tắt đơn đặt</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                    <span style={{ color: '#555' }}>Cửa hàng:</span> <strong style={{ textAlign: 'right' }}>{selectedBranchObj.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                    <span style={{ color: '#555' }}>Dịch vụ:</span> <strong style={{ textAlign: 'right' }}>{selectedServiceObj.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingTop: 12, borderTop: '1px dashed #ccc' }}>
                    <span style={{ color: '#555' }}>Tổng tiền:</span> <strong style={{ color: 'var(--pink)', fontSize: 18 }}>{Number(selectedServiceObj.price).toLocaleString('vi-VN')}đ</strong>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-outline" onClick={prevStep} disabled={submitting}>
                  <ChevronLeft size={18} /> Quay lại
                </button>
                <button type="button" className="btn" onClick={submit} disabled={!form.appointmentDate || !form.startTime || submitting}>
                  {submitting ? 'Đang xử lý...' : 'Hoàn tất Đặt lịch'} <CheckCircle size={18} style={{ marginLeft: 8 }} />
                </button>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
