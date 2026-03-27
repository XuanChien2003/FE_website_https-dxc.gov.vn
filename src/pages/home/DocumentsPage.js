import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  FaSearch,
  FaFileAlt,
  FaAngleRight,
  FaHome,
} from "react-icons/fa";

const DocumentsPage = () => {
  // --- STATE DỮ LIỆU ---
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);

  // Dữ liệu cho Dropdown bộ lọc
  const [fields, setFields] = useState([]);
  const [types, setTypes] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [signers, setSigners] = useState([]);

  // Sidebar data
  const [webLinks, setWebLinks] = useState([]);
  const [newDocs, setNewDocs] = useState([]);

  const [loading, setLoading] = useState(true);

  // --- STATE BỘ LỌC ---
  const [filters, setFilters] = useState({
    keyword: "",
    fieldID: "",
    typeID: "",
    agencyID: "",
    signerID: "",
  });

  // --- PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          resDocs,
          resFields,
          resTypes,
          resAgencies,
          resSigners,
          resLinks,
        ] = await Promise.all([
          supabase.from('documents').select('*').order('publisheddate', { ascending: false }),
          supabase.from('fields').select('*').order('name', { ascending: true }),
          supabase.from('documenttypes').select('*').order('name', { ascending: true }),
          supabase.from('agencies').select('*').order('name', { ascending: true }),
          supabase.from('signers').select('*').order('name', { ascending: true }),
          supabase.from('weblinks').select('*').filter('isshow', 'eq', true).order('stt', { ascending: true }),
        ]);

        const allDocs = resDocs.data || [];
        setDocuments(allDocs);
        setFilteredDocs(allDocs);
        setNewDocs(allDocs.slice(0, 5));

        setFields(resFields.data || []);
        setTypes(resTypes.data || []);
        setAgencies(resAgencies.data || []);
        setSigners(resSigners.data || []);
        setWebLinks(resLinks.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- LOGIC LỌC ---
  useEffect(() => {
    let result = documents;

    if (filters.keyword) {
      const k = filters.keyword.toLowerCase();
      result = result.filter((d) => {
        const docNum = d.number ? d.number.toLowerCase() : "";
        const title = d.title ? d.title.toLowerCase() : "";
        return docNum.includes(k) || title.includes(k);
      });
    }

    if (filters.fieldID)
      result = result.filter((d) => d.fieldid === Number(filters.fieldID));
    if (filters.typeID)
      result = result.filter((d) => d.typeid === Number(filters.typeID));
    if (filters.agencyID)
      result = result.filter((d) => d.agencyid === Number(filters.agencyID));
    if (filters.signerID)
      result = result.filter((d) => d.signerid === Number(filters.signerID));

    setFilteredDocs(result);
    setCurrentPage(1);
  }, [filters, documents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  // --- PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);

  if (loading) return <div className="text-center py-10 font-medium text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-gov-bg-body font-sans text-gov-text text-[14px] pb-10 pt-[25px] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-gray-500 mb-5 flex items-center flex-wrap gap-2">
          <Link to="/" className="hover:text-black hover:underline transition-colors flex items-center gap-1">
            <FaHome className="text-[11px]" /> Trang chủ
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-black font-semibold">Văn bản</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-[25px]">
          {/* --- CỘT TRÁI: MAIN CONTENT --- */}
          <div>
            {/* HEADER STYLE GIỐNG HOMEPAGE */}
            <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-3 px-[15px] border-b-[3px] border-gov-yellow font-bold uppercase text-[15px] flex items-center mb-0 rounded-t-lg">
              <span className="flex items-center">
                <FaFileAlt style={{ marginRight: "8px" }} /> TRA CỨU VĂN BẢN
              </span>
            </div>

            {/* KHUNG TÌM KIẾM - STYLE LẠI BOX TRẮNG */}
            <div className="p-5 mb-[25px] bg-white border border-t-0 border-gov-border rounded-b shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
              <div className="mb-[15px]">
                <div className="flex flex-col sm:flex-row">
                  <input
                    type="text"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                    placeholder="Nhập số hiệu văn bản hoặc trích yếu nội dung..."
                    className="flex-grow py-2.5 px-[15px] border border-[#ccc] sm:border-r-0 outline-none text-[14px] focus:border-gov-red mb-2.5 sm:mb-0"
                  />
                  <button className="bg-gov-red text-white border-none px-5 py-[10px] cursor-pointer flex justify-center items-center gap-2 font-semibold text-[14px] transition hover:bg-gov-red-dark">
                    <FaSearch /> Tìm kiếm
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
                <div>
                  <select
                    name="fieldID"
                    onChange={handleFilterChange}
                    value={filters.fieldID}
                    className="p-2 border border-[#ccc] rounded-[2px] w-full text-[13px] text-[#444] outline-none focus:border-gov-red"
                  >
                    <option value="">-- Lĩnh vực --</option>
                    {fields.map((f) => (
                      <option key={f.fieldid} value={f.fieldid}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    name="typeID"
                    onChange={handleFilterChange}
                    value={filters.typeID}
                    className="p-2 border border-[#ccc] rounded-[2px] w-full text-[13px] text-[#444] outline-none focus:border-gov-red"
                  >
                    <option value="">-- Loại văn bản --</option>
                    {types.map((t) => (
                      <option key={t.typeid} value={t.typeid}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    name="agencyID"
                    onChange={handleFilterChange}
                    value={filters.agencyID}
                    className="p-2 border border-[#ccc] rounded-[2px] w-full text-[13px] text-[#444] outline-none focus:border-gov-red"
                  >
                    <option value="">-- Cơ quan ban hành --</option>
                    {agencies.map((a) => (
                      <option key={a.agencyid} value={a.agencyid}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    name="signerID"
                    onChange={handleFilterChange}
                    value={filters.signerID}
                    className="p-2 border border-[#ccc] rounded-[2px] w-full text-[13px] text-[#444] outline-none focus:border-gov-red"
                  >
                    <option value="">-- Người ký --</option>
                    {signers.map((s) => (
                      <option key={s.signerid} value={s.signerid}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white border border-gov-border overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr>
                    <th className="bg-[#f2f2f2] text-[#333] font-bold py-3 px-2.5 text-center whitespace-nowrap border border-[#dcdcdc]" style={{ width: "50px" }}>STT</th>
                    <th className="bg-[#f2f2f2] text-[#333] font-bold py-3 px-2.5 text-center whitespace-nowrap border border-[#dcdcdc]" style={{ width: "130px" }}>Số ký hiệu</th>
                    <th className="bg-[#f2f2f2] text-[#333] font-bold py-3 px-2.5 text-center whitespace-nowrap border border-[#dcdcdc]" style={{ width: "110px" }}>Ngày ban hành</th>
                    <th className="bg-[#f2f2f2] text-[#333] font-bold py-3 px-2.5 text-center whitespace-nowrap border border-[#dcdcdc]">Trích yếu</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDocs.length > 0 ? (
                    currentDocs.map((doc, index) => (
                      <tr key={doc.docid} className="hover:bg-[#fcebeb]">
                        <td className="text-center py-2.5 px-3 text-[#333] align-middle border border-[#dcdcdc]">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="text-gov-red font-semibold whitespace-nowrap text-center py-2.5 px-3 align-middle border border-[#dcdcdc]">
                          {doc.number}
                        </td>
                        <td className="text-center py-2.5 px-3 text-[#333] align-middle border border-[#dcdcdc]">
                          {formatDate(doc.publisheddate)}
                        </td>
                        <td className="py-2.5 px-3 text-[#333] align-middle border border-[#dcdcdc]">
                          <Link to={`/documents/${doc.docid}`} title={doc.title} className="text-[#333] no-underline font-medium leading-relaxed block text-justify hover:text-gov-red hover:underline">
                            {doc.title}
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3 border border-[#dcdcdc]">
                        Không tìm thấy dữ liệu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="mt-[25px] flex justify-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`py-1.5 px-3 border cursor-pointer rounded-[3px] font-semibold transition hover:border-gov-red hover:text-gov-red ${currentPage === i + 1 ? 'bg-gov-red text-white border-gov-red' : 'border-[#ddd] bg-white text-[#555]'}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- CỘT PHẢI: SIDEBAR (Đồng bộ style với Home) --- */}
          <div>
            {/* BOX 1: WEBLINKS */}
            <div className="bg-white border border-gov-border shadow-sm mb-5 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-3 px-[15px] border-b-[3px] border-gov-yellow font-bold uppercase text-[15px] flex items-center">
                <span>
                  LIÊN KẾT WEBSITE
                </span>
              </div>
              <ul className="list-none p-0 m-0">
                {webLinks
                  .filter((l) => l.isshow)
                  .map((link) => (
                    <li key={link.linkid} className="py-3 px-[15px] border-b border-dashed border-[#eee] flex items-center gap-2.5 transition hover:bg-[#f9f9f9] last:border-b-0">
                      <FaAngleRight className="text-[#999] text-[12px]" />
                      <a href={link.url} target="_blank" rel="noreferrer" className="font-semibold text-[13px] text-[#333] no-underline hover:text-gov-red">
                        {link.name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>

            {/* BOX 2: VĂN BẢN MỚI */}
            <div className="bg-white border border-gov-border shadow-sm mb-5 mt-5 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-3 px-[15px] border-b-[3px] border-gov-yellow font-bold uppercase text-[15px] flex items-center">
                <span>
                  VĂN BẢN MỚI
                </span>
              </div>
              <div className="py-2.5 px-[15px]">
                {newDocs.map((doc) => (
                  <div key={doc.docid} className="mb-[15px] border-b border-dashed border-[#eee] pb-2.5 last:border-b-0 last:mb-0 last:pb-0">
                    <Link
                      to={`/documents/${doc.docid}`}
                      title={doc.title}
                      className="block text-[13.5px] font-bold text-[#333] no-underline leading-snug mb-1 text-justify hover:text-gov-red"
                    >
                      {doc.title}
                    </Link>
                    <div className="text-[12px] text-[#666]">
                      Số: <b>{doc.number}</b> - {formatDate(doc.publisheddate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner QC */}
            <div className="mt-5">
              <img
                src="https://dxc.gov.vn/SitePages/uploads/banners/MOI-TRUONG.jpg"
                alt="QC"
                className="w-full block shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
