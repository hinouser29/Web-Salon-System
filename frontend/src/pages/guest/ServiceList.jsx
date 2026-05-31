import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { resolveFileUrl } from "../../api/axiosClient";
import { getActiveServices } from "../../api/servicesApi";

export default function ServiceList() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['services'],
    queryFn: getActiveServices,
  });
  const services = data?.data?.data || [];


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

      {loading ? (
        <p className="muted">Đang tải...</p>
      ) : (
        <div className="grid">
          {services.map((s) => (
            <div className="service-card" key={s.id}>
              {s.imageUrl && <img src={resolveFileUrl(s.imageUrl)} alt={s.name} />}

              <div className="service-body">
                <p className="eyebrow">{s.categoryName}</p>
                <h3>{s.name}</h3>

                <p className="muted">
                  {s.durationMinutes} phút
                  <span className="price" style={{ float: "right" }}>
                    {Number(s.price).toLocaleString("vi-VN")}đ
                  </span>
                </p>

                <Link to={`/services/${s.id}`}>
                  <button type="button" className="card-btn">Xem chi tiết</button>
                </Link>
              </div>
            </div>
          ))}
          {services.length === 0 && <p className="muted">Chưa có dịch vụ nào.</p>}
        </div>
      )}
    </section>
  );
}
