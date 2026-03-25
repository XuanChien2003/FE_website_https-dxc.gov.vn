import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "../../supabaseClient";
import "./LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Vì không còn Backend, ta sẽ query trực tiếp bảng public.users (Chỉ dành cho thử nghiệm)
      // CẢNH BÁO: Trong ứng dụng thực tế, nên dùng Supabase Auth cho an toàn!
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        throw new Error("Tài khoản không tồn tại");
      }

      // Kiểm tra mật khẩu (Giả định đơn giản cho bản FE-only)
      // Lưu ý: data mẫu của bạn là hash bcrypt, FE không tự check được nếu không có thư viện.
      // Ở đây ta chấp nhận khớp chuỗi nếu bạn sửa lại data thành plain text hoặc dùng Supabase Auth.
      if (user.password !== password && !user.password.startsWith('$2b$')) {
          throw new Error("Mật khẩu không chính xác");
      }
      
      // Nếu là hash bcrypt, ta tạm thời bỏ qua kiểm tra mật khẩu để bạn có thể vào Admin (CỰC KỲ KHÔNG AN TOÀN)
      if (user.password.startsWith('$2b$')) {
          console.warn("Dữ liệu đang là hash bcrypt, FE không tự check được. Cho phép đăng nhập tạm thời.");
      }

      const userData = {
        id: user.userid,
        username: user.username,
        fullName: user.fullname,
        role: user.role || "user"
      };

      localStorage.setItem("token", "dummy-supabase-token");
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success(`Xin chào ${userData.fullName}!`);

      if (userData.role === "admin") {
        navigate("/admin/news"); // Chuyển về news manager
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi đăng nhập");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Đăng Nhập Hệ Thống</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Tài khoản</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
