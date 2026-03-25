import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { toast } from "react-toastify";
import {
  FaImages,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaImage,
} from "react-icons/fa";

const SlideManager = () => {
  const [slides, setSlides] = useState([]);
  const [filteredSlides, setFilteredSlides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  // Form Data khớp với Backend (name, imageLink, description)
  const [formData, setFormData] = useState({
    name: "",
    imageLink: "",
    description: "",
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSlides(slides);
    } else {
      const lower = searchTerm.toLowerCase();
      const results = slides.filter((item) =>
        item.name?.toLowerCase().includes(lower)
      );
      setFilteredSlides(results);
    }
  }, [searchTerm, slides]);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('name');
      if (error) throw error;
      setSlides(data || []);
      setFilteredSlides(data || []);
    } catch (err) {
      toast.error("Lỗi tải danh sách Slide!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setFormData({ name: "", imageLink: "", description: "" });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      imageLink: item.imagelink,
      description: item.description || "",
    });
    setEditID(item.slideid);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa Slide này?")) {
      try {
        const { error } = await supabase
          .from('slides')
          .delete()
          .eq('slideid', id);
        if (error) throw error;
        toast.success("Xóa thành công!");
        fetchSlides();
      } catch (err) {
        toast.error("Lỗi khi xóa Slide!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        imagelink: formData.imageLink,
        description: formData.description,
        modifieddate: new Date().toISOString()
      };
      if (isEditing) {
        const { error } = await supabase
          .from('slides')
          .update(payload)
          .eq('slideid', editID);
        if (error) throw error;
        toast.success("Cập nhật thành công!");
      } else {
        const { error } = await supabase
          .from('slides')
          .insert([payload]);
        if (error) throw error;
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchSlides();
    } catch (err) {
      toast.error(err.message || "Lỗi lưu dữ liệu!");
    }
  };

  return (
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[13.5px] text-[#334155]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-[20px] bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282]">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaImages /> QUẢN TRỊ SLIDE ẢNH
        </h2>
        <div className="flex gap-[12px] items-center">
          <div className="relative">
            <FaSearch className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#888] text-[14px]" />
            <input
              className="p-[8px_12px_8px_35px] border border-[#ccc] rounded-[4px] text-[13.5px] w-[250px] outline-none transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 h-[34px]"
              type="text"
              placeholder="Tìm tên slide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-[#2c5282] text-white border-none py-[8px] px-[18px] h-[34px] rounded-md font-semibold flex items-center gap-[6px] cursor-pointer transition-colors duration-200 hover:bg-[#1e3a8a]" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-t-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden border border-[#cbd5e1] mt-[20px]">
        <div className="w-full overflow-x-auto min-h-[300px]">
          <table className="w-full border-collapse table-fixed min-w-[900px]">
            <thead>
              <tr>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[5%]">STT</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[25%]">Tên Slide</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[20%]">Hình ảnh</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[30%]">Mô tả</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[12%]">Cập nhật cuối</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-transparent leading-[1.3] w-[8%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlides.length > 0 ? (
                filteredSlides.map((item, index) => (
                  <tr key={item.slideid} className="even:bg-[#f8fafc] hover:bg-[#e2e8f0] group">
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] font-semibold text-center">{index + 1}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle text-[13px] font-bold text-[#2c5282]">{item.name}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle text-center overflow-hidden">
                      {item.imagelink ? (
                        <div className="w-[120px] h-[60px] mx-auto border border-[#cbd5e1] rounded-[4px] overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                          <img
                            src={item.imagelink}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="italic text-[#999] text-[12px]">No Image</span>
                      )}
                    </td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] leading-[1.4]">{item.description}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle text-[12.5px] text-center">{formatDate(item.modifieddate)}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle text-center">
                      <div className="flex justify-center gap-[4px]">
                        <button
                          className="w-[26px] h-[26px] rounded-[4px] border border-[#cbd5e1] bg-white text-[#64748b] cursor-pointer flex items-center justify-center transition-all hover:-translate-y-[1px] hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#eff6ff]"
                          onClick={() => handleEdit(item)}
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="w-[26px] h-[26px] rounded-[4px] border border-[#cbd5e1] bg-white text-[#64748b] cursor-pointer flex items-center justify-center transition-all hover:-translate-y-[1px] hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                          onClick={() => handleDelete(item.slideid)}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-[30px] text-[#999] border border-[#cbd5e1]">
                    Chưa có slide nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-[12px_20px] border-t border-[#cbd5e1] bg-white flex justify-between items-center rounded-b-lg">
          <div className="text-[#334155]">
            Tổng số: <b className="text-[#2c5282]">{filteredSlides.length}</b> slide
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center pt-[80px] z-[999]">
          <div className="bg-white w-[600px] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden h-fit">
            <div className="bg-[#2c5282] text-white p-[15px_20px] flex justify-between items-center">
              <h3 className="m-0 text-[16px] font-bold uppercase">{isEditing ? "CẬP NHẬT SLIDE" : "THÊM SLIDE MỚI"}</h3>
              <button className="bg-transparent border-none text-white/80 text-[20px] cursor-pointer hover:text-white" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-[25px_30px]">
                {/* Tên Slide */}
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">
                    Tên Slide <span className="text-[#ef4444] ml-[3px]">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    autoFocus
                    placeholder="Ví dụ: Banner Chào mừng..."
                  />
                </div>

                {/* Link Ảnh */}
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">
                    Link Hình Ảnh (URL) <span className="text-[#ef4444] ml-[3px]">*</span>
                  </label>
                  <div className="relative w-full">
                    <FaImage className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] z-10" />
                    <input
                      type="text"
                      className="w-full pl-[36px] pr-[12px] py-[8px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15"
                      value={formData.imageLink}
                      onChange={(e) =>
                        setFormData({ ...formData, imageLink: e.target.value })
                      }
                      required
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Preview Ảnh */}
                  <div className="mt-[10px] w-full h-[200px] bg-[#f1f5f9] border-[2px] border-dashed border-[#cbd5e1] rounded-[6px] flex flex-col items-center justify-center overflow-hidden relative">
                    {formData.imageLink ? (
                      <>
                        <img
                          src={formData.imageLink}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/400x200?text=Lỗi+Link+Ảnh";
                          }}
                        />
                        <button
                          type="button"
                          className="absolute top-[10px] right-[10px] bg-black/60 text-white border-none rounded-full w-[30px] h-[30px] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#ef4444]"
                          onClick={() =>
                            setFormData({ ...formData, imageLink: "" })
                          }
                          title="Xóa ảnh"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-[5px] text-[#94a3b8]">
                        <FaImage size={40} />
                        <span>Xem trước ảnh tại đây</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mô tả */}
                <div className="mb-[10px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">Mô tả / Ghi chú</label>
                  <textarea
                    className="w-full p-[10px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15 resize-y"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả ngắn gọn về slide này..."
                  ></textarea>
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

export default SlideManager;
