import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaSave, FaCamera, FaSpinner } from "react-icons/fa";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  // Lấy User ID từ localStorage
  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : null;
  // Lưu ý: Đảm bảo khi login, BE trả về id hoặc userID, và FE lưu vào localStorage đúng key.
  // Ví dụ: BE trả về { id: 1, username: 'admin'... } -> FE lưu.
  const currentId = currentUser ? currentUser.userid || currentUser.UserID || currentUser.id : null;

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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('userid', currentId)
        .single();

      if (error) throw error;

      setFormData({
        fullName: data.fullname || "",
        username: data.username || "",
        role: data.role || "",
        avatar: data.avatar || "",
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
      const { error } = await supabase
        .from('users')
        .update({
          fullname: formData.fullName,
          avatar: formData.avatar,
        })
        .eq('userid', currentId);

      if (error) throw error;

      // Cập nhật localStorage để Header hiển thị ngay
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          fullname: formData.fullName,
          avatar: formData.avatar,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
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
      const { error } = await supabase
        .from('users')
        .update({ password: passData.newPassword })
        .eq('userid', currentId);

      if (error) throw error;

      toast.success("Đổi mật khẩu thành công!");
      setPassData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message || "Lỗi đổi mật khẩu!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] gap-[10px] text-[#64748b]">
        <FaSpinner className="animate-spin" /> Đang tải...
      </div>
    );
  }

  if (!currentId) {
    return (
      <div className="text-center p-8 text-gray-500">
        Không tìm thấy thông tin người dùng (Vui lòng đăng nhập lại).
      </div>
    );
  }

  return (
    <div className="p-[20px] max-w-[900px] mx-auto font-sans">
      {/* HEADER CARD */}
      <div className="bg-white rounded-[8px] p-[30px] flex items-center gap-[20px] shadow-[0_2px_5px_rgba(0,0,0,0.05)] mb-[20px]">
        <div className="relative">
          <img
            src={
              formData.avatar || "https://via.placeholder.com/150?text=Avatar"
            }
            alt="Avatar"
            className="w-[100px] h-[100px] rounded-full object-cover border-[3px] border-[#f1f5f9]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150?text=Avatar";
            }}
          />
          <button
            className="absolute bottom-0 right-0 bg-[#2c3e50] text-white border-[2px] border-white rounded-full w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
            type="button"
            title="Chức năng này đang phát triển"
          >
            <FaCamera />
          </button>
        </div>
        <div>
          <h2 className="m-[0_0_5px_0] text-[#2c3e50] text-2xl font-bold">{formData.fullName}</h2>
          <p className="m-0 text-[#64748b] text-[14px]">
            @{formData.username} •{" "}
            <span className="bg-[#e0f2fe] text-[#0369a1] p-[2px_8px] rounded-[12px] text-[12px] font-semibold uppercase">{formData.role}</span>
          </p>
        </div>
      </div>

      <div className="flex gap-[20px] flex-col md:flex-row">
        {/* TABS */}
        <div className="w-full md:w-[250px] bg-white rounded-[8px] p-[10px] shadow-[0_2px_5px_rgba(0,0,0,0.05)] h-fit shrink-0">
          <button
            className={`flex items-center gap-[10px] w-full p-[12px_15px] border-none text-left cursor-pointer rounded-[6px] transition-all duration-200 ${activeTab === "general"
              ? "bg-[#eff6ff] text-[#2c3e50] font-semibold"
              : "bg-transparent text-[#64748b] font-medium hover:bg-[#f8fafc] hover:text-[#2c3e50]"
              }`}
            onClick={() => setActiveTab("general")}
          >
            <FaUser /> Thông tin chung
          </button>
          <button
            className={`flex items-center gap-[10px] w-full p-[12px_15px] border-none text-left cursor-pointer rounded-[6px] transition-all duration-200 ${activeTab === "security"
              ? "bg-[#eff6ff] text-[#2c3e50] font-semibold"
              : "bg-transparent text-[#64748b] font-medium hover:bg-[#f8fafc] hover:text-[#2c3e50]"
              }`}
            onClick={() => setActiveTab("security")}
          >
            <FaLock /> Bảo mật
          </button>
        </div>

        {/* PANELS */}
        <div className="flex-1 bg-white rounded-[8px] p-[30px] shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
          {/* TAB 1 */}
          {activeTab === "general" && (
            <form onSubmit={handleUpdateInfo}>
              <h3 className="mt-0 mb-[25px] text-[18px] text-[#334155] border-b border-[#f1f5f9] pb-[15px]">Chỉnh sửa thông tin</h3>

              <div className="mb-[20px]">
                <label className="block mb-[8px] font-medium text-[#475569]">Tên đăng nhập</label>
                <input
                  type="text"
                  className="w-full p-[10px] border border-[#cbd5e1] rounded-[6px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15 disabled:bg-[#f1f5f9] disabled:text-[#94a3b8] cursor-not-allowed"
                  value={formData.username}
                  disabled
                />
              </div>

              <div className="mb-[20px]">
                <label className="block mb-[8px] font-medium text-[#475569]">
                  Họ và tên <span className="text-[#ef4444] ml-[3px]">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-[10px] border border-[#cbd5e1] rounded-[6px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-[20px]">
                <label className="block mb-[8px] font-medium text-[#475569]">Link Avatar (URL)</label>
                <input
                  type="text"
                  className="w-full p-[10px] border border-[#cbd5e1] rounded-[6px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="mt-[30px] text-right text-black">
                <button type="submit" className="bg-[#2c5282] text-white px-[20px] py-[10px] rounded-[6px] font-semibold inline-flex items-center justify-center gap-[8px] hover:bg-[#1e3a8a] transition-all cursor-pointer border-none">
                  <FaSave /> Lưu thay đổi
                </button>
              </div>
            </form>
          )}

          {/* TAB 2 */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword}>
              <h3 className="mt-0 mb-[25px] text-[18px] text-[#334155] border-b border-[#f1f5f9] pb-[15px]">Đổi mật khẩu</h3>

              <div className="mb-[20px]">
                <label className="block mb-[8px] font-medium text-[#475569]">
                  Mật khẩu mới <span className="text-[#ef4444] ml-[3px]">*</span>
                </label>
                <input
                  type="password"
                  className="w-full p-[10px] border border-[#cbd5e1] rounded-[6px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                  value={passData.newPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, newPassword: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-[20px]">
                <label className="block mb-[8px] font-medium text-[#475569]">
                  Xác nhận mật khẩu <span className="text-[#ef4444] ml-[3px]">*</span>
                </label>
                <input
                  type="password"
                  className="w-full p-[10px] border border-[#cbd5e1] rounded-[6px] text-[14px] outline-none h-[42px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
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

              <div className="mt-[30px] text-right">
                <button type="submit" className="bg-[#2c5282] text-white px-[20px] py-[10px] rounded-[6px] font-semibold inline-flex items-center justify-center gap-[8px] hover:bg-[#1e3a8a] transition-all cursor-pointer border-none">
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
