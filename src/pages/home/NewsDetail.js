import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  FaCalendarAlt,
  FaTag,
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

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getReadingTime = (htmlContent) => {
    if (!htmlContent) return 1;
    // Strip HTML tags to count words
    const cleanText = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");
    const wordsPerMinute = 250;
    const wordCount = cleanText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // 1. Gọi Supabase lấy chi tiết bài viết kèm tên danh mục
        const { data, error } = await supabase
          .from('news')
          .select('*, categories(title)')
          .eq('newsid', id)
          .single();

        if (error) throw error;
        setNews(data);

        // Tin liên quan
        const { data: relData } = await supabase
          .from('news')
          .select('*')
          .eq('categoryid', data.categoryid)
          .neq('newsid', id)
          .limit(5);
        setRelatedNews(relData || []);
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

  if (loading) return <div className="text-center py-10 font-medium text-gray-500">Đang tải nội dung...</div>;

  if (!news) return <div className="text-center py-10 font-medium text-red-500">Không tìm thấy bài viết!</div>;

  return (
    <div className="py-[30px] bg-white font-sans text-[#333]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-[40px]">
          {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
          <div>
            {/* Breadcrumb */}
            <nav className="text-[13px] text-gray-500 mb-6 flex items-center flex-wrap gap-2">
              <Link to="/" className="text-gray-500 hover:text-black hover:underline transition-colors">Trang chủ</Link>
              <FaAngleRight className="text-[10px] text-gray-400" />
              <Link to="/news" className="text-gray-500 hover:text-black hover:underline transition-colors">Tin tức</Link>
              <FaAngleRight className="text-[10px] text-gray-400" />
              <span className="text-black font-semibold">{news.categories?.title || "Chi tiết"}</span>
            </nav>

            {/* Tiêu đề */}
            <h1 className="text-2xl lg:text-3xl text-black font-extrabold mb-4 leading-tight">{news.title}</h1>
            <div className="flex flex-wrap gap-6 text-gray-500 text-[13px] mb-8 border-b border-gray-100 pb-5">
              <span className="flex items-center gap-2">
                <FaCalendarAlt className="text-black/70" /> <b>Ngày đăng:</b> {formatDate(news.publisheddate)}
              </span>
              <span className="flex items-center gap-2">
                <FaTag className="text-black/70" /> <b>Danh mục:</b> {news.categories?.title || "Chung"}
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> <b>Thời gian đọc:</b> {getReadingTime(news.content)} phút
              </span>
            </div>

            {/* Ảnh bài viết (Thêm mới) */}
            {news.imagelink && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-sm">
                <img
                  src={news.imagelink}
                  alt={news.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>
            )}

            {/* Nội dung chi tiết */}
            <div className="text-[17px] leading-[1.8] text-[#333] mb-12 text-justify space-y-4">
              <div className="news-summary-box font-medium italic text-gray-700 mb-6 bg-red-50/30 p-5 border-l-4 border-gov-red rounded-r text-[16px] leading-relaxed">
                {news.summary}
              </div>
              <div className="news-content-detail" dangerouslySetInnerHTML={{ __html: news.content }} />
            </div>

            {/* Tác giả / Nguồn cuối bài */}
            <div className="text-right mt-[30px] font-bold text-[15px] text-black">
              <strong>Tác giả:</strong> {news.createdby || "Admin"}
            </div>


          </div>

          {/* CỘT PHẢI: TIN LIÊN QUAN */}
          <aside className="lg:border-l lg:pl-10">
            <div>
              <h3 className="text-[18px] text-[#da251d] uppercase border-b-2 border-[#da251d] pb-2 mb-[20px] font-bold tracking-wider">TIN LIÊN QUAN</h3>
              <div className="space-y-4">
                {relatedNews.map((item) => (
                  <div key={item.newsid} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 align-start">
                    {item.imagelink && (
                      <Link to={`/news/${item.newsid}`} className="w-[80px] h-[60px] flex-shrink-0 rounded overflow-hidden relative block bg-gray-100">
                        <img src={item.imagelink} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={`/news/${item.newsid}`} className="group block">
                        <h4 className="text-gray-800 group-hover:text-gov-red transition-colors text-[13px] font-semibold leading-snug mb-1 line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="text-gray-400 text-[11px] flex items-center gap-1">
                          <FaCalendarAlt className="text-[10px]" /> {formatDate(item.publisheddate)}
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
