import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  FaFileAlt,
  FaLink,
  FaStar,
  FaCaretRight,
  FaAngleDoubleRight,
} from "react-icons/fa";
import "./HomePage.css";

const HomePage = () => {
  const [slides, setSlides] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);

  // Data Grid
  const [newsActivityMinistry, setNewsActivityMinistry] = useState([]);
  const [newsActivityCenter, setNewsActivityCenter] = useState([]);
  const [newsDigital, setNewsDigital] = useState([]);
  const [newsPolicy, setNewsPolicy] = useState([]);

  // Sidebar
  const [documents, setDocuments] = useState([]);
  const [webLinks, setWebLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resSlides, resNews, resDocs, resLinks] = await Promise.all([
          api.get("/slides"),
          api.get("/news"),
          api.get("/documents"),
          api.get("/weblinks"),
        ]);

        let listSlides = resSlides.data || [];
        listSlides.sort(
          (a, b) => (a.DisplayOrder || 0) - (b.DisplayOrder || 0)
        );
        setSlides(listSlides);

        let allNews = resNews.data || [];
        allNews.sort(
          (a, b) => new Date(b.PublishedDate) - new Date(a.PublishedDate)
        );

        const getNewsByCategory = (catId, count, excludeIds = []) => {
          let filtered = allNews.filter((n) => n.CategoryID === catId);
          if (filtered.length < count) {
            const remaining = allNews.filter(
              (n) => n.CategoryID !== catId && !excludeIds.includes(n.NewsID)
            );
            filtered = [
              ...filtered,
              ...remaining.slice(0, count - filtered.length),
            ];
          }
          return filtered.slice(0, count);
        };

        setFeaturedNews(getNewsByCategory(15, 4));
        setNewsActivityMinistry(getNewsByCategory(12, 5));
        setNewsActivityCenter(getNewsByCategory(17, 5));
        setNewsDigital(getNewsByCategory(16, 5));
        setNewsPolicy(getNewsByCategory(10, 5));
        setDocuments(resDocs.data || []);
        setWebLinks(resLinks.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;

  const bigNews = featuredNews[0];
  const subNews = featuredNews.slice(1, 4);

  const SectionHeader = ({ title, linkTo }) => (
    <div className="gov-section-header">
      <h3 className="gov-section-title">
        <span className="icon-star">
          <FaStar />
        </span>{" "}
        {title}
      </h3>
    </div>
  );

  // Tin chính trong khối
  const FirstNewsItem = ({ news }) => (
    <div className="gov-first-news">
      <Link to={`/news/${news.NewsID}`} className="gov-first-thumb">
        <img
          src={news.ImageLink || "https://via.placeholder.com/300x200"}
          alt={news.Title}
        />
      </Link>
      <div className="gov-first-body">
        <h4 className="gov-first-title">
          <Link to={`/news/${news.NewsID}`}>{news.Title}</Link>
        </h4>
        <p className="gov-summary">{news.Summary}</p>
      </div>
    </div>
  );

  // List tin bên dưới
  const NewsListItem = ({ news }) => (
    <div className="gov-news-item-list">
      <FaCaretRight className="gov-bullet" />
      <Link to={`/news/${news.NewsID}`} title={news.Title}>
        {news.Title}{" "}
        <span className="gov-date-sm">({formatDate(news.PublishedDate)})</span>
      </Link>
    </div>
  );

  const CategoryBlock = ({ title, data, linkTo }) => (
    <div className="gov-box">
      <SectionHeader title={title} linkTo={linkTo} />
      <div className="gov-box-body">
        {data.length > 0 && <FirstNewsItem news={data[0]} />}
        <div className="gov-list-divider"></div>
        <div className="gov-sub-list">
          {data.slice(1).map((item) => (
            <NewsListItem key={item.NewsID} news={item} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-wrapper gov-style">
      <div className="home-container">
        {/* --- SECTION 1: TOP NEWS & SLIDER --- */}
        <div className="gov-top-section">
          {/* Cột tin nổi bật (Trái) */}
          <div className="gov-featured-col">
            <div className="gov-box no-border">
              <div className="gov-section-header-red">
                <span>TIN NỔI BẬT</span>
              </div>
              <div className="gov-featured-content">
                {bigNews && (
                  <div className="gov-big-news">
                    <Link
                      to={`/news/${bigNews.NewsID}`}
                      className="gov-big-thumb"
                    >
                      <img
                        src={
                          bigNews.ImageLink ||
                          "https://via.placeholder.com/600x400"
                        }
                        alt={bigNews.Title}
                      />
                    </Link>
                    <h2 className="gov-big-title">
                      <Link to={`/news/${bigNews.NewsID}`}>
                        {bigNews.Title}
                      </Link>
                    </h2>
                    <p className="gov-big-summary">{bigNews.Summary}</p>
                  </div>
                )}
                <div className="gov-sub-featured">
                  {subNews.map((news) => (
                    <div key={news.NewsID} className="gov-sub-item-row">
                      <Link
                        to={`/news/${news.NewsID}`}
                        className="gov-sub-thumb-sm"
                      >
                        <img src={news.ImageLink} alt={news.Title} />
                      </Link>
                      <Link
                        to={`/news/${news.NewsID}`}
                        className="gov-sub-title-sm"
                      >
                        {news.Title}
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="gov-view-all-bottom">
                  <Link to="/news" className="btn-view-all">
                    Xem tất cả tin tức <FaAngleDoubleRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Banner/Slide (Phải) - Giống trang nq57 thường banner bên phải hoặc trên cùng */}
          <div className="gov-banner-col">
            {slides.map((slide) => (
              <a
                key={slide.SlideID}
                href={slide.LinkUrl}
                target="_blank"
                rel="noreferrer"
                className="gov-banner-link"
              >
                <img
                  src={slide.ImageLink}
                  alt={slide.Name}
                  className="gov-banner-img"
                />
              </a>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: GRID CONTENT --- */}
        <div className="gov-main-grid">
          <div className="gov-content-left">
            <div className="gov-row-2">
              <CategoryBlock
                title="Hoạt động CĐS Bộ"
                data={newsActivityMinistry}
                linkTo="/bo-nganh"
              />
              <CategoryBlock
                title="Hoạt động CĐS Trung tâm"
                data={newsActivityCenter}
                linkTo="/trung-tam"
              />
            </div>

            {/* Banner giữa trang */}
            <div className="gov-mid-banner">
              <img
                src="https://dxc.gov.vn/SitePages/uploads/banners/banners.jpg"
                alt="Banner"
              />
            </div>

            <div className="gov-row-2">
              <CategoryBlock
                title="Điểm tin Chuyển đổi số"
                data={newsDigital}
                linkTo="/diem-tin"
              />
              <CategoryBlock
                title="Chính sách - Văn bản"
                data={newsPolicy}
                linkTo="/chinh-sach"
              />
            </div>
          </div>

          {/* SIDEBAR RIGHT */}
          <div className="gov-sidebar">
            {/* Box Link */}
            <div className="gov-box sidebar-box">
              <div className="gov-section-header sidebar-header">
                <span>LIÊN KẾT WEBSITE</span>
              </div>
              <ul className="gov-link-list">
                {webLinks
                  .filter((l) => l.IsShow)
                  .map((link) => (
                    <li key={link.LinkID}>
                      <FaLink className="icon-link" />
                      <a href={link.Url} target="_blank" rel="noreferrer">
                        {link.Name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Box Văn bản mới */}
            <div className="gov-box sidebar-box mt-15">
              <div className="gov-section-header sidebar-header">
                <span>
                  <FaFileAlt /> VĂN BẢN MỚI
                </span>
              </div>
              <div className="gov-doc-list">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.DocID} className="gov-doc-item">
                    <Link
                      to={`/documents/${doc.DocID}`}
                      className="gov-doc-title"
                    >
                      {doc.Title}
                    </Link>
                    <div className="gov-doc-meta">
                      Số: <b>{doc.DocNumber}</b> - NH:{" "}
                      {formatDate(doc.IssueDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gov-ad-banner mt-15">
              <img
                src="https://dxc.gov.vn/SitePages/uploads/banners/MOI-TRUONG.jpg"
                alt="QC"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
