import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  FaCalendarAlt,
  FaAngleRight,
  FaListUl,
  FaPlayCircle,
} from "react-icons/fa";
import "./HomePage.css";

const HomePage = () => {
  const [slides, setSlides] = useState([]);

  // Dữ liệu Top (1 tin to + 3 tin nhỏ bên cạnh)
  const [featuredNews, setFeaturedNews] = useState([]);

  // Dữ liệu Grid bên dưới
  const [newsActivityMinistry, setNewsActivityMinistry] = useState([]);
  const [newsActivityCenter, setNewsActivityCenter] = useState([]);
  const [newsDigital, setNewsDigital] = useState([]);

  // STATE MỚI: Chính sách Chuyển đổi số (ID 10)
  const [newsPolicy, setNewsPolicy] = useState([]);

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

        // 1. Slide
        let listSlides = resSlides.data || [];
        listSlides.sort(
          (a, b) => (a.DisplayOrder || 0) - (b.DisplayOrder || 0)
        );
        setSlides(listSlides);

        // 2. Tin tức
        let allNews = resNews.data || [];
        // Sắp xếp mới nhất lên đầu
        allNews.sort(
          (a, b) => new Date(b.PublishedDate) - new Date(a.PublishedDate)
        );

        // --- HÀM HELPER: Lấy tin theo ID ---
        const getNewsByCategory = (catId, count, excludeIds = []) => {
          let filtered = allNews.filter((n) => n.CategoryID === catId);
          if (filtered.length < count) {
            const remaining = allNews.filter(
              (n) => n.CategoryID !== catId && !excludeIds.includes(n.NewsID)
            );
            const needed = count - filtered.length;
            filtered = [...filtered, ...remaining.slice(0, needed)];
          }
          return filtered.slice(0, count);
        };

        // 2.1. Tin nổi bật (Top Layout) (CatID = 15)
        const topNews = getNewsByCategory(15, 4);
        setFeaturedNews(topNews);

        // 2.2. Hoạt động CĐS của Bộ (CatID: 12)
        setNewsActivityMinistry(getNewsByCategory(12, 5));

        // 2.3. Hoạt động CĐS của Trung tâm (CatID: 17)
        setNewsActivityCenter(getNewsByCategory(17, 5));

        // 2.4. Điểm tin CĐS (CatID: 16)
        setNewsDigital(getNewsByCategory(16, 5));

        // 2.5. Chính sách CĐS (CatID: 10) -> THEO YÊU CẦU CỦA BẠN
        setNewsPolicy(getNewsByCategory(10, 5));

        // 3. Văn bản & Links (Vẫn giữ documents để hiển thị ở Sidebar)
        setDocuments(resDocs.data || []);
        setWebLinks(resLinks.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
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

  // --- Helpers render Top Section ---
  const bigNews = featuredNews.length > 0 ? featuredNews[0] : null;
  const subNews = featuredNews.length > 1 ? featuredNews.slice(1, 4) : [];

  // Component tin nhỏ (Grid dưới) - Có ảnh thumbnail
  const NewsItemSmall = ({ news }) => {
    if (!news) return null;
    return (
      <div className="news-item-sm">
        <Link to={`/news/${news.NewsID}`} className="news-thumb-link">
          <img
            src={news.ImageLink || "https://via.placeholder.com/150"}
            alt={news.Title}
            className="news-thumb-sm"
          />
        </Link>
        <div className="news-info-sm">
          <h4 className="news-title-sm">
            <Link to={`/news/${news.NewsID}`}>{news.Title}</Link>
          </h4>
          <span className="news-date">
            <FaCalendarAlt /> {formatDate(news.PublishedDate)}
          </span>
        </div>
      </div>
    );
  };

  // Component tin list (Grid dưới) - Dạng bullet point
  const NewsItemList = ({ news }) => (
    <div className="news-list-item">
      <FaPlayCircle className="bullet-icon" />
      <Link to={`/news/${news.NewsID}`}>{news.Title}</Link>
    </div>
  );

  return (
    <div className="home-wrapper">
      <div className="home-container">
        {/* --- SECTION 1: TOP LAYOUT 3 CỘT --- */}
        <div className="top-section-3cols">
          {/* CỘT 1: TIN LỚN NHẤT */}
          <div className="col-big-news">
            {bigNews && (
              <div className="big-news-wrapper">
                <Link to={`/news/${bigNews.NewsID}`} className="big-thumb-link">
                  <img
                    src={
                      bigNews.ImageLink || "https://via.placeholder.com/800x450"
                    }
                    alt={bigNews.Title}
                    className="big-thumb-img"
                  />
                </Link>
                <div className="big-news-info">
                  <h2 className="big-title">
                    <Link to={`/news/${bigNews.NewsID}`}>{bigNews.Title}</Link>
                  </h2>
                  <p className="big-summary">{bigNews.Summary}</p>
                </div>
              </div>
            )}
          </div>

          {/* CỘT 2: 3 TIN NHỎ */}
          <div className="col-sub-news">
            {subNews.length > 0 ? (
              subNews.map((news) => (
                <div key={news.NewsID} className="sub-news-block">
                  <h3 className="sub-title-top">
                    <Link to={`/news/${news.NewsID}`}>{news.Title}</Link>
                  </h3>
                  <div className="sub-news-body">
                    <Link
                      to={`/news/${news.NewsID}`}
                      className="sub-thumb-link"
                    >
                      <img
                        src={
                          news.ImageLink ||
                          "https://via.placeholder.com/200x150"
                        }
                        alt={news.Title}
                        className="sub-thumb-img"
                      />
                    </Link>
                    <p className="sub-summary-text">{news.Summary}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 10 }}>Đang cập nhật tin...</div>
            )}
          </div>

          {/* CỘT 3: BANNER */}
          <div className="col-banners">
            {slides.length > 0 ? (
              slides.map((slide) => (
                <div key={slide.SlideID} className="banner-vertical">
                  <a
                    href={slide.LinkUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={slide.ImageLink}
                      alt={slide.Name}
                      className="banner-v-img"
                    />
                  </a>
                </div>
              ))
            ) : (
              <div className="empty-box">Banner</div>
            )}
          </div>
        </div>

        {/* --- SECTION 2: GRID CONTENT --- */}
        <div className="main-content-grid">
          <div className="left-column">
            <div className="two-col-grid">
              {/* Box 1 */}
              <div className="category-box">
                <h3 className="cat-title">Hoạt động CĐS của Bộ</h3>
                <div className="cat-content">
                  {newsActivityMinistry.length > 0 && (
                    <NewsItemSmall news={newsActivityMinistry[0]} />
                  )}
                  <div className="sub-news-list">
                    {newsActivityMinistry.slice(1).map((news) => (
                      <NewsItemList key={news.NewsID} news={news} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2 */}
              <div className="category-box">
                <h3 className="cat-title">Hoạt động CĐS của Trung tâm</h3>
                <div className="cat-content">
                  {newsActivityCenter.length > 0 && (
                    <NewsItemSmall news={newsActivityCenter[0]} />
                  )}
                  <div className="sub-news-list">
                    {newsActivityCenter.slice(1).map((news) => (
                      <NewsItemList key={news.NewsID} news={news} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mid-banner">
              <img
                src="https://dxc.gov.vn/SitePages/uploads/banners/banners.jpg"
                alt="Banner"
              />
            </div>

            <div className="two-col-grid">
              {/* Box 3 */}
              <div className="category-box">
                <h3 className="cat-title">Điểm tin Chuyển đổi số</h3>
                <div className="cat-content">
                  {newsDigital.length > 0 && (
                    <NewsItemSmall news={newsDigital[0]} />
                  )}
                  <div className="sub-news-list">
                    {newsDigital.slice(1).map((news) => (
                      <NewsItemList key={news.NewsID} news={news} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 4: CHÍNH SÁCH CHUYỂN ĐỔI SỐ (Sử dụng ID 10 từ bảng News) */}
              <div className="category-box">
                <h3 className="cat-title">Chính sách Chuyển đổi số</h3>
                <div className="cat-content">
                  {/* Vì là dữ liệu Tin tức (News), ta tái sử dụng component NewsItemSmall & NewsItemList */}
                  {newsPolicy.length > 0 && (
                    <NewsItemSmall news={newsPolicy[0]} />
                  )}
                  <div className="sub-news-list">
                    {newsPolicy.slice(1).map((news) => (
                      <NewsItemList key={news.NewsID} news={news} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-sidebar">
            <div className="sidebar-box">
              <h3 className="sidebar-title">
                <FaListUl /> SẢN PHẨM - DỊCH VỤ
              </h3>
              <ul className="weblink-list">
                {webLinks
                  .filter((l) => l.IsShow)
                  .map((link) => (
                    <li key={link.LinkID}>
                      <FaAngleRight className="link-arrow" />
                      <a href={link.Url} target="_blank" rel="noreferrer">
                        {link.Name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="sidebar-box mt-20">
              <h3 className="sidebar-title orange">VĂN BẢN MỚI</h3>
              {/* Sidebar vẫn giữ nguyên hiển thị Documents (Văn bản pháp quy) */}
              <div className="sidebar-content">
                {documents.slice(0, 3).map((doc) => (
                  <div key={doc.DocID} className="sidebar-doc">
                    <Link
                      to={`/documents/${doc.DocID}`}
                      className="doc-title-link"
                      title={doc.Title}
                    >
                      {doc.Title}
                    </Link>
                    <div className="doc-meta-info">
                      {doc.DocNumber} - {formatDate(doc.IssueDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-banner">
              <img
                src="https://dxc.gov.vn/SitePages/uploads/banners/MOI-TRUONG.jpg"
                alt="Quảng cáo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
