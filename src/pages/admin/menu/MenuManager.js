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
      <ul className="list-none p-0 m-0">
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = !!expandedNodes[node.MenuID];

          return (
            <li key={node.MenuID} className="mb-[2px] relative">
              <div className="flex items-center p-[6px_5px] rounded-[4px] transition-colors duration-100 cursor-default hover:bg-[#f1f5f9] group/item">
                {/* 1. Toggle Icon */}
                <span
                  className={`flex items-center justify-center w-[24px] h-[24px] rounded-[3px] mr-[5px] text-[#64748b] text-[14px] ${hasChildren ? "cursor-pointer hover:bg-[#e2e8f0] hover:text-[#2c5282]" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasChildren) toggleNode(node.MenuID);
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

                {/* 2. Icon Folder/Link */}
                <span className="flex items-center mr-[8px] text-[16px]">
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
                <div className="flex-1 flex items-center gap-[10px] cursor-pointer select-none" onClick={() => handleEdit(node)}>
                  <span className="font-semibold text-[#333]">{node.Title}</span>
                  {node.Url && <span className="text-[12px] text-[#64748b] italic">({node.Url})</span>}
                  {!node.IsShow && <span className="text-[#ef4444] text-[12px] font-semibold">(Ẩn)</span>}
                </div>

                {/* 4. Actions */}
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
                    onClick={() => handleDelete(node.MenuID)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* 5. Children */}
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
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[#334155] text-[14px] flex flex-col gap-[15px]">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282]">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaSitemap /> QUẢN TRỊ MENU HOMEPAGE
        </h2>
        <div className="flex gap-[10px]">
          <div className="relative">
            <FaSearch className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              className="p-[0_10px_0_35px] border border-[#ccc] rounded-[4px] text-[13px] w-[250px] h-[36px] outline-none"
              type="text"
              placeholder="Tìm kiếm menu..."
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
        {menus.length > 0 ? (
          searchTerm ? (
            // LIST PHẲNG (Khi tìm kiếm)
            <ul className="list-none p-0 m-0">
              {filteredMenus.map((node) => (
                <li key={node.MenuID} className="mb-[2px] relative">
                  <div className="flex items-center p-[6px_5px] rounded-[4px] transition-colors duration-100 cursor-default hover:bg-[#f1f5f9] group/item">
                    <span className="w-[6px] h-[6px] bg-[#cbd5e1] rounded-full mx-[9px]"></span>
                    <div className="flex-1 flex items-center gap-[10px] cursor-pointer select-none" onClick={() => handleEdit(node)}>
                      <span className="font-semibold text-[#333]">{node.Title}</span>
                      <span className="text-[12px] text-[#64748b] italic">({node.Url})</span>
                    </div>
                    <div className="hidden gap-[5px] ml-[10px] group-hover/item:flex">
                      <button
                        className="w-[26px] h-[26px] border border-[#ddd] bg-white rounded-[3px] cursor-pointer flex items-center justify-center text-[#555] text-[12px] hover:bg-[#eff6ff] hover:text-[#0d6efd] hover:border-[#0d6efd]"
                        onClick={() => handleEdit(node)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="w-[26px] h-[26px] border border-[#ddd] bg-white rounded-[3px] cursor-pointer flex items-center justify-center text-[#555] text-[12px] hover:bg-[#fef2f2] hover:text-[#ef4444] hover:border-[#ef4444]"
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
          <p className="text-center text-[#999] p-[20px] italic">Chưa có dữ liệu menu</p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center pt-[80px] z-[999]">
          <div className="bg-white w-[500px] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#2c5282] text-white p-[15px_20px] flex justify-between items-center">
              <h3 className="m-0 text-[16px] font-bold uppercase">{isEditing ? "CẬP NHẬT MENU" : "THÊM MENU MỚI"}</h3>
              <button className="bg-transparent border-none text-white/80 text-[20px] cursor-pointer hover:text-white" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-[25px_30px]">
                {/* Title */}
                <div className="mb-[20px] flex-1">
                  <label className="block font-semibold mb-[8px] text-[#334155]">
                    Tiêu đề Menu <span className="text-[#ef4444]">*</span>
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

                {/* Url & STT */}
                <div className="flex gap-[15px]">
                  <div className="mb-[20px] flex-[2]">
                    <label className="block font-semibold mb-[8px] text-[#334155]">Liên kết (Url)</label>
                    <input
                      type="text"
                      className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="/example"
                    />
                  </div>
                  <div className="mb-[20px] flex-1">
                    <label className="block font-semibold mb-[8px] text-[#334155]">Thứ tự (STT)</label>
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
                </div>

                {/* Parent & Show */}
                <div className="flex gap-[15px] items-end">
                  <div className="mb-[20px] flex-[2]">
                    <label className="block font-semibold mb-[8px] text-[#334155]">Menu Cha</label>
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
                  <div className="mb-[20px] pb-[10px] flex-1">
                    <label className="flex items-center gap-[8px] cursor-pointer text-[#334155] font-semibold">
                      <input
                        type="checkbox"
                        className="w-[18px] h-[18px]"
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

              <div className="p-[15px_30px] bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-[10px]">
                <button
                  type="button"
                  className="bg-[#64748b] text-white border-none p-[8px_20px] rounded-[4px] cursor-pointer font-semibold hover:bg-[#475569]"
                  onClick={() => setShowModal(false)}
                >
                  Đóng lại
                </button>
                <button type="submit" className="flex items-center gap-[6px] bg-[#15803d] text-white border-none p-[8px_20px] rounded-[4px] cursor-pointer font-semibold hover:bg-[#166534]">
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
