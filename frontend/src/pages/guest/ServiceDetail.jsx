import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getServiceById } from "../../api/salonApi";
import { resolveFileUrl } from "../../api/axiosClient";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);

  useEffect(() => {
    getServiceById(id)
      .then((res) => setService(res.data?.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!service) return <p className="container">Đang tải...</p>;

  return (
    <section className="section container">
      <div
        className="dashboard-card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 30,
          alignItems: "center",
        }}
      >
        {service.imageUrl && (
          <img
            style={{ width: "100%", borderRadius: 18 }}
            src={resolveFileUrl(service.imageUrl)}
            alt={service.name}
          />
        )}

        <div>
          <div className="eyebrow">{service.categoryName}</div>
          <h1 className="section-title">{service.name}</h1>

          <p className="muted">{service.description}</p>

          <p>
            <b>Thời lượng:</b> {service.durationMinutes} phút
          </p>

          <p>
            <b>Giá:</b>{" "}
            <span className="price">
              {Number(service.price).toLocaleString("vi-VN")}đ
            </span>
          </p>

          <Link to={`/customer/booking?serviceId=${service.id}`} className="btn">
            Đặt lịch dịch vụ này
          </Link>
        </div>
      </div>
    </section>
  );
}
