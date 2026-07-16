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
            <img
              src="/logo footer.png"
              alt="Logo Footer"
              className="footer-logo-img"
            />
          </div>

          <div className="footer-contact-info">
            <p>
              <FaMapMarkerAlt className="footer-icon-gold" />
              <strong>Địa chỉ: </strong> Số 20, ngõ 2 Hoa Lư, Hai Bà Trưng, Hà
              Nội
            </p>
            <p className="footer-contact-row">
              <span className="contact-item">
                <FaPhoneAlt className="footer-icon-gold" />
                <strong>Điện thoại: </strong> 0243.9745845
              </span>
              <span className="footer-sep">|</span>
              <span className="contact-item">
                <FaFax className="footer-icon-gold" />
                <strong>Fax: </strong> 0243.9745846
              </span>
            </p>
            <p>
              <FaEnvelope className="footer-icon-gold" />
              <strong>Email: </strong> banbientap@bvhttdl.gov.vn
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
              <a
                href="https://dichvucong.gov.vn"
                target="_blank"
                rel="noreferrer"
              >
                Cổng Dịch vụ công Quốc gia
              </a>
            </li>
            <li>
              <a href="https://bvhttdl.gov.vn" target="_blank" rel="noreferrer">
                Cổng TTĐT Bộ VHTTDL
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="main-footer-bottom">
        <p>© {new Date().getFullYear()} Trung tâm Công nghệ thông tin — Bộ Văn hóa, Thể thao và Du lịch. Bản quyền thuộc về BVHTTDL.</p>
      </div>
    </footer>
  );
};

export default Footer;
