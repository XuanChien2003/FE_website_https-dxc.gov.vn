import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaTags,
  FaMinusSquare,
  FaPlusSquare,
  FaFolder,
  FaFolderOpen,
  FaSearch,
} from "react-icons/fa";
import "./CategoryManager.css";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCats, setFilteredCats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  // State quản lý danh sách các node đang MỞ (Key là CategoryID, Value là true/false)
  const [expandedNodes, setExpandedNodes] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    stt: 0,
    parentID: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCats(categories);
    } else {
      const lower = searchTerm.toLowerCase();
      // Khi tìm kiếm -> Lọc phẳng (Flat list) để dễ nhìn
      const results = categories.filter((item) =>
        item.Title?.toLowerCase().includes(lower)
      );
      setFilteredCats(results);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      setFilteredCats(res.data);

      // Mặc định: MỞ TẤT CẢ khi mới tải trang (để người dùng thấy hết)
      const initialExpanded = {};
      res.data.forEach((c) => (initialExpanded[c.CategoryID] = true));
      setExpandedNodes(initialExpanded);
    } catch (err) {
      toast.error("Lỗi tải danh sách chuyên mục!");
    }
  };

  // --- LOGIC CÂY (TREE) ---
  const buildTree = (cats) => {
    const tree = [];
    const map = {};
    // Clone dữ liệu để tránh lỗi tham chiếu
    const data = JSON.parse(JSON.stringify(cats));

    // Tạo Map
    data.forEach((cat) => {
      map[cat.CategoryID] = { ...cat, children: [] };
    });

    // Xếp con vào cha
    data.forEach((cat) => {
      // Kiểm tra ParentID hợp lệ và tồn tại trong map
      if (cat.ParentID && cat.ParentID !== 0 && map[cat.ParentID]) {
        map[cat.ParentID].children.push(map[cat.CategoryID]);
      } else {
        // Nếu không có cha hoặc cha không tồn tại -> Là gốc
        tree.push(map[cat.CategoryID]);
      }
    });

    // Hàm sắp xếp đệ quy theo STT
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

  // --- HÀM TOGGLE (QUAN TRỌNG: FIX LỖI CLICK) ---
  const toggleNode = (id) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const newExpanded = {};
    categories.forEach((c) => (newExpanded[c.CategoryID] = true));
    setExpandedNodes(newExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // --- RENDER NODE (ĐỆ QUY) ---
  const renderTreeNodes = (nodes) => {
    return (
      <ul className="tree-list">
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = !!expandedNodes[node.CategoryID];

          return (
            <li key={node.CategoryID} className="tree-node">
              <div className="tree-content">
                {/* 1. Icon Đóng/Mở (+/-) */}
                <span
                  className={`toggle-icon ${
                    hasChildren ? "clickable" : "spacer"
                  }`}
                  onClick={(e) => {
                    // Ngăn sự kiện nổi bọt để tránh click nhầm vào dòng
                    e.stopPropagation();
                    if (hasChildren) toggleNode(node.CategoryID);
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

                {/* 2. Icon Folder */}
                <span className="node-icon">
                  {hasChildren ? (
                    isExpanded ? (
                      <FaFolderOpen style={{ color: "#f59e0b" }} />
                    ) : (
                      <FaFolder style={{ color: "#f59e0b" }} />
                    )
                  ) : (
                    <FaTags style={{ color: "#64748b" }} />
                  )}
                </span>

                {/* 3. Tên & STT */}
                <span className="node-title" onClick={() => handleEdit(node)}>
                  {node.Title}
                  {node.STT > 0 && (
                    <span className="node-stt"> (STT: {node.STT})</span>
                  )}
                </span>

                {/* 4. Actions Hover */}
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
                    onClick={() => handleDelete(node.CategoryID)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* 5. Render Con (Chỉ hiện khi cha đang mở) */}
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

  // --- XỬ LÝ FORM ---
  const handleOpenAdd = () => {
    setFormData({ title: "", stt: 0, parentID: 0 });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.Title,
      stt: item.STT,
      parentID: item.ParentID || 0,
    });
    setEditID(item.CategoryID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa chuyên mục này?")) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success("Xóa thành công!");
        fetchCategories();
      } catch (err) {
        toast.error("Không thể xóa (có thể đang chứa chuyên mục con)!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (isEditing) {
        await api.put(`/categories/${editID}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/categories", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu!");
    }
  };

  const treeData = buildTree(categories);

  return (
    <div className="category-manager">
      {/* HEADER MÀU XANH CHUẨN */}
      <div className="page-header">
        <h2 className="page-title">
          <FaTags /> QUẢN TRỊ CHUYÊN MỤC
        </h2>
        <div className="header-actions">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
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
        {categories.length > 0 ? (
          searchTerm ? (
            // List phẳng khi search
            <ul className="tree-list">
              {filteredCats.map((node) => (
                <li key={node.CategoryID} className="tree-node">
                  <div className="tree-content">
                    <span className="dot"></span>
                    <span className="node-title">{node.Title}</span>
                    <div className="node-actions" style={{ display: "flex" }}>
                      <button
                        className="btn-icon-mini edit"
                        onClick={() => handleEdit(node)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon-mini delete"
                        onClick={() => handleDelete(node.CategoryID)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            renderTreeNodes(treeData)
          )
        ) : (
          <p className="no-data">Chưa có dữ liệu chuyên mục</p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "CẬP NHẬT CHUYÊN MỤC" : "THÊM CHUYÊN MỤC"}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Tên chuyên mục <span className="req">*</span>
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
                <div className="form-group">
                  <label>STT (Thứ tự)</label>
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
                <div className="form-group">
                  <label>Chuyên mục cha</label>
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
                    <option value="0">|-- Chuyên mục gốc --</option>
                    {categories
                      .filter((c) => c.CategoryID !== editID)
                      .map((c) => (
                        <option key={c.CategoryID} value={c.CategoryID}>
                          |-- {c.Title}
                        </option>
                      ))}
                  </select>
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

export default CategoryManager;
