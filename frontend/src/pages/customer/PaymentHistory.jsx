import { useEffect, useState } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { getMyInvoices, payInvoice } from '../../api/salonApi';

const PAYMENT_STATUS = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

export default function PaymentHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyInvoices();
      setInvoices(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePay = async (id) => {
    const method = window.prompt('Phương thức thanh toán (CASH / VNPAY / MOMO):', 'CASH');
    if (!method) return;
    try {
      setPayingId(id);
      await payInvoice(id, method.trim().toUpperCase());
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <CustomerLayout>
      <h2 className="section-title">Lịch sử thanh toán</h2>
      {error && <p className="auth-error">{error}</p>}
      {loading ? (
        <p className="muted">Đang tải...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Dịch vụ</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.id?.substring(0, 8).toUpperCase()}</td>
                <td>{inv.serviceSummary}</td>
                <td>{Number(inv.totalAmount).toLocaleString('vi-VN')}đ</td>
                <td>{inv.paymentMethod || '—'}</td>
                <td><span className="status">{PAYMENT_STATUS[inv.paymentStatus] || inv.paymentStatus}</span></td>
                <td>
                  {inv.paymentStatus === 'PENDING' && (
                    <button
                      type="button"
                      className="card-btn"
                      disabled={payingId === inv.id}
                      onClick={() => handlePay(inv.id)}
                    >
                      {payingId === inv.id ? 'Đang xử lý...' : 'Thanh toán'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan="6" className="muted">Chưa có hóa đơn</td></tr>
            )}
          </tbody>
        </table>
      )}
    </CustomerLayout>
  );
}
