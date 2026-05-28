import CustomerLayout from '../../components/layout/CustomerLayout';

const rows = [
  ['Massage thư giãn','Linh Chi','25/05/2026 09:00','Đã xác nhận'],
  ['Nail cao cấp','Minh Anh','28/05/2026 14:00','Chờ xác nhận'],
  ['Chăm sóc da mặt','Thảo Vy','30/05/2026 10:30','Đã đặt']
];
export default function MyAppointments() {
  return <CustomerLayout>
    <h2 className="section-title">Lịch hẹn của tôi</h2>
    <table className="table"><thead><tr><th>Dịch vụ</th><th>Kỹ thuật viên</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map(r=><tr key={r[2]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><span className="status">{r[3]}</span></td><td><button className="card-btn">Chi tiết</button></td></tr>)}</tbody></table>
  </CustomerLayout>;
}
