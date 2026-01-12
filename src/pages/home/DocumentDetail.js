import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  FaDownload,
  FaFilePdf,
  FaArrowLeft,
  FaCalendarAlt,
  FaUserTie,
  FaBuilding,
} from "react-icons/fa";
import "./DocumentDetail.css";

const DocumentDetail = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/documents/${id}`);
        setDoc(response.data);
      } catch (error) {
        console.error("Lỗi tải văn bản:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocDetail();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Đang cập nhật";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (loading)
    return <div className="loading-state">Đang tải dữ liệu văn bản...</div>;
  if (!doc) return <div className="error-state">Không tìm thấy văn bản!</div>;

  return (
    <div className="doc-detail-wrapper">
      <div className="doc-container">
        {/* Breadcrumb / Nút quay lại */}
        <div className="breadcrumb">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Quay lại trang chủ
          </Link>
          <span className="separator">/</span>
          <span className="current">Chi tiết văn bản</span>
        </div>

        {/* Tiêu đề văn bản */}
        <h1 className="doc-main-title">{doc.Title}</h1>
        <div className="doc-meta-line">
          <span className="meta-item">
            <FaCalendarAlt /> Ngày ban hành: {formatDate(doc.IssueDate)}
          </span>
          <span className="meta-item">
            <FaBuilding /> Cơ quan: {doc.Organization || "Bộ VHTTDL"}
          </span>
        </div>

        {/* Khung thông tin thuộc tính (Dạng bảng) */}
        <div className="doc-attributes-box">
          <h3 className="section-header">THÔNG TIN THUỘC TÍNH</h3>
          <table className="doc-table">
            <tbody>
              <tr>
                <td className="label">Số ký hiệu:</td>
                <td className="value highlight">{doc.DocNumber}</td>
                <td className="label">Loại văn bản:</td>
                <td className="value">{doc.DocType || "Quyết định"}</td>
              </tr>
              <tr>
                <td className="label">Ngày ban hành:</td>
                <td className="value">{formatDate(doc.IssueDate)}</td>
                <td className="label">Ngày hiệu lực:</td>
                <td className="value">
                  {formatDate(doc.EffectDate) || "Đang cập nhật"}
                </td>
              </tr>
              <tr>
                <td className="label">Cơ quan ban hành:</td>
                <td className="value">
                  {doc.Organization || "Bộ Văn hóa, Thể thao và Du lịch"}
                </td>
                <td className="label">Người ký:</td>
                <td className="value">{doc.Signer || "Lãnh đạo Bộ"}</td>
              </tr>
              <tr>
                <td className="label">Lĩnh vực:</td>
                <td className="value" colSpan="3">
                  {doc.Field || "Chuyển đổi số"}
                </td>
              </tr>
              <tr>
                <td className="label">Trích yếu:</td>
                <td className="value content-summary" colSpan="3">
                  {doc.Title}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Khu vực Tải về */}
        <div className="doc-download-section">
          <h3 className="section-header">VĂN BẢN TOÀN VĂN</h3>
          <div className="download-box">
            <FaFilePdf className="pdf-icon" />
            <div className="download-info">
              <span className="file-name">
                {doc.FileName || `VanBan_${doc.DocNumber}.pdf`}
              </span>
              <span className="file-size">(Dung lượng: 2.5 MB)</span>
            </div>
            {/* Nếu có link tải thật thì dùng thẻ a, nếu không thì button giả */}
            <a
              href={doc.FileUrl || "#"}
              className="btn-download"
              target="_blank"
              rel="noreferrer"
            >
              <FaDownload /> Tải về
            </a>
          </div>
        </div>

        {/* Nội dung chi tiết (Nếu có HTML content) */}
        {doc.Content && (
          <div className="doc-content-html">
            <h3 className="section-header">NỘI DUNG CHI TIẾT</h3>
            <div dangerouslySetInnerHTML={{ __html: doc.Content }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;
