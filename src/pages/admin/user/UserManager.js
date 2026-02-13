import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaUserCog,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaUserShield,
  FaFilter,
  FaBan,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./UserManager.css";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [showSearch, setShowSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [searchParams, setSearchParams] = useState({
    keyword: "",
    role: "all",
  });

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "user",
    avatar: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let results = users;
    if (searchParams.keyword) {
      const term = searchParams.keyword.toLowerCase();
      results = results.filter(
        (u) =>
          (u.Username && u.Username.toLowerCase().includes(term)) ||
          (u.FullName && u.FullName.toLowerCase().includes(term)),
      );
    }
    if (searchParams.role !== "all") {
      results = results.filter((u) => u.Role === searchParams.role);
    }
    setFilteredUsers(results);
  }, [searchParams, users]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách!");
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "user",
      avatar: "",
    });
    setIsEditing(false);
    setEditID(null);
    setShowPassword(false);
    setShowConfirmPass(false);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    if (item.Role === "admin") {
      toast.warning("Bạn không thể sửa thông tin Quản trị viên!");
      return;
    }

    setFormData({
      username: item.Username,
      password: "",
      confirmPassword: "",
      fullName: item.FullName,
      role: item.Role,
      avatar: item.Avatar || "",
    });
    setEditID(item.UserID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (item.Role === "admin") {
      toast.error("Không được phép xóa Quản trị viên!");
      return;
    }
    if (window.confirm(`Xóa người dùng "${item.Username}"?`)) {
      try {
        await api.delete(`/users/${item.UserID}`);
        toast.success("Đã xóa!");
        fetchUsers();
      } catch (err) {
        toast.error("Lỗi xóa!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // LOGIC MỚI: Chỉ validate mật khẩu khi THÊM MỚI (!isEditing)
    if (!isEditing) {
      if (!formData.password) {
        toast.error("Vui lòng nhập mật khẩu!");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp!");
        return;
      }
    }

    try {
      if (isEditing) {
        // Khi sửa: Chỉ gửi thông tin Username(nếu API cần check), FullName, Role
        // Không gửi password
        const updateData = {
          fullName: formData.fullName,
          role: formData.role,
          avatar: formData.avatar,
        };

        await api.put(`/users/${editID}`, updateData);
        toast.success("Cập nhật thông tin thành công!");
      } else {
        // Khi thêm mới: Gửi đầy đủ
        await api.post("/users", formData);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lưu dữ liệu!");
    }
  };

  const getRoleBadge = (role) => {
    return role === "admin" ? (
      <span className="badge badge-admin">Quản trị</span>
    ) : (
      <span className="badge badge-user">Người dùng</span>
    );
  };

  return (
    <div className="agency-manager">
      <div className="page-header">
        <h2 className="page-title">
          <FaUserCog /> QUẢN LÝ NGƯỜI DÙNG
        </h2>
        <div className="header-actions">
          <button
            className={`search-toggle-btn ${showSearch ? "active" : ""}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <FaTimes /> : <FaFilter />}
            {showSearch ? " Đóng bộ lọc" : " Tìm kiếm"}
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
                  placeholder="Tìm theo Tên hoặc Username..."
                  value={searchParams.keyword}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="search-group">
              <div className="input-with-icon">
                <FaUserShield className="input-icon left" />
                <select
                  className="form-control"
                  name="role"
                  value={searchParams.role}
                  onChange={handleSearchChange}
                >
                  <option value="all">- Tất cả quyền -</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                  <option value="user">Người dùng thường</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ tên</th>
              <th className="text-center">Quyền</th>
              <th className="col-action">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isAdmin = user.Role === "admin";
                return (
                  <tr key={user.UserID}>
                    <td className="font-bold text-primary">{user.Username}</td>
                    <td>{user.FullName}</td>
                    <td className="text-center">{getRoleBadge(user.Role)}</td>
                    <td className="col-action">
                      <div className="btn-group">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => !isAdmin && handleEdit(user)}
                          disabled={isAdmin}
                          title={
                            isAdmin ? "Không thể sửa Admin" : "Sửa thông tin"
                          }
                          style={
                            isAdmin
                              ? { opacity: 0.5, cursor: "not-allowed" }
                              : {}
                          }
                        >
                          {isAdmin ? <FaBan /> : <FaEdit />}
                        </button>

                        <button
                          className="btn-icon btn-delete"
                          onClick={() => !isAdmin && handleDelete(user)}
                          disabled={isAdmin}
                          title={isAdmin ? "Không thể xóa Admin" : "Xóa"}
                          style={
                            isAdmin
                              ? { opacity: 0.5, cursor: "not-allowed" }
                              : {}
                          }
                        >
                          {isAdmin ? <FaBan /> : <FaTrash />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted p-4">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {isEditing ? "CẬP NHẬT THÔNG TIN" : "THÊM NGƯỜI DÙNG MỚI"}
              </h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Tên tài khoản{" "}
                    {isEditing ? (
                      "(Không thể sửa)"
                    ) : (
                      <span className="req">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="input-lg"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={isEditing}
                    placeholder="Nhập tên đăng nhập..."
                    style={
                      isEditing
                        ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" }
                        : {}
                    }
                  />
                </div>

                {/* LOGIC MỚI: Chỉ hiển thị vùng nhập password khi KHÔNG PHẢI LÀ EDIT (!isEditing) */}
                {!isEditing && (
                  <>
                    <div className="form-group">
                      <label>
                        Mật khẩu <span className="req">*</span>
                      </label>
                      <div
                        className="password-input-wrapper"
                        style={{ position: "relative" }}
                      >
                        <input
                          type={showPassword ? "text" : "password"}
                          className="input-lg"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Nhập mật khẩu..."
                          required
                          style={{ paddingRight: "40px" }}
                        />
                        <span
                          className="eye-icon"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            zIndex: 10,
                            color: "#666",
                          }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        Xác nhận mật khẩu <span className="req">*</span>
                      </label>
                      <div
                        className="password-input-wrapper"
                        style={{ position: "relative" }}
                      >
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          className="input-lg"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Nhập lại mật khẩu..."
                          required
                          style={{ paddingRight: "40px" }}
                        />
                        <span
                          className="eye-icon"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            zIndex: 10,
                            color: "#666",
                          }}
                        >
                          {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>
                    Họ và tên <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-lg"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Nhập họ và tên..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phân quyền</label>
                  <select
                    className="input-lg"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="user">Người dùng (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
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
                  <FaSave /> {isEditing ? "Cập nhật" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
