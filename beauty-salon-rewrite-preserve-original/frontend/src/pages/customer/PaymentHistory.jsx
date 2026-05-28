import CustomerLayout from '../../components/layout/CustomerLayout';

export default function PaymentHistory() {
  return <CustomerLayout>
    <h2 className="section-title">Lịch sử thanh toán</h2>
    <table className="table"><thead><tr><th>Mã hóa đơn</th><th>Dịch vụ</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th></tr></thead><tbody>
      <tr><td>INV001</td><td>Massage thư giãn</td><td>500,000đ</td><td>VNPay</td><td><span className="status">Đã thanh toán</span></td></tr>
      <tr><td>INV002</td><td>Nail cao cấp</td><td>300,000đ</td><td>Tiền mặt</td><td><span className="status">Hoàn tất</span></td></tr>
    </tbody></table>
  </CustomerLayout>;
}
