import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import {
  FaUserTie,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const SignerManager = () => {
  const [signers, setSigners] = useState([]);
  const [filteredSigners, setFilteredSigners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchSigners();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSigners(signers);
    } else {
      const lower = searchTerm.toLowerCase();
      const results = signers.filter((item) =>
        item.Name?.toLowerCase().includes(lower)
      );
      setFilteredSigners(results);
    }
  }, [searchTerm, signers]);

  const fetchSigners = async () => {
    try {
      const res = await api.get("/dictionaries/signers");
      setSigners(res.data);
      setFilteredSigners(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách người ký!");
    }
  };

  const handleOpenAdd = () => {
    setName("");
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setName(item.Name);
    setEditID(item.SignerID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người ký này?")) {
      try {
        await api.delete(`/dictionaries/signers/${id}`);
        toast.success("Xóa thành công!");
        fetchSigners();
      } catch (err) {
        toast.error("Không thể xóa (đang được sử dụng trong văn bản)!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: name };

      if (isEditing) {
        await api.put(`/dictionaries/signers/${editID}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/dictionaries/signers", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchSigners();
    } catch (err) {
      const msg = err.response?.data?.error || "Lỗi lưu dữ liệu!";
      toast.error(msg);
    }
  };

  return (
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[#334155] text-[13.5px]">
      <div className="bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282] flex justify-between items-center mb-5 w-full box-border">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaUserTie /> QUẢN LÝ NGƯỜI KÝ
        </h2>
        <div className="flex gap-[10px] items-center">
          <div className="relative w-[250px]">
            <FaSearch className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              className="w-full p-[8px_10px_8px_35px] border border-[#ccc] rounded-[6px] outline-none text-[13.5px] focus:border-[#0d6efd]"
              placeholder="Tìm tên người ký..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-[#2c5282] text-white border-none py-[8px] px-[16px] rounded-[6px] font-semibold flex items-center gap-[6px] cursor-pointer hover:bg-[#1e3a8a] transition-colors" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-t-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border border-[#cbd5e1] overflow-hidden w-full box-border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-[80px] text-center bg-[#2c5282] text-white p-[12px_15px] font-semibold uppercase text-[12.5px] border-r border-white/20">STT</th>
                <th className="bg-[#2c5282] text-white p-[12px_15px] text-left font-semibold uppercase text-[12.5px] border-r border-white/20">Họ và Tên người ký</th>
                <th className="w-[120px] text-center bg-[#2c5282] text-white p-[12px_15px] font-semibold uppercase text-[12.5px] border-r border-white/20">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSigners.length > 0 ? (
                filteredSigners.map((item, index) => (
                  <tr key={item.SignerID} className="group hover:bg-[#f1f5f9]">
                    <td className="w-[80px] text-center font-bold text-[#64748b] p-[10px_15px] border-b border-[#cbd5e1] border-r border-[#f1f5f9] align-middle">
                      {index + 1}
                    </td>
                    <td className="font-medium text-[#2c5282] p-[10px_15px] border-b border-[#cbd5e1] border-r border-[#f1f5f9] align-middle">{item.Name}</td>
                    <td className="w-[120px] text-center p-[10px_15px] border-b border-[#cbd5e1] border-r border-[#f1f5f9] align-middle">
                      <div className="flex justify-center gap-[8px]">
                        <button
                          className="w-[30px] h-[30px] border border-[#e2e8f0] bg-white rounded-[4px] cursor-pointer flex items-center justify-center text-[#64748b] transition-all duration-200 hover:bg-[#eff6ff] hover:text-[#0d6efd] hover:border-[#0d6efd]"
                          onClick={() => handleEdit(item)}
                          title="Sửa tên"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="w-[30px] h-[30px] border border-[#e2e8f0] bg-white rounded-[4px] cursor-pointer flex items-center justify-center text-[#64748b] transition-all duration-200 hover:bg-[#fef2f2] hover:text-[#ef4444] hover:border-[#ef4444]"
                          onClick={() => handleDelete(item.SignerID)}
                          title="Xóa người ký"
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
                    Chưa có dữ liệu người ký
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-[12px_20px] bg-white border-t border-[#cbd5e1] text-right italic text-[#64748b]">
          Tổng số: <b>{filteredSigners.length}</b> người ký
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-[80px] z-[999] animate-[fadeIn_0.2s]">
          <div className="bg-white w-[500px] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden animate-[slideIn_0.3s]">
            <div className="bg-[#2c5282] text-white p-[15px_20px] flex justify-between items-center">
              <h3 className="m-0 text-[16px] font-bold uppercase">{isEditing ? "CẬP NHẬT THÔNG TIN" : "THÊM NGƯỜI KÝ MỚI"}</h3>
              <button className="bg-transparent border-none text-white/80 text-[20px] cursor-pointer hover:text-white" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-[25px_30px]">
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">
                    Họ và tên <span className="text-[#ef4444] ml-[3px]">*</span>
                  </label>
                  <input
                    type="text"
                    className="h-[42px] text-[15px] p-[10px_15px] border border-[#cbd5e1] rounded-[4px] w-full outline-none focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ tên người ký (VD: Nguyễn Văn A)..."
                    required
                    autoFocus
                  />
                </div>
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

export default SignerManager;
