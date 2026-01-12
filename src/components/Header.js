import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaBars, FaTimes, FaAngleDown } from "react-icons/fa";
import "./Header.css";
import api from "../pages/services/api";

// Component Đồng hồ
const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  const days = [
    "Chủ nhật",

    "Thứ hai",

    "Thứ ba",

    "Thứ tư",

    "Thứ năm",

    "Thứ sáu",

    "Thứ bảy",
  ];

  const dayName = days[time.getDay()];

  const dateStr = `${time.getDate().toString().padStart(2, "0")}/${(
    time.getMonth() + 1
  )

    .toString()

    .padStart(2, "0")}/${time.getFullYear()}`;

  const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time

    .getMinutes()

    .toString()

    .padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")}`;

  return (
    <span>
      {dayName} {dateStr}, {timeStr}
    </span>
  );
};

const Header = () => {
  const [menuTree, setMenuTree] = useState([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [mobileExpanded, setMobileExpanded] = useState({});

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.get("/menus");

        const activeMenus = res.data.filter((m) => m.IsShow);

        const tree = buildMenuTree(activeMenus);

        setMenuTree(tree);
      } catch (err) {
        console.error("Lỗi tải menu:", err);
      }
    };

    fetchMenus();
  }, []);

  const buildMenuTree = (list) => {
    const map = {};

    const tree = [];

    list.forEach((item) => {
      map[item.MenuID] = { ...item, children: [] };
    });

    list.forEach((item) => {
      if (item.ParentID && item.ParentID !== 0 && map[item.ParentID]) {
        map[item.ParentID].children.push(map[item.MenuID]);
      } else {
        tree.push(map[item.MenuID]);
      }
    });

    return tree.sort((a, b) => (a.STT || 0) - (b.STT || 0));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) alert(`Tìm kiếm: ${searchTerm}`);
  };

  const toggleMobileSubmenu = (id, e) => {
    e.preventDefault();

    setMobileExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <header className="site-header">
      {/* 1. BRANDING - Đã chỉnh sửa đẹp hơn */}

      <div className="header-top">
        <div className="container branding-container">
          <Link to="/" className="brand-box">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Emblem_of_the_Socialist_Republic_of_Vietnam.svg/2021px-Emblem_of_the_Socialist_Republic_of_Vietnam.svg.png"
              alt="Quốc Huy"
              className="header-logo"
            />

            <div className="brand-divider"></div>

            <div className="brand-text">
              <h2 className="ministry-name">BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH</h2>

              <h1 className="portal-name">CHUYÊN TRANG CHUYỂN ĐỔI SỐ</h1>

              <span className="ministry-en">
                Ministry of Culture, Sports and Tourism
              </span>
            </div>
          </Link>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION BAR */}

      <nav className={`main-nav ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="container">
          <ul className="nav-list">
            {/* --- MỤC TRANG CHỦ (CỐ ĐỊNH) --- */}

            <li className="nav-item">
              <div className="menu-link-wrapper">
                <Link
                  to="/"
                  className="menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Trang chủ
                </Link>
              </div>
            </li>

            {menuTree.map((menu) => {
              const hasChildren = menu.children && menu.children.length > 0;

              const isExpanded = mobileExpanded[menu.MenuID];

              return (
                <li
                  key={menu.MenuID}
                  className={`nav-item ${hasChildren ? "has-children" : ""}`}
                >
                  <div className="menu-link-wrapper">
                    <Link
                      to={menu.Url || "#"}
                      className="menu-link"
                      onClick={() => !hasChildren && setIsMobileMenuOpen(false)}
                    >
                      {menu.Title}
                    </Link>

                    {hasChildren && (
                      <span
                        className="submenu-toggle"
                        onClick={(e) => toggleMobileSubmenu(menu.MenuID, e)}
                      >
                        <FaAngleDown />
                      </span>
                    )}
                  </div>

                  {hasChildren && (
                    <ul
                      className={`submenu ${isExpanded ? "mobile-show" : ""}`}
                    >
                      {menu.children.map((child) => (
                        <li key={child.MenuID}>
                          <Link
                            to={child.Url || "#"}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.Title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* 3. HERO BANNER */}

      <div className="hero-banner">
        <div className="container">
          <img
            src="https://sqhx-hanoi.mediacdn.vn/91579363132710912/2024/10/3/2bannerngang-17279503477582013927390.png"
            alt="Banner Chuyển đổi số"
            className="banner-img"
            onError={(e) => {
              e.target.style.display = "none";

              e.target.parentElement.style.background =
                "linear-gradient(90deg, #b91c1c, #d97706)";

              e.target.parentElement.style.height = "100px";
            }}
          />
        </div>
      </div>

      {/* 4. UTILITY BAR */}

      <div className="info-bar">
        <div className="container info-container">
          <div className="time-display">
            <RealTimeClock />
          </div>

          <form onSubmit={handleSearch} className="search-form-bottom">
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button type="button" onClick={handleSearch}>
              <FaSearch />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
