import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { removeVietnameseTones } from "../../utils/stringUtils";
import { FaCalendarAlt, FaAngleLeft, FaAngleRight, FaHome } from "react-icons/fa";

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
          supabase.from('news').select('*').order('publisheddate', { ascending: false }),
          supabase.from('categories').select('*').order('stt', { ascending: true })
        ]);

        setAllNews(resNews.data || []);
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
        (item) => item.categoryid === Number(selectedCategory)
      );
    }

    // Lọc theo Từ khóa
    if (searchText) {
      const lowerText = removeVietnameseTones(searchText);
      result = result.filter(
        (item) =>
          (item.title && removeVietnameseTones(item.title).includes(lowerText)) ||
          (item.summary && removeVietnameseTones(item.summary).includes(lowerText))
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

  const getCategoryTitle = (categoryId) => {
    const cat = categories.find((c) => c.categoryid === categoryId);
    return cat ? cat.title : "Tin tức";
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="bg-gov-bg-body font-sans min-h-screen py-[25px] pb-[60px]">
      <div className="max-w-[1280px] mx-auto px-[15px]">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-gray-500 mb-5 flex items-center flex-wrap gap-2">
          <Link to="/" className="hover:text-black hover:underline transition-colors flex items-center gap-1">
            <FaHome className="text-[11px]" /> Trang chủ
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-black font-semibold">Tin tức</span>
        </nav>

        {/* Page Header */}
        <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-3 px-5 rounded-t-lg border-b-[3px] border-gov-yellow flex items-center mb-0">
          <h1 className="m-0 text-[16px] uppercase font-bold tracking-[0.5px]">TẤT CẢ TIN TỨC</h1>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 border border-gov-border border-t-0 rounded-b-lg shadow-sm mb-[25px] flex flex-col sm:flex-row gap-[12px]">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="flex-1 py-2.5 px-4 border border-gov-border rounded-md text-[14px] text-gov-text outline-none bg-white focus:border-gov-red transition-colors"
          >
            <option value="all">—— Tất cả các mục ——</option>
            {categories.map((cat) => (
              <option key={cat.categoryid} value={cat.categoryid}>
                {cat.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm..."
            value={searchText}
            onChange={handleSearchChange}
            className="flex-1 py-2.5 px-4 border border-gov-border rounded-md text-[14px] text-gov-text outline-none bg-white focus:border-gov-red transition-colors"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] mb-[40px]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden flex flex-col p-4 shadow-sm">
                <div className="skeleton h-[200px] w-full mb-3"></div>
                <div className="skeleton h-[20px] w-3/4 mb-2"></div>
                <div className="skeleton h-[16px] w-full mb-4"></div>
                <div className="skeleton h-[14px] w-1/4 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Grid News List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] mb-[40px]">
              {currentItems.length > 0 ? (
                currentItems.map((news) => (
                  <div key={news.newsid} className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:-translate-y-1 group/card">
                    <Link to={`/news/${news.newsid}`} className="block w-full h-[200px] overflow-hidden relative">
                      <img
                        src={
                          news.imagelink ||
                          "https://via.placeholder.com/400x250"
                        }
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                      />
                      <span className="absolute top-2 left-2 bg-gov-red text-white text-[11px] font-bold px-2 py-0.5 rounded shadow z-10">
                        {getCategoryTitle(news.categoryid)}
                      </span>
                    </Link>
                    <div className="p-[15px] flex-1 flex flex-col">
                      <h3 className="m-0 mb-2 text-[15px] leading-[1.4] font-bold line-clamp-2 overflow-hidden">
                        <Link to={`/news/${news.newsid}`} className="text-[#333] no-underline hover:text-gov-red transition-colors">
                          {news.title}
                        </Link>
                      </h3>
                      <p className="text-[13px] text-gray-500 m-0 mb-4 line-clamp-2 leading-[1.5] text-justify">
                        {news.summary}
                      </p>
                      <div className="mt-auto text-[12px] text-[#888] flex items-center gap-[5px]">
                        <FaCalendarAlt /> {formatDate(news.publisheddate)}
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

                {getPageNumbers().map((pageNum, index) => {
                  if (pageNum === "...") {
                    return (
                      <span key={`dots-${index}`} className="px-2 text-[#777] font-semibold select-none">
                        ...
                      </span>
                    );
                  }
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
