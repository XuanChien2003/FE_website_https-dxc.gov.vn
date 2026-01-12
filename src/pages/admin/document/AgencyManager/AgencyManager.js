import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaFilter,
  FaTag,
  FaToggleOn,
} from "react-icons/fa";
import "./AgencyManager.css";

const AgencyManager = () => {
  const [agencies, setAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  const [searchParams, setSearchParams] = useState({
    keyword: "",
    scope: "all",
    isDefault: "all",
  });

  const [formData, setFormData] = useState({
    name: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    let results = agencies;
    if (searchParams.keyword) {
      const term = searchParams.keyword.toLowerCase();
      const scope = searchParams.scope;
      results = results.filter((item) => {
        const idStr = item.AgencyID ? item.AgencyID.toString() : "";
        const nameStr = item.Name ? item.Name.toLowerCase() : "";
        if (scope === "all")
          return idStr.includes(term) || nameStr.includes(term);
        if (scope === "id") return idStr.includes(term);
        if (scope === "name") return nameStr.includes(term);
        return true;
      });
    }
    if (searchParams.isDefault !== "all") {
      const isTrue = searchParams.isDefault === "true";
      results = results.filter((item) => item.IsDefault === isTrue);
    }
    setFilteredAgencies(results);
  }, [searchParams, agencies]);

  const fetchAgencies = async () => {
    try {
      const res = await api.get("/dictionaries/agencies");
      setAgencies(res.data);
      setFilteredAgencies(res.data);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu!");
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", isDefault: false });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({ name: item.Name, isDefault: item.IsDefault });
    setEditID(item.AgencyID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa cơ quan này?")) {
      try {
        await api.delete(`/dictionaries/agencies/${id}`);
        toast.success("Đã xóa thành công!");
        fetchAgencies();
      } catch (err) {
        toast.error("Không thể xóa (dữ liệu đang được sử dụng)!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/dictionaries/agencies/${editID}`, formData);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/dictionaries/agencies", formData);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchAgencies();
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu!");
    }
  };

  return (
    <div className="agency-manager">
      <div className="page-header">
        <h2 className="page-title">
          <FaBuilding /> QUẢN LÝ CƠ QUAN
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
                  placeholder="Nhập từ khóa..."
                  value={searchParams.keyword}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="search-group">
              <div className="input-with-icon">
                <FaTag className="input-icon left" />
                <select
                  className="form-control"
                  name="scope"
                  value={searchParams.scope}
                  onChange={handleSearchChange}
                >
                  <option value="all">Tất cả</option>
                  <option value="name">Tên</option>
                  <option value="id">ID</option>
                </select>
              </div>
            </div>
            <div className="search-group">
              <div className="input-with-icon">
                <FaToggleOn className="input-icon left" />
                <select
                  className="form-control"
                  name="isDefault"
                  value={searchParams.isDefault}
                  onChange={handleSearchChange}
                >
                  <option value="all">- Trạng thái -</option>
                  <option value="true">Mặc định</option>
                  <option value="false">Bình thường</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th className="col-name">Tên Cơ Quan / Đơn Vị</th>
                <th className="col-default">Mặc định</th>
                <th className="col-action">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgencies.length > 0 ? (
                filteredAgencies.map((agency) => (
                  <tr key={agency.AgencyID}>
                    <td className="col-id">{agency.AgencyID}</td>
                    <td className="font-medium text-primary">{agency.Name}</td>
                    <td className="col-default">
                      {agency.IsDefault ? (
                        <FaCheckCircle className="icon-check-success" />
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="col-action">
                      <div className="btn-group">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(agency)}
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(agency.AgencyID)}
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
                  <td colSpan="4" className="text-center p-4 text-muted">
                    Không tìm thấy dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Hiển thị <b>{filteredAgencies.length}</b> / <b>{agencies.length}</b>{" "}
          cơ quan
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "CẬP NHẬT CƠ QUAN" : "THÊM CƠ QUAN MỚI"}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Tên cơ quan <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-lg"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên cơ quan..."
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group checkbox-wrapper">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDefault: e.target.checked,
                        })
                      }
                    />
                    <span className="checkbox-text">Hiển thị mặc định</span>
                  </label>
                  <div className="hint-text">
                    (Ưu tiên hiển thị cơ quan này trong danh sách)
                  </div>
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

export default AgencyManager;
