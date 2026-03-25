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

const NewsDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
            <div className="text-[14px] text-[#666] mb-5 border-b border-[#eee] pb-2.5 flex items-center flex-wrap">
              <Link to="/" className="text-[#0056b3] no-underline hover:underline mx-1">Trang chủ</Link> /
              <Link to="/news" className="text-[#0056b3] no-underline hover:underline mx-1">Tin tức</Link> /
              <span className="text-[#999] ml-1">{news.categories?.title || "Chi tiết"}</span>
            </div>

            {/* Tiêu đề */}
            <h1 className="text-2xl text-primary font-bold mb-2.5 leading-snug">{news.title}</h1>
            <div className="flex gap-5 text-gray-400 text-[13px] mb-7 border-b border-gray-100 pb-4 italic">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt /> Ngày đăng: {formatDate(news.publisheddate)}
              </span>
              <span className="flex items-center gap-1.5">
                <FaTag /> Danh mục: {news.categories?.title || "Chung"}
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
              <div className="font-bold italic text-gray-600 mb-6 bg-gray-50 p-4 border-l-4 border-primary rounded-r">
                {news.summary}
              </div>
              <div className="news-content-detail" dangerouslySetInnerHTML={{ __html: news.content }} />
            </div>

            {/* Tác giả / Nguồn cuối bài */}
            <div className="text-right mt-[30px] font-bold text-[15px] text-[#2c5282]">
              <strong>Tác giả:</strong> {news.createdby || "Admin"}
            </div>

            {/* Các nút công cụ (In, Chia sẻ) */}
            <div className="flex justify-between items-center mt-5 pt-[15px] border-t border-[#ddd]">
              <button
                className="bg-transparent border border-[#ccc] py-1.5 px-[15px] cursor-pointer rounded flex items-center gap-[5px] text-[13px] text-[#555] hover:bg-[#f1f1f1] hover:text-black transition-colors"
                onClick={() => window.print()}
              >
                <FaPrint /> In bài viết
              </button>
              <div className="flex items-center gap-2.5 text-[14px]">
                <span>Chia sẻ:</span>
                <a href="#" className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white no-underline text-[14px] transition-transform hover:scale-110 bg-[#3b5998]">
                  <FaFacebookF />
                </a>
                <a href="#" className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white no-underline text-[14px] transition-transform hover:scale-110 bg-[#1da1f2]">
                  <FaTwitter />
                </a>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TIN LIÊN QUAN */}
          <div>
            <div>
              <h3 className="text-[18px] text-[#da251d] uppercase border-b-2 border-[#da251d] pb-2 mb-[15px] font-bold">TIN LIÊN QUAN</h3>
              <ul className="list-none p-0 m-0">
                {relatedNews.map((item) => (
                  <li key={item.newsid} className="group">
                    <Link to={`/news/${item.newsid}`} className="text-gray-700 hover:text-primary transition-colors flex items-start gap-2 py-1">
                      <span className="text-primary mt-1.5">•</span>
                      <span className="flex-1">{item.title}</span>
                      <span className="text-gray-400 text-xs ml-2 whitespace-nowrap mt-1">({formatDate(item.publisheddate)})</span>
                    </Link>
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
