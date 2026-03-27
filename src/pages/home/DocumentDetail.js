import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
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
        const { data, error } = await supabase
          .from('documents')
          .select('*, documenttypes(name), fields(name), agencies(name), signers(name)')
          .eq('docid', id)
          .single();

        if (error) throw error;
        setDoc(data);
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
    <div className="bg-gov-bg-body py-8 min-h-[80vh] font-sans">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-gray-500 mb-6 flex items-center flex-wrap gap-2">
          <Link to="/" className="hover:text-black hover:underline transition-colors">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <Link to="/documents" className="hover:text-black hover:underline transition-colors">Văn bản</Link>
          <span className="text-gray-400">/</span>
          <span className="text-black font-semibold">Chi tiết văn bản</span>
        </nav>

        {/* Tiêu đề văn bản */}
        <div className="bg-white p-6 rounded-lg border border-gov-border shadow-sm">
          <h1 className="text-xl text-gov-red font-bold mb-3 leading-snug uppercase">{doc.title}</h1>
          <div className="flex flex-wrap gap-5 text-gray-500 text-[13px] border-t border-gray-100 pt-3 mt-3">
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="text-gov-red" /> Ngày ban hành: <b className="text-gray-700">{formatDate(doc.publisheddate)}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <FaBuilding className="text-gov-red" /> Cơ quan: <b className="text-gray-700">{doc.agencies?.name || "Đang cập nhật"}</b>
            </span>
          </div>
        </div>

        {/* Khung thông tin thuộc tính (Dạng bảng) */}
        <div className="mt-6 mb-7 border border-gov-border rounded-lg overflow-hidden shadow-sm">
          <h3 className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-3 px-4 m-0 text-[15px] font-bold uppercase tracking-wide">THÔNG TIN THUỘC TÍNH</h3>
          <table className="w-full border-collapse text-sm block md:table">
            <tbody className="block md:table-row-group">
              <tr className="md:border-b-0 border-b-2 border-gray-100 mb-4 md:mb-0 block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Số ký hiệu:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top text-accent font-bold">{doc.number}</td>
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Loại văn bản:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">{doc.documenttypes?.name || "Quyết định"}</td>
              </tr>
              <tr className="md:border-b-0 border-b-2 border-gray-100 mb-4 md:mb-0 block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Ngày ban hành:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">{formatDate(doc.publisheddate)}</td>
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Ngày hiệu lực:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">
                  {formatDate(doc.effectivedate) || "Đang cập nhật"}
                </td>
              </tr>
              <tr className="md:border-b-0 border-b-2 border-gray-100 mb-4 md:mb-0 block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Cơ quan ban hành:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">
                  {doc.agencies?.name || "Đang cập nhật"}
                </td>
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Người ký:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">{doc.signers?.name || "Lãnh đạo Bộ"}</td>
              </tr>
              <tr className="md:border-b-0 border-b-2 border-gray-100 mb-4 md:mb-0 block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top">Lĩnh vực:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b border-border-color align-top" colSpan="3">
                  {doc.fields?.name || "Chuyển đổi số"}
                </td>
              </tr>
              <tr className="block md:table-row">
                <td className="bg-gray-100 font-semibold text-gray-700 md:w-[180px] md:border-r border-border-color block md:table-cell w-full p-3 md:py-3 md:px-4 border-b-0 align-top">Trích yếu:</td>
                <td className="text-gray-800 block md:table-cell w-full p-3 md:py-3 md:px-4 border-b-0 align-top leading-relaxed text-justify" colSpan="3">
                  {doc.title}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Khu vực Tải về */}
        <div className="mb-7 border border-gov-border rounded-lg overflow-hidden shadow-sm">
          <h3 className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-3 px-4 m-0 text-[15px] font-bold uppercase tracking-wide">VĂN BẢN TOÀN VĂN</h3>
          <div className="p-5 flex flex-col md:flex-row items-center gap-4 bg-white text-center md:text-left">
            <FaFilePdf className="text-[40px] text-gov-red" />
            <div className="flex-1 flex flex-col mb-2.5 md:mb-0">
              <span className="font-semibold text-[15px] text-gray-800">
                {doc.filename || `VanBan_${doc.number}.pdf`}
              </span>
              <span className="text-[13px] text-gray-500">(Dung lượng: 2.5 MB)</span>
            </div>
            <a
              href={doc.fileurl || "#"}
              className="bg-gov-red text-white py-2.5 px-5 no-underline rounded-lg font-semibold flex items-center gap-2 transition hover:bg-gov-red-dark shadow-sm"
              target="_blank"
              rel="noreferrer"
            >
              <FaDownload /> Tải về
            </a>
          </div>
        </div>

        {/* Nội dung chi tiết (Nếu có HTML content) */}
        {doc.content && (
          <div className="doc-content-html mb-7 border border-gov-border rounded-lg overflow-hidden shadow-sm">
            <h3 className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-3 px-4 m-0 text-[15px] font-bold uppercase tracking-wide">NỘI DUNG CHI TIẾT</h3>
            <div dangerouslySetInnerHTML={{ __html: doc.content }} className="p-5 bg-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;
