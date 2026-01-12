import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import {
  FaUserTie,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import "./SignerManager.css";

const SignerManager = () => {
  const [signers, setSigners] = useState([]);
  const [filteredSigners, setFilteredSigners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  // State Form (Chỉ cần Name)
  const [name, setName] = useState("");

  useEffect(() => {
    fetchSigners();
  }, []);

  // Logic tìm kiếm
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSigners(signers);
    } else {
      const lower = searchTerm.toLowerCase();
      const results = signers.filter((item) =>
        item.Name?.toLowerCase().includes(lower)
      );
      setFilteredSigners(results);
    }
  }, [searchTerm, signers]);

  const fetchSigners = async () => {
    try {
      const res = await api.get("/dictionaries/signers");
      setSigners(res.data);
      setFilteredSigners(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách người ký!");
    }
  };

  const handleOpenAdd = () => {
    setName("");
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setName(item.Name);
    setEditID(item.SignerID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người ký này?")) {
      try {
        await api.delete(`/dictionaries/signers/${id}`);
        toast.success("Xóa thành công!");
        fetchSigners();
      } catch (err) {
        toast.error("Không thể xóa (đang được sử dụng trong văn bản)!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: name };

      if (isEditing) {
        await api.put(`/dictionaries/signers/${editID}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/dictionaries/signers", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchSigners();
    } catch (err) {
      const msg = err.response?.data?.error || "Lỗi lưu dữ liệu!";
      toast.error(msg);
    }
  };

  return (
    <div className="signer-manager">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">
          <FaUserTie /> QUẢN LÝ NGƯỜI KÝ
        </h2>

        <div className="header-actions">
          {/* Thanh tìm kiếm nhanh */}
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm tên người ký..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={handleOpenAdd}>
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
                {/* Ẩn ID, dùng STT */}
                <th className="col-stt text-center">STT</th>
                <th className="col-name">Họ và Tên người ký</th>
                <th className="col-action text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSigners.length > 0 ? (
                filteredSigners.map((item, index) => (
                  <tr key={item.SignerID}>
                    <td className="text-center font-bold text-muted">
                      {index + 1}
                    </td>
                    <td className="font-medium text-primary">{item.Name}</td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(item)}
                          title="Sửa tên"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(item.SignerID)}
                          title="Xóa người ký"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">
                    Chưa có dữ liệu người ký
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Tổng số: <b>{filteredSigners.length}</b> người ký
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "CẬP NHẬT THÔNG TIN" : "THÊM NGƯỜI KÝ MỚI"}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Họ và tên <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ tên người ký (VD: Nguyễn Văn A)..."
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes /> Đóng
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

export default SignerManager;
