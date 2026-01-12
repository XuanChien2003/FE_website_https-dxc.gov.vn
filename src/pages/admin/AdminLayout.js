import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaFileAlt,
  FaBuilding,
  FaUser,
  FaList,
  FaGlobeAsia,
  FaBars,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaNewspaper,
  FaLink,
  FaImages,
  FaSitemap,
  FaTags,
} from "react-icons/fa";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 1. CẤU HÌNH TRẠNG THÁI MỞ MENU
  // Mặc định: Mở 'articles', Đóng 'documents'
  const [openMenus, setOpenMenus] = useState({
    documents: false,
    articles: true,
  });

  // State lưu thông tin user đang đăng nhập
  const [currentUser, setCurrentUser] = useState({ fullName: "Admin" });

  const navigate = useNavigate();
  const location = useLocation();

  // 2. LẤY THÔNG TIN USER TỪ LOCALSTORAGE KHI MOUNT
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // Ưu tiên hiển thị: FullName -> Username -> "Admin"
        setCurrentUser({
          ...user,
          displayName: user.fullName || user.username || "Admin",
        });
      } catch (error) {
        console.error("Lỗi parse user data", error);
      }
    }
  }, []);

  // Lắng nghe sự kiện storage để cập nhật header realtime (khi update profile)
  useEffect(() => {
    const handleStorageChange = () => {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser({
          ...user,
          displayName: user.fullName || user.username || "Admin",
        });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 3. LOGIC KIỂM TRA ACTIVE (QUAN TRỌNG)
  // Kiểm tra menu con có đang active không (bao gồm cả trang con)
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Kiểm tra menu cha có đang chứa menu con active không
  const isParentActive = (children) => {
    if (!children) return false;
    return children.some((child) => isActive(child.path));
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // --- CẤU HÌNH MENU ---
  const menuConfig = [
    // 1. QUẢN TRỊ BÀI VIẾT (Mặc định mở)
    {
      key: "articles",
      label: "Quản trị bài viết",
      icon: <FaNewspaper />,
      isParent: true,
      children: [
        {
          name: "Bài viết tin tức",
          icon: <FaNewspaper />,
          path: "/admin/news",
          key: "news",
        },
        {
          name: "Chuyên mục",
          icon: <FaTags />,
          path: "/admin/categories",
          key: "categories",
        },
      ],
    },

    // 2. QUẢN TRỊ VĂN BẢN
    {
      key: "documents",
      label: "Quản trị văn bản",
      icon: <FaFileAlt />,
      isParent: true,
      children: [
        {
          name: "Danh sách văn bản",
          icon: <FaFileAlt />,
          path: "/admin/documents",
          key: "doc-list",
        },
        {
          name: "Cơ quan ban hành",
          icon: <FaBuilding />,
          path: "/admin/agencies",
          key: "agencies",
        },
        {
          name: "Người ký",
          icon: <FaUser />,
          path: "/admin/signers",
          key: "signers",
        },
        {
          name: "Loại văn bản",
          icon: <FaList />,
          path: "/admin/types",
          key: "types",
        },
        {
          name: "Lĩnh vực",
          icon: <FaGlobeAsia />,
          path: "/admin/fields",
          key: "fields",
        },
      ],
    },

    // 3. CÁC MỤC KHÁC
    {
      key: "menus",
      label: "Menu Trang Chủ",
      icon: <FaSitemap />,
      path: "/admin/menus",
      isParent: false,
    },
    {
      key: "slides",
      label: "Slide Ảnh (Banner)",
      icon: <FaImages />,
      path: "/admin/slides",
      isParent: false,
    },
    {
      key: "weblinks",
      label: "Liên kết Website",
      icon: <FaLink />,
      path: "/admin/weblinks",
      isParent: false,
    },
  ];

  return (
    <div className="admin-layout">
      {/* HEADER */}
      <header className="admin-header">
        <div className="header-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
          <h1 className="app-title">HỆ THỐNG QUẢN TRỊ</h1>
        </div>

        <div className="header-right">
          {/* Link tới trang Profile */}
          <Link
            to="/admin/profile"
            className="user-info-link"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            title="Xem thông tin cá nhân"
          >
            {currentUser.avatar && (
              <img
                src={currentUser.avatar}
                alt="avatar"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
                onError={(e) => (e.target.style.display = "none")} // Ẩn nếu lỗi ảnh
              />
            )}
            <span className="user-info">
              Xin chào: <strong>{currentUser.displayName}</strong>
            </span>
          </Link>

          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="main-container">
        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-menu">
            {menuConfig.map((item) => (
              <React.Fragment key={item.key}>
                {/* --- MENU CHA (CÓ CON) --- */}
                {item.isParent ? (
                  <div
                    className={`menu-group ${
                      openMenus[item.key] ? "expanded" : ""
                    }`}
                  >
                    <div
                      className={`menu-parent ${
                        isParentActive(item.children) ? "active-parent" : ""
                      }`}
                      onClick={() => toggleMenu(item.key)}
                      title={!sidebarOpen ? item.label : ""}
                    >
                      <div className="menu-parent-content">
                        <span className="menu-icon">{item.icon}</span>
                        {sidebarOpen && (
                          <span className="menu-text">{item.label}</span>
                        )}
                      </div>
                      {sidebarOpen && (
                        <span className="menu-arrow">
                          {openMenus[item.key] ? (
                            <FaChevronDown />
                          ) : (
                            <FaChevronRight />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Menu con */}
                    {(openMenus[item.key] || !sidebarOpen) && (
                      <div className="menu-children">
                        {item.children.map((child) => (
                          <Link
                            key={child.key}
                            to={child.path}
                            className={`menu-item ${
                              isActive(child.path) ? "active" : ""
                            }`}
                            title={!sidebarOpen ? child.name : ""}
                          >
                            <span className="menu-icon">{child.icon}</span>
                            {sidebarOpen && (
                              <span className="menu-text">{child.name}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* --- MENU ĐƠN (KHÔNG CON) --- */
                  <Link
                    to={item.path}
                    className={`menu-parent single-link ${
                      isActive(item.path) ? "active-parent" : ""
                    }`}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    <div className="menu-parent-content">
                      <span className="menu-icon">{item.icon}</span>
                      {sidebarOpen && (
                        <span className="menu-text">{item.label}</span>
                      )}
                    </div>
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className={`main-content ${sidebarOpen ? "" : "full-width"}`}>
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
