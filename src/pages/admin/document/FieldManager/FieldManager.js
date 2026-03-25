import React, { useEffect, useState } from "react";
import { supabase } from "../../../../supabaseClient";
import { toast } from "react-toastify";
import {
  FaLayerGroup,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaFilter,
  FaTag,
} from "react-icons/fa";

const FieldManager = () => {
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);

  const [showSearch, setShowSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  const [searchParams, setSearchParams] = useState({
    keyword: "",
    scope: "all",
  });

  const [formData, setFormData] = useState({ name: "", code: "" });

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    let results = fields;
    if (searchParams.keyword) {
      const term = searchParams.keyword.toLowerCase();
      const scope = searchParams.scope;
      results = results.filter((item) => {
        const idStr = item.fieldid ? item.fieldid.toString() : "";
        const nameStr = item.name ? item.name.toLowerCase() : "";

        if (scope === "all")
          return idStr.includes(term) || nameStr.includes(term);
        if (scope === "id") return idStr.includes(term);
        if (scope === "name") return nameStr.includes(term);
        return true;
      });
    }
    setFilteredFields(results);
  }, [searchParams, fields]);

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .order('name');
      if (error) throw error;
      setFields(data || []);
      setFilteredFields(data || []);
    } catch (err) {
      toast.error("Lỗi tải danh sách lĩnh vực!");
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", code: "" });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, code: item.code });
    setEditID(item.fieldid);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa lĩnh vực này?")) {
      try {
        const { error } = await supabase
          .from('fields')
          .delete()
          .eq('fieldid', id);
        if (error) throw error;
        toast.success("Xóa thành công!");
        fetchFields();
      } catch (err) {
        toast.error("Không thể xóa (dữ liệu đang được sử dụng)!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: isEditing ? formData.code : "",
      };

      if (isEditing) {
        const { error } = await supabase
          .from('fields')
          .update(payload)
          .eq('fieldid', editID);
        if (error) throw error;
        toast.success("Cập nhật thành công!");
      } else {
        const { error } = await supabase
          .from('fields')
          .insert([payload]);
        if (error) throw error;
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchFields();
    } catch (err) {
      toast.error(err.message || "Lỗi lưu dữ liệu!");
    }
  };

  return (
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[#334155] text-[13.5px] flex flex-col gap-[1px]">
      {/* HEADER */}
      <div className="bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282] flex justify-between items-center mb-0 w-full box-border">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaLayerGroup /> QUẢN LÝ LĨNH VỰC
        </h2>
        <div className="flex gap-[10px] items-center">
          <button
            className={`bg-white border text-[#2c5282] py-[8px] px-[16px] rounded-md font-semibold flex items-center gap-[8px] cursor-pointer transition-all duration-200 hover:bg-[#eff6ff] hover:border-[#2c5282] ${showSearch ? 'bg-[#eff6ff] border-[#2c5282]' : 'border-[#cbd5e1]'}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <FaTimes /> : <FaFilter />}{" "}
            {showSearch ? "Đóng bộ lọc" : "Tìm kiếm"}
          </button>
          <button className="bg-[#2c5282] text-white border-none py-[9px] px-[18px] rounded-md font-semibold flex items-center gap-[8px] cursor-pointer transition-colors duration-200 hover:bg-[#1e3a8a]" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* SEARCH PANEL */}
      <div className={`overflow-hidden transition-all duration-300 opacity-0 max-h-0 mb-0 ${showSearch ? 'max-h-[200px] opacity-100 mb-0' : ''}`}>
        <div className="bg-white p-[20px] rounded-lg border border-[#cbd5e1] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-[15px]">
            <div className="flex flex-col flex-[2]">
              <div className="relative w-full">
                <FaSearch className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px]" />
                <input
                  type="text"
                  className="w-full py-[9px] px-[12px] pl-[36px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] transition-all duration-200 focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                  name="keyword"
                  placeholder="Nhập từ khóa (Tên hoặc ID)..."
                  value={searchParams.keyword}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="relative w-full">
                <FaTag className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px]" />
                <select
                  className="w-full py-[9px] px-[12px] pl-[36px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] transition-all duration-200 focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                  name="scope"
                  value={searchParams.scope}
                  onChange={handleSearchChange}
                >
                  <option value="all">Tất cả</option>
                  <option value="name">Tên lĩnh vực</option>
                  <option value="id">ID</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border border-[#cbd5e1] overflow-hidden w-full box-border mt-[20px]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="w-[80px] text-center bg-[#2c5282] text-white p-[12px_15px] font-semibold uppercase text-[12.5px] border-r border-white/20">ID</th>
                <th className="bg-[#2c5282] text-white p-[12px_15px] text-left font-semibold uppercase text-[12.5px] border-r border-white/20">Tên Lĩnh Vực</th>
                <th className="w-[120px] text-center bg-[#2c5282] text-white p-[12px_15px] font-semibold uppercase text-[12.5px] border-r border-white/20">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredFields.length > 0 ? (
                filteredFields.map((item) => (
                  <tr key={item.fieldid} className="group even:bg-[#f8fafc] hover:bg-[#eff6ff]">
                    <td className="w-[80px] text-center font-bold text-[#2c5282] p-[10px_15px] border-b border-[#cbd5e1] border-r border-[#f1f5f9] align-middle">
                      {item.fieldid}
                    </td>
                    <td className="font-medium p-[10px_15px] border-b border-[#cbd5e1] border-r border-[#f1f5f9] align-middle">{item.name}</td>
                    <td className="w-[120px] text-center p-[10px_15px] border-b border-[#cbd5e1] border-r border-[#f1f5f9] align-middle">
                      <div className="flex justify-center gap-[8px]">
                        <button
                          className="w-[30px] h-[30px] border border-[#cbd5e1] bg-white rounded-[4px] cursor-pointer flex items-center justify-center text-[#64748b] transition-all duration-200 hover:bg-[#eff6ff] hover:text-[#0d6efd] hover:border-[#0d6efd]"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="w-[30px] h-[30px] border border-[#cbd5e1] bg-white rounded-[4px] cursor-pointer flex items-center justify-center text-[#64748b] transition-all duration-200 hover:bg-[#fef2f2] hover:text-[#ef4444] hover:border-[#ef4444]"
                          onClick={() => handleDelete(item.fieldid)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-[20px] text-[#999] italic border-b border-[#cbd5e1]">
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-[12px_20px] bg-white border-t border-[#cbd5e1] text-right italic text-[#64748b]">
          Tổng số: <b>{filteredFields.length}</b> lĩnh vực
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-[80px] z-[999] animate-[fadeIn_0.2s]">
          <div className="bg-white w-[600px] max-w-[95%] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden animate-[slideIn_0.3s]">
            <div className="bg-[#2c5282] text-white p-[15px_20px] flex justify-between items-center">
              <h3 className="m-0 text-[16px] font-bold uppercase">{isEditing ? "CẬP NHẬT LĨNH VỰC" : "THÊM LĨNH VỰC MỚI"}</h3>
              <button className="bg-transparent border-none text-white/80 text-[20px] cursor-pointer hover:text-white" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-[25px_30px]">
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">
                    Tên lĩnh vực <span className="text-[#ef4444] ml-[3px]">*</span>
                  </label>
                  <input
                    type="text"
                    className="h-[42px] text-[15px] p-[10px_15px] border border-[#cbd5e1] rounded-[4px] w-full outline-none focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên lĩnh vực..."
                    required
                    autoFocus
                  />
                </div>

                {isEditing && (
                  <div className="mb-[20px]">
                    <label className="block font-semibold mb-[8px] text-[#334155]">Mã lĩnh vực (Code)</label>
                    <input
                      type="text"
                      className="h-[42px] text-[15px] p-[10px_15px] border border-[#cbd5e1] rounded-[4px] w-full outline-none focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="Mã hệ thống..."
                    />
                  </div>
                )}
              </div>
              <div className="p-[15px_30px] bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-[10px]">
                <button
                  type="button"
                  className="bg-[#64748b] text-white p-[8px_20px] rounded-[4px] border-none font-semibold cursor-pointer flex items-center gap-[6px] hover:bg-[#475569]"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes /> Đóng
                </button>
                <button type="submit" className="bg-[#15803d] text-white p-[8px_20px] rounded-[4px] border-none font-semibold cursor-pointer flex items-center gap-[6px] hover:bg-[#166534]">
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

export default FieldManager;
