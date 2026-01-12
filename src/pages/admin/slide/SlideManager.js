import React, { useEffect, useState } from "react";
import api from "../../services/api"; // Đảm bảo đường dẫn đúng
import { toast } from "react-toastify";
import {
  FaImages,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import "../document/DocumentList.css"; // Dùng chung CSS layout cơ bản
import "./SlideManager.css"; // CSS riêng cho ảnh

const SlideManager = () => {
  const [slides, setSlides] = useState([]);
  const [filteredSlides, setFilteredSlides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  // Form Data khớp với Backend (name, imageLink, description)
  const [formData, setFormData] = useState({
    name: "",
    imageLink: "",
    description: "",
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSlides(slides);
    } else {
      const lower = searchTerm.toLowerCase();
      const results = slides.filter((item) =>
        item.Name?.toLowerCase().includes(lower)
      );
      setFilteredSlides(results);
    }
  }, [searchTerm, slides]);

  const fetchSlides = async () => {
    try {
      const res = await api.get("/slides");
      setSlides(res.data);
      setFilteredSlides(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách Slide!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setFormData({ name: "", imageLink: "", description: "" });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.Name,
      imageLink: item.ImageLink,
      description: item.Description || "",
    });
    setEditID(item.SlideID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa Slide này?")) {
      try {
        await api.delete(`/slides/${id}`);
        toast.success("Xóa thành công!");
        fetchSlides();
      } catch (err) {
        toast.error("Lỗi khi xóa Slide!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (isEditing) {
        await api.put(`/slides/${editID}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/slides", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchSlides();
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu!");
    }
  };

  return (
    <div className="document-manager slide-manager">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">
          <FaImages /> QUẢN TRỊ SLIDE ẢNH
        </h2>
        <div className="header-actions">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm tên slide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "50px", textAlign: "center" }}>STT</th>
                <th style={{ width: "20%" }}>Tên Slide</th>
                <th style={{ width: "150px", textAlign: "center" }}>
                  Hình ảnh
                </th>
                <th style={{ width: "30%" }}>Mô tả</th>
                <th style={{ width: "150px", textAlign: "center" }}>
                  Cập nhật cuối
                </th>
                <th style={{ width: "100px", textAlign: "center" }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSlides.length > 0 ? (
                filteredSlides.map((item, index) => (
                  <tr key={item.SlideID}>
                    <td className="text-center">{index + 1}</td>
                    <td className="font-bold text-primary">{item.Name}</td>
                    <td className="text-center">
                      {item.ImageLink ? (
                        <img
                          src={item.ImageLink}
                          alt={item.Name}
                          className="slide-thumb"
                        />
                      ) : (
                        <span className="no-img-text">No Image</span>
                      )}
                    </td>
                    <td>{item.Description}</td>
                    <td className="text-center">
                      {formatDate(item.ModifiedDate)}
                    </td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(item)}
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(item.SlideID)}
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
                  <td colSpan="6" className="no-data">
                    Chưa có slide nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Tổng số: <b>{filteredSlides.length}</b> slide
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "600px" }}>
            <div className="modal-header">
              <h3>{isEditing ? "CẬP NHẬT SLIDE" : "THÊM SLIDE MỚI"}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Tên Slide */}
                <div className="form-group">
                  <label>
                    Tên Slide <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    autoFocus
                    placeholder="Ví dụ: Banner Chào mừng..."
                  />
                </div>

                {/* Link Ảnh */}
                <div className="form-group">
                  <label>
                    Link Hình Ảnh (URL) <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <FaImage
                      className="input-icon left"
                      style={{ top: "12px" }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={formData.imageLink}
                      onChange={(e) =>
                        setFormData({ ...formData, imageLink: e.target.value })
                      }
                      required
                      placeholder="https://example.com/image.jpg"
                      style={{ paddingLeft: "35px" }}
                    />
                  </div>

                  {/* Preview Ảnh */}
                  <div className="img-preview-container">
                    {formData.imageLink ? (
                      <>
                        <img
                          src={formData.imageLink}
                          alt="Preview"
                          className="img-preview-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/400x200?text=Lỗi+Link+Ảnh";
                          }}
                        />
                        <button
                          type="button"
                          className="btn-clear-img"
                          onClick={() =>
                            setFormData({ ...formData, imageLink: "" })
                          }
                          title="Xóa ảnh"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <div className="preview-placeholder">
                        <FaImage size={40} />
                        <span>Xem trước ảnh tại đây</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mô tả */}
                <div className="form-group">
                  <label>Mô tả / Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả ngắn gọn về slide này..."
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Đóng lại
                </button>
                <button type="submit" className="btn-success">
                  <FaSave /> {isEditing ? "Cập nhật" : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideManager;
