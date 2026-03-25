import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import {
  FaFileAlt,
  FaLink,
  FaStar,
  FaCaretRight,
  FaAngleDoubleRight,
} from "react-icons/fa";

const HomePage = () => {
  const [slides, setSlides] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);

  const [newsActivityMinistry, setNewsActivityMinistry] = useState([]);
  const [newsActivityCenter, setNewsActivityCenter] = useState([]);
  const [newsDigital, setNewsDigital] = useState([]);
  const [newsPolicy, setNewsPolicy] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [webLinks, setWebLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Slides
        const { data: slidesData, error: slidesError } = await supabase
          .from('slides')
          .select('*')
          .order('slideid', { ascending: true }); // Default order if DisplayOrder is missing

        // Fetch News
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .order('publisheddate', { ascending: false });

        // Fetch Documents
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .order('publisheddate', { ascending: false });

        // Fetch WebLinks
        const { data: linksData, error: linksError } = await supabase
          .from('weblinks')
          .select('*')
          .filter('isshow', 'eq', true)
          .order('stt', { ascending: true });

        if (slidesError) console.error("Error slides:", slidesError);
        if (newsError) console.error("Error news:", newsError);
        if (docsError) console.error("Error docs:", docsError);
        if (linksError) console.error("Error links:", linksError);

        setSlides(slidesData || []);
        
        let allNews = newsData || [];
        const getNewsByCategory = (catId, count, excludeIds = []) => {
          let filtered = allNews.filter((n) => n.categoryid === catId);
          if (filtered.length < count) {
            const remaining = allNews.filter(
              (n) => n.categoryid !== catId && !excludeIds.includes(n.newsid)
            );
            filtered = [...filtered, ...remaining.slice(0, count - filtered.length)];
          }
          return filtered.slice(0, count);
        };

        setFeaturedNews(getNewsByCategory(15, 4));
        setNewsActivityMinistry(getNewsByCategory(12, 5));
        setNewsActivityCenter(getNewsByCategory(17, 5));
        setNewsDigital(getNewsByCategory(16, 5));
        setNewsPolicy(getNewsByCategory(10, 5));
        setDocuments(docsData || []);
        setWebLinks(linksData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (loading) return <div className="text-center py-10 font-medium text-gov-text-sub">Đang tải dữ liệu...</div>;

  const bigNews = featuredNews[0];
  const subNews = featuredNews.slice(1, 4);

  const SectionHeader = ({ title }) => (
    <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-[10px] px-4 flex justify-between items-center rounded-t-lg border-b-[3px] border-gov-yellow shadow-[0_2px_4px_rgba(190,30,45,0.2)]">
      <h3 className="m-0 text-[14px] uppercase font-bold tracking-[0.5px] flex items-center gap-2">
        <FaStar className="text-gov-yellow text-[13px]" /> {title}
      </h3>
    </div>
  );

  const FirstNewsItem = ({ news }) => (
    <div className="flex flex-col gap-[10px] mb-[12px] group/firstnews">
      <Link to={`/news/${news.newsid}`} className="w-full h-[190px] rounded-md overflow-hidden block">
        <img
          src={news.imagelink || "https://via.placeholder.com/300x200"}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/firstnews:scale-[1.05]"
        />
      </Link>
      <div>
        <h4 className="m-0 text-[15px] leading-[1.4] mb-1">
          <Link to={`/news/${news.newsid}`} className="font-bold text-gov-text group-hover/firstnews:text-gov-red transition-colors duration-300">
            {news.title}
          </Link>
        </h4>
        <p className="text-[13px] text-gov-text-sub m-0 line-clamp-2 leading-[1.5] text-justify">
          {news.summary}
        </p>
      </div>
    </div>
  );

  const NewsListItem = ({ news }) => (
    <div className="text-[14px] flex items-start py-[3px]">
      <FaCaretRight className="text-gov-red mt-[3px] mr-[8px] text-[13px] flex-shrink-0" />
      <Link to={`/news/${news.newsid}`} title={news.title} className="text-gov-text leading-[1.5] hover:text-gov-red transition-colors duration-300">
        {news.title}{" "}
        <span className="text-[12px] text-slate-400 font-normal ml-1 whitespace-nowrap">({formatDate(news.publisheddate)})</span>
      </Link>
    </div>
  );

  const CategoryBlock = ({ title, data }) => (
    <div className="bg-white mb-0 rounded-lg border border-gov-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <SectionHeader title={title} />
      <div className="p-[14px] bg-white rounded-b-lg">
        {data.length > 0 && <FirstNewsItem news={data[0]} />}
        <div className="border-b border-gov-border my-[10px]"></div>
        <div className="flex flex-col gap-[6px]">
          {data.slice(1).map((item) => (
            <NewsListItem key={item.newsid} news={item} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gov-bg-body font-sans text-gov-text text-[14px] w-full min-h-screen antialiased">
      <div className="max-w-[1280px] mx-auto px-4 pt-[20px] pb-[30px]">

        {/* SECTION 1: TIN NỔI BẬT + SLIDE */}
        <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-[18px] mb-[20px]">
          {/* Cột trái: Tin nổi bật */}
          <div>
            <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-[10px] px-4 flex items-center rounded-t-lg border-b-[3px] border-gov-yellow shadow-[0_2px_4px_rgba(190,30,45,0.2)]">
              <span className="text-[14px] uppercase font-bold tracking-[0.5px]">TIN NỔI BẬT</span>
            </div>
            <div className="bg-white border border-gov-border border-t-0 p-[16px] rounded-b-lg shadow-sm">
              {bigNews && (
                <div>
                  <Link
                    to={`/news/${bigNews.newsid}`}
                    className="block w-full h-[300px] md:h-[380px] overflow-hidden mb-[14px] rounded-md relative group/thumb"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-md z-10"></div>
                    <img
                      src={bigNews.imagelink || "https://via.placeholder.com/600x400"}
                      alt={bigNews.title}
                      className="w-full h-full object-cover transition-transform duration-[600ms] group-hover/thumb:scale-[1.04]"
                    />
                  </Link>
                  <h2 className="text-[20px] m-0 mb-[8px] leading-[1.35] font-bold tracking-[-0.3px]">
                    <Link to={`/news/${bigNews.newsid}`} className="text-gov-text hover:text-gov-red transition-colors duration-300">
                      {bigNews.title}
                    </Link>
                  </h2>
                  <p className="text-gov-text-sub text-[14px] leading-[1.6] text-justify mb-[14px] line-clamp-2 overflow-hidden">
                    {bigNews.summary}
                  </p>
                </div>
              )}
              {/* Sub news grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] border-t border-gov-border pt-[14px] mb-[12px]">
                {subNews.map((news) => (
                  <div key={news.newsid} className="flex flex-row md:flex-col items-center md:items-stretch gap-[10px] group/subitem">
                    <Link
                      to={`/news/${news.newsid}`}
                      className="w-[110px] md:w-full h-[75px] md:h-[120px] flex-shrink-0 overflow-hidden rounded-md"
                    >
                      <img src={news.imagelink} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/subitem:scale-[1.05]" />
                    </Link>
                    <Link
                      to={`/news/${news.newsid}`}
                      className="text-[13.5px] font-semibold leading-[1.5] text-gov-text line-clamp-3 group-hover/subitem:text-gov-red transition-colors duration-300"
                    >
                      {news.title}
                    </Link>
                  </div>
                ))}
              </div>
              <div className="text-right border-t border-gov-border pt-[10px]">
                <Link to="/news" className="inline-flex items-center gap-[5px] text-[13px] font-semibold text-gov-red py-[6px] px-[14px] rounded-full bg-gov-red-light transition-all duration-300 hover:bg-gov-red hover:text-white hover:shadow-[0_4px_8px_rgba(190,30,45,0.2)]">
                  Xem tất cả tin tức <FaAngleDoubleRight />
                </Link>
              </div>
            </div>
          </div>

          {/* Cột phải: Banner/Slide */}
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] lg:grid-cols-1 gap-[12px]">
            {slides.map((slide) => (
              <a
                key={slide.slideid}
                href={slide.linkurl || "#"}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-md"
              >
                <img src={slide.imagelink} alt={slide.name} className="w-full h-auto block object-cover" />
              </a>
            ))}
          </div>
        </div>

        {/* SECTION 2: NỘI DUNG CHÍNH + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-[2.8fr_1.2fr] gap-[18px]">
          {/* Cột chính: 4 khối tin */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[16px]">
              <CategoryBlock title="Hoạt động CĐS Bộ" data={newsActivityMinistry} />
              <CategoryBlock title="Hoạt động CĐS Trung tâm" data={newsActivityCenter} />
            </div>

            <div className="mb-[16px] rounded-lg overflow-hidden shadow-sm">
              <img
                src="https://dxc.gov.vn/SitePages/uploads/banners/banners.jpg"
                alt="Banner"
                className="w-full block"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <CategoryBlock title="Điểm tin Chuyển đổi số" data={newsDigital} />
              <CategoryBlock title="Chính sách - Văn bản" data={newsPolicy} />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="flex flex-col gap-[16px]">
            {/* Liên kết website */}
            <div className="bg-white rounded-lg border border-gov-border shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-[10px] px-4 rounded-t-lg border-b-[3px] border-gov-yellow">
                <span className="text-[14px] uppercase font-bold tracking-[0.5px]">LIÊN KẾT WEBSITE</span>
              </div>
              <ul className="list-none py-[6px] px-[6px] m-0 rounded-b-lg">
                {webLinks
                  .filter((l) => l.isshow)
                  .map((link) => (
                    <li key={link.linkid} className="py-[8px] px-[12px] border-b border-gov-border flex items-center gap-[10px] transition-all duration-300 last:border-b-0 hover:bg-gov-red-light rounded-md">
                      <FaLink className="text-gov-red text-[12px] flex-shrink-0" />
                      <a href={link.url} target="_blank" rel="noreferrer" className="font-semibold text-[13px] text-gov-text flex-1 hover:text-gov-red transition-colors duration-300">
                        {link.name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Văn bản mới */}
            <div className="bg-white rounded-lg border border-gov-border shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="bg-gradient-to-br from-gov-red to-[#aa1a28] text-white py-[10px] px-4 rounded-t-lg border-b-[3px] border-gov-yellow">
                <span className="text-[14px] uppercase font-bold tracking-[0.5px] flex items-center gap-2">
                  <FaFileAlt /> VĂN BẢN MỚI
                </span>
              </div>
              <div className="p-[12px_14px]">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.docid} className="mb-[10px] border-b border-dashed border-gov-border pb-[10px] last:border-none last:pb-0 last:mb-0 hover:translate-x-[2px] transition-transform duration-300">
                    <Link
                      to={`/documents/${doc.docid}`}
                      className="block font-semibold text-[13px] text-gov-text mb-[4px] leading-[1.5] hover:text-gov-red transition-colors duration-300 line-clamp-2"
                    >
                      {doc.title}
                    </Link>
                    <div className="text-[12px] text-gov-text-sub flex items-center gap-[4px]">
                      Số: <b className="text-gov-text font-semibold">{doc.number}</b> - NH: {formatDate(doc.publisheddate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-sm">
              <img
                src="https://dxc.gov.vn/SitePages/uploads/banners/MOI-TRUONG.jpg"
                alt="QC"
                className="w-full block transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
