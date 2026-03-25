import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // <--- 1. Thêm useLocation
import { FaSearch, FaBars, FaTimes, FaAngleDown, FaHome } from "react-icons/fa";
import "./Header.css";
import { supabase } from "../supabaseClient";

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
    .padStart(2, "0")}`;

  return (
    <span className="clock-text">
      {dayName}, ngày {dateStr} | {timeStr}
    </span>
  );
};

const Header = () => {
  const [menuTree, setMenuTree] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileExpanded, setMobileExpanded] = useState({});

  const location = useLocation(); // <--- 2. Lấy đường dẫn hiện tại

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const { data, error } = await supabase
          .from('menus')
          .select('*')
          .filter('isshow', 'eq', true)
          .order('stt', { ascending: true });
        
        if (error) throw error;
        const tree = buildMenuTree(data || []);
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
      map[item.menuid] = { ...item, children: [] };
    });
    list.forEach((item) => {
      if (item.parentid && item.parentid !== 0 && map[item.parentid]) {
        map[item.parentid].children.push(map[item.menuid]);
      } else {
        tree.push(map[item.menuid]);
      }
    });
    return tree.sort((a, b) => (a.stt || 0) - (b.stt || 0));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      alert(`Tìm kiếm: ${searchTerm}`);
    }
  };

  const toggleMobileSubmenu = (id, e) => {
    e.preventDefault();
    setMobileExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Hàm kiểm tra xem menu này có đang active không
  const checkActive = (menu) => {
    // 1. Nếu URL trùng khớp hoàn toàn
    if (location.pathname === menu.url) return true;

    // 2. Nếu là menu cha, kiểm tra xem có con nào đang active không
    if (menu.children && menu.children.length > 0) {
      return menu.children.some((child) => child.url === location.pathname);
    }
    return false;
  };

  return (
    <header className="site-header">
      {/* 1. BRANDING */}
      <div className="header-branding">
        <div className="container branding-container">
          <Link to="/" className="brand-box">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Emblem_of_the_Socialist_Republic_of_Vietnam.svg/2021px-Emblem_of_the_Socialist_Republic_of_Vietnam.svg.png"
              alt="Quốc Huy"
              className="brand-logo"
            />
            <div className="brand-info">
              <h2 className="ministry-title">
                BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH
              </h2>
              <h1 className="portal-title">
                CỔNG THÔNG TIN ĐIỆN TỬ CHUYỂN ĐỔI SỐ
              </h1>
            </div>
          </Link>

          <button
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION BAR */}
      <nav className={`gov-nav ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="container">
          <ul className="gov-menu">
            {/* Home Icon */}
            <li
              className={`gov-menu-item home-icon ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <FaHome />
              </Link>
            </li>

            {menuTree.map((menu) => {
              const hasChildren = menu.children && menu.children.length > 0;
              const isExpanded = mobileExpanded[menu.menuid];
              const isActive = checkActive(menu); // <--- 3. Kiểm tra Active

              return (
                <li
                  key={menu.menuid}
                  className={`gov-menu-item ${hasChildren ? "has-sub" : ""} ${
                    isActive ? "active" : ""
                  }`}
                >
                  <div className="menu-link-wrap">
                    <Link
                      to={menu.url || "#"}
                      className="gov-link"
                      onClick={() => !hasChildren && setIsMobileMenuOpen(false)}
                    >
                      {menu.title}
                    </Link>
                    {hasChildren && (
                      <span
                        className="mobile-submenu-arrow"
                        onClick={(e) => toggleMobileSubmenu(menu.menuid, e)}
                      >
                        <FaAngleDown />
                      </span>
                    )}
                  </div>

                  {hasChildren && (
                    <ul className={`gov-submenu ${isExpanded ? "show" : ""}`}>
                      {menu.children.map((child) => (
                        <li
                          key={child.menuid}
                          className={
                            location.pathname === child.url ? "active-sub" : ""
                          }
                        >
                          <Link
                            to={child.url || "#"}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Search Box */}
          <div className="nav-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* 3. DATE BAR */}
      <div className="date-bar">
        <div className="container date-container">
          <RealTimeClock />
          <div className="hotline">Hotline: 1900 xxxx</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
