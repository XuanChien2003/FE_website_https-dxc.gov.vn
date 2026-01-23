import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  FaSearch,
  FaFileAlt,
  FaAngleRight,
  FaLink,
  FaStar,
} from "react-icons/fa";
import "./DocumentsPage.css";

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
          api.get("/documents"),
          api.get("/dictionaries/fields"),
          api.get("/dictionaries/types"),
          api.get("/dictionaries/agencies"),
          api.get("/dictionaries/signers"),
          api.get("/weblinks"),
        ]);

        const allDocs = resDocs.data || [];
        allDocs.sort((a, b) => new Date(b.IssueDate) - new Date(a.IssueDate));

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
        const docNum = d.DocNumber ? d.DocNumber.toLowerCase() : "";
        const title = d.Title ? d.Title.toLowerCase() : "";
        return docNum.includes(k) || title.includes(k);
      });
    }

    if (filters.fieldID)
      result = result.filter((d) => d.FieldID === filters.fieldID);
    if (filters.typeID)
      result = result.filter((d) => d.TypeID === filters.typeID);
    if (filters.agencyID)
      result = result.filter((d) => d.AgencyID === filters.agencyID);
    if (filters.signerID)
      result = result.filter((d) => d.SignerID === filters.signerID);

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

  if (loading) return <div className="doc-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="doc-page-wrapper gov-style">
      <div className="doc-page-container">
        {/* --- CỘT TRÁI: MAIN CONTENT --- */}
        <div className="doc-main-content">
          {/* HEADER STYLE GIỐNG HOMEPAGE */}
          <div className="gov-section-header-red doc-header-bar">
            <span className="doc-header-title">
              <FaFileAlt style={{ marginRight: "8px" }} /> TRA CỨU VĂN BẢN
            </span>
          </div>

          {/* KHUNG TÌM KIẾM - STYLE LẠI BOX TRẮNG */}
          <div className="doc-search-box gov-box">
            <div className="search-row top">
              <div className="input-group">
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Nhập số hiệu văn bản hoặc trích yếu nội dung..."
                />
                <button className="btn-search-doc">
                  <FaSearch /> Tìm kiếm
                </button>
              </div>
            </div>

            <div className="search-row grid-4">
              <div className="filter-item">
                <select
                  name="fieldID"
                  onChange={handleFilterChange}
                  value={filters.fieldID}
                >
                  <option value="">-- Lĩnh vực --</option>
                  {fields.map((f) => (
                    <option key={f.FieldID} value={f.FieldID}>
                      {f.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <select
                  name="typeID"
                  onChange={handleFilterChange}
                  value={filters.typeID}
                >
                  <option value="">-- Loại văn bản --</option>
                  {types.map((t) => (
                    <option key={t.TypeID} value={t.TypeID}>
                      {t.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <select
                  name="agencyID"
                  onChange={handleFilterChange}
                  value={filters.agencyID}
                >
                  <option value="">-- Cơ quan ban hành --</option>
                  {agencies.map((a) => (
                    <option key={a.AgencyID} value={a.AgencyID}>
                      {a.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <select
                  name="signerID"
                  onChange={handleFilterChange}
                  value={filters.signerID}
                >
                  <option value="">-- Người ký --</option>
                  {signers.map((s) => (
                    <option key={s.SignerID} value={s.SignerID}>
                      {s.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* BẢNG DỮ LIỆU */}
          <div className="doc-table-wrapper gov-box no-shadow">
            <table className="doc-table-public">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>STT</th>
                  <th style={{ width: "130px" }}>Số ký hiệu</th>
                  <th style={{ width: "110px" }}>Ngày ban hành</th>
                  <th>Trích yếu</th>
                </tr>
              </thead>
              <tbody>
                {currentDocs.length > 0 ? (
                  currentDocs.map((doc, index) => (
                    <tr key={doc.DocID}>
                      <td className="text-center">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="doc-number text-center">
                        {doc.DocNumber}
                      </td>
                      <td className="text-center">
                        {formatDate(doc.IssueDate)}
                      </td>
                      <td className="doc-abstract">
                        <Link to={`/documents/${doc.DocID}`} title={doc.Title}>
                          {doc.Title}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-3">
                      Không tìm thấy dữ liệu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="pagination-public">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: SIDEBAR (Đồng bộ style với Home) --- */}
        <div className="doc-sidebar">
          {/* BOX 1: WEBLINKS */}
          <div className="gov-box sidebar-box">
            <div className="gov-section-header sidebar-header">
              <span>
                <FaLink style={{ marginBottom: "-2px" }} /> LIÊN KẾT WEBSITE
              </span>
            </div>
            <ul className="gov-link-list">
              {webLinks
                .filter((l) => l.IsShow)
                .map((link) => (
                  <li key={link.LinkID}>
                    <FaAngleRight className="link-arrow" />
                    <a href={link.Url} target="_blank" rel="noreferrer">
                      {link.Name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* BOX 2: VĂN BẢN MỚI */}
          <div className="gov-box sidebar-box mt-20">
            <div className="gov-section-header sidebar-header">
              <span>
                <FaStar style={{ marginBottom: "-2px" }} /> VĂN BẢN MỚI
              </span>
            </div>
            <div className="sidebar-content">
              {newDocs.map((doc) => (
                <div key={doc.DocID} className="sidebar-doc">
                  <Link
                    to={`/documents/${doc.DocID}`}
                    className="doc-title-link"
                    title={doc.Title}
                  >
                    {doc.Title}
                  </Link>
                  <div className="doc-meta-info">
                    Số: <b>{doc.DocNumber}</b> - {formatDate(doc.IssueDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Banner QC */}
          <div className="sidebar-banner mt-20">
            <img
              src="https://dxc.gov.vn/SitePages/uploads/banners/MOI-TRUONG.jpg"
              alt="QC"
              style={{
                width: "100%",
                display: "block",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
