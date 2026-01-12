import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaTag,
  FaInfoCircle,
} from "react-icons/fa";
import "./DocumentList.css";

const DocumentList = () => {
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showSearch, setShowSearch] = useState(false);

  const [searchParams, setSearchParams] = useState({
    keyword: "",
    scope: "all",
    publishStatus: "all", // Trạng thái tìm riêng
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  // --- LOGIC BỘ LỌC ---
  useEffect(() => {
    let results = docs;

    // 1. Lọc theo Từ khóa & Phạm vi
    // "Lĩnh vực" giờ đã nằm trong scope (FieldName)
    if (searchParams.keyword) {
      const term = searchParams.keyword.toLowerCase();
      const scope = searchParams.scope;

      results = results.filter((doc) => {
        if (scope === "all") {
          return (
            doc.DocNumber?.toLowerCase().includes(term) ||
            doc.AgencyName?.toLowerCase().includes(term) ||
            doc.TypeName?.toLowerCase().includes(term) ||
            doc.FieldName?.toLowerCase().includes(term) || // Tìm cả lĩnh vực
            doc.SignerName?.toLowerCase().includes(term) ||
            doc.Title?.toLowerCase().includes(term) ||
            doc.CreatedBy?.toLowerCase().includes(term) ||
            doc.UpdatedBy?.toLowerCase().includes(term)
          );
        }

        // Tìm theo cột cụ thể
        if (scope === "DocNumber")
          return doc.DocNumber?.toLowerCase().includes(term);
        if (scope === "AgencyName")
          return doc.AgencyName?.toLowerCase().includes(term);
        if (scope === "TypeName")
          return doc.TypeName?.toLowerCase().includes(term);
        if (scope === "FieldName")
          return doc.FieldName?.toLowerCase().includes(term); // Lĩnh vực nằm ở đây
        if (scope === "SignerName")
          return doc.SignerName?.toLowerCase().includes(term);
        if (scope === "Title") return doc.Title?.toLowerCase().includes(term);
        if (scope === "CreatedBy")
          return doc.CreatedBy?.toLowerCase().includes(term);
        if (scope === "UpdatedBy")
          return doc.UpdatedBy?.toLowerCase().includes(term);
        return true;
      });
    }

    // 2. Lọc theo Trạng thái (Riêng biệt)
    if (searchParams.publishStatus && searchParams.publishStatus !== "all") {
      results = results.filter(
        (doc) => doc.PublishStatus === searchParams.publishStatus
      );
    }

    // 3. Lọc theo Ngày
    if (searchParams.dateFrom) {
      results = results.filter(
        (doc) => new Date(doc.IssueDate) >= new Date(searchParams.dateFrom)
      );
    }
    if (searchParams.dateTo) {
      results = results.filter(
        (doc) => new Date(doc.IssueDate) <= new Date(searchParams.dateTo)
      );
    }

    setFilteredDocs(results);
    setCurrentPage(1);
  }, [searchParams, docs]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents");
      setDocs(res.data);
      setFilteredDocs(res.data);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu!");
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // Helpers
  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa văn bản này?")) {
      try {
        await api.delete(`/documents/${id}`);
        toast.success("Đã xóa!");
        fetchDocuments();
      } catch (err) {
        toast.error("Lỗi xóa!");
      }
    }
  };
  const displayDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");
  const getTypeClass = (t) => {
    const m = {
      "Quyết định": "type-qd",
      "Nghị định": "type-nd",
      "Chỉ thị": "type-ct",
      "Thông tư": "type-tt",
      "Công văn": "type-cv",
    };
    return m[t] || "";
  };
  const getStatusClass = (s) => {
    if (s === "Đã xuất bản") return "status-published";
    if (s === "Chưa xuất bản") return "status-pending";
    return "status-default";
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const renderPagination = () => {
    const pages = [];
    if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) pages.push(i);
    else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
      else if (currentPage >= totalPages - 2)
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      else
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
    }
    return (
      <div className="pagination">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="page-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={i}
              className={currentPage === p ? "active" : ""}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className="document-manager">
      <div className="page-header">
        <h2 className="page-title">
          <FaFileAlt /> QUẢN LÝ VĂN BẢN
        </h2>
        <div className="header-actions">
          <button
            className={`search-toggle-btn ${showSearch ? "active" : ""}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <FaTimes /> : <FaFilter />}{" "}
            {showSearch ? "Đóng tìm kiếm" : "Bộ lọc tìm kiếm"}
          </button>
          <button className="btn-primary" onClick={() => navigate("add")}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* --- FORM TÌM KIẾM --- */}
      <div className={`advanced-search-container ${showSearch ? "open" : ""}`}>
        <div className="search-panel">
          {/* HÀNG 1: TỪ KHÓA + TÌM THEO (Bao gồm cả Lĩnh vực trong này) */}
          <div className="search-row">
            <div className="search-group" style={{ flex: 2 }}>
              <div className="input-with-icon">
                <FaSearch className="input-icon left" />
                <input
                  type="text"
                  className="form-control"
                  name="keyword"
                  placeholder="Từ khóa tìm kiếm"
                  value={searchParams.keyword}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="search-group" style={{ flex: 1 }}>
              <div className="input-with-icon">
                <FaTag className="input-icon left" />
                <select
                  className="form-control"
                  name="scope"
                  value={searchParams.scope}
                  onChange={handleSearchChange}
                >
                  <option value="all">Chọn phạm vi tìm kiếm</option>
                  <option value="DocNumber">Số/Ký hiệu</option>
                  <option value="AgencyName">Cơ quan ban hành</option>
                  <option value="TypeName">Loại văn bản</option>
                  <option value="FieldName">Lĩnh vực</option>{" "}
                  {/* Đã đưa vào đây */}
                  <option value="SignerName">Người ký</option>
                  <option value="Title">Trích Yếu</option>
                  <option value="CreatedBy">Người tạo</option>
                  <option value="UpdatedBy">Người sửa cuối</option>
                </select>
              </div>
            </div>
          </div>

          {/* HÀNG 2: TRẠNG THÁI (Riêng biệt, full width cho đẹp) */}
          <div className="search-row">
            <div className="search-group full-width">
              <div className="input-with-icon">
                <FaInfoCircle className="input-icon left" />
                <select
                  className="form-control"
                  name="publishStatus"
                  value={searchParams.publishStatus}
                  onChange={handleSearchChange}
                >
                  <option value="all">Tất cả</option>
                  <option value="Đã xuất bản">Đã xuất bản</option>
                  <option value="Chờ duyệt">Chưa xuất bản</option>
                </select>
              </div>
            </div>
          </div>

          {/* HÀNG 3: NGÀY + NÚT */}
          <div className="search-row bottom-row">
            <div className="search-group">
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon left" />
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  className="form-control"
                  name="dateFrom"
                  placeholder="Ngày tạo"
                  value={searchParams.dateFrom}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="search-group">
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon left" />
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  className="form-control"
                  name="dateTo"
                  placeholder="Ngày kết"
                  value={searchParams.dateTo}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="search-group btn-container">
              <button className="btn-search-block" onClick={() => {}}>
                <FaSearch /> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-number">Số/Ký hiệu</th>
                <th className="col-date">Ban hành</th>
                <th className="col-date">Hiệu lực</th>
                <th className="col-agency">Cơ quan</th>
                <th className="col-type">Loại</th>
                <th className="col-field">Lĩnh vực</th>
                <th className="col-signer">Người ký</th>
                <th className="col-title">Trích Yếu</th>
                <th className="col-info">Người tạo</th>
                <th className="col-info">Người sửa cuối</th>
                <th className="col-status">Trạng thái</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((doc) => (
                  <tr key={doc.DocID}>
                    <td className="col-number">{doc.DocNumber}</td>
                    <td className="col-date">{displayDate(doc.IssueDate)}</td>
                    <td className="col-date">
                      {displayDate(doc.EffectiveDate)}
                    </td>
                    <td className="col-agency">{doc.AgencyName}</td>
                    <td className="col-type">
                      <span
                        className={`doc-type ${getTypeClass(doc.TypeName)}`}
                      >
                        {doc.TypeName}
                      </span>
                    </td>
                    <td className="col-field">{doc.FieldName}</td>
                    <td className="col-signer">{doc.SignerName}</td>
                    <td className="col-title">{doc.Title}</td>
                    <td className="col-info">{doc.CreatedBy}</td>
                    <td className="col-info">{doc.UpdatedBy}</td>
                    <td className="col-status">
                      <span
                        className={`doc-status ${getStatusClass(
                          doc.PublishStatus
                        )}`}
                      >
                        {doc.PublishStatus || "Chưa cập nhật"}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="btn-group">
                        <button
                          className="btn-icon btn-edit"
                          title="Sửa"
                          onClick={() => navigate(`edit/${doc.DocID}`)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          title="Xóa"
                          onClick={() => handleDelete(doc.DocID)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="no-data">
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <div>
            Hiển thị <b>{currentItems.length}</b> / <b>{filteredDocs.length}</b>{" "}
            văn bản
          </div>
          {totalPages > 1 && renderPagination()}
        </div>
      </div>
    </div>
  );
};
export default DocumentList;
