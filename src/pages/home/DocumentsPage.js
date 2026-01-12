import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  FaSearch,
  FaFileAlt,
  FaAngleRight,
  FaListUl,
  FaDownload,
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
  const [newDocs, setNewDocs] = useState([]); // Văn bản mới nhất bên phải

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
        // Gọi song song các API để lấy dữ liệu nạp vào trang
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

        // 1. Xử lý danh sách văn bản chính
        const allDocs = resDocs.data || [];

        // Sắp xếp theo ngày ban hành giảm dần (Mới nhất lên đầu)
        // Dùng 'IssueDate' giống DocumentList.js
        allDocs.sort((a, b) => new Date(b.IssueDate) - new Date(a.IssueDate));

        setDocuments(allDocs);
        setFilteredDocs(allDocs);

        // 2. Lấy 5 văn bản mới nhất cho Sidebar
        setNewDocs(allDocs.slice(0, 5));

        // 3. Nạp dữ liệu cho các Dropdown
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

  // --- LOGIC LỌC DỮ LIỆU ---
  useEffect(() => {
    let result = documents;

    // 1. Lọc theo từ khóa (Số hiệu HOẶC Trích yếu)
    if (filters.keyword) {
      const k = filters.keyword.toLowerCase();
      result = result.filter((d) => {
        // Kiểm tra null trước khi toLowerCase để tránh lỗi
        const docNum = d.DocNumber ? d.DocNumber.toLowerCase() : "";
        const title = d.Title ? d.Title.toLowerCase() : "";
        return docNum.includes(k) || title.includes(k);
      });
    }

    // 2. Lọc theo Dropdown
    // Lưu ý: Value từ select là String, ID trong data là Number -> Dùng ==
    if (filters.fieldID) {
      result = result.filter((d) => d.FieldID == filters.fieldID);
    }
    if (filters.typeID) {
      result = result.filter((d) => d.TypeID == filters.typeID);
    }
    if (filters.agencyID) {
      result = result.filter((d) => d.AgencyID == filters.agencyID);
    }
    if (filters.signerID) {
      result = result.filter((d) => d.SignerID == filters.signerID);
    }

    setFilteredDocs(result);
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [filters, documents]);

  // Xử lý khi người dùng chọn bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Helper Format Date (Dùng IssueDate)
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
    <div className="doc-page-wrapper">
      <div className="container doc-page-container">
        {/* --- CỘT TRÁI: DANH SÁCH VĂN BẢN --- */}
        <div className="doc-main-content">
          <h2 className="page-heading">
            <FaFileAlt /> HỆ THỐNG VĂN BẢN
          </h2>

          {/* KHUNG TÌM KIẾM */}
          <div className="doc-search-box">
            <div className="search-row top">
              <label>Từ khóa:</label>
              <div className="input-group">
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Nhập số hiệu hoặc trích yếu..."
                />
                <button className="btn-search-doc">
                  <FaSearch /> Tìm kiếm
                </button>
              </div>
            </div>

            <div className="search-row grid-4">
              <div className="filter-item">
                <label>Lĩnh vực</label>
                <select
                  name="fieldID"
                  onChange={handleFilterChange}
                  value={filters.fieldID}
                >
                  <option value="">-- Tất cả lĩnh vực --</option>
                  {fields.map((f) => (
                    <option key={f.FieldID} value={f.FieldID}>
                      {f.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Loại văn bản</label>
                <select
                  name="typeID"
                  onChange={handleFilterChange}
                  value={filters.typeID}
                >
                  <option value="">-- Tất cả loại văn bản --</option>
                  {types.map((t) => (
                    <option key={t.TypeID} value={t.TypeID}>
                      {t.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Cơ quan ban hành</label>
                <select
                  name="agencyID"
                  onChange={handleFilterChange}
                  value={filters.agencyID}
                >
                  <option value="">-- Tất cả cơ quan --</option>
                  {agencies.map((a) => (
                    <option key={a.AgencyID} value={a.AgencyID}>
                      {a.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Người ký</label>
                <select
                  name="signerID"
                  onChange={handleFilterChange}
                  value={filters.signerID}
                >
                  <option value="">-- Tất cả --</option>
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
          <div className="doc-table-wrapper">
            <table className="doc-table-public">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>STT</th>
                  <th style={{ width: "140px" }}>Số ký hiệu</th>
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
                      {/* SỬ DỤNG DocNumber */}
                      <td className="doc-number">{doc.DocNumber}</td>
                      {/* SỬ DỤNG IssueDate */}
                      <td className="text-center">
                        {formatDate(doc.IssueDate)}
                      </td>
                      {/* SỬ DỤNG Title */}
                      <td className="doc-abstract">
                        <Link to={`/documents/${doc.DocID}`} title={doc.Title}>
                          {doc.Title}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      Không tìm thấy văn bản nào phù hợp.
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

        {/* --- CỘT PHẢI: SIDEBAR --- */}
        <div className="doc-sidebar">
          {/* BOX 1: WEBLINKS */}
          <div className="sidebar-box">
            <h3 className="sidebar-title">
              <FaListUl /> SẢN PHẨM - DỊCH VỤ TIÊU BIỂU
            </h3>
            <ul className="weblink-list">
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
          <div className="sidebar-box mt-20">
            <h3 className="sidebar-title orange">VĂN BẢN MỚI</h3>
            <div className="sidebar-content">
              {newDocs.map((doc) => (
                <div key={doc.DocID} className="sidebar-doc">
                  {/* Title là Trích yếu */}
                  <Link
                    to={`/documents/${doc.DocID}`}
                    className="doc-title-link"
                    title={doc.Title}
                  >
                    {doc.Title}
                  </Link>
                  {/* DocNumber và IssueDate */}
                  <div className="doc-meta-info">
                    {doc.DocNumber} - {formatDate(doc.IssueDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Banner QC */}
          <div className="sidebar-banner">
            <img
              src="https://dxc.gov.vn/SitePages/uploads/banners/MOI-TRUONG.jpg"
              alt="QC"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
