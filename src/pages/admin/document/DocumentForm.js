import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import { FaSave, FaFileAlt, FaPen, FaTimes } from "react-icons/fa";

const DocumentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    docNumber: "",
    title: "",
    link: "",
    agencyID: "",
    signerID: "",
    typeID: "",
    fieldID: "",
    issueDate: "",
    effectiveDate: "",
    publishStatus: "Đã xuất bản",
  });

  const [agencies, setAgencies] = useState([]);
  const [signers, setSigners] = useState([]);
  const [types, setTypes] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdownData();
    if (isEditing) fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      const doc = res.data;
      setFormData({
        docNumber: doc.DocNumber || "",
        title: doc.Title || "",
        link: doc.Link || "",
        agencyID: doc.AgencyID || "",
        signerID: doc.SignerID || "",
        typeID: doc.TypeID || "",
        fieldID: doc.FieldID || "",
        issueDate: doc.IssueDate ? doc.IssueDate.split("T")[0] : "",
        effectiveDate: doc.EffectiveDate ? doc.EffectiveDate.split("T")[0] : "",
        publishStatus: doc.PublishStatus || "Đã xuất bản",
      });
    } catch (err) {
      toast.error("Lỗi tải dữ liệu!");
      navigate("/admin/documents");
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [resAgency, resSigner, resType, resField] = await Promise.all([
        api.get("/dictionaries/agencies"),
        api.get("/dictionaries/signers"),
        api.get("/dictionaries/types"),
        api.get("/dictionaries/fields"),
      ]);
      setAgencies(resAgency.data);
      setSigners(resSigner.data);
      setTypes(resType.data);
      setFields(resField.data);
    } catch (err) {
      toast.error("Lỗi tải danh mục!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        agencyID: parseInt(formData.agencyID),
        signerID: parseInt(formData.signerID),
        typeID: parseInt(formData.typeID),
        fieldID: parseInt(formData.fieldID),
      };

      if (isEditing) {
        await api.put(`/documents/${id}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/documents", payload);
        toast.success("Thêm mới thành công!");
      }
      navigate("/admin/documents");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-[20px] w-full min-h-[calc(100vh-60px)] bg-[#f0f2f5] font-sans text-[#333] text-[14px] flex flex-col items-center gap-[15px]">
      <div className="bg-white p-[12px_20px] rounded-[6px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex justify-between items-center border-t-[3px] border-[#2c3e50] w-full max-w-[1100px]">
        <h2 className="text-[18px] font-bold text-[#2c3e50] m-0 flex items-center gap-[10px] uppercase">
          {isEditing ? <FaPen /> : <FaFileAlt />}
          {isEditing ? "CẬP NHẬT VĂN BẢN" : "THÊM VĂN BẢN MỚI"}
        </h2>
      </div>

      <div className="bg-white rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-[#ced4da] w-full max-w-[1100px] p-[20px] sm:p-[30px] h-auto flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          {/* HÀNG 1: 4 CỘT (Thông tin cơ bản) */}
          <div className="grid gap-[20px] w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">
                Số/Ký hiệu <span className="text-[#dc3545] ml-[3px]">*</span>
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full p-[9px_12px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15"
                  placeholder="VD: 749/QĐ-TTg"
                  value={formData.docNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, docNumber: e.target.value })
                  }
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">
                Loại văn bản <span className="text-[#dc3545] ml-[3px]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  className="w-full p-[9px_12px] pr-[30px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg_xmlns=%22http://www.w3.org/2000/svg%22_viewBox=%220_0_24_24%22_fill=%22none%22_stroke=%22%23666%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22%3e%3cpolyline_points=%226_9_12_15_18_9%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[position:right_12px_center] bg-[length:14px]"
                  value={formData.typeID}
                  onChange={(e) =>
                    setFormData({ ...formData, typeID: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn loại --</option>
                  {types.map((t) => (
                    <option key={t.TypeID} value={t.TypeID}>
                      {t.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">
                Lĩnh vực <span className="text-[#dc3545] ml-[3px]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  className="w-full p-[9px_12px] pr-[30px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg_xmlns=%22http://www.w3.org/2000/svg%22_viewBox=%220_0_24_24%22_fill=%22none%22_stroke=%22%23666%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22%3e%3cpolyline_points=%226_9_12_15_18_9%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[position:right_12px_center] bg-[length:14px]"
                  value={formData.fieldID}
                  onChange={(e) =>
                    setFormData({ ...formData, fieldID: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn lĩnh vực --</option>
                  {fields.map((f) => (
                    <option key={f.FieldID} value={f.FieldID}>
                      {f.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">Trạng thái</label>
              <div className="relative w-full">
                <select
                  className="w-full p-[9px_12px] pr-[30px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg_xmlns=%22http://www.w3.org/2000/svg%22_viewBox=%220_0_24_24%22_fill=%22none%22_stroke=%22%23666%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22%3e%3cpolyline_points=%226_9_12_15_18_9%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[position:right_12px_center] bg-[length:14px]"
                  value={formData.publishStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, publishStatus: e.target.value })
                  }
                >
                  <option value="Đã xuất bản">Đã xuất bản</option>
                  <option value="Chờ duyệt">Chưa xuất bản</option>
                </select>
              </div>
            </div>
          </div>

          {/* HÀNG 2: 4 CỘT (Đối tượng & Thời gian) */}
          <div className="grid gap-[20px] w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">
                Cơ quan ban hành <span className="text-[#dc3545] ml-[3px]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  className="w-full p-[9px_12px] pr-[30px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg_xmlns=%22http://www.w3.org/2000/svg%22_viewBox=%220_0_24_24%22_fill=%22none%22_stroke=%22%23666%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22%3e%3cpolyline_points=%226_9_12_15_18_9%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[position:right_12px_center] bg-[length:14px]"
                  value={formData.agencyID}
                  onChange={(e) =>
                    setFormData({ ...formData, agencyID: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn cơ quan --</option>
                  {agencies.map((a) => (
                    <option key={a.AgencyID} value={a.AgencyID}>
                      {a.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">
                Người ký <span className="text-[#dc3545] ml-[3px]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  className="w-full p-[9px_12px] pr-[30px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg_xmlns=%22http://www.w3.org/2000/svg%22_viewBox=%220_0_24_24%22_fill=%22none%22_stroke=%22%23666%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22%3e%3cpolyline_points=%226_9_12_15_18_9%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[position:right_12px_center] bg-[length:14px]"
                  value={formData.signerID}
                  onChange={(e) =>
                    setFormData({ ...formData, signerID: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn người ký --</option>
                  {signers.map((s) => (
                    <option key={s.SignerID} value={s.SignerID}>
                      {s.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">Ngày ban hành</label>
              <div className="relative w-full">
                <input
                  type="date"
                  className="w-full p-[9px_12px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">Ngày hiệu lực</label>
              <div className="relative w-full">
                <input
                  type="date"
                  className="w-full p-[9px_12px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15"
                  value={formData.effectiveDate}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* HÀNG 3: LINK */}
          <div className="grid gap-[20px] w-full grid-cols-1">
            <div className="col-span-full">
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">Link tải về (URL)</label>
              <div className="relative w-full">
                <input
                  type="url"
                  className="w-full p-[9px_12px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* HÀNG 4: TRÍCH YẾU */}
          <div className="grid gap-[20px] w-full grid-cols-1">
            <div className="col-span-full h-full">
              <label className="block font-semibold mb-[6px] text-[13.5px] text-[#444]">
                Trích yếu nội dung <span className="text-[#dc3545] ml-[3px]">*</span>
              </label>
              <div className="relative w-full h-full">
                <textarea
                  className="w-full p-[10px_12px] border border-[#ccc] rounded-[4px] text-[14px] min-h-[120px] resize-y leading-[1.5] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 h-full"
                  placeholder="Nhập nội dung tóm tắt..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-[10px] pt-[20px] border-t border-[#eee] flex justify-end gap-[12px] max-sm:flex-col-reverse">
            <button
              type="button"
              className="px-[24px] h-[40px] border-none rounded-[4px] cursor-pointer font-semibold inline-flex items-center gap-[8px] text-[14px] transition-all duration-200 bg-[#6c757d] text-white hover:bg-[#5a6268] max-sm:w-full max-sm:justify-center"
              onClick={() => navigate("/admin/documents")}
            >
              <FaTimes /> Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-[24px] h-[40px] border-none rounded-[4px] cursor-pointer font-semibold inline-flex items-center gap-[8px] text-[14px] transition-all duration-200 bg-[#0d6efd] text-white hover:bg-[#0b5ed7] max-sm:w-full max-sm:justify-center"
              disabled={loading}
            >
              <FaSave /> {loading ? "Đang lưu..." : "Lưu dữ liệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;
