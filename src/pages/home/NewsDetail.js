import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api"; // Đảm bảo đường dẫn đúng tới file cấu hình axios
import {
  FaCalendarAlt,
  FaUser,
  FaPrint,
  FaFacebookF,
  FaTwitter,
  FaAngleRight,
} from "react-icons/fa";
import "./NewsDetail.css";

const NewsDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // 1. Gọi API lấy chi tiết bài viết
        const res = await api.get(`/news/${id}`);
        setNews(res.data);

        // 2. Gọi API lấy danh sách tin để làm "Tin liên quan"
        // (Trong thực tế nên có API riêng: /news/related/:id)
        const resRelated = await api.get("/news");
        // Lọc ra các tin khác bài hiện tại và lấy 5 tin
        const otherNews = resRelated.data
          .filter((item) => item.NewsID !== parseInt(id))
          .slice(0, 5);

        setRelatedNews(otherNews);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    // Scroll lên đầu trang khi chuyển bài viết
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="loading-state">Đang tải nội dung...</div>;

  if (!news) return <div className="error-state">Không tìm thấy bài viết!</div>;

  return (
    <div className="news-detail-page">
      <div className="container">
        <div className="detail-layout">
          {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
          <div className="detail-content">
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <Link to="/">Trang chủ</Link> /<Link to="/news">Tin tức</Link> /
              <span>{news.CategoryName || "Chi tiết"}</span>
            </div>

            {/* Tiêu đề */}
            <h1 className="article-title">{news.Title}</h1>

            {/* Meta info (Ngày đăng, Tác giả) */}
            <div className="article-meta">
              <span className="meta-item">
                <FaCalendarAlt />{" "}
                {new Date(news.PublishedDate).toLocaleDateString("vi-VN")}
              </span>
              <span className="meta-item">
                <FaUser /> {news.CreatedBy || "Ban biên tập"}
              </span>
            </div>

            {/* Tóm tắt (In đậm) */}
            {news.Summary && (
              <div className="article-summary">
                <strong>{news.Summary}</strong>
              </div>
            )}

            {/* NỘI DUNG HTML (Quan trọng) */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: news.Content }}
            ></div>

            {/* Tác giả / Nguồn cuối bài */}
            <div className="article-author-footer">
              <strong>Tác giả:</strong> {news.CreatedBy || "Admin"}
            </div>

            {/* Các nút công cụ (In, Chia sẻ) */}
            <div className="article-tools">
              <button className="btn-tool" onClick={() => window.print()}>
                <FaPrint /> In bài viết
              </button>
              <div className="share-buttons">
                <span>Chia sẻ:</span>
                <a href="#" className="share-icon fb">
                  <FaFacebookF />
                </a>
                <a href="#" className="share-icon tw">
                  <FaTwitter />
                </a>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TIN LIÊN QUAN */}
          <div className="detail-sidebar">
            <div className="sidebar-widget">
              <h3 className="widget-title">TIN LIÊN QUAN</h3>
              <ul className="related-list">
                {relatedNews.map((item) => (
                  <li key={item.NewsID}>
                    <FaAngleRight className="arrow-icon" />
                    <Link to={`/news/${item.NewsID}`}>{item.Title}</Link>
                    <span className="date-sm">
                      (
                      {new Date(item.PublishedDate).toLocaleDateString("vi-VN")}
                      )
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
