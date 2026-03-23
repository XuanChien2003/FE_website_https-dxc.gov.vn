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
        const updateData = {
          fullName: formData.fullName,
          role: formData.role,
          avatar: formData.avatar,
        };

        await api.put(`/users/${editID}`, updateData);
        toast.success("Cập nhật thông tin thành công!");
      } else {
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
      <span className="inline-block p-[4px_12px] rounded-[15px] text-[11px] font-bold uppercase whitespace-nowrap bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">Quản trị</span>
    ) : (
      <span className="inline-block p-[4px_12px] rounded-[15px] text-[11px] font-bold uppercase whitespace-nowrap bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">Người dùng</span>
    );
  };

  return (
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[13.5px] text-[#334155]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-[20px] bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282]">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaUserCog /> QUẢN LÝ NGƯỜI DÙNG
        </h2>
        <div className="flex gap-[10px]">
          <button
            className={`bg-white border text-[#2c5282] py-[8px] px-[16px] rounded-md font-semibold flex items-center gap-[8px] cursor-pointer transition-all duration-200 hover:bg-[#eff6ff] hover:border-[#2c5282] ${
              showSearch ? "bg-[#eff6ff] border-[#2c5282]" : "border-[#cbd5e1]"
            }`}
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <FaTimes /> : <FaFilter />}
            {showSearch ? " Đóng bộ lọc" : " Tìm kiếm"}
          </button>
          <button className="bg-[#2c5282] text-white border-none py-[9px] px-[18px] rounded-md font-semibold flex items-center gap-[8px] cursor-pointer transition-colors duration-200 hover:bg-[#1e3a8a]" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* TÌM KIẾM MỞ RỘNG */}
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
                  name="keyword"
                  placeholder="Tìm theo Tên hoặc Username..."
                  value={searchParams.keyword}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="relative w-full">
                <FaUserShield className="absolute top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] left-[12px]" />
                <select
                  className="p-[10px_12px_10px_36px] border border-[#d1d5db] rounded-[4px] text-[14px] text-[#334155] outline-none w-full h-[42px] bg-white transition-all duration-200 focus:border-[#2c5282] focus:ring-[2px] focus:ring-[#2c5282]/10 cursor-pointer appearance-none"
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

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-t-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden border border-[#cbd5e1] mt-[20px]">
        {/* Đã xóa min-h-[300px] để bảng co giãn vừa khít */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[700px]">
            <thead>
              <tr>
                {/* Thay đổi lại tỷ lệ các cột cho chuẩn đẹp: Username (25%), Họ tên (45%), Quyền (15%), Thao tác (15%) */}
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-left p-[12px_15px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[25%]">Username</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-left p-[12px_15px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[45%]">Họ tên</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_15px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[15%]">Quyền</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_15px] align-middle border-r border-transparent leading-[1.3] w-[15%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isAdmin = user.Role === "admin";
                  return (
                    <tr key={user.UserID} className="even:bg-[#f8fafc] hover:bg-[#e2e8f0] group">
                      <td className="p-[10px_15px] border border-[#cbd5e1] align-middle break-words text-[13px] font-bold text-[#0d6efd]">{user.Username}</td>
                      <td className="p-[10px_15px] border border-[#cbd5e1] align-middle break-words text-[13.5px]">{user.FullName}</td>
                      <td className="p-[10px_15px] border border-[#cbd5e1] align-middle text-center break-words">{getRoleBadge(user.Role)}</td>
                      <td className="p-[10px_15px] border border-[#cbd5e1] align-middle text-center">
                        <div className="flex justify-center gap-[6px]">
                          <button
                            className={`w-[26px] h-[26px] rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center transition-all ${
                              isAdmin
                                ? "opacity-50 cursor-not-allowed text-[#94a3b8]"
                                : "text-[#64748b] cursor-pointer hover:-translate-y-[1px] hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#eff6ff]"
                            }`}
                            onClick={() => !isAdmin && handleEdit(user)}
                            disabled={isAdmin}
                            title={
                              isAdmin ? "Không thể sửa Admin" : "Sửa thông tin"
                            }
                          >
                            {isAdmin ? <FaBan /> : <FaEdit />}
                          </button>

                          <button
                            className={`w-[26px] h-[26px] rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center transition-all ${
                              isAdmin
                                ? "opacity-50 cursor-not-allowed text-[#94a3b8]"
                                : "text-[#64748b] cursor-pointer hover:-translate-y-[1px] hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                            }`}
                            onClick={() => !isAdmin && handleDelete(user)}
                            disabled={isAdmin}
                            title={isAdmin ? "Không thể xóa Admin" : "Xóa"}
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
                  <td colSpan="4" className="text-center p-[30px] text-[#999] border border-[#cbd5e1]">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-[12px_20px] border-t border-[#cbd5e1] bg-white flex justify-between items-center rounded-b-lg">
          <div className="text-[#334155]">
            Tổng số: <b className="text-[#2c5282] mx-[2px]">{filteredUsers.length}</b> người dùng
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center pt-[80px] z-[999]">
          <div className="bg-white w-[600px] max-w-[95%] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden h-fit">
            <div className="bg-[#2c5282] text-white p-[15px_20px] flex justify-between items-center border-b border-[#1e3a8a]">
              <h3 className="m-0 text-[16px] font-bold uppercase tracking-wide">
                {isEditing ? "CẬP NHẬT THÔNG TIN" : "THÊM NGƯỜI DÙNG MỚI"}
              </h3>
              <button className="bg-transparent border-none text-white/80 text-[20px] cursor-pointer hover:text-white transition-colors" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-[25px_30px]">
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155] text-[13.5px]">
                    Tên tài khoản{" "}
                    {isEditing ? (
                      <span className="text-[#94a3b8] text-[12px] font-normal italic ml-[5px]">(Không thể sửa)</span>
                    ) : (
                      <span className="text-[#ef4444] ml-[3px]">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="w-full p-[10px_15px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] disabled:bg-[#f1f5f9] disabled:cursor-not-allowed transition-all"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={isEditing}
                    placeholder="Nhập tên đăng nhập..."
                  />
                </div>

                {!isEditing && (
                  <>
                    <div className="mb-[20px]">
                      <label className="block font-semibold mb-[8px] text-[#334155] text-[13.5px]">
                        Mật khẩu <span className="text-[#ef4444] ml-[3px]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full p-[10px_40px_10px_15px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] transition-all"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Nhập mật khẩu..."
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-[5px] w-[32px] h-[32px] flex flex-col justify-center items-center cursor-pointer text-[#94a3b8] bg-transparent border-none hover:text-[#0ea5e9] transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-[20px]">
                      <label className="block font-semibold mb-[8px] text-[#334155] text-[13.5px]">
                        Xác nhận mật khẩu <span className="text-[#ef4444] ml-[3px]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          className="w-full p-[10px_40px_10px_15px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] transition-all"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Nhập lại mật khẩu..."
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-[5px] w-[32px] h-[32px] flex flex-col justify-center items-center cursor-pointer text-[#94a3b8] bg-transparent border-none hover:text-[#0ea5e9] transition-colors"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                        >
                          {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155] text-[13.5px]">
                    Họ và tên <span className="text-[#ef4444] ml-[3px]">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-[10px_15px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] transition-all"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Nhập họ và tên..."
                    required
                  />
                </div>

                <div className="mb-[10px]">
                  <label className="block font-semibold mb-[8px] text-[#334155] text-[13.5px]">Phân quyền</label>
                  <select
                    className="w-full p-[10px_15px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] bg-white cursor-pointer transition-all"
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

              <div className="p-[15px_30px] bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-[10px]">
                <button
                  type="button"
                  className="bg-[#64748b] text-white p-[8px_20px] rounded-[4px] border-none font-semibold cursor-pointer flex items-center gap-[6px] hover:bg-[#475569] transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes /> Đóng lại
                </button>
                <button type="submit" className="bg-[#15803d] text-white p-[8px_20px] rounded-[4px] border-none font-semibold cursor-pointer flex items-center gap-[6px] hover:bg-[#166534] transition-colors">
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
