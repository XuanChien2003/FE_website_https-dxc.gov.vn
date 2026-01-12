import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaSave,
  FaFileAlt,
  FaPen,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  MdBusiness,
  MdPerson,
  MdCategory,
  MdLink,
  MdDescription,
  MdInfo,
  MdTopic,
} from "react-icons/md";
import "./DocumentForm.css";

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
    <div className="document-form-page">
      <div className="page-header">
        <h2 className="page-title">
          {isEditing ? <FaPen /> : <FaFileAlt />}
          {isEditing ? "CẬP NHẬT VĂN BẢN" : "THÊM VĂN BẢN MỚI"}
        </h2>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="main-form">
          {/* HÀNG 1: 4 CỘT (Thông tin cơ bản) */}
          <div className="form-row four-cols">
            <div className="form-group">
              <label>
                Số/Ký hiệu <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <input
                  type="text"
                  className="form-control"
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

            <div className="form-group">
              <label>
                Loại văn bản <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <select
                  className="form-control"
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

            <div className="form-group">
              <label>
                Lĩnh vực <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <select
                  className="form-control"
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

            <div className="form-group">
              <label>Trạng thái</label>
              <div className="input-with-icon">
                <select
                  className="form-control"
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
          <div className="form-row four-cols">
            <div className="form-group">
              <label>
                Cơ quan ban hành <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <select
                  className="form-control"
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

            <div className="form-group">
              <label>
                Người ký <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <select
                  className="form-control"
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

            <div className="form-group">
              <label>Ngày ban hành</label>
              <div className="input-with-icon">
                <input
                  type="date"
                  className="form-control"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ngày hiệu lực</label>
              <div className="input-with-icon">
                <input
                  type="date"
                  className="form-control"
                  value={formData.effectiveDate}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* HÀNG 3: LINK (Full width nhưng mỏng) */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>Link tải về (URL)</label>
              <div className="input-with-icon">
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* HÀNG 4: TRÍCH YẾU (Chiếm toàn bộ không gian còn lại) */}
          <div className="form-row flex-grow-row">
            <div className="form-group full-width h-100">
              <label>
                Trích yếu nội dung <span className="req">*</span>
              </label>
              <div className="input-with-icon textarea-wrapper h-100">
                <textarea
                  className="form-control textarea-control h-100"
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
          <div className="form-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/documents")}
            >
              <FaTimes /> Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
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
