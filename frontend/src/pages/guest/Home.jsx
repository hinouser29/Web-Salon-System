import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axiosClient, { resolveFileUrl } from "../../api/axiosClient";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function Home() {
  const [services, setServices] = useState([]);
  const [techs, setTechs] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/services")
      .then((res) => {
        setServices(res.data.data || res.data || []);
      })
      .catch((err) => console.log("Lỗi lấy services:", err));

    axiosClient
      .get("/employees")
      .then((res) => {
        setTechs(res.data.data || res.data || []);
      })
      .catch((err) => console.log("Lỗi lấy employees:", err));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeInUp}>
              Tỏa sáng vẻ đẹp <span>Tự tin mỗi ngày</span>
            </motion.h1>
            <motion.p variants={fadeInUp}>
              Beauty Salon & Spa mang đến cho bạn những trải nghiệm làm đẹp
              tuyệt vời nhất.
            </motion.p>

            <motion.div variants={fadeInUp} className="hero-actions">
              <Link to="/customer/booking" className="btn">
                Đặt lịch ngay
              </Link>
              <Link to="/services" className="btn btn-outline">
                Xem dịch vụ
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="features-mini">
              <span>🎧 Đội ngũ chuyên nghiệp</span>
              <span>💎 Sản phẩm cao cấp</span>
              <span>🌸 Không gian thư giãn</span>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }} 
            animate={{ opacity: 1, scale: 1, x: 0 }} 
            transition={{ duration: 0.7 }}
            className="hero-img"
          >
            <img
              src="http://localhost:8080/images/home/hero-girl.png"
              alt="Beauty Girl"
            />
          </motion.div>
        </div>
      </section>

      <div className="container search-box">
        <div className="field">
          💆
          <div>
            <small>Chọn dịch vụ</small>
            <select>
              <option>Tất cả dịch vụ</option>
              {services.map((s) => (
                <option key={s.ServiceId}>{s.ServiceName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          👩‍🔧
          <div>
            <small>Chọn kỹ thuật viên</small>
            <select>
              <option>Bất kỳ</option>
              {techs.map((t) => (
                <option key={t.EmployeeId}>{t.FullName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          📅
          <div>
            <small>Chọn ngày</small>
            <input type="date" />
          </div>
        </div>

        <button className="btn">Tìm kiếm</button>
      </div>

      <section className="section container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Dịch vụ của chúng tôi</div>
            <h2 className="section-title">Dịch vụ nổi bật</h2>
          </div>

          <Link className="see-all" to="/services">
            Xem tất cả dịch vụ →
          </Link>
        </div>

        <div className="grid">
          {services.slice(0, 5).map((s) => (
            <div className="service-card" key={s.ServiceId}>
              <img src={resolveFileUrl(s.ImageUrl)} alt={s.ServiceName} />

              <div className="service-body">
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

        <div id="promotion" className="banner">
          <div>
            <div className="eyebrow">Khuyến mãi hấp dẫn</div>
            <h2>Ưu đãi đặc biệt tháng 5</h2>
            <p>Giảm ngay 20% tất cả dịch vụ làm đẹp</p>
            <button className="btn">Xem chi tiết</button>
          </div>

          <div className="discount">
            20%
            <br />
            <small>OFF</small>
          </div>
        </div>
      </section>

      <section id="about" className="section why">
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <div className="eyebrow">Vì sao chọn chúng tôi?</div>
            <h2 className="section-title">Trải nghiệm khác biệt</h2>
          </div>

          <div className="grid why-grid">
            <div className="why-item">
              <div className="circle">👩‍⚕️</div>
              <h3>Đội ngũ chuyên nghiệp</h3>
              <p className="muted">Kỹ thuật viên giàu kinh nghiệm.</p>
            </div>

            <div className="why-item">
              <div className="circle">🎁</div>
              <h3>Sản phẩm cao cấp</h3>
              <p className="muted">An toàn cho sức khỏe.</p>
            </div>

            <div className="why-item">
              <div className="circle">🏠</div>
              <h3>Không gian sang trọng</h3>
              <p className="muted">Sạch sẽ, thư giãn tuyệt đối.</p>
            </div>

            <div className="why-item">
              <div className="circle">💗</div>
              <h3>Dịch vụ tận tâm</h3>
              <p className="muted">Chăm sóc khách hàng chu đáo.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="technicians" className="section container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Kỹ thuật viên nổi bật</div>
            <h2 className="section-title">Đội ngũ chuyên gia</h2>
          </div>

          <a className="see-all">Xem tất cả →</a>
        </div>

        <div className="tech-grid">
          {techs.slice(0, 4).map((t, index) => (
            <div className="tech-card" key={t.EmployeeId}>
              <div className="tech-img-box">
                <img
                  src={`http://localhost:5000${t.ImageUrl}`}
                  alt={t.FullName}
                />
              </div>

              <div className="tech-info">
                <h3>{t.FullName}</h3>

                <p>Chuyên viên {t.Specialization}</p>

                <span className="exp">{5 + index} năm kinh nghiệm</span>

                <div className="social">
                  <span>f</span>
                  <span>◎</span>
                  <span>▶</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section testimonials">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Khách hàng nói về chúng tôi</div>
              <h2 className="section-title">Cảm nhận từ khách hàng</h2>
            </div>

            <a className="see-all">Xem tất cả →</a>
          </div>

          <div className="grid">
            <div className="testimonial">
              <h2 style={{ color: "#ef4f83" }}>“</h2>
              <p>
                Dịch vụ tuyệt vời. Nhân viên tư vấn nhiệt tình, kỹ thuật viên
                tay nghề cao.
              </p>
              <b>Nguyễn Thanh Hằng</b>
              <p className="stars">★★★★★</p>
            </div>

            <div className="testimonial">
              <h2 style={{ color: "#ef4f83" }}>“</h2>
              <p>
                Không gian đẹp, thư giãn, giá cả hợp lý. Đặc biệt thích dịch vụ
                chăm sóc da.
              </p>
              <b>Trần Thị Mai</b>
              <p className="stars">★★★★★</p>
            </div>
          </div>

          <div className="newsletter">
            <div>
              <div className="eyebrow">Đăng ký nhận tin</div>
              <h2>Nhận ngay ưu đãi đặc biệt!</h2>
              <p className="muted">
                Đăng ký email để nhận thông tin khuyến mãi mới nhất.
              </p>
            </div>

            <div>
              <input placeholder="Nhập email của bạn" />{" "}
              <button className="btn">Đăng ký</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo">
            🌸
            <div>
              Beauty<span>Salon & Spa</span>
            </div>
          </div>

          <p className="muted">
            Nơi tôn vinh vẻ đẹp và mang đến sự tự tin cho bạn.
          </p>
        </div>

        <div>
          <h4>Dịch vụ</h4>
          <ul>
            <li>Chăm sóc da mặt</li>
            <li>Massage thư giãn</li>
            <li>Nail cao cấp</li>
            <li>Làm tóc</li>
          </ul>
        </div>

        <div>
          <h4>Hỗ trợ</h4>
          <ul>
            <li>Hướng dẫn đặt lịch</li>
            <li>Chính sách bảo mật</li>
            <li>Câu hỏi thường gặp</li>
          </ul>
        </div>

        <div>
          <h4>Liên hệ</h4>
          <ul>
            <li>☎ 0123 456 789</li>
            <li>✉ spa@beautysalon.com</li>
            <li>📍 Đà Nẵng</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
