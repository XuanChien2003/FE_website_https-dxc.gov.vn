import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaSitemap,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaMinusSquare,
  FaPlusSquare,
  FaFolder,
  FaFolderOpen,
  FaLink,
} from "react-icons/fa";
import "./MenuManager.css";

const MenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  // State mở rộng/thu gọn cây
  const [expandedNodes, setExpandedNodes] = useState({});

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    stt: 0,
    isShow: true,
    parentID: 0,
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMenus(menus);
    } else {
      const lower = searchTerm.toLowerCase();
      // Khi tìm kiếm -> Hiển thị dạng phẳng (List)
      const results = menus.filter((item) =>
        item.Title?.toLowerCase().includes(lower)
      );
      setFilteredMenus(results);
    }
  }, [searchTerm, menus]);

  const fetchMenus = async () => {
    try {
      const res = await api.get("/menus");
      setMenus(res.data);
      setFilteredMenus(res.data);

      // Mặc định mở tất cả node
      const initialExpanded = {};
      res.data.forEach((m) => (initialExpanded[m.MenuID] = true));
      setExpandedNodes(initialExpanded);
    } catch (err) {
      toast.error("Lỗi tải danh sách menu!");
    }
  };

  // --- LOGIC TREE ---
  const buildTree = (menuList) => {
    const tree = [];
    const map = {};
    const data = JSON.parse(JSON.stringify(menuList));

    // Tạo Map
    data.forEach((item) => {
      map[item.MenuID] = { ...item, children: [] };
    });

    // Xếp con vào cha
    data.forEach((item) => {
      if (item.ParentID && item.ParentID !== 0 && map[item.ParentID]) {
        map[item.ParentID].children.push(map[item.MenuID]);
      } else {
        tree.push(map[item.MenuID]);
      }
    });

    // Sắp xếp theo STT
    const sortTree = (nodes) => {
      return nodes
        .sort((a, b) => (a.STT || 0) - (b.STT || 0))
        .map((node) => {
          if (node.children.length > 0) node.children = sortTree(node.children);
          return node;
        });
    };
    return sortTree(tree);
  };

  const toggleNode = (id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const newExpanded = {};
    menus.forEach((m) => (newExpanded[m.MenuID] = true));
    setExpandedNodes(newExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // --- RENDER NODE ---
  const renderTreeNodes = (nodes) => {
    return (
      <ul className="tree-list">
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = !!expandedNodes[node.MenuID];

          return (
            <li key={node.MenuID} className="tree-node">
              <div className="tree-content">
                {/* 1. Toggle Icon */}
                <span
                  className={`toggle-icon ${hasChildren ? "clickable" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasChildren) toggleNode(node.MenuID);
                  }}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <FaMinusSquare className="ico-collapse" />
                    ) : (
                      <FaPlusSquare className="ico-expand" />
                    )
                  ) : (
                    <span className="dot"></span>
                  )}
                </span>

                {/* 2. Icon Folder/Link */}
                <span className="node-icon">
                  {hasChildren || node.ParentID === 0 ? (
                    isExpanded ? (
                      <FaFolderOpen style={{ color: "#f59e0b" }} />
                    ) : (
                      <FaFolder style={{ color: "#f59e0b" }} />
                    )
                  ) : (
                    <FaLink style={{ color: "#64748b" }} />
                  )}
                </span>

                {/* 3. Info */}
                <div className="node-info" onClick={() => handleEdit(node)}>
                  <span className="node-title">{node.Title}</span>
                  {node.Url && <span className="node-url">({node.Url})</span>}
                  {!node.IsShow && <span className="node-hidden">(Ẩn)</span>}
                </div>

                {/* 4. Actions */}
                <div className="node-actions">
                  <button
                    className="btn-icon-mini edit"
                    onClick={() => handleEdit(node)}
                    title="Sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon-mini delete"
                    onClick={() => handleDelete(node.MenuID)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* 5. Children */}
              {hasChildren && isExpanded && (
                <div className="tree-children">
                  {renderTreeNodes(node.children)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // --- FORM HANDLERS ---
  const handleOpenAdd = () => {
    setFormData({ title: "", url: "", stt: 0, isShow: true, parentID: 0 });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.Title,
      url: item.Url,
      stt: item.STT,
      isShow: item.IsShow,
      parentID: item.ParentID || 0,
    });
    setEditID(item.MenuID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa menu này?")) {
      try {
        await api.delete(`/menus/${id}`);
        toast.success("Xóa thành công!");
        fetchMenus();
      } catch (err) {
        toast.error("Lỗi khi xóa (có thể còn menu con)!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (isEditing) {
        await api.put(`/menus/${editID}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/menus", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchMenus();
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu!");
    }
  };

  const treeData = buildTree(menus);

  return (
    <div className="menu-manager">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">
          <FaSitemap /> QUẢN TRỊ MENU HOMEPAGE
        </h2>
        <div className="header-actions">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      {!searchTerm && (
        <div className="tree-toolbar">
          <button className="btn-tool" onClick={collapseAll}>
            <FaMinusSquare /> Đóng tất cả
          </button>
          <button className="btn-tool" onClick={expandAll}>
            <FaPlusSquare /> Mở tất cả
          </button>
        </div>
      )}

      {/* TREE VIEW */}
      <div className="tree-container">
        {menus.length > 0 ? (
          searchTerm ? (
            // LIST PHẲNG (Khi tìm kiếm)
            <ul className="tree-list">
              {filteredMenus.map((node) => (
                <li key={node.MenuID} className="tree-node">
                  <div className="tree-content">
                    <span className="dot"></span>
                    <div className="node-info" onClick={() => handleEdit(node)}>
                      <span className="node-title">{node.Title}</span>
                      <span className="node-url">({node.Url})</span>
                    </div>
                    <div className="node-actions" style={{ display: "flex" }}>
                      <button
                        className="btn-icon-mini edit"
                        onClick={() => handleEdit(node)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon-mini delete"
                        onClick={() => handleDelete(node.MenuID)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            // LIST CÂY (Mặc định)
            renderTreeNodes(treeData)
          )
        ) : (
          <p className="no-data">Chưa có dữ liệu menu</p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "CẬP NHẬT MENU" : "THÊM MENU MỚI"}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Title */}
                <div className="form-group">
                  <label>
                    Tiêu đề Menu <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    autoFocus
                  />
                </div>

                {/* Url & STT */}
                <div style={{ display: "flex", gap: "15px" }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Liên kết (Url)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="/example"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Thứ tự (STT)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.stt}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stt: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Parent & Show */}
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    alignItems: "flex-end",
                  }}
                >
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Menu Cha</label>
                    <select
                      className="form-control"
                      value={formData.parentID}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parentID: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value="0">|-- Menu gốc (Mục to) --</option>

                      {/* FIX: Chỉ hiển thị các menu gốc (ParentID === 0) */}
                      {menus
                        .filter(
                          (m) =>
                            m.MenuID !== editID && // Không chọn chính nó
                            m.ParentID === 0 // Chỉ chọn menu gốc làm cha
                        )
                        .map((m) => (
                          <option key={m.MenuID} value={m.MenuID}>
                            |-- {m.Title}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div
                    className="form-group"
                    style={{ flex: 1, paddingBottom: "10px" }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px" }}
                        checked={formData.isShow}
                        onChange={(e) =>
                          setFormData({ ...formData, isShow: e.target.checked })
                        }
                      />
                      <span>Hiển thị</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Đóng lại
                </button>
                <button type="submit" className="btn-success">
                  <FaSave /> {isEditing ? "Cập nhật" : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
