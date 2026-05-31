import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { getMyInvoices, payInvoice } from '../../api/salonApi';
import { CreditCard, Receipt, AlertCircle, X, CheckCircle, Wallet, Smartphone } from 'lucide-react';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function PaymentHistory() {
  const queryClient = useQueryClient();

  // Payment Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const { data: invoices = [], isLoading: loading, error } = useQuery({
    queryKey: ['myInvoices'],
    queryFn: async () => {
      const res = await getMyInvoices();
      return res.data?.data || [];
    },
  });

  const payMutation = useMutation({
    mutationFn: ({ invoiceId, method }) => payInvoice(invoiceId, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInvoices'] });
      toast.success('Thanh toán thành công!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại');
    },
  });

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentMethod('');
    setShowModal(true);
  };

  const closePaymentModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    setPaymentMethod('');
  };

  const handleConfirmPay = () => {
    if (!paymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }
    closePaymentModal();
    payMutation.mutate({ invoiceId: selectedInvoice.id, method: paymentMethod });
  };

  const errorMessage = error ? (error.response?.data?.message || 'Không thể tải lịch sử thanh toán') : '';

  const getMethodIcon = (iconType) => {
    if (iconType === 'phone') return <Smartphone size={24} />;
    if (iconType === 'wallet') return <Wallet size={24} />;
    return null; // text icon handled inline
  };

  return (
    <CustomerLayout>
      <div className="section-head" style={{ marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--pink)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>BILLING</div>
          <h2 className="section-title" style={{ fontSize: 28, margin: 0 }}>Lịch sử thanh toán</h2>
        </div>
      </div>

      {errorMessage && <div className="alert error" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={18}/> {errorMessage}</div>}
      
      {loading ? (
        <p className="muted" style={{ textAlign: 'center', padding: 40 }}>Đang tải hóa đơn...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {invoices.map((inv) => {
            const statusStyle = PAYMENT_STATUS[inv.paymentStatus] || { label: inv.paymentStatus, bg: '#eee', color: '#666' };
            const isPaying = payMutation.isPending && payMutation.variables?.invoiceId === inv.id;

            return (
              <div key={inv.id} className="dashboard-card invoice-card" style={{ 
                background: '#fff', 
                borderRadius: 16, 
                padding: 24, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)', 
                border: '1px solid #f0f0f0',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#888', fontWeight: 600, letterSpacing: 1 }}>MÃ HÓA ĐƠN</span>
                    <h4 style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 16 }}>#{inv.id?.substring(0, 8).toUpperCase()}</h4>
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
                    {statusStyle.label}
                  </span>
                </div>

                <div style={{ background: '#fafafa', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#666', fontSize: 14 }}>Dịch vụ:</span>
                    <strong style={{ fontSize: 14, textAlign: 'right', maxWidth: '60%' }}>{inv.serviceSummary || '—'}</strong>
                  </div>
                  {inv.paymentMethod && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ color: '#666', fontSize: 14 }}>Phương thức:</span>
                      <strong style={{ fontSize: 14 }}>{inv.paymentMethod}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px dashed #ddd' }}>
                    <span style={{ color: '#666', fontSize: 14, fontWeight: 500 }}>Tổng tiền:</span>
                    <strong style={{ fontSize: 18, color: 'var(--pink)' }}>{Number(inv.totalAmount).toLocaleString('vi-VN')}đ</strong>
                  </div>
                </div>

                {inv.paymentStatus === 'PENDING' && (
                  <button
                    type="button"
                    className="btn"
                    disabled={isPaying}
                    onClick={() => openPaymentModal(inv)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '12px' }}
                  >
                    <CreditCard size={18} />
                    {isPaying ? 'Đang xử lý...' : 'Thanh toán ngay'}
                  </button>
                )}
                {inv.paymentStatus === 'PAID' && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '12px', color: '#2e7d32', borderColor: '#2e7d32' }}
                  >
                    <CheckCircle size={18} /> Đã hoàn tất
                  </button>
                )}
              </div>
            );
          })}
          
          {invoices.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fafafa', borderRadius: 16 }}>
              <div style={{ background: '#fff', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Receipt size={40} color="#ccc" />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#333' }}>Chưa có hóa đơn</h3>
              <p className="muted" style={{ margin: 0 }}>Bạn chưa có lịch sử thanh toán nào trong hệ thống.</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showModal && selectedInvoice && (
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
              onClick={closePaymentModal}
              style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#888' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ margin: '0 0 8px', fontSize: 22, textAlign: 'center' }}>Thanh toán Hóa đơn</h3>
            <p className="muted" style={{ margin: '0 0 24px', textAlign: 'center' }}>Hóa đơn #{selectedInvoice.id?.substring(0, 8).toUpperCase()}</p>

            <div style={{ background: '#fdf3ed', padding: 20, borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#cd7f32', marginBottom: 4, fontWeight: 600 }}>SỐ TIỀN CẦN THANH TOÁN</div>
              <div style={{ fontSize: 28, color: 'var(--pink)', fontWeight: 700 }}>{Number(selectedInvoice.totalAmount).toLocaleString('vi-VN')}đ</div>
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
              disabled={!paymentMethod}
            >
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      )}

      <style>{`
        .invoice-card:hover {
          border-color: #ffd1e3 !important;
          box-shadow: 0 8px 24px rgba(226,56,120,0.08) !important;
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </CustomerLayout>
  );
}
