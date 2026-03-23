import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { FaCalendarAlt, FaAngleLeft, FaAngleRight } from "react-icons/fa";

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
    <div className="bg-[#fdfdfd] font-sans min-h-screen py-[30px] pb-[60px]">
      <div className="max-w-[1200px] mx-auto px-[15px]">
        <h1 className="text-center text-gov-red text-[28px] font-bold mb-[25px] uppercase">Tin tức</h1>

        {/* Filter Section */}
        <div className="flex flex-col gap-[15px] mb-[30px] bg-white p-[5px]">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full py-2.5 px-[15px] border border-[#e5e7eb] rounded text-[14px] text-[#555] outline-none bg-white focus:border-[#aaa] transition-colors"
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
            className="w-full py-2.5 px-[15px] border border-[#e5e7eb] rounded text-[14px] text-[#555] outline-none bg-white focus:border-[#aaa] transition-colors"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center p-[50px] text-gray-500 font-medium">Đang tải dữ liệu...</div>
        ) : (
          <>
            {/* Grid News List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] mb-[40px]">
              {currentItems.length > 0 ? (
                currentItems.map((news) => (
                  <div key={news.NewsID} className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:-translate-y-1 group/card">
                    <Link to={`/news/${news.NewsID}`} className="block w-full h-[200px] overflow-hidden">
                      <img
                        src={
                          news.ImageLink ||
                          "https://via.placeholder.com/400x250"
                        }
                        alt={news.Title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                      />
                    </Link>
                    <div className="p-[15px] flex-1 flex flex-col">
                      <h3 className="m-0 mb-2.5 text-[15px] leading-[1.4] font-bold line-clamp-3 overflow-hidden">
                        <Link to={`/news/${news.NewsID}`} className="text-[#333] no-underline hover:text-gov-red transition-colors">
                          {news.Title}
                        </Link>
                      </h3>
                      <div className="mt-auto text-[12px] text-[#888] flex items-center gap-[5px]">
                        <FaCalendarAlt /> {formatDate(news.PublishedDate)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center p-[40px] text-[#777]">
                  Không tìm thấy tin tức nào phù hợp.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-[35px] h-[35px] flex items-center justify-center border-none bg-transparent text-[#777] font-semibold cursor-pointer rounded transition-all duration-200 hover:bg-[#f0f0f0] disabled:hover:bg-transparent disabled:opacity-30 disabled:cursor-default"
                >
                  <FaAngleLeft />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`w-[35px] h-[35px] flex items-center justify-center border-none font-semibold cursor-pointer rounded transition-all duration-200 ${
                        currentPage === pageNum ? "bg-gov-red text-white shadow-[0_2px_4px_rgba(190,30,45,0.4)]" : "bg-transparent text-[#333] hover:bg-[#f0f0f0]"
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
                  className="w-[35px] h-[35px] flex items-center justify-center border-none bg-transparent text-[#777] font-semibold cursor-pointer rounded transition-all duration-200 hover:bg-[#f0f0f0] disabled:hover:bg-transparent disabled:opacity-30 disabled:cursor-default"
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
