import CustomerLayout from '../../components/layout/CustomerLayout';

export default function BookingPage() {
  return <CustomerLayout>
    <div className="dashboard-card">
      <div className="eyebrow">Appointment</div>
      <h2 className="section-title">Đặt lịch hẹn</h2>
      <div className="form-grid">
        <select><option>Chọn dịch vụ</option><option>Massage thư giãn</option><option>Nail cao cấp</option><option>Cắt tóc tạo kiểu</option></select>
        <select><option>Chọn kỹ thuật viên</option><option>Linh Chi</option><option>Minh Anh</option><option>Thảo Vy</option></select>
        <input type="date" />
        <input type="time" />
      </div>
      <textarea style={{width:'100%',marginTop:16,minHeight:100,border:'1px solid #f6dbe5',borderRadius:10,padding:14}} placeholder="Ghi chú yêu cầu của bạn"></textarea>
      <button className="btn" style={{marginTop:16}}>Xác nhận đặt lịch</button>
    </div>
  </CustomerLayout>;
}
