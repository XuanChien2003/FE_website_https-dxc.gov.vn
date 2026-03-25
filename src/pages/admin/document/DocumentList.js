import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
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
    if (searchParams.keyword) {
      const term = searchParams.keyword.toLowerCase();
      const scope = searchParams.scope;

      results = results.filter((doc) => {
        if (scope === "all") {
          return (
            doc.number?.toLowerCase().includes(term) ||
            doc.agencies?.name?.toLowerCase().includes(term) ||
            doc.documenttypes?.name?.toLowerCase().includes(term) ||
            doc.fields?.name?.toLowerCase().includes(term) ||
            doc.signers?.name?.toLowerCase().includes(term) ||
            doc.title?.toLowerCase().includes(term) ||
            doc.createdby?.toLowerCase().includes(term) ||
            doc.updatedby?.toLowerCase().includes(term)
          );
        }

        // Tìm theo cột cụ thể
        if (scope === "DocNumber")
          return doc.number?.toLowerCase().includes(term);
        if (scope === "AgencyName")
          return doc.agencies?.name?.toLowerCase().includes(term);
        if (scope === "TypeName")
          return doc.documenttypes?.name?.toLowerCase().includes(term);
        if (scope === "FieldName")
          return doc.fields?.name?.toLowerCase().includes(term);
        if (scope === "SignerName")
          return doc.signers?.name?.toLowerCase().includes(term);
        if (scope === "Title") return doc.title?.toLowerCase().includes(term);
        if (scope === "CreatedBy")
          return doc.createdby?.toLowerCase().includes(term);
        if (scope === "UpdatedBy")
          return doc.updatedby?.toLowerCase().includes(term);
        return true;
      });
    }

    // 2. Lọc theo Trạng thái (Riêng biệt)
    if (searchParams.publishStatus && searchParams.publishStatus !== "all") {
      results = results.filter(
        (doc) => doc.status === searchParams.publishStatus
      );
    }

    // 3. Lọc theo Ngày
    if (searchParams.dateFrom) {
      results = results.filter(
        (doc) => new Date(doc.publisheddate) >= new Date(searchParams.dateFrom)
      );
    }
    if (searchParams.dateTo) {
      results = results.filter(
        (doc) => new Date(doc.publisheddate) <= new Date(searchParams.dateTo)
      );
    }

    setFilteredDocs(results);
    setCurrentPage(1);
  }, [searchParams, docs]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*, agencies(name), documenttypes(name), fields(name), signers(name)')
        .order('publisheddate', { ascending: false });
        
      if (error) throw error;
      setDocs(data || []);
      setFilteredDocs(data || []);
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
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('docid', id);
        if (error) throw error;
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
      "Quyết định": "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]",
      "Nghị định": "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]",
      "Chỉ thị": "bg-[#fef9c3] text-[#a16207] border border-[#fde047]",
      "Thông tư": "bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]",
      "Công văn": "bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]",
    };
    return m[t] || "bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]";
  };

  const getStatusClass = (s) => {
    if (s === "Active") return "bg-[#22c55e] text-white";
    if (s === "Chưa xuất bản" || s === "Inactive") return "bg-[#f59e0b] text-white";
    return "bg-[#e2e8f0] text-[#475569]";
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
      <div className="flex gap-[4px]">
        <button
          className="min-w-[30px] h-[30px] border border-[#cbd5e1] flex items-center justify-center bg-white rounded-[4px] cursor-pointer disabled:opacity-50 transition-colors"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft className="text-[12px]" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="flex items-center justify-center min-w-[30px] h-[30px] text-[#94a3b8]">
              ...
            </span>
          ) : (
            <button
              key={i}
              className={`min-w-[30px] h-[30px] border border-[#cbd5e1] bg-white rounded-[4px] cursor-pointer transition-colors ${currentPage === p ? 'bg-[#2c5282] text-white border-[#2c5282]' : 'hover:bg-slate-50'}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="min-w-[30px] h-[30px] border border-[#cbd5e1] flex items-center justify-center bg-white rounded-[4px] cursor-pointer disabled:opacity-50 transition-colors"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight className="text-[12px]" />
        </button>
      </div>
    );
  };

  return (
    <div className="p-[20px] bg-[#f8fafc] min-h-screen font-sans text-[13.5px] text-[#334155]">
      <div className="flex justify-between items-center mb-[20px] bg-white p-[15px_20px] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-l-[5px] border-[#2c5282]">
        <h2 className="text-[18px] font-bold text-[#2c5282] flex items-center gap-[10px] uppercase m-0">
          <FaFileAlt /> QUẢN LÝ VĂN BẢN
        </h2>
        <div className="flex gap-[10px]">
          <button
            className={`bg-white border text-[#2c5282] py-[8px] px-[16px] rounded-md font-semibold flex items-center gap-[8px] cursor-pointer transition-all duration-200 hover:bg-[#eff6ff] hover:border-[#2c5282] ${showSearch ? 'bg-[#eff6ff] border-[#2c5282]' : 'border-[#cbd5e1]'}`}
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <FaTimes /> : <FaFilter />}{" "}
            {showSearch ? "Đóng tìm kiếm" : "Bộ lọc tìm kiếm"}
          </button>
          <button className="bg-[#2c5282] text-white border-none py-[9px] px-[18px] rounded-md font-semibold flex items-center gap-[8px] cursor-pointer transition-colors duration-200 hover:bg-[#1e3a8a]" onClick={() => navigate("add")}>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* --- FORM TÌM KIẾM --- */}
      <div className={`overflow-hidden transition-all duration-400 opacity-0 mb-0 ${showSearch ? 'max-h-[500px] opacity-100 mb-[20px]' : 'max-h-0'}`}>
        <div className="bg-white p-[25px] rounded-lg border border-[#cbd5e1] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col gap-[15px]">
          {/* HÀNG 1: TỪ KHÓA + TÌM THEO (Bao gồm cả Lĩnh vực trong này) */}
          <div className="flex gap-[15px] w-full flex-col md:flex-row md:gap-[15px]">
            <div className="flex flex-col flex-[2]">
              <div className="relative w-full">
                <FaSearch className="absolute top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] left-[12px]" />
                <input
                  type="text"
                  className="p-[10px_12px_10px_36px] border border-[#d1d5db] rounded-[4px] text-[14px] text-[#334155] outline-none w-full h-[42px] bg-white transition-all duration-200 focus:border-[#2c5282] focus:ring-[2px] focus:ring-[#2c5282]/10"
                  name="keyword"
                  placeholder="Từ khóa tìm kiếm"
                  value={searchParams.keyword}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="relative w-full">
                <FaTag className="absolute top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] left-[12px]" />
                <select
                  className="p-[10px_12px_10px_36px] border border-[#d1d5db] rounded-[4px] text-[14px] text-[#334155] outline-none w-full h-[42px] bg-white transition-all duration-200 focus:border-[#2c5282] focus:ring-[2px] focus:ring-[#2c5282]/10 cursor-pointer appearance-none"
                  name="scope"
                  value={searchParams.scope}
                  onChange={handleSearchChange}
                >
                  <option value="all">Chọn phạm vi tìm kiếm</option>
                  <option value="DocNumber">Số/Ký hiệu</option>
                  <option value="AgencyName">Cơ quan ban hành</option>
                  <option value="TypeName">Loại văn bản</option>
                  <option value="FieldName">Lĩnh vực</option>
                  <option value="SignerName">Người ký</option>
                  <option value="Title">Trích Yếu</option>
                  <option value="CreatedBy">Người tạo</option>
                  <option value="UpdatedBy">Người sửa cuối</option>
                </select>
              </div>
            </div>
          </div>

          {/* HÀNG 2: TRẠNG THÁI (Riêng biệt, full width cho đẹp) */}
          <div className="flex gap-[15px] w-full flex-col md:flex-row md:gap-[15px]">
            <div className="flex flex-col flex-1 w-full">
              <div className="relative w-full">
                <FaInfoCircle className="absolute top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] left-[12px]" />
                <select
                  className="p-[10px_12px_10px_36px] border border-[#d1d5db] rounded-[4px] text-[14px] text-[#334155] outline-none w-full h-[42px] bg-white transition-all duration-200 focus:border-[#2c5282] focus:ring-[2px] focus:ring-[#2c5282]/10 cursor-pointer appearance-none"
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
          <div className="flex gap-[15px] w-full flex-col md:flex-row md:gap-[15px]">
            <div className="flex flex-col flex-1">
              <div className="relative w-full">
                <FaCalendarAlt className="absolute top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] left-[12px]" />
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  className="p-[10px_12px_10px_36px] border border-[#d1d5db] rounded-[4px] text-[14px] text-[#334155] outline-none w-full h-[42px] bg-white transition-all duration-200 focus:border-[#2c5282] focus:ring-[2px] focus:ring-[#2c5282]/10"
                  name="dateFrom"
                  placeholder="Ngày tạo"
                  value={searchParams.dateFrom}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="relative w-full">
                <FaCalendarAlt className="absolute top-1/2 -translate-y-1/2 text-[#94a3b8] text-[14px] left-[12px]" />
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  className="p-[10px_12px_10px_36px] border border-[#d1d5db] rounded-[4px] text-[14px] text-[#334155] outline-none w-full h-[42px] bg-white transition-all duration-200 focus:border-[#2c5282] focus:ring-[2px] focus:ring-[#2c5282]/10"
                  name="dateTo"
                  placeholder="Ngày kết"
                  value={searchParams.dateTo}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex-[0_0_150px] md:w-auto w-full">
              <button className="w-full h-[42px] bg-[#4285f4] text-white border-none rounded-[4px] font-semibold text-[14px] flex items-center justify-center gap-[8px] cursor-pointer transition-opacity duration-200 hover:opacity-90" onClick={() => { }}>
                <FaSearch /> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden border border-[#cbd5e1] mt-[20px]">
        <div className="w-full overflow-x-auto min-h-[300px]">
          <table className="w-full border-collapse table-fixed min-w-[1100px]">
            <thead>
              <tr>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[8%]">Số/Ký hiệu</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[6.5%]">Ban hành</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[6.5%]">Hiệu lực</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[11%]">Cơ quan</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[7%]">Loại</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[7%]">Lĩnh vực</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[9%]">Người ký</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[15%]">Trích Yếu</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[7%]">Người tạo</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[7%]">Người sửa cuối</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-[#ffffff]/30 leading-[1.3] w-[8%]">Trạng thái</th>
                <th className="bg-[#2c5282] text-white font-semibold uppercase text-[12px] text-center p-[12px_2px] align-middle border-r border-transparent leading-[1.3] w-[7%]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((doc) => (
                  <tr key={doc.docid} className="even:bg-[#f8fafc] hover:bg-[#e2e8f0] group">
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] font-semibold text-[#2c5282] text-center">{doc.number}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[12.5px] text-center">{displayDate(doc.publisheddate)}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[12.5px] text-center">{displayDate(doc.effectivedate)}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px]">{doc.agencies?.name}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] text-center">
                      <span className={`inline-block p-[2px_6px] rounded-[4px] text-[11px] font-semibold whitespace-nowrap ${getTypeClass(doc.documenttypes?.name)}`}>
                        {doc.documenttypes?.name}
                      </span>
                    </td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px]">{doc.fields?.name}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px]">{doc.signers?.name}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] leading-[1.4] text-justify">{doc.title}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[12px] text-[#475569]">{doc.createdby}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[12px] text-[#475569]">{doc.updatedby}</td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] text-center">
                      <span className={`inline-block p-[2px_8px] rounded-[50px] text-[11px] font-semibold whitespace-nowrap ${getStatusClass(doc.status)}`}>
                        {doc.status || "Chưa cập nhật"}
                      </span>
                    </td>
                    <td className="p-[8px_4px] border border-[#cbd5e1] align-middle break-words text-[13px] text-center">
                      <div className="flex justify-center gap-[4px]">
                        <button
                          className="w-[26px] h-[26px] rounded-[4px] border border-[#cbd5e1] bg-white text-[#64748b] cursor-pointer flex items-center justify-center transition-all hover:-translate-y-[1px] hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#eff6ff]"
                          title="Sửa"
                          onClick={() => navigate(`edit/${doc.docid}`)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="w-[26px] h-[26px] rounded-[4px] border border-[#cbd5e1] bg-white text-[#64748b] cursor-pointer flex items-center justify-center transition-all hover:-translate-y-[1px] hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                          title="Xóa"
                          onClick={() => handleDelete(doc.docid)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center p-[30px] text-[#999] border border-[#cbd5e1]">
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-[12px_20px] border-t border-[#cbd5e1] bg-white flex justify-between items-center rounded-b-lg">
          <div className="text-[#334155]">
            Hiển thị <b className="text-[#2c5282]">{currentItems.length}</b> / <b className="text-[#2c5282]">{filteredDocs.length}</b>{" "}
            văn bản
          </div>
          {totalPages > 1 && renderPagination()}
        </div>
      </div>
    </div>
  );
};
export default DocumentList;
