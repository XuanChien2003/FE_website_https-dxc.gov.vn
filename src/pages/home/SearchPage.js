import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { FaSearch, FaFileAlt, FaNewspaper, FaHome, FaAngleRight } from "react-icons/fa";
import { removeVietnameseTones } from "../../utils/stringUtils";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const rawQ = searchParams.get("q") || "";
  const keyword = rawQ.toLowerCase().trim();
  const normalizedKeyword = removeVietnameseTones(keyword);

  const [news, setNews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar data
  const [webLinks, setWebLinks] = useState([]);
  const [newDocs, setNewDocs] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [resNews, resDocs, resLinks] = await Promise.all([
          supabase.from('news').select('*').order('publisheddate', { ascending: false }),
          supabase.from('documents').select('*').order('publisheddate', { ascending: false }),
          supabase.from('weblinks').select('*').filter('isshow', 'eq', true).order('stt', { ascending: true }),
        ]);

        const allNews = resNews.data || [];
        const allDocs = resDocs.data || [];

        const filteredNews = allNews.filter(n => 
          (n.title && removeVietnameseTones(n.title).includes(normalizedKeyword)) ||
          (n.content && removeVietnameseTones(n.content).includes(normalizedKeyword))
        );

        const filteredDocs = allDocs.filter(d => 
          (d.title && removeVietnameseTones(d.title).includes(normalizedKeyword)) ||
          (d.number && removeVietnameseTones(d.number).includes(normalizedKeyword))
        );

        setNews(filteredNews);
        setDocuments(filteredDocs);
        setWebLinks(resLinks.data || []);
        setNewDocs(allDocs.slice(0, 5));
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [keyword, normalizedKeyword]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-gov-bg-body font-sans text-gov-text text-[14px] pb-10 pt-[25px] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-gray-500 mb-5 flex items-center flex-wrap gap-2">
          <Link to="/" className="hover:text-black hover:underline transition-colors flex items-center gap-1">
            <FaHome className="text-[11px]" /> Trang chủ
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-black font-semibold">Tìm kiếm</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-[25px]">
          {/* CỘT TRÁI */}
          <div>
             <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-3 px-[15px] border-b-[3px] border-gov-yellow font-bold uppercase text-[15px] flex items-center mb-[20px] rounded-t-lg">
              <span className="flex items-center">
                <FaSearch style={{ marginRight: "8px" }} /> KẾT QUẢ TÌM KIẾM CHO: "{rawQ}"
              </span>
            </div>

            {loading ? (
              <div className="text-center py-10">Đang tìm kiếm...</div>
            ) : !keyword ? (
              <div className="text-center py-10">Vui lòng nhập từ khóa tìm kiếm.</div>
            ) : (
              <>
                {/* Tin Tức */}
                <div className="mb-8 p-5 bg-white border border-gov-border rounded shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
                  <h3 className="text-[16px] text-gov-red font-bold mb-4 flex items-center gap-2 border-b pb-2">
                    <FaNewspaper /> TIN TỨC ({news.length})
                  </h3>
                  {news.length > 0 ? (
                    news.map((item) => (
                      <div key={item.newsid} className="mb-5 pb-5 border-b border-[#eee] flex flex-col sm:flex-row gap-[15px] last:border-b-0 last:mb-0 last:pb-0">
                        {item.imageurl && (
                          <Link to={`/news/${item.newsid}`} className="shrink-0">
                            <img src={item.imageurl} alt={item.title} className="w-full sm:w-[150px] h-[100px] object-cover rounded shadow-sm" />
                          </Link>
                        )}
                        <div>
                          <Link to={`/news/${item.newsid}`} className="block text-[15px] font-bold text-[#333] mb-2 hover:text-gov-red leading-snug">
                            {item.title}
                          </Link>
                          <div className="text-[13px] text-[#666] mb-2">{formatDate(item.publisheddate)}</div>
                          <div className="text-[13px] text-[#444] line-clamp-2 text-justify">
                            {item.summary || "Chi tiết tin tức..."}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#666] italic">Không tìm thấy tin tức nào.</div>
                  )}
                </div>

                {/* Văn Bản */}
                <div className="p-5 bg-white border border-gov-border rounded shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
                  <h3 className="text-[16px] text-gov-red font-bold mb-4 flex items-center gap-2 border-b pb-2">
                    <FaFileAlt /> VĂN BẢN ({documents.length})
                  </h3>
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <div key={doc.docid} className="mb-4 pb-4 border-b border-dashed border-[#eee] last:border-b-0 last:mb-0 last:pb-0">
                        <Link to={`/documents/${doc.docid}`} className="block text-[14px] font-bold text-[#333] mb-1 hover:text-gov-red leading-snug text-justify">
                          {doc.title}
                        </Link>
                        <div className="text-[12px] text-[#666]">
                          Số: <b>{doc.number}</b> - Ban hành: {formatDate(doc.publisheddate)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#666] italic">Không tìm thấy văn bản nào.</div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* CỘT PHẢI */}
           <div>
            {/* BOX 1: WEBLINKS */}
             {webLinks.length > 0 && (
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
             )}

            {/* BOX 2: VĂN BẢN MỚI */}
            {newDocs.length > 0 && (
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
            )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
