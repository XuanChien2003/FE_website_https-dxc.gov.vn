import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { FaCalendarAlt, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import "./NewsPage.css";

const NewsPage = () => {
  // 1. State lưu TOÀN BỘ tin từ API (API cũ trả về hết 1 lần)
  const [allNews, setAllNews] = useState([]);
  // 2. State lưu các tin ĐANG HIỂN THỊ (sau khi lọc)
  const [displayNews, setDisplayNews] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Phân trang Client
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [searchParams] = useSearchParams();

  // 1. LẤY DỮ LIỆU TỪ API (Chạy 1 lần khi vào trang)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resNews, resCats] = await Promise.all([
          api.get("/news"), // API cũ: Trả về mảng [...]
          api.get("/categories"),
        ]);

        // Sắp xếp tin mới nhất lên đầu
        const sortedNews = (resNews.data || []).sort(
          (a, b) => new Date(b.PublishedDate) - new Date(a.PublishedDate)
        );

        setAllNews(sortedNews);
        setCategories(resCats.data || []);

        // Nếu có param ?cat=... trên URL thì set state
        const catParam = searchParams.get("cat");
        if (catParam) setSelectedCategory(Number(catParam));
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  // 2. LOGIC LỌC & TÌM KIẾM (Chạy tại Client khi state thay đổi)
  useEffect(() => {
    let result = allNews;

    // Lọc theo Danh mục
    if (selectedCategory !== "all") {
      result = result.filter(
        (item) => item.CategoryID === Number(selectedCategory)
      );
    }

    // Lọc theo Từ khóa
    if (searchText) {
      const lowerText = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.Title.toLowerCase().includes(lowerText) ||
          (item.Summary && item.Summary.toLowerCase().includes(lowerText))
      );
    }

    setDisplayNews(result);
    // Lưu ý: Khi filter đổi thì nên reset về trang 1,
    // nhưng cần check để tránh reset lúc mới load trang chưa có dữ liệu
    if (allNews.length > 0) {
      // setCurrentPage(1); // Bạn có thể bỏ comment dòng này nếu muốn auto về trang 1 khi search
    }
  }, [searchText, selectedCategory, allNews]);

  // 3. LOGIC CẮT TRANG (Client Side Pagination)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayNews.length / itemsPerPage);

  // --- HANDLERS ---
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="np-wrapper">
      <div className="np-container">
        <h1 className="np-page-title">Tin tức</h1>

        {/* Filter Section */}
        <div className="np-filters">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="np-select"
          >
            <option value="all">--- Tất cả các mục ---</option>
            {categories.map((cat) => (
              <option key={cat.CategoryID} value={cat.CategoryID}>
                {cat.CategoryName || cat.Title}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm..."
            value={searchText}
            onChange={handleSearchChange}
            className="np-search"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="np-loading">Đang tải dữ liệu...</div>
        ) : (
          <>
            {/* Grid News List */}
            <div className="np-grid">
              {currentItems.length > 0 ? (
                currentItems.map((news) => (
                  <div key={news.NewsID} className="np-card">
                    <Link to={`/news/${news.NewsID}`} className="np-card-thumb">
                      <img
                        src={
                          news.ImageLink ||
                          "https://via.placeholder.com/400x250"
                        }
                        alt={news.Title}
                      />
                    </Link>
                    <div className="np-card-body">
                      <h3 className="np-card-title">
                        <Link to={`/news/${news.NewsID}`}>{news.Title}</Link>
                      </h3>
                      <div className="np-card-date">
                        <FaCalendarAlt /> {formatDate(news.PublishedDate)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="np-no-result">
                  Không tìm thấy tin tức nào phù hợp.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="np-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="np-page-btn arrow"
                >
                  <FaAngleLeft />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`np-page-btn ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="np-page-btn arrow"
                >
                  <FaAngleRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
