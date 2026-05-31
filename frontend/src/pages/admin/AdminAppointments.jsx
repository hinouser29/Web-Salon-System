import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { CalendarCheck, Search, CreditCard, X, Smartphone, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllAppointments,
  confirmAppointment,
  completeAppointment,
  cancelAppointment,
  getInvoiceByAppointment,
  staffPayInvoice
} from '../../api/salonApi';
import AppointmentCalendar from '../../components/AppointmentCalendar';
import { useAuth } from '../../context/AuthContext';
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_METHODS } from '../../utils/constants';

// STATUS_LABELS and STATUS_COLORS imported from constants.js

export default function AdminAppointments() {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { hasPermission } = useAuth();
  const canManage = hasPermission('PERM_APPOINTMENT_UPDATE_ALL') || hasPermission('PERM_APPOINTMENT_UPDATE_OWN');
  const canPay = hasPermission('PERM_INVOICE_PAY') || hasPermission('PERM_APPOINTMENT_UPDATE_ALL');
  
  const queryClient = useQueryClient();

  // Fetch data using React Query
  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['appointments', 'all'],
    queryFn: async () => {
      const res = await getAllAppointments();
      return res.data?.data || [];
    }
  });

  const appointments = data || [];

  // Mutations for actions
  const actionMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      if (action === 'confirm') return await confirmAppointment(id);
      if (action === 'complete') return await completeAppointment(id);
      if (action === 'cancel') return await cancelAppointment(id);
    },
    onSuccess: (data, variables) => {
      toast.success(`Thao tác ${variables.action} thành công!`);
      queryClient.invalidateQueries({ queryKey: ['appointments', 'all'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  });

  const isProcessing = actionMutation.isPending;
  const processingId = actionMutation.variables?.id;

  const handleAction = (id, action) => {
    if (action === 'cancel' && !window.confirm('Hủy lịch hẹn này?')) return;
    actionMutation.mutate({ id, action }, {
      onSuccess: () => {
         if (selectedAppt && selectedAppt.id === id) {
             setSelectedAppt(null);
         }
      }
    });
  };

  const filtered = appointments.filter(appt => {
    const matchStatus = filterStatus === 'ALL' || appt.status === filterStatus;
    const matchDate = !filterDate || appt.appointmentDate === filterDate;
    const line = appt.lines?.[0];
    const matchSearch = !searchText
      || (line?.serviceName || '').toLowerCase().includes(searchText.toLowerCase())
      || (line?.technicianName || '').toLowerCase().includes(searchText.toLowerCase())
      || (appt.appointmentDate || '').includes(searchText);
    return matchStatus && matchDate && matchSearch;
  });

  const countByStatus = (status) => appointments.filter(a => a.status === status).length;

  return (
    <AdminLayout>
      <div className="section-head" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="section-title">Quản lý Lịch hẹn</h2>
          <p className="muted">Tổng hợp và điều phối tất cả lịch hẹn của khách hàng.</p>
        </div>
        <button className="btn btn-outline" onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalendarCheck size={16} /> Làm mới
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Chờ xử lý', count: countByStatus('PENDING'), color: '#f57f17', bg: '#fff9c4' },
          { label: 'Đã xác nhận', count: countByStatus('CONFIRMED'), color: '#1565c0', bg: '#e3f2fd' },
          { label: 'Hoàn tất', count: countByStatus('COMPLETED'), color: '#2e7d32', bg: '#e8f5e9' },
          { label: 'Đã hủy', count: countByStatus('CANCELLED'), color: '#c62828', bg: '#fce4ec' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="dashboard-card"
            style={{ background: '#fff', padding: 16, borderRadius: 10, boxShadow: 'var(--shadow-soft)', cursor: 'pointer', border: `2px solid ${filterStatus === STATUS_LABELS[label] ? color : 'transparent'}` }}
          >
            <p className="muted" style={{ margin: '0 0 4px', fontSize: 12 }}>{label}</p>
            <h3 style={{ margin: 0, fontSize: 24, color }}>{count}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button 
          className={`btn ${viewMode === 'list' ? '' : 'btn-outline'}`}
          onClick={() => setViewMode('list')}
        >
          Danh sách
        </button>
        <button 
          className={`btn ${viewMode === 'calendar' ? '' : 'btn-outline'}`}
          onClick={() => setViewMode('calendar')}
        >
          Lịch
        </button>
      </div>

      {/* Filters (only in list view) */}
      {viewMode === 'list' && (
      <div className="dashboard-card" style={{ background: '#fff', padding: 18, borderRadius: 12, boxShadow: 'var(--shadow-soft)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input className="input-field" style={{ paddingLeft: 36 }}
              placeholder="Tìm kiếm dịch vụ, kỹ thuật viên..."
              value={searchText} onChange={e => setSearchText(e.target.value)} />
          </div>
          <input type="date" className="input-field" style={{ width: 180 }}
            value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <select className="input-field" style={{ width: 180 }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {(searchText || filterDate || filterStatus !== 'ALL') && (
            <button className="btn btn-outline" style={{ padding: '9px 16px' }}
              onClick={() => { setSearchText(''); setFilterDate(''); setFilterStatus('ALL'); }}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
      )}

      {/* Content */}
      {viewMode === 'calendar' ? (
        <AppointmentCalendar 
          appointments={appointments} 
          onSelectEvent={(event) => setSelectedAppt(event.resource)}
        />
      ) : (
      <div className="dashboard-card" style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-soft)', overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Danh sách Lịch hẹn</span>
          <span className="muted" style={{ fontSize: 13 }}>Hiển thị {filtered.length} / {appointments.length} lịch hẹn</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p className="muted">Không tìm thấy lịch hẹn nào.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                  {['Ngày', 'Giờ', 'Dịch vụ', 'Kỹ thuật viên', 'Chi nhánh', 'Ghi chú', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(appt => {
                  const line = appt.lines?.[0];
                  const statusStyle = STATUS_COLORS[appt.status] || {};
                  const isProcessing = processingId === appt.id;
                  return (
                    <tr key={appt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{appt.appointmentDate}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{appt.startTime}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{line?.serviceName || 'Dịch vụ'}</div>
                        {line?.price && <div className="muted" style={{ fontSize: 12 }}>{Number(line.price).toLocaleString('vi-VN')}d</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{line?.technicianName || <span className="muted">—</span>}</td>
                      <td style={{ padding: '12px 16px' }}>{appt.branchName || <span className="muted">—</span>}</td>
                      <td style={{ padding: '12px 16px', color: '#666', fontSize: 13, maxWidth: 150 }}>{appt.notes || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color, whiteSpace: 'nowrap' }}>
                          {STATUS_LABELS[appt.status] || appt.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {canManage ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {appt.status === 'PENDING' && (
                              <button className="btn" style={{ padding: '5px 12px', fontSize: 12 }}
                                disabled={isProcessing} onClick={() => handleAction(appt.id, 'confirm')}>
                                Xác nhận
                              </button>
                            )}
                            {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                              <button className="btn" style={{ padding: '5px 12px', fontSize: 12, background: '#2e7d32' }}
                                disabled={isProcessing} onClick={() => handleAction(appt.id, 'complete')}>
                                Hoàn thành
                              </button>
                            )}
                            {appt.status === 'COMPLETED' && canPay && (
                              <button className="btn" style={{ padding: '5px 12px', fontSize: 12, background: 'var(--pink)', display: 'flex', alignItems: 'center', gap: 4 }}
                                disabled={isProcessingPayment} onClick={() => handleOpenPayment(appt.id)}>
                                <CreditCard size={14} /> Thu tiền
                              </button>
                            )}
                            {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                              <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12, color: '#c62828', borderColor: '#c62828' }}
                                disabled={isProcessing} onClick={() => handleAction(appt.id, 'cancel')}>
                                Hủy
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="muted" style={{ fontSize: 12 }}>Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="dashboard-card" style={{ background: '#fff', padding: 24, borderRadius: 12, width: 400, maxWidth: '90%' }}>
             <h3 style={{ margin: '0 0 16px' }}>Chi tiết Lịch hẹn</h3>
             
             <div style={{ marginBottom: 12 }}><strong>Khách hàng:</strong> {selectedAppt.customerName || 'Không có tên'}</div>
             <div style={{ marginBottom: 12 }}><strong>Ngày giờ:</strong> {selectedAppt.appointmentDate} lúc {selectedAppt.startTime}</div>
             <div style={{ marginBottom: 12 }}><strong>Dịch vụ:</strong> {selectedAppt.lines?.[0]?.serviceName}</div>
             <div style={{ marginBottom: 12 }}><strong>Kỹ thuật viên:</strong> {selectedAppt.lines?.[0]?.technicianName || 'Chưa xếp'}</div>
             <div style={{ marginBottom: 12 }}><strong>Ghi chú:</strong> {selectedAppt.notes || 'Không có'}</div>
             <div style={{ marginBottom: 24 }}><strong>Trạng thái:</strong> {STATUS_LABELS[selectedAppt.status] || selectedAppt.status}</div>

             <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={() => setSelectedAppt(null)}>Đóng</button>
                {canManage && (
                  <>
                    {selectedAppt.status === 'PENDING' && (
                      <button className="btn" disabled={isProcessing} onClick={() => handleAction(selectedAppt.id, 'confirm')}>Xác nhận</button>
                    )}
                    {(selectedAppt.status === 'PENDING' || selectedAppt.status === 'CONFIRMED') && (
                      <button className="btn" style={{ background: '#2e7d32' }} disabled={isProcessing} onClick={() => handleAction(selectedAppt.id, 'complete')}>Hoàn thành</button>
                    )}
                    {selectedAppt.status === 'COMPLETED' && canPay && (
                      <button className="btn" style={{ background: 'var(--pink)' }} disabled={isProcessingPayment} onClick={() => { setSelectedAppt(null); handleOpenPayment(selectedAppt.id); }}>Thu tiền</button>
                    )}
                    {selectedAppt.status !== 'CANCELLED' && selectedAppt.status !== 'COMPLETED' && (
                      <button className="btn btn-outline" style={{ color: '#c62828', borderColor: '#c62828' }} disabled={isProcessing} onClick={() => handleAction(selectedAppt.id, 'cancel')}>Hủy</button>
                    )}
                  </>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Staff Payment Modal */}
      {showPaymentModal && paymentInvoice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, padding: 32,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)', position: 'relative', animation: 'scaleUp 0.3s ease-out'
          }}>
            <button 
              onClick={() => { setShowPaymentModal(false); setPaymentInvoice(null); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#888' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ margin: '0 0 8px', fontSize: 22, textAlign: 'center' }}>Thu tiền Dịch vụ</h3>
            <p className="muted" style={{ margin: '0 0 24px', textAlign: 'center' }}>Hóa đơn #{paymentInvoice.id?.substring(0, 8).toUpperCase()}</p>

            <div style={{ background: '#fdf3ed', padding: 20, borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#cd7f32', marginBottom: 4, fontWeight: 600 }}>SỐ TIỀN CẦN THU</div>
              <div style={{ fontSize: 28, color: 'var(--pink)', fontWeight: 700 }}>{Number(paymentInvoice.totalAmount).toLocaleString('vi-VN')}đ</div>
            </div>

            <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>Chọn phương thức thanh toán</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {PAYMENT_METHODS.map(method => (
                <div 
                  key={method.code}
                  onClick={() => setPaymentMethod(method.code)}
                  style={{ 
                    padding: 16, borderRadius: 12, 
                    border: `2px solid ${paymentMethod === method.code ? method.color : '#eee'}`, 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, 
                    background: paymentMethod === method.code ? `${method.color}10` : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 40, height: 40, background: method.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                    {method.icon === 'phone' ? <Smartphone size={24} /> : method.icon === 'wallet' ? <Wallet size={24} /> : method.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#111' }}>{method.label}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{method.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn" 
              style={{ width: '100%', padding: '14px', fontSize: 16 }}
              onClick={handleConfirmPay}
              disabled={!paymentMethod || isProcessingPayment}
            >
              {isProcessingPayment ? 'Đang xử lý...' : 'Xác nhận Đã thu tiền'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </AdminLayout>
  );
}
