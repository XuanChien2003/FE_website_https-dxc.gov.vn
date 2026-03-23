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
    {
      key: "users",
      label: "Quản lý người dùng",
      icon: <FaUser />,
      path: "/admin/users",
      isParent: false,
    },
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
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-[#f4f6f9]">
      {/* HEADER */}
      <header className="h-[60px] bg-[#2c3e50] text-white flex justify-between items-center px-[15px] shadow-[0_2px_5px_rgba(0,0,0,0.15)] z-[1000] relative">
        <div className="flex items-center gap-[10px]">
          <button
            className="bg-transparent border-none text-white text-[18px] cursor-pointer p-[5px]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
          <h1 className="text-[16px] font-bold uppercase m-0 tracking-[0.5px]">HỆ THỐNG QUẢN TRỊ</h1>
        </div>

        <div className="flex items-center gap-[14px] text-[14px]">
          {/* Link tới trang Profile */}
          <Link
            to="/admin/profile"
            className="flex items-center gap-[10px] text-inherit no-underline hover:opacity-90 transition-opacity"
            title="Xem thông tin cá nhân"
          >
            {currentUser.avatar && (
              <img
                src={currentUser.avatar}
                alt="avatar"
                className="w-[32px] h-[32px] rounded-full object-cover border-[2px] border-white/20"
                onError={(e) => (e.target.style.display = "none")} // Ẩn nếu lỗi ảnh
              />
            )}
            <span>
              Xin chào: <strong>{currentUser.displayName}</strong>
            </span>
          </Link>

          <button
            className="bg-white/10 border border-white/20 text-white p-[6px_10px] text-[15px] rounded-[4px] cursor-pointer flex items-center gap-[5px] transition-all hover:bg-white/20"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden mt-[2px]">
        {/* SIDEBAR */}
        <aside
          className={`bg-[#2c3e50] transition-all duration-300 overflow-y-auto shrink-0 border-r border-white/5 ${
            sidebarOpen ? "w-[230px]" : "w-[50px]"
          } scrollbar-thin scrollbar-thumb-gray-600`}
        >
          <div className="pt-[5px]">
            {menuConfig.map((item) => (
              <React.Fragment key={item.key}>
                {/* --- MENU CHA (CÓ CON) --- */}
                {item.isParent ? (
                  <div className="group">
                    <div
                      className={`flex justify-between items-center p-[12px_15px] text-[#ecf0f1] bg-[#2c3e50] cursor-pointer transition-all duration-200 font-medium text-[14px] border-b border-black/5 ${
                        !sidebarOpen && "justify-center py-[15px]"
                      } ${
                        isParentActive(item.children) || openMenus[item.key]
                          ? "bg-[#34495e] text-white border-l-[4px] border-[#e74c3c]"
                          : "hover:bg-[#34495e] hover:text-white border-l-[4px] border-transparent"
                      }`}
                      onClick={() => toggleMenu(item.key)}
                      title={!sidebarOpen ? item.label : ""}
                    >
                      <div className={`flex items-center ${sidebarOpen ? "gap-[12px]" : "gap-0"}`}>
                        <span className={`text-[16px] min-w-[20px] text-center ${isParentActive(item.children) || openMenus[item.key] ? "text-white" : "text-[#bdc3c7]"}`}>{item.icon}</span>
                        {sidebarOpen && <span>{item.label}</span>}
                      </div>
                      {sidebarOpen && (
                        <span className="text-[11px] opacity-80">
                          {openMenus[item.key] ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                      )}
                    </div>

                    {/* Menu con */}
                    {(openMenus[item.key] || !sidebarOpen) && (
                      <div className={`bg-[#22303d] shadow-[inset_0_3px_5px_rgba(0,0,0,0.2)] ${!sidebarOpen && "hidden"}`}>
                        {item.children.map((child) => (
                          <Link
                            key={child.key}
                            to={child.path}
                            className={`flex items-center gap-[10px] p-[10px_15px_10px_48px] no-underline text-[13px] transition-all duration-200 border-l-[4px] ${
                              isActive(child.path)
                                ? "bg-white/10 text-[#e74c3c] font-semibold border-[#e74c3c]"
                                : "text-[#bdc3c7] border-transparent hover:text-white hover:bg-white/5"
                            }`}
                            title={!sidebarOpen ? child.name : ""}
                          >
                            <span className={`text-[16px] min-w-[20px] text-center ${isActive(child.path) ? "text-[#e74c3c]" : "text-[#bdc3c7]"}`}>{child.icon}</span>
                            {sidebarOpen && <span>{child.name}</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* --- MENU ĐƠN (KHÔNG CON) --- */
                  <Link
                    to={item.path}
                    className={`flex justify-between items-center p-[12px_15px] text-[#ecf0f1] bg-[#2c3e50] cursor-pointer transition-all duration-200 font-medium text-[14px] no-underline border-b border-black/5 ${
                      !sidebarOpen && "justify-center py-[15px]"
                    } ${
                      isActive(item.path)
                        ? "bg-[#34495e] text-white border-l-[4px] border-[#e74c3c]"
                        : "hover:bg-[#34495e] hover:text-white border-l-[4px] border-transparent"
                    }`}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    <div className={`flex items-center ${sidebarOpen ? "gap-[12px]" : "gap-0"}`}>
                      <span className={`text-[16px] min-w-[20px] text-center ${isActive(item.path) ? "text-white" : "text-[#bdc3c7]"}`}>{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </div>
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-[#f4f6f9] p-0 overflow-y-auto w-full">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
