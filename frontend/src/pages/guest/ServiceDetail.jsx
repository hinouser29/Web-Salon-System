import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getServiceById, getServiceReviews, getServiceReviewSummary } from "../../api/salonApi";
import { resolveFileUrl } from "../../api/axiosClient";
import StarRating from "../../components/StarRating";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getServiceById(id)
      .then((res) => setService(res.data?.data))
      .catch((err) => console.error(err));
      
    getServiceReviewSummary(id)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
      
    getServiceReviews(id)
      .then((res) => setReviews(res.data))
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

          <Link to={`/customer/booking?serviceId=${service.id}`} className="btn" style={{ marginTop: 20, display: 'inline-block' }}>
            Đặt lịch dịch vụ này
          </Link>
        </div>
      </div>
      
      <div style={{ marginTop: 60 }}>
        <h3 className="section-title">Danh gia tu khach hang</h3>
        {summary && summary.totalReviews > 0 ? (
          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', marginBottom: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: 64, margin: 0, color: '#111' }}>{summary.averageRating}</h1>
              <StarRating rating={Math.round(summary.averageRating)} readOnly />
              <p className="muted" style={{ marginTop: 8 }}>{summary.totalReviews} danh gia</p>
            </div>
            <div style={{ flex: 1, maxWidth: 400 }}>
              {[
                { star: 5, count: summary.fiveStarCount },
                { star: 4, count: summary.fourStarCount },
                { star: 3, count: summary.threeStarCount },
                { star: 2, count: summary.twoStarCount },
                { star: 1, count: summary.oneStarCount },
              ].map(item => (
                <div key={item.star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ minWidth: 20 }}>{item.star} <StarRating rating={1} size={12} readOnly /></span>
                  <div style={{ flex: 1, background: '#eee', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${summary.totalReviews ? (item.count / summary.totalReviews) * 100 : 0}%`, 
                      background: '#fbbf24', 
                      height: '100%' 
                    }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#666', minWidth: 30 }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="muted">Chua co danh gia nao cho dich vu nay.</p>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {reviews.map(review => (
            <div key={review.id} style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--pink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {review.customerName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{review.customerName}</h4>
                    <span style={{ fontSize: 13, color: '#999' }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <StarRating rating={review.rating} readOnly size={16} />
              </div>
              <p style={{ margin: 0, color: '#333', lineHeight: 1.6 }}>{review.comment || 'Khong co nhan xet.'}</p>
              {review.technicianName && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: '#666', background: '#f5f5f5', padding: '8px 12px', borderRadius: 6, display: 'inline-block' }}>
                  KTV thuc hien: <b>{review.technicianName}</b>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
