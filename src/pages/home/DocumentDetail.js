import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  FaDownload,
  FaFilePdf,
  FaArrowLeft,
  FaCalendarAlt,
  FaBuilding,
} from "react-icons/fa";

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
    return <div className="text-center py-20 text-gray-500 font-medium">Đang tải dữ liệu văn bản...</div>;
  if (!doc) return <div className="text-center py-20 text-red-500 font-medium">Không tìm thấy văn bản!</div>;

  return (
    <div className="bg-white py-8 min-h-[80vh] font-sans">
      <div className="max-w-[1000px] mx-auto px-4">
        {/* Breadcrumb / Nút quay lại */}
        <div className="mb-5 text-sm text-gray-600 flex items-center gap-2">
          <Link to="/" className="no-underline text-primary flex items-center gap-1 font-medium hover:text-accent">
            <FaArrowLeft /> Quay lại trang chủ
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Chi tiết văn bản</span>
        </div>

        {/* Tiêu đề văn bản */}
        <h1 className="text-2xl text-primary font-bold mb-2.5 leading-snug uppercase">{doc.Title}</h1>
        <div className="flex gap-5 text-gray-500 text-[13px] mb-7 border-b border-gray-200 pb-4">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt /> Ngày ban hành: {formatDate(doc.IssueDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <FaBuilding /> Cơ quan: {doc.Organization || "Bộ VHTTDL"}
          </span>
        </div>

        {/* Khung thông tin thuộc tính (Dạng bảng) */}
        <div className="mb-7 border border-border-color rounded overflow-hidden">
          <h3 className="bg-primary text-white py-2.5 px-4 m-0 text-[15px] font-semibold uppercase">THÔNG TIN THUỘC TÍNH</h3>
          <table className="w-full border-collapse text-sm block md:table">
            <tbody className="block md:table-row-group">
              <tr className="md:border-b-0 border-b-2 border-gray-100 mb-4 md:mb-0 block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Số ký hiệu:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top text-accent font-bold">{doc.DocNumber}</td>
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Loại văn bản:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">{doc.DocType || "Quyết định"}</td>
              </tr>
              <tr className="md:border-b-0 border-b-2 border-gray-100 mb-4 md:mb-0 block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Ngày ban hành:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">{formatDate(doc.IssueDate)}</td>
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Ngày hiệu lực:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">
                  {formatDate(doc.EffectDate) || "Đang cập nhật"}
                </td>
              </tr>
              <tr className="md:border-b-0 border-b-2 border-gray-100 mb-4 md:mb-0 block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Cơ quan ban hành:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">
                  {doc.Organization || "Bộ Văn hóa, Thể thao và Du lịch"}
                </td>
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Người ký:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">{doc.Signer || "Lãnh đạo Bộ"}</td>
              </tr>
              <tr className="md:border-b-0 border-b-2 border-gray-100 mb-4 md:mb-0 block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Lĩnh vực:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top" colSpan="3">
                  {doc.Field || "Chuyển đổi số"}
                </td>
              </tr>
              <tr className="block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b-0 align-top">Trích yếu:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b-0 align-top leading-relaxed text-justify" colSpan="3">
                  {doc.Title}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Khu vực Tải về */}
        <div className="mb-7 border border-border-color rounded">
          <h3 className="bg-primary text-white py-2.5 px-4 m-0 text-[15px] font-semibold uppercase">VĂN BẢN TOÀN VĂN</h3>
          <div className="p-5 flex flex-col md:flex-row items-center gap-4 bg-white text-center md:text-left">
            <FaFilePdf className="text-[40px] text-accent" />
            <div className="flex-1 flex flex-col mb-2.5 md:mb-0">
              <span className="font-semibold text-[15px] text-gray-800">
                {doc.FileName || `VanBan_${doc.DocNumber}.pdf`}
              </span>
              <span className="text-[13px] text-gray-500">(Dung lượng: 2.5 MB)</span>
            </div>
            {/* Nếu có link tải thật thì dùng thẻ a, nếu không thì button giả */}
            <a
              href={doc.FileUrl || "#"}
              className="bg-primary text-white py-2.5 px-5 no-underline rounded font-medium flex items-center gap-2 transition hover:bg-blue-900"
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
            <h3 className="bg-primary text-white py-2.5 px-4 m-0 text-[15px] font-semibold uppercase">NỘI DUNG CHI TIẾT</h3>
            <div dangerouslySetInnerHTML={{ __html: doc.Content }} className="p-4 bg-white border border-border-color border-t-0 rounded-b" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;
