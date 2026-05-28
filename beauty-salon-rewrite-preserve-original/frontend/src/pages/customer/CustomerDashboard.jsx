import CustomerLayout from '../../components/layout/CustomerLayout';

export default function CustomerDashboard() {
  return <CustomerLayout>
    <div className="section-head"><div><div className="eyebrow">Customer</div><h2 className="section-title">Tổng quan tài khoản</h2></div></div>
    <div className="stats">
      <div className="dashboard-card"><h3>Lịch hẹn</h3><strong>3</strong><p className="muted">Đang chờ / đã xác nhận</p></div>
      <div className="dashboard-card"><h3>Điểm thưởng</h3><strong>850</strong><p className="muted">Hạng Silver</p></div>
      <div className="dashboard-card"><h3>Combo đã mua</h3><strong>2</strong><p className="muted">Còn hiệu lực</p></div>
      <div className="dashboard-card"><h3>AI gợi ý</h3><strong>4</strong><p className="muted">Dịch vụ phù hợp</p></div>
    </div>
    <h2 className="section-title" style={{fontSize:28,marginTop:32}}>Gợi ý cho bạn</h2>
    <div className="grid">
      <div className="dashboard-card"><h3>Chăm sóc da mặt</h3><p className="muted">Phù hợp với lịch sử dịch vụ gần đây.</p><button className="card-btn">Đặt ngay</button></div>
      <div className="dashboard-card"><h3>Combo Spa + Nail</h3><p className="muted">Tiết kiệm 15% khi đặt combo.</p><button className="card-btn">Xem combo</button></div>
    </div>
  </CustomerLayout>;
}
