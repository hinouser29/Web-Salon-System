import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient, { resolveFileUrl } from "../../api/axiosClient";

export default function ServiceList() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/services")
      .then((res) => setServices(res.data.data || res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <section className="section container">
      <div className="section-head">
        <div>
          <div className="eyebrow">Danh sách dịch vụ</div>
          <h2 className="section-title">Chọn dịch vụ phù hợp</h2>
        </div>
        <Link className="btn" to="/customer/booking">
          Đặt lịch ngay
        </Link>
      </div>

      <div className="grid">
        {services.map((s) => (
          <div className="service-card" key={s.ServiceId}>
            <img src={resolveFileUrl(s.ImageUrl)} alt={s.ServiceName} />

            <div className="service-body">
              <p className="eyebrow">{s.CategoryName}</p>
              <h3>{s.ServiceName}</h3>

              <p className="muted">
                {s.DurationMinutes} phút
                <span className="price" style={{ float: "right" }}>
                  {Number(s.Price).toLocaleString("vi-VN")}đ
                </span>
              </p>

              <Link to={`/services/${s.ServiceId}`}>
                <button className="card-btn">Xem chi tiết</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
