import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import {
  FaLayerGroup,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaFilter,
  FaTag,
} from "react-icons/fa";
import "./FieldManager.css";

const FieldManager = () => {
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);

  const [showSearch, setShowSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  const [searchParams, setSearchParams] = useState({
    keyword: "",
    scope: "all",
  });

  const [formData, setFormData] = useState({ name: "", code: "" });

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    let results = fields;
    if (searchParams.keyword) {
      const term = searchParams.keyword.toLowerCase();
      const scope = searchParams.scope;
      results = results.filter((item) => {
        const idStr = item.FieldID ? item.FieldID.toString() : "";
        const nameStr = item.Name ? item.Name.toLowerCase() : "";

        if (scope === "all")
          return idStr.includes(term) || nameStr.includes(term);
        if (scope === "id") return idStr.includes(term);
        if (scope === "name") return nameStr.includes(term);
        return true;
      });
    }
    setFilteredFields(results);
  }, [searchParams, fields]);

  const fetchFields = async () => {
    try {
      const res = await api.get("/dictionaries/fields");
      setFields(res.data);
      setFilteredFields(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách lĩnh vực!");
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", code: "" });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({ name: item.Name, code: item.Code });
    setEditID(item.FieldID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa lĩnh vực này?")) {
      try {
        await api.delete(`/dictionaries/fields/${id}`);
        toast.success("Xóa thành công!");
        fetchFields();
      } catch (err) {
        toast.error("Không thể xóa (dữ liệu đang được sử dụng)!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: isEditing ? formData.code : "",
      };

      if (isEditing) {
        await api.put(`/dictionaries/fields/${editID}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/dictionaries/fields", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchFields();
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu!");
    }
  };

  return (
    <div className="field-manager">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">
          <FaLayerGroup /> QUẢN LÝ LĨNH VỰC
        </h2>
        <div className="header-actions">
          <button
            className={`search-toggle-btn ${showSearch ? "active" : ""}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <FaTimes /> : <FaFilter />}{" "}
            {showSearch ? "Đóng bộ lọc" : "Tìm kiếm"}
          </button>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* SEARCH PANEL */}
      <div className={`advanced-search-container ${showSearch ? "open" : ""}`}>
        <div className="search-panel">
          <div className="search-row">
            <div className="search-group" style={{ flex: 2 }}>
              <div className="input-with-icon">
                <FaSearch className="input-icon left" />
                <input
                  type="text"
                  className="form-control"
                  name="keyword"
                  placeholder="Nhập từ khóa (Tên hoặc ID)..."
                  value={searchParams.keyword}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="search-group" style={{ flex: 1 }}>
              <div className="input-with-icon">
                <FaTag className="input-icon left" />
                <select
                  className="form-control"
                  name="scope"
                  value={searchParams.scope}
                  onChange={handleSearchChange}
                >
                  <option value="all">Tất cả</option>
                  <option value="name">Tên lĩnh vực</option>
                  <option value="id">ID</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id text-center">ID</th>
                <th className="col-name">Tên Lĩnh Vực</th>
                <th className="col-action text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredFields.length > 0 ? (
                filteredFields.map((item) => (
                  <tr key={item.FieldID}>
                    <td className="text-center font-bold text-primary">
                      {item.FieldID}
                    </td>
                    <td className="font-medium">{item.Name}</td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(item.FieldID)}
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
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Tổng số: <b>{filteredFields.length}</b> lĩnh vực
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "CẬP NHẬT LĨNH VỰC" : "THÊM LĨNH VỰC MỚI"}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Tên lĩnh vực <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-lg"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên lĩnh vực..."
                    required
                    autoFocus
                  />
                </div>

                {isEditing && (
                  <div className="form-group">
                    <label>Mã lĩnh vực (Code)</label>
                    <input
                      type="text"
                      className="input-lg"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="Mã hệ thống..."
                    />
                  </div>
                )}
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

export default FieldManager;
