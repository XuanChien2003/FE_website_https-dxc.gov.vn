import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaLink,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaGlobe,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
} from "react-icons/fa";
import "../document/DocumentList.css"; // CSS Layout chung
import "./WebLinkManager.css"; // CSS riêng

const WebLinkManager = () => {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    imageLink: "",
    description: "",
    stt: 0,
    isShow: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLinks(links);
    } else {
      const lower = searchTerm.toLowerCase();
      const results = links.filter(
        (item) =>
          item.Name?.toLowerCase().includes(lower) ||
          item.Url?.toLowerCase().includes(lower)
      );
      setFilteredLinks(results);
    }
  }, [searchTerm, links]);

  const fetchLinks = async () => {
    try {
      const res = await api.get("/weblinks");
      setLinks(res.data);
      setFilteredLinks(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách liên kết!");
    }
  };

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      url: "",
      imageLink: "",
      description: "",
      stt: 0,
      isShow: true,
    });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.Name,
      url: item.Url,
      imageLink: item.ImageLink,
      description: item.Description,
      stt: item.STT,
      isShow: item.IsShow,
    });
    setEditID(item.LinkID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa liên kết này?")) {
      try {
        await api.delete(`/weblinks/${id}`);
        toast.success("Xóa thành công!");
        fetchLinks();
      } catch (err) {
        toast.error("Lỗi khi xóa!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, stt: parseInt(formData.stt) || 0 };
      if (isEditing) {
        await api.put(`/weblinks/${editID}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/weblinks", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchLinks();
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu!");
    }
  };

  return (
    <div className="document-manager weblink-manager">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">
          <FaLink /> QUẢN TRỊ LIÊN KẾT WEB
        </h2>
        <div className="header-actions">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm tên hoặc url..."
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
                <th style={{ width: "60px", textAlign: "center" }}>STT</th>
                <th style={{ width: "80px", textAlign: "center" }}>Logo</th>
                <th style={{ width: "25%" }}>Tên Website / Liên kết</th>
                <th style={{ width: "25%" }}>Đường dẫn (URL)</th>
                <th style={{ width: "20%" }}>Mô tả</th>
                <th style={{ width: "100px", textAlign: "center" }}>
                  Hiển thị
                </th>
                <th style={{ width: "80px", textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.length > 0 ? (
                filteredLinks.map((item) => (
                  <tr key={item.LinkID}>
                    <td className="text-center">{item.STT}</td>
                    <td className="text-center">
                      {item.ImageLink ? (
                        <img
                          src={item.ImageLink}
                          alt="logo"
                          className="link-logo-sm"
                        />
                      ) : (
                        <FaGlobe size={24} color="#ccc" />
                      )}
                    </td>
                    <td className="font-bold text-primary">{item.Name}</td>
                    <td>
                      <a
                        href={item.Url}
                        target="_blank"
                        rel="noreferrer"
                        className="link-url"
                      >
                        {item.Url}
                      </a>
                    </td>
                    <td>{item.Description}</td>
                    <td className="text-center">
                      {item.IsShow ? (
                        <FaCheckCircle style={{ color: "green" }} />
                      ) : (
                        <FaTimesCircle style={{ color: "#ccc" }} />
                      )}
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
                          onClick={() => handleDelete(item.LinkID)}
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
                  <td colSpan="7" className="no-data">
                    Chưa có liên kết nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "600px" }}>
            <div className="modal-header">
              <h3>{isEditing ? "CẬP NHẬT LIÊN KẾT" : "THÊM LIÊN KẾT MỚI"}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Tên & STT */}
                <div style={{ display: "flex", gap: "15px" }}>
                  <div className="form-group" style={{ flex: 3 }}>
                    <label>
                      Tên Website <span className="req">*</span>
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
                      placeholder="VD: Cổng Dịch vụ công Quốc gia"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Thứ tự</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.stt}
                      onChange={(e) =>
                        setFormData({ ...formData, stt: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* URL */}
                <div className="form-group">
                  <label>
                    Đường dẫn (URL) <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    required
                    placeholder="https://..."
                  />
                </div>

                {/* Logo Link & Preview */}
                <div className="form-group">
                  <label>Link Logo (Icon)</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.imageLink}
                      onChange={(e) =>
                        setFormData({ ...formData, imageLink: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  {formData.imageLink && (
                    <div className="logo-preview-box">
                      <img
                        src={formData.imageLink}
                        alt="Preview"
                        className="logo-preview-img"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/100x50?text=Error")
                        }
                      />
                      <button
                        type="button"
                        className="btn-clear-img"
                        onClick={() =>
                          setFormData({ ...formData, imageLink: "" })
                        }
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          width: "24px",
                          height: "24px",
                        }}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mô tả */}
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả ngắn gọn..."
                  ></textarea>
                </div>

                {/* Checkbox Hiển thị */}
                <div className="form-group">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: "18px", height: "18px" }}
                      checked={formData.isShow}
                      onChange={(e) =>
                        setFormData({ ...formData, isShow: e.target.checked })
                      }
                    />
                    <span>Hiển thị trên trang chủ</span>
                  </label>
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

export default WebLinkManager;
