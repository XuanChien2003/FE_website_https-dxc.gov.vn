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
      <ul className="list-none p-0 m-0">
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = !!expandedNodes[node.CategoryID];

          return (
            <li key={node.CategoryID} className="mb-[2px] relative">
              <div className="flex items-center p-[6px_5px] rounded-[4px] transition-colors duration-100 cursor-default hover:bg-[#f1f5f9] group/item">
                {/* 1. Icon Đóng/Mở (+/-) */}
                <span
                  className={`flex items-center justify-center w-[24px] h-[24px] rounded-[3px] mr-[5px] text-[#64748b] text-[14px] ${
                    hasChildren ? "cursor-pointer hover:bg-[#e2e8f0] hover:text-[#2c5282]" : ""
                  }`}
                  onClick={(e) => {
                    // Ngăn sự kiện nổi bọt để tránh click nhầm vào dòng
                    e.stopPropagation();
                    if (hasChildren) toggleNode(node.CategoryID);
                  }}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <FaMinusSquare className="text-[#64748b]" />
                    ) : (
                      <FaPlusSquare className="text-[#2c5282]" />
                    )
                  ) : (
                    <span className="w-[6px] h-[6px] bg-[#cbd5e1] rounded-full"></span>
                  )}
                </span>

                {/* 2. Icon Folder */}
                <span className="flex items-center mr-[8px] text-[18px]">
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
                <span className="flex-1 font-medium text-[#333] cursor-pointer select-none hover:text-[#0d6efd]" onClick={() => handleEdit(node)}>
                  {node.Title}
                  {node.STT > 0 && (
                    <span className="text-[11px] text-[#999] ml-[8px] font-normal italic"> (STT: {node.STT})</span>
                  )}
                </span>

                {/* 4. Actions Hover */}
                <div className="hidden gap-[5px] ml-[10px] group-hover/item:flex">
                  <button
                    className="w-[26px] h-[26px] border border-[#ddd] bg-white rounded-[3px] cursor-pointer flex items-center justify-center text-[#555] text-[12px] hover:bg-[#eff6ff] hover:text-[#0d6efd] hover:border-[#0d6efd]"
                    onClick={() => handleEdit(node)}
                    title="Sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="w-[26px] h-[26px] border border-[#ddd] bg-white rounded-[3px] cursor-pointer flex items-center justify-center text-[#555] text-[12px] hover:bg-[#fef2f2] hover:text-[#ef4444] hover:border-[#ef4444]"
                    onClick={() => handleDelete(node.CategoryID)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* 5. Render Con (Chỉ hiện khi cha đang mở) */}
              {hasChildren && isExpanded && (
                <div className="pl-[27px] border-l border-dotted border-[#ccc] ml-[9px]">
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
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[#334155] text-[14px] flex flex-col gap-[15px]">
      {/* HEADER MÀU XANH CHUẨN */}
      <div className="flex justify-between items-center bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282]">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaTags /> QUẢN TRỊ CHUYÊN MỤC
        </h2>
        <div className="flex gap-[10px]">
          <div className="relative">
            <FaSearch className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              className="p-[0_10px_0_35px] border border-[#ccc] rounded-[4px] text-[13px] w-[250px] h-[36px] outline-none"
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-[#2c5282] text-white border-none px-[16px] rounded-[4px] font-semibold cursor-pointer h-[36px] flex items-center gap-[6px] transition-all duration-200 hover:bg-[#1e3a8a]" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      {!searchTerm && (
        <div className="bg-white p-[10px_15px] border border-[#cbd5e1] border-b-0 rounded-t-lg flex gap-[10px]">
          <button className="bg-[#f1f5f9] border border-[#cbd5e1] text-[#334155] p-[5px_12px] rounded-[4px] cursor-pointer font-semibold text-[13px] flex items-center gap-[6px] transition-all duration-200 hover:bg-[#e2e8f0] hover:text-[#2c5282]" onClick={collapseAll}>
            <FaMinusSquare /> Đóng tất cả
          </button>
          <button className="bg-[#f1f5f9] border border-[#cbd5e1] text-[#334155] p-[5px_12px] rounded-[4px] cursor-pointer font-semibold text-[13px] flex items-center gap-[6px] transition-all duration-200 hover:bg-[#e2e8f0] hover:text-[#2c5282]" onClick={expandAll}>
            <FaPlusSquare /> Mở tất cả
          </button>
        </div>
      )}

      {/* TREE VIEW */}
      <div className={`bg-white border border-[#cbd5e1] p-[20px] min-h-[400px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] ${searchTerm ? 'rounded-lg' : 'rounded-b-lg'}`}>
        {categories.length > 0 ? (
          searchTerm ? (
            // List phẳng khi search
            <ul className="list-none p-0 m-0">
              {filteredCats.map((node) => (
                <li key={node.CategoryID} className="mb-[2px] relative">
                  <div className="flex items-center p-[6px_5px] rounded-[4px] transition-colors duration-100 cursor-default hover:bg-[#f1f5f9] group/item">
                    <span className="w-[6px] h-[6px] bg-[#cbd5e1] rounded-full mx-[9px]"></span>
                    <span className="flex-1 font-medium text-[#333] cursor-pointer select-none hover:text-[#0d6efd]">{node.Title}</span>
                    <div className="hidden gap-[5px] ml-[10px] group-hover/item:flex">
                      <button
                        className="w-[26px] h-[26px] border border-[#ddd] bg-white rounded-[3px] cursor-pointer flex items-center justify-center text-[#555] text-[12px] hover:bg-[#eff6ff] hover:text-[#0d6efd] hover:border-[#0d6efd]"
                        onClick={() => handleEdit(node)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="w-[26px] h-[26px] border border-[#ddd] bg-white rounded-[3px] cursor-pointer flex items-center justify-center text-[#555] text-[12px] hover:bg-[#fef2f2] hover:text-[#ef4444] hover:border-[#ef4444]"
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
          <p className="text-center text-[#999] p-[20px] italic">Chưa có dữ liệu chuyên mục</p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center pt-[80px] z-[999]">
          <div className="bg-white w-[500px] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden h-fit">
            <div className="bg-[#2c5282] text-white p-[15px_20px] flex justify-between items-center">
              <h3 className="m-0 text-[16px] font-bold uppercase">{isEditing ? "CẬP NHẬT CHUYÊN MỤC" : "THÊM CHUYÊN MỤC"}</h3>
              <button className="bg-transparent border-none text-white/80 text-[20px] cursor-pointer hover:text-white" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-[25px_30px]">
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">
                    Tên chuyên mục <span className="text-[#ef4444]">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">STT (Thứ tự)</label>
                  <input
                    type="number"
                    className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                    value={formData.stt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stt: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">Chuyên mục cha</label>
                  <select
                    className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
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
              <div className="p-[15px_30px] bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-[10px]">
                <button
                  type="button"
                  className="bg-[#64748b] text-white border-none p-[8px_20px] rounded-[4px] cursor-pointer font-semibold hover:bg-[#475569]"
                  onClick={() => setShowModal(false)}
                >
                  Đóng lại
                </button>
                <button type="submit" className="bg-[#15803d] flex items-center gap-[6px] text-white border-none p-[8px_20px] rounded-[4px] cursor-pointer font-semibold hover:bg-[#166534]">
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
