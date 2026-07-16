import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaFax, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="main-footer-wrapper">
      <div className="footer-container main-footer-content">
        {/* CỘT 1: THÔNG TIN LIÊN HỆ */}
        <div className="footer-col info-col">
          <div className="footer-brand-box">
            <div className="footer-text-logo">
              <span className="footer-logo-main">Tintuc News</span>
              <span className="footer-logo-sub">CẬP NHẬT LIÊN TỤC & CHÍNH XÁC</span>
            </div>
          </div>

          <div className="footer-contact-info">
            <p>
              <FaMapMarkerAlt className="footer-icon-gold" />
              <strong>Địa chỉ: </strong> Hà Nội, Việt Nam
            </p>
            <p className="footer-contact-row">
              <span className="contact-item">
                <FaPhoneAlt className="footer-icon-gold" />
                <strong>Hotline: </strong> 1900 xxxx
              </span>
            </p>
            <p>
              <FaEnvelope className="footer-icon-gold" />
              <strong>Email: </strong> nguyenxuanchienbkn@gmail.com
            </p>
          </div>
        </div>

        {/* CỘT 2: LIÊN KẾT NHANH */}
        <div className="footer-col links-col">
          <h3 className="footer-heading">LIÊN KẾT NHANH</h3>
          <ul className="footer-link-list">
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <Link to="/news">Tin tức - Sự kiện</Link>
            </li>
            <li>
              <Link to="/documents">Văn bản chỉ đạo</Link>
            </li>
            <li>
              <Link to="#">Điều khoản sử dụng</Link>
            </li>
            <li>
              <Link to="#">Chính sách bảo mật</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="main-footer-bottom">
        <p>© {new Date().getFullYear()} Tintuc News. Nền tảng cập nhật tin tức đa chiều, nhanh chóng và chính xác.</p>
      </div>
    </footer>
  );
};

export default Footer;
