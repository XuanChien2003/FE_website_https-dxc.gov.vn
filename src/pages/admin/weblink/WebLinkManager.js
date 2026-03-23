import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaLink,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaGlobe,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const WebLinkManager = () => {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editID, setEditID] = useState(null);

  // Form Data (Giữ nguyên camelCase để gửi lên API)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    imageLink: "",
    description: "",
    stt: 0,
    isShow: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLinks(links);
    } else {
      const lower = searchTerm.toLowerCase();
      const results = links.filter(
        (item) =>
          // FIX: Dùng item.Name và item.Url (khớp với DB)
          (item.Name && item.Name.toLowerCase().includes(lower)) ||
          (item.Url && item.Url.toLowerCase().includes(lower)),
      );
      setFilteredLinks(results);
    }
  }, [searchTerm, links]);

  const fetchLinks = async () => {
    try {
      const res = await api.get("/weblinks");
      // API trả về mảng các object có key viết hoa: LinkID, Name, Url...
      setLinks(res.data);
      setFilteredLinks(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách liên kết!");
    }
  };

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      url: "",
      imageLink: "",
      description: "",
      stt: 0,
      isShow: true,
    });
    setIsEditing(false);
    setEditID(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    // FIX: Map dữ liệu từ DB (Viết hoa) sang Form (Viết thường)
    setFormData({
      name: item.Name,
      url: item.Url,
      imageLink: item.ImageLink,
      description: item.Description,
      stt: item.STT,
      isShow: item.IsShow,
    });
    // FIX: Dùng LinkID để sửa
    setEditID(item.LinkID);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa liên kết này?")) {
      try {
        await api.delete(`/weblinks/${id}`);
        toast.success("Xóa thành công!");
        fetchLinks();
      } catch (err) {
        toast.error("Lỗi khi xóa!");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, stt: parseInt(formData.stt) || 0 };
      if (isEditing) {
        await api.put(`/weblinks/${editID}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/weblinks", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchLinks();
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu!");
    }
  };

  return (
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[13.5px] text-[#334155]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-[20px] bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282]">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaLink /> QUẢN TRỊ LIÊN KẾT WEB
        </h2>
        <div className="flex gap-[12px] items-center">
          <div className="relative">
            <FaSearch className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#888] text-[14px]" />
            <input
              className="p-[8px_12px_8px_35px] border border-[#ccc] rounded-[4px] text-[13.5px] w-[250px] outline-none transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 h-[34px]"
              type="text"
              placeholder="Tìm tên hoặc url..."
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
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[8%]">Logo</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[25%]">Tên Website / Liên kết</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[25%]">Đường dẫn (URL)</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[20%]">Mô tả</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[9%]">Hiển thị</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-transparent leading-[1.3] w-[8%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.length > 0 ? (
                filteredLinks.map((item) => (
                  <tr key={item.LinkID} className="even:bg-[#f8fafc] hover:bg-[#e2e8f0] group">
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] font-semibold text-center">{item.STT}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle text-center overflow-hidden">
                      {item.ImageLink ? (
                        <div className="w-[40px] h-[40px] mx-auto bg-white border border-[#ddd] rounded-[4px] p-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center">
                          <img
                            src={item.ImageLink}
                            alt="logo"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40?text=Logo";
                            }}
                          />
                        </div>
                      ) : (
                        <FaGlobe size={24} className="text-[#ccc] mx-auto" />
                      )}
                    </td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] font-bold text-[#2c5282]">{item.Name}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words">
                      <a
                        href={item.Url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0d6efd] no-underline hover:underline text-[13px]"
                      >
                        {item.Url}
                      </a>
                    </td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] leading-[1.4]">{item.Description}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle text-center">
                      {item.IsShow ? (
                        <FaCheckCircle className="text-green-600 mx-auto text-[16px]" />
                      ) : (
                        <FaTimesCircle className="text-[#ccc] mx-auto text-[16px]" />
                      )}
                    </td>
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
                          onClick={() => handleDelete(item.LinkID)}
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
                  <td colSpan="7" className="text-center p-[30px] text-[#999] border border-[#cbd5e1]">
                    Chưa có liên kết nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-[12px_20px] border-t border-[#cbd5e1] bg-white flex justify-between items-center rounded-b-lg">
          <div className="text-[#334155]">
            Tổng số: <b className="text-[#2c5282]">{filteredLinks.length}</b> liên kết
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center pt-[80px] z-[999]">
          <div className="bg-white w-[600px] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden h-fit">
            <div className="bg-[#2c5282] text-white p-[15px_20px] flex justify-between items-center">
              <h3 className="m-0 text-[16px] font-bold uppercase">{isEditing ? "CẬP NHẬT LIÊN KẾT" : "THÊM LIÊN KẾT MỚI"}</h3>
              <button className="bg-transparent border-none text-white/80 text-[20px] cursor-pointer hover:text-white transition-colors" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-[25px_30px]">
                {/* Tên & STT */}
                <div className="flex gap-[15px] mb-[20px]">
                  <div className="flex-[3]">
                    <label className="block font-semibold mb-[8px] text-[#334155]">
                      Tên Website <span className="text-[#ef4444] ml-[3px]">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] transition-all"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      autoFocus
                      placeholder="VD: Cổng Dịch vụ công Quốc gia"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold mb-[8px] text-[#334155]">Thứ tự</label>
                    <input
                      type="number"
                      className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] transition-all"
                      value={formData.stt}
                      onChange={(e) =>
                        setFormData({ ...formData, stt: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* URL */}
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">
                    Đường dẫn (URL) <span className="text-[#ef4444] ml-[3px]">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] transition-all"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    required
                    placeholder="https://..."
                  />
                </div>

                {/* Logo Link & Preview */}
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">Link Logo (Icon)</label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      className="w-full p-[8px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none h-[40px] focus:border-[#2c5282] focus:ring-[3px] focus:ring-[rgba(44,82,130,0.15)] transition-all"
                      value={formData.imageLink}
                      onChange={(e) =>
                        setFormData({ ...formData, imageLink: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  {formData.imageLink && (
                    <div className="mt-[10px] w-full h-[120px] bg-[#f1f5f9] border border-dashed border-[#cbd5e1] rounded-[4px] flex items-center justify-center relative p-[10px]">
                      <img
                        src={formData.imageLink}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/100x50?text=Error")
                        }
                      />
                      <button
                        type="button"
                        className="absolute top-[5px] right-[5px] w-[24px] h-[24px] bg-black/60 text-white border-none rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ef4444] transition-colors"
                        onClick={() =>
                          setFormData({ ...formData, imageLink: "" })
                        }
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mô tả */}
                <div className="mb-[20px]">
                  <label className="block font-semibold mb-[8px] text-[#334155]">Mô tả</label>
                  <textarea
                    className="w-full p-[10px_12px] border border-[#cbd5e1] rounded-[4px] text-[14px] outline-none focus:border-[#2c5282] focus:ring-[3px] focus:ring-[#2c5282]/15 resize-y transition-all"
                    rows="2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả ngắn gọn..."
                  ></textarea>
                </div>

                {/* Checkbox Hiển thị */}
                <div className="mb-[10px]">
                  <label className="flex items-center gap-[8px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-[18px] h-[18px] cursor-pointer accent-[#2c5282]"
                      checked={formData.isShow}
                      onChange={(e) =>
                        setFormData({ ...formData, isShow: e.target.checked })
                      }
                    />
                    <span className="text-[#334155] font-semibold">Hiển thị trên trang chủ</span>
                  </label>
                </div>
              </div>

              <div className="p-[15px_30px] bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-[10px]">
                <button
                  type="button"
                  className="bg-[#64748b] text-white p-[8px_20px] rounded-[4px] border-none font-semibold cursor-pointer flex items-center gap-[6px] hover:bg-[#475569] transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Đóng lại
                </button>
                <button type="submit" className="bg-[#15803d] text-white p-[8px_20px] rounded-[4px] border-none font-semibold cursor-pointer flex items-center gap-[6px] hover:bg-[#166534] transition-colors">
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

export default WebLinkManager;
