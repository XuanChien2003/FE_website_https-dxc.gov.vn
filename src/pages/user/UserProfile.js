import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaSave, FaCamera, FaSpinner } from "react-icons/fa";
import "./UserProfile.css";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  // Lấy User ID từ localStorage
  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : null;
  // Lưu ý: Đảm bảo khi login, BE trả về id hoặc userID, và FE lưu vào localStorage đúng key.
  // Ví dụ: BE trả về { id: 1, username: 'admin'... } -> FE lưu.
  const currentId = currentUser ? currentUser.id || currentUser.UserID : null;

  // State Info
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    role: "",
    avatar: "",
  });

  // State Password
  const [passData, setPassData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (currentId) {
      fetchUserInfo();
    } else {
      setLoading(false);
      // Nếu không có ID, có thể redirect về login
    }
  }, [currentId]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${currentId}`);
      const data = res.data;

      // Map dữ liệu từ BE (Chữ Hoa) sang State (Chữ thường)
      setFormData({
        fullName: data.FullName || "",
        username: data.Username || "",
        role: data.Role || "",
        avatar: data.Avatar || "",
      });
    } catch (err) {
      toast.error("Lỗi tải thông tin người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!currentId) return;

    try {
      // Gửi dữ liệu lên BE (khớp với req.body trong controller update)
      await api.put(`/users/${currentId}`, {
        fullName: formData.fullName,
        role: formData.role, // Vẫn gửi role cũ để BE không bị null
        avatar: formData.avatar,
      });

      // Cập nhật localStorage để Header hiển thị ngay
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          fullName: formData.fullName, // Cập nhật tên mới
          avatar: formData.avatar, // Cập nhật ảnh mới
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Dispatch event để Header (nếu ở file khác) biết mà render lại
        window.dispatchEvent(new Event("storage"));
      }

      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      toast.error("Lỗi cập nhật thông tin!");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentId) return;

    if (passData.newPassword.length < 6) {
      return toast.warning("Mật khẩu phải từ 6 ký tự trở lên!");
    }

    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp!");
    }

    try {
      // Gửi password mới lên BE
      await api.put(`/users/${currentId}/password`, {
        newPassword: passData.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      setPassData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      // Hiển thị lỗi chi tiết từ BE trả về
      const msg = err.response?.data?.message || "Lỗi đổi mật khẩu!";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <FaSpinner className="spin" /> Đang tải...
      </div>
    );
  }

  if (!currentId) {
    return (
      <div className="no-data">
        Không tìm thấy thông tin người dùng (Vui lòng đăng nhập lại).
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      {/* HEADER CARD */}
      <div className="profile-header-card">
        <div className="profile-avatar-wrapper">
          <img
            src={
              formData.avatar || "https://via.placeholder.com/150?text=Avatar"
            }
            alt="Avatar"
            className="profile-avatar-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150?text=Avatar";
            }}
          />
          <button
            className="btn-upload-avatar"
            type="button"
            title="Chức năng này đang phát triển"
          >
            <FaCamera />
          </button>
        </div>
        <div className="profile-info-basic">
          <h2>{formData.fullName}</h2>
          <p>
            @{formData.username} •{" "}
            <span className="role-badge">{formData.role}</span>
          </p>
        </div>
      </div>

      <div className="profile-content">
        {/* TABS */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <FaUser /> Thông tin chung
          </button>
          <button
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <FaLock /> Bảo mật
          </button>
        </div>

        {/* PANELS */}
        <div className="profile-tab-panel">
          {/* TAB 1 */}
          {activeTab === "general" && (
            <form onSubmit={handleUpdateInfo} className="profile-form">
              <h3 className="panel-title">Chỉnh sửa thông tin</h3>

              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.username}
                  disabled
                  style={{ backgroundColor: "#f3f4f6" }}
                />
              </div>

              <div className="form-group">
                <label>
                  Họ và tên <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Link Avatar (URL)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FaSave /> Lưu thay đổi
                </button>
              </div>
            </form>
          )}

          {/* TAB 2 */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="profile-form">
              <h3 className="panel-title">Đổi mật khẩu</h3>

              <div className="form-group">
                <label>
                  Mật khẩu mới <span className="req">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={passData.newPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, newPassword: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label>
                  Xác nhận mật khẩu <span className="req">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={passData.confirmPassword}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FaSave /> Cập nhật mật khẩu
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
