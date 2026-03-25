import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { toast } from "react-toastify";
import {
  FaNewspaper,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaTimes,
  FaLayerGroup,
} from "react-icons/fa";

const NewsManager = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);

  // Search & Display State
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  useEffect(() => {
    let results = newsList;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter((item) =>
        item.Title?.toLowerCase().includes(lower)
      );
    }

    if (filterCategory !== "all") {
      results = results.filter(
        (item) => item.categoryid === parseInt(filterCategory)
      );
    }

    setFilteredNews(results);
  }, [searchTerm, filterCategory, newsList]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*, categories(title)')
        .order('publisheddate', { ascending: false });
      
      if (error) throw error;
      setNewsList(data);
      setFilteredNews(data);
    } catch (err) {
      toast.error("Lỗi tải danh sách tin tức!");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('stt', { ascending: true });
        
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Lỗi tải chuyên mục:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa bài viết này?")) {
      try {
        const { error } = await supabase
          .from('news')
          .delete()
          .eq('newsid', id);
          
        if (error) throw error;
        toast.success("Xóa thành công!");
        fetchNews();
      } catch (err) {
        toast.error("Lỗi khi xóa!");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const renderStatusBadge = (status) => {
    let bgColor = "bg-[#e2e8f0]";
    let textColor = "text-[#475569]";

    if (status === "Đã xuất bản" || status === "Đã duyệt") {
      bgColor = "bg-[#22c55e]";
      textColor = "text-white";
    } else if (status === "Chờ duyệt") {
      bgColor = "bg-[#f59e0b]";
      textColor = "text-white";
    } else if (status === "Trả lại" || status === "Hủy") {
      bgColor = "bg-[#ef4444]";
      textColor = "text-white";
    }

    return (
      <span
        className={`inline-block p-[2px_8px] rounded-[50px] text-[11px] font-semibold whitespace-nowrap ${bgColor} ${textColor}`}
      >
        {status || "Chờ duyệt"}
      </span>
    );
  };

  return (
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[13.5px] text-[#334155]">
      {/* HEADER TƯƠNG TỰ DOCUMENTLIST */}
      <div className="flex justify-between items-center mb-[20px] bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282]">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaNewspaper /> QUẢN LÝ TIN TỨC
        </h2>
        <div className="flex gap-[10px]">
          <button
            className={`bg-white border text-[#2c5282] py-[8px] px-[16px] rounded-md font-semibold flex items-center gap-[8px] cursor-pointer transition-all duration-200 hover:bg-[#eff6ff] hover:border-[#2c5282] ${
              showSearch ? "bg-[#eff6ff] border-[#2c5282]" : "border-[#cbd5e1]"
            }`}
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <FaTimes /> : <FaFilter />}{" "}
            {showSearch ? "Đóng tìm kiếm" : "Bộ lọc tìm kiếm"}
          </button>
          <button
            className="bg-[#2c5282] text-white border-none py-[9px] px-[18px] rounded-md font-semibold flex items-center gap-[8px] cursor-pointer transition-colors duration-200 hover:bg-[#1e3a8a]"
            onClick={() => navigate("/admin/news/add")}
          >
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* FORM TÌM KIẾM MỞ RỘNG */}
      <div
        className={`overflow-hidden transition-all duration-400 opacity-0 mb-0 ${
          showSearch ? "max-h-[500px] opacity-100 mb-[20px]" : "max-h-0"
        }`}
      >
        <div className="bg-white p-[25px] rounded-lg border border-[#cbd5e1] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col gap-[15px]">
          <div className="flex gap-[15px] w-full flex-col md:flex-row md:gap-[15px]">
            <div className="flex flex-col flex-[2]">
              <div className="relative w-full">
                <FaSearch className="absolute top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] left-[12px]" />
                <input
                  type="text"
                  className="p-[10px_12px_10px_36px] border border-[#d1d5db] rounded-[4px] text-[14px] text-[#334155] outline-none w-full h-[42px] bg-white transition-all duration-200 focus:border-[#2c5282] focus:ring-[2px] focus:ring-[#2c5282]/10"
                  placeholder="Tìm từ khóa trong tiêu đề..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="relative w-full">
                <FaLayerGroup className="absolute top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] left-[12px]" />
                <select
                  className="p-[10px_12px_10px_36px] border border-[#d1d5db] rounded-[4px] text-[14px] text-[#334155] outline-none w-full h-[42px] bg-white transition-all duration-200 focus:border-[#2c5282] focus:ring-[2px] focus:ring-[#2c5282]/10 cursor-pointer appearance-none"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">-- Tất cả chuyên mục --</option>
                  {categories.map((c) => (
                    <option key={c.categoryid} value={c.categoryid}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex-[0_0_150px] md:w-auto w-full">
              <button
                className="w-full h-[42px] bg-[#4285f4] text-white border-none rounded-[4px] font-semibold text-[14px] flex items-center justify-center gap-[8px] cursor-pointer transition-opacity duration-200 hover:opacity-90"
                onClick={() => {}}
              >
                <FaSearch /> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU ĐỒNG BỘ */}
      <div className="bg-white rounded-t-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden border border-[#cbd5e1] mt-[20px]">
        <div className="w-full overflow-x-auto min-h-[300px]">
          <table className="w-full border-collapse table-fixed min-w-[1100px]">
            <thead>
              <tr>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[20%]">
                  Tiêu đề bài viết
                </th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[8%]">
                  Ảnh bìa
                </th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[20%]">
                  Mô tả tóm tắt
                </th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[12%]">
                  Chuyên mục
                </th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[10%]">
                  Ngày xuất bản
                </th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[8%]">
                  Người tạo
                </th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[8%]">
                  Người sửa cuối
                </th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[8%]">
                  Trạng thái
                </th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-transparent leading-[1.3] w-[6%]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <tr key={item.newsid} className="even:bg-[#f8fafc] hover:bg-[#e2e8f0] group">
                    <td
                      className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] font-semibold text-[#2c5282]"
                      title={item.title}
                    >
                      {item.title}
                    </td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle text-center overflow-hidden">
                      {item.imagelink ? (
                        <div className="w-[80%] mx-auto max-w-[80px] h-[45px] border border-[#cbd5e1] rounded-[4px] overflow-hidden">
                          <img
                            src={item.imagelink}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-[#94a3b8] text-[11px] italic">
                          Không có ảnh
                        </span>
                      )}
                    </td>

                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[12px] leading-[1.4] text-justify" title={item.summary}>
                      {item.summary && item.summary.length > 60
                        ? item.summary.substring(0, 60) + "..."
                        : item.summary}
                    </td>

                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] text-center">
                      <span className="inline-block p-[2px_6px] rounded-[4px] text-[11px] font-semibold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                         {item.categories?.title || "---"}
                      </span>
                    </td>

                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[12.5px] text-center">
                      {formatDate(item.publisheddate)}
                    </td>

                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[12px] text-[#475569]">{item.createdby}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[12px] text-[#475569]">{item.updatedby}</td>

                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] text-center">
                      {renderStatusBadge(item.newsstatus)}
                    </td>

                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle text-center">
                      <div className="flex justify-center gap-[4px]">
                        <button
                          className="w-[26px] h-[26px] rounded-[4px] border border-[#cbd5e1] bg-white text-[#64748b] cursor-pointer flex items-center justify-center transition-all hover:-translate-y-[1px] hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#eff6ff]"
                          title="Sửa"
                          onClick={() =>
                            navigate(`/admin/news/edit/${item.newsid}`)
                          }
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="w-[26px] h-[26px] rounded-[4px] border border-[#cbd5e1] bg-white text-[#64748b] cursor-pointer flex items-center justify-center transition-all hover:-translate-y-[1px] hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                          title="Xóa"
                          onClick={() => handleDelete(item.newsid)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center p-[30px] text-[#999] border border-[#cbd5e1]"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-[12px_20px] border-t border-[#cbd5e1] bg-white flex justify-between items-center rounded-b-lg">
          <div className="text-[#334155]">
             Hiển thị <b className="text-[#2c5282]">{filteredNews.length}</b> bài viết
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsManager;
