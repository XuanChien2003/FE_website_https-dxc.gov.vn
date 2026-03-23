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
              <span className="text-[#999] ml-1">{news.CategoryName || "Chi tiết"}</span>
            </div>

            {/* Tiêu đề */}
            <h1 className="text-[24px] lg:text-[28px] font-extrabold text-[#2c5282] leading-[1.3] mb-[15px]">
              {news.Title}
            </h1>

            {/* Meta info (Ngày đăng, Tác giả) */}
            <div className="flex flex-wrap gap-5 text-[13px] text-[#777] mb-5">
              <span className="flex items-center gap-[5px]">
                <FaCalendarAlt />{" "}
                {new Date(news.PublishedDate).toLocaleDateString("vi-VN")}
              </span>
              <span className="flex items-center gap-[5px]">
                <FaUser /> {news.CreatedBy || "Ban biên tập"}
              </span>
            </div>

            {/* Tóm tắt (In đậm) */}
            {news.Summary && (
              <div className="text-[16px] italic text-[#444] bg-[#f8f9fa] p-[15px] border-l-4 border-[#da251d] mb-[25px] leading-[1.6]">
                <strong>{news.Summary}</strong>
              </div>
            )}

            {/* NỘI DUNG HTML (Quan trọng) */}
            <div
              className="text-[16px] leading-[1.8] text-[#222] text-justify [&_p]:mb-[15px] [&_img]:max-w-full [&_img]:h-auto [&_img]:block [&_img]:mx-auto [&_img]:my-5 [&_img]:rounded [&_img]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] [&_figure]:m-0 [&_figure]:text-center [&_figcaption]:text-[13px] [&_figcaption]:text-[#666] [&_figcaption]:italic [&_figcaption]:mt-[5px] [&_figcaption]:text-center"
              dangerouslySetInnerHTML={{ __html: news.Content }}
            ></div>

            {/* Tác giả / Nguồn cuối bài */}
            <div className="text-right mt-[30px] font-bold text-[15px] text-[#2c5282]">
              <strong>Tác giả:</strong> {news.CreatedBy || "Admin"}
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
                  <li key={item.NewsID} className="mb-[15px] border-b border-dashed border-[#eee] pb-2.5">
                    <Link to={`/news/${item.NewsID}`} className="no-underline text-[#333] font-semibold text-[14px] leading-[1.4] block hover:text-[#0056b3] transition-colors">
                      <FaAngleRight className="text-[#da251d] text-[12px] mr-[5px] inline-block" />
                      {item.Title}
                    </Link>
                    <span className="block text-[12px] text-[#999] mt-1 pl-4">
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
