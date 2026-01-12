import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import hook chuyển trang
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaNewspaper,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";
import "../../admin/document/DocumentList.css";

const NewsManager = () => {
  const navigate = useNavigate(); // Hook để chuyển hướng
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);

  // Search & Display State
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
        (item) => item.CategoryID === parseInt(filterCategory)
      );
    }

    setFilteredNews(results);
  }, [searchTerm, filterCategory, newsList]);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news");
      setNewsList(res.data);
      setFilteredNews(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách tin tức!");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi tải chuyên mục:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa bài viết này?")) {
      try {
        await api.delete(`/news/${id}`);
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

  // Hàm hiển thị màu sắc cho trạng thái
  const renderStatusBadge = (status) => {
    let bgColor = "#6c757d"; // Xám
    let textColor = "#fff";

    if (status === "Đã xuất bản" || status === "Đã duyệt") {
      bgColor = "#198754"; // Xanh lá
    } else if (status === "Chờ duyệt") {
      bgColor = "#ffc107"; // Vàng
      textColor = "#000";
    } else if (status === "Trả lại" || status === "Hủy") {
      bgColor = "#dc3545"; // Đỏ
    }

    return (
      <span
        style={{
          backgroundColor: bgColor,
          color: textColor,
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "600",
          display: "inline-block",
        }}
      >
        {status || "Chờ duyệt"}
      </span>
    );
  };

  return (
    <div className="document-manager">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">
          <FaNewspaper /> QUẢN TRỊ BÀI VIẾT TIN TỨC
        </h2>
        <div className="header-actions">
          <select
            className="form-control"
            style={{ width: "200px", height: "34px", padding: "0 10px" }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">-- Tất cả chuyên mục --</option>
            {categories.map((c) => (
              <option key={c.CategoryID} value={c.CategoryID}>
                {c.Title}
              </option>
            ))}
          </select>

          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm tiêu đề tin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Nút Thêm mới chuyển hướng sang trang NewsForm */}
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/news/add")}
          >
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* TABLE FULL DỮ LIỆU */}
      <div className="table-container">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Tiêu đề bài viết</th>
                <th style={{ width: "80px", textAlign: "center" }}>Ảnh</th>
                <th style={{ width: "20%" }}>Mô tả</th>
                <th style={{ width: "12%" }}>Chuyên mục</th>
                <th style={{ width: "100px", textAlign: "center" }}>
                  Ngày xuất bản
                </th>
                <th style={{ width: "8%" }}>Người tạo</th>
                <th style={{ width: "8%" }}>Sửa bởi</th>
                <th style={{ width: "100px", textAlign: "center" }}>
                  Trạng thái
                </th>
                <th style={{ width: "80px", textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <tr key={item.NewsID}>
                    <td className="font-bold text-primary" title={item.Title}>
                      {item.Title}
                    </td>
                    <td className="text-center">
                      {item.ImageLink ? (
                        <img
                          src={item.ImageLink}
                          alt="thumb"
                          style={{
                            width: "60px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "3px",
                            border: "1px solid #dee2e6",
                          }}
                        />
                      ) : (
                        <span
                          className="text-muted"
                          style={{ fontSize: "11px" }}
                        >
                          No Image
                        </span>
                      )}
                    </td>

                    {/* Cột Mô tả */}
                    <td title={item.Summary}>
                      {item.Summary && item.Summary.length > 50
                        ? item.Summary.substring(0, 50) + "..."
                        : item.Summary}
                    </td>

                    <td>{item.CategoryName || "---"}</td>

                    <td className="text-center">
                      {formatDate(item.PublishedDate)}
                    </td>

                    {/* Cột Người tạo */}
                    <td>{item.CreatedBy}</td>

                    {/* Cột Người sửa */}
                    <td>{item.UpdatedBy}</td>

                    {/* Cột Trạng thái */}
                    <td className="text-center">
                      {renderStatusBadge(item.NewsStatus)}
                    </td>

                    <td className="text-center">
                      <div className="btn-group">
                        {/* Nút Sửa chuyển hướng sang trang NewsForm kèm ID */}
                        <button
                          className="btn-icon btn-edit"
                          onClick={() =>
                            navigate(`/admin/news/edit/${item.NewsID}`)
                          }
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(item.NewsID)}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    Chưa có dữ liệu bài viết
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Tổng số: <b>{filteredNews.length}</b> bài viết
        </div>
      </div>
    </div>
  );
};

export default NewsManager;
