import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });

      const { token, user } = res.data;

      // 1. Lưu Token và thông tin User vào LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Xin chào ${user.fullName}!`);

      // 2. LOGIC ĐIỀU HƯỚNG THEO ROLE
      if (user.role === "admin") {
        // Nếu là Admin -> Vào trang quản trị
        navigate("/admin/documents");
      } else {
        // Nếu là User thường -> Về trang chủ
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đăng nhập");
    }
  };

  return (
    <div
      style={{
        padding: 50,
        maxWidth: 400,
        margin: "100px auto",
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      <h2 style={{ textAlign: "center" }}>Đăng Nhập Hệ Thống</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 15 }}>
          <label>Tài khoản:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 5 }}
            required
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 5 }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
