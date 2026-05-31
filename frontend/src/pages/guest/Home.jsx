import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, User, CheckCircle, Heart, Award, Sparkles, 
  ArrowRight, MapPin, Phone, Mail,
  Search, Play, Star
} from "lucide-react";
import { resolveFileUrl } from "../../api/axiosClient";
import { getActiveServices } from "../../api/servicesApi";
import { getTechnicians } from "../../api/techniciansApi";
import Hero3D from "../../components/Hero3D";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function Home() {
  const { data: servicesRes } = useQuery({
    queryKey: ['services'],
    queryFn: getActiveServices,
  });
  const services = servicesRes?.data?.data || [];

  const { data: techsRes } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => getTechnicians(),
  });
  const techs = techsRes?.data?.data || [];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <section className="hero">
          <div className="container hero-inner">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ zIndex: 2 }}>
              <motion.h1 variants={fadeInUp}>
                Tỏa sáng vẻ đẹp <span>Tự tin mỗi ngày</span>
              </motion.h1>
              <motion.p variants={fadeInUp}>
                Beauty Salon & Spa mang đến cho bạn những trải nghiệm làm đẹp
                tuyệt vời nhất. Thư giãn, tái tạo và nâng tầm vẻ đẹp của bạn.
              </motion.p>

              <motion.div variants={fadeInUp} className="hero-actions">
                <Link to="/customer/booking" className="btn">
                  Đặt lịch ngay
                </Link>
                <Link to="/services" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={18} /> Xem dịch vụ
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="features-mini">
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><CheckCircle size={16} color="var(--pink)" /> Đội ngũ chuyên nghiệp</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Sparkles size={16} color="var(--pink)" /> Sản phẩm cao cấp</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Heart size={16} color="var(--pink)" /> Không gian thư giãn</span>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 50 }} 
              animate={{ opacity: 1, scale: 1, x: 0 }} 
              transition={{ duration: 0.7 }}
              className="hero-img-container"
            >
              <Hero3D />
            </motion.div>
          </div>
        </section>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="container search-box"
          style={{ backdropFilter: "blur(10px)", background: "rgba(255, 255, 255, 0.85)" }}
        >
          <div className="field" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{ background: '#fff0f5', padding: '12px', borderRadius: '12px', color: 'var(--pink)' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <small>Chọn dịch vụ</small>
              <select style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '15px', fontWeight: '500' }}>
                <option>Tất cả dịch vụ</option>
                {services.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{ background: '#fff0f5', padding: '12px', borderRadius: '12px', color: 'var(--pink)' }}>
              <User size={24} />
            </div>
            <div>
              <small>Chọn kỹ thuật viên</small>
              <select style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '15px', fontWeight: '500' }}>
                <option>Bất kỳ</option>
                {techs.map((t) => (
                  <option key={t.id}>{t.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{ background: '#fff0f5', padding: '12px', borderRadius: '12px', color: 'var(--pink)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <small>Chọn ngày</small>
              <input type="date" style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '15px', fontWeight: '500' }} />
            </div>
          </div>

          <button className="btn" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            <Search size={18} /> Tìm kiếm
          </button>
        </motion.div>

        <section className="section container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-head"
          >
            <div>
              <div className="eyebrow">Dịch vụ của chúng tôi</div>
              <h2 className="section-title">Dịch vụ nổi bật</h2>
            </div>
            <Link className="see-all" to="/services" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              Xem tất cả dịch vụ <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div 
            className="grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            {services.slice(0, 4).map((s) => (
              <motion.div 
                className="service-card" 
                key={s.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(239, 79, 131, 0.12)' }}
                transition={{ duration: 0.3 }}
              >
                {s.imageUrl && <img src={resolveFileUrl(s.imageUrl)} alt={s.name} />}
                <div className="service-body">
                  {s.categoryName && <p className="eyebrow" style={{margin:'0 0 4px'}}>{s.categoryName}</p>}
                  <h3>{s.name}</h3>
                  <p className="muted">
                    {s.durationMinutes} phút
                    <span className="price" style={{ float: "right", color: "var(--pink)", fontWeight: "600" }}>
                      {Number(s.price).toLocaleString("vi-VN")}đ
                    </span>
                  </p>
                  <Link to={`/services/${s.id}`}>
                    <button className="card-btn">Xem chi tiết</button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            id="promotion" 
            className="banner"
          >
            <div>
              <div className="eyebrow">Khấp nổi</div>
              <h2>Trải nghiệm dịch vụ tại nhiều chi nhánh</h2>
              <p>Hệ thống Beauty Salon phục vụ tại nhiều địa điểm trên toàn quốc</p>
              <Link to="/customer/booking" className="btn">Đặt lịch ngay</Link>
            </div>
            <div className="discount">
              <Sparkles size={48} />
            </div>
          </motion.div>
        </section>

        <section id="about" className="section why">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: "center" }}
            >
              <div className="eyebrow">Vì sao chọn chúng tôi?</div>
              <h2 className="section-title">Trải nghiệm khác biệt</h2>
            </motion.div>

            <motion.div 
              className="grid why-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.15 } }
              }}
            >
              {[
                { icon: <Award size={36} />, title: "Đội ngũ chuyên nghiệp", desc: "Kỹ thuật viên giàu kinh nghiệm." },
                { icon: <Sparkles size={36} />, title: "Sản phẩm cao cấp", desc: "An toàn cho sức khỏe." },
                { icon: <MapPin size={36} />, title: "Không gian sang trọng", desc: "Sạch sẽ, thư giãn tuyệt đối." },
                { icon: <Heart size={36} />, title: "Dịch vụ tận tâm", desc: "Chăm sóc khách hàng chu đáo." }
              ].map((item, index) => (
                <motion.div 
                  className="why-item" 
                  key={index}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ y: -5 }}
                >
                  <div className="circle">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="technicians" className="section container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-head"
          >
            <div>
              <div className="eyebrow">Kỹ thuật viên nổi bật</div>
              <h2 className="section-title">Đội ngũ chuyên gia</h2>
            </div>
            <a className="see-all" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              Xem tất cả <ArrowRight size={18} />
            </a>
          </motion.div>

          <motion.div 
            className="tech-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            {techs.slice(0, 4).map((t, index) => (
              <motion.div 
                className="tech-card" 
                key={t.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(198, 75, 116, 0.1)' }}
              >
                <div className="tech-img-box">
                  <img
                    src={t.imageUrl ? resolveFileUrl(t.imageUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(t.fullName || 'KTV')}&background=f6dbe5&color=c0396b&size=128`}
                    alt={t.fullName}
                  />
                </div>
                <div className="tech-info">
                  <h3>{t.fullName}</h3>
                  <p>{t.position || 'Chuyên viên làm đẹp'}</p>
                  {t.hireDate && (
                    <span className="exp">{new Date().getFullYear() - new Date(t.hireDate).getFullYear()} năm kinh nghiệm</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="section testimonials">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-head"
            >
              <div>
                <div className="eyebrow">Khách hàng nói về chúng tôi</div>
                <h2 className="section-title">Cảm nhận từ khách hàng</h2>
              </div>
            </motion.div>

            <motion.div 
              className="grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.2 } }
              }}
            >
              {[
                { name: "Nguyễn Thanh Hằng", text: "Dịch vụ tuyệt vời. Nhân viên tư vấn nhiệt tình, kỹ thuật viên tay nghề cao." },
                { name: "Trần Thị Mai", text: "Không gian đẹp, thư giãn, giá cả hợp lý. Đặc biệt thích dịch vụ chăm sóc da." },
                { name: "Lê Văn Hoàng", text: "Lần đầu tiên đến làm dịch vụ, rất hài lòng với chất lượng. Sẽ quay lại!" }
              ].map((testi, i) => (
                <motion.div 
                  className="testimonial" 
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h2 style={{ color: "#ef4f83", fontSize: "48px", lineHeight: 0.5, marginTop: "20px" }}>“</h2>
                  <p>{testi.text}</p>
                  <b>{testi.name}</b>
                  <p className="stars" style={{ display: "flex", gap: "2px", color: "#FFD700", marginTop: "10px" }}>
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="#FFD700" />)}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="newsletter"
            >
              <div>
                <div className="eyebrow">Đăng ký nhận tin</div>
                <h2>Nhận ngay ưu đãi đặc biệt!</h2>
                <p className="muted">Đăng ký email để nhận thông tin khuyến mãi mới nhất.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input placeholder="Nhập email của bạn" />
                <button className="btn">Đăng ký</button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo">
            <Sparkles size={28} color="var(--pink)" />
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
            <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Phone size={16}/> 0123 456 789</li>
            <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Mail size={16}/> spa@beautysalon.com</li>
            <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}><MapPin size={16}/> Đà Nẵng</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
