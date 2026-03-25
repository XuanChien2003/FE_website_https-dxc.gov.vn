import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { toast } from "react-toastify";
import {
  FaSave,
  FaArrowLeft,
  FaTimes,
  FaCalendarAlt,
  FaImage,
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaUndo,
  FaRedo,
  FaLink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaMagic,
} from "react-icons/fa";

// --- TIPTAP IMPORTS ---
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

// --- COMPONENT THANH CÔNG CỤ (TOOLBAR) ---
const MenuBar = ({ editor, onOpenAI }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("Nhập đường dẫn ảnh (URL):");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập đường dẫn (URL):", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const baseBtnClass = "border-none rounded-[4px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer transition-all duration-200 text-[14px]";
  const activeBtnClass = `${baseBtnClass} bg-[#2c3e50] text-white`;
  const inactiveBtnClass = `${baseBtnClass} bg-transparent text-[#333] hover:bg-[#e2e6ea] hover:text-black`;

  return (
    <div className="bg-[#f8f9fa] p-[8px] border-b border-[#ddd] flex flex-wrap gap-[5px] items-center">
      {/* NÚT AI WRITER */}
      <div className="flex gap-[2px]">
        <button
          type="button"
          onClick={onOpenAI}
          className="bg-gradient-to-br from-[#667eea] to-[#764ba2] !text-white font-bold !w-auto h-[32px] px-[10px] !rounded-[20px] gap-[6px] shadow-[0_2px_5px_rgba(118,75,162,0.4)] hover:opacity-90 hover:-translate-y-[1px] flex items-center cursor-pointer border-none transition-all"
          title="Viết bài tự động bằng AI"
        >
          <FaMagic /> <span className="text-[13px]">Viết bằng AI</span>
        </button>
      </div>

      <div className="w-[1px] h-[24px] bg-[#ccc] my-0 mx-[8px]"></div>

      {/* Group: Format Text */}
      <div className="flex gap-[2px]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? activeBtnClass : inactiveBtnClass}
          title="In đậm"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? activeBtnClass : inactiveBtnClass}
          title="In nghiêng"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? activeBtnClass : inactiveBtnClass}
          title="Gạch chân"
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? activeBtnClass : inactiveBtnClass}
          title="Gạch ngang"
        >
          <FaStrikethrough />
        </button>
      </div>

      <div className="w-[1px] h-[24px] bg-[#ccc] my-0 mx-[8px]"></div>

      {/* Group: Alignment */}
      <div className="flex gap-[2px]">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? activeBtnClass : inactiveBtnClass}
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? activeBtnClass : inactiveBtnClass}
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? activeBtnClass : inactiveBtnClass}
        >
          <FaAlignRight />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={editor.isActive({ textAlign: "justify" }) ? activeBtnClass : inactiveBtnClass}
        >
          <FaAlignJustify />
        </button>
      </div>

      <div className="w-[1px] h-[24px] bg-[#ccc] my-0 mx-[8px]"></div>

      {/* Group: Lists & Heading */}
      <div className="flex gap-[2px]">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor.isActive("heading", { level: 2 }) ? activeBtnClass : inactiveBtnClass}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={editor.isActive("heading", { level: 3 }) ? activeBtnClass : inactiveBtnClass}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? activeBtnClass : inactiveBtnClass}
        >
          <FaListUl />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? activeBtnClass : inactiveBtnClass}
        >
          <FaListOl />
        </button>
      </div>

      <div className="w-[1px] h-[24px] bg-[#ccc] my-0 mx-[8px]"></div>

      {/* Group: Insert */}
      <div className="flex gap-[2px]">
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive("link") ? activeBtnClass : inactiveBtnClass}
        >
          <FaLink />
        </button>
        <button type="button" onClick={addImage} className={inactiveBtnClass}>
          <FaImage />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? activeBtnClass : inactiveBtnClass}
        >
          <FaQuoteRight />
        </button>
      </div>

      <div className="w-[1px] h-[24px] bg-[#ccc] my-0 mx-[8px]"></div>

      <div className="flex gap-[2px]">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={inactiveBtnClass}
        >
          <FaUndo />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={inactiveBtnClass}
        >
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const NewsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    categoryid: "",
    imagelink: "",
    summary: "",
    content: "",
    isfeatured: false,
    note: "",
    publisheddate: "",
    newsstatus: "Chờ duyệt",
  });

  // --- STATE CHO AI ---
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Khởi tạo Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      ImageExtension.configure({ inline: true, allowBase64: true }),
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({ ...prev, content: html }));
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchNewsDetail(id);
    } else {
      setFormData((prev) => ({
        ...prev,
        publishedDate: formatDateTimeLocal(new Date()),
      }));
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (editor && formData.content && editor.isEmpty && isEditing) {
      editor.commands.setContent(formData.content);
    }
  }, [editor, formData.content, isEditing]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('stt', { ascending: true });
        
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNewsDetail = async (newsId) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('newsid', newsId)
        .single();
        
      if (error) throw error;
      
      setFormData({
        title: data.title,
        categoryid: data.categoryid,
        imagelink: data.imagelink,
        summary: data.summary,
        content: data.content,
        isfeatured: data.isfeatured,
        note: data.note,
        publisheddate: formatDateTimeLocal(data.publisheddate),
        newsstatus: data.newsstatus || "Chờ duyệt",
      });

      if (editor) {
        editor.commands.setContent(data.content);
      }
    } catch (err) {
      toast.error("Lỗi tải thông tin bài viết!");
    }
  };

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        title: formData.title,
        categoryid: parseInt(formData.categoryid),
        imagelink: formData.imagelink,
        summary: formData.summary,
        content: editor ? editor.getHTML() : formData.content,
        isfeatured: formData.isfeatured,
        note: formData.note,
        publisheddate: formData.publisheddate,
        newsstatus: formData.newsstatus,
        updatedby: user.username || "admin"
      };

      if (isEditing) {
        const { error } = await supabase
          .from('news')
          .update(payload)
          .eq('newsid', id);
        if (error) throw error;
        toast.success("Cập nhật thành công!");
      } else {
        payload.createdby = user.username || "admin";
        const { error } = await supabase
          .from('news')
          .insert([payload]);
        if (error) throw error;
        toast.success("Thêm mới thành công!");
      }
      navigate("/admin/news");
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu: " + (err.message || ""));
    }
  };

  // --- HÀM XỬ LÝ AI GENERATE ---
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return toast.warning("Vui lòng nhập yêu cầu cho AI!");
    
    setIsGeneratingAI(true);
    try {
      // Gọi trực tiếp Local AI Server (VD: LM Studio)
      const res = await fetch("http://127.0.0.1:8045/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-4a02b88bd1dd4eacb072351ae94298c0"
        },
        body: JSON.stringify({
          model: "gemini-3-flash",
          messages: [
            { role: "system", content: "Bạn là một nhà báo, biên tập viên. Hãy viết một bài tin tức bằng tiếng Việt dựa trên yêu cầu của người dùng. Trả về định dạng HTML (chỉ dùng thẻ phổ biến như p, h2, h3, ul, li; không có thẻ html, head, body)." },
            { role: "user", content: aiPrompt }
          ],
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error("Lỗi kết nối AI");

      const data = await res.json();
      const articleHtml = data.choices[0].message.content;

      // Nhúng nội dung vào Tiptap Editor
      if (editor) {
        editor.commands.setContent(articleHtml);
      } else {
        setFormData(prev => ({ ...prev, content: articleHtml }));
      }
      
      toast.success("AI đã tạo bài viết thành công!");
      setShowAIModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối với AI. Hãy chắc chắn Local AI đang chạy ở http://127.0.0.1:8045");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="p-[20px] pb-[50px] w-full min-h-[calc(100vh-60px)] bg-[#f0f2f5] font-sans text-[#333] text-[14px] flex flex-col items-center gap-[15px]">
      <div className="bg-white p-[12px_20px] rounded-[6px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex justify-between items-center border-t-[3px] border-[#2c3e50] w-full max-w-[1200px]">
        <h2 className="text-[18px] font-bold text-[#2c3e50] m-0 flex items-center gap-[10px] uppercase">
          {isEditing ? "CHỈNH SỬA BÀI VIẾT" : "THÊM BÀI VIẾT MỚI"}
        </h2>
        <div className="flex gap-[12px] items-center">
          <button
            className="px-[18px] h-[36px] border-none rounded-[4px] cursor-pointer font-semibold inline-flex items-center gap-[6px] text-[13.5px] transition-all duration-200 bg-[#6c757d] text-white hover:bg-[#5a6268]"
            onClick={() => navigate("/admin/news")}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <button className="px-[18px] h-[36px] border-none rounded-[4px] cursor-pointer font-semibold inline-flex items-center gap-[6px] text-[13.5px] transition-all duration-200 bg-[#15803d] text-white hover:bg-[#166534]" onClick={handleSubmit}>
            <FaSave /> {isEditing ? "Cập nhật" : "Lưu bài viết"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-[#ced4da] w-full max-w-[1200px] p-[20px] sm:p-[30px] h-auto flex flex-col">
        <form onSubmit={handleSubmit} className="flex gap-[30px] max-lg:flex-col">
          {/* CỘT TRÁI */}
          <div className="flex-[7]">
            <div>
              <label className="font-bold text-[16px] mb-[5px] block text-[#444]">
                Tiêu đề bài viết <span className="text-red-500 ml-[3px]">*</span>
              </label>
              <input
                type="text"
                className="w-full !p-[10px] border border-[#ccc] rounded-[4px] !text-[16px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Nhập tiêu đề tại đây..."
              />
            </div>

            <div className="mt-[20px]">
              <label className="font-bold text-[14px] mb-[5px] block text-[#444]">Mô tả tóm tắt</label>
              <textarea
                className="w-full p-[9px_12px] border border-[#ccc] rounded-[4px] text-[14px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 min-h-[80px]"
                rows="3"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                placeholder="Mô tả ngắn gọn về bài viết..."
              ></textarea>
            </div>

            {/* --- TRÌNH SOẠN THẢO TIPTAP --- */}
            <div className="mt-[20px]">
              <label className="font-bold text-[14px] mb-[5px] block text-[#444]">Nội dung bài viết</label>
              <div className="border border-[#ccc] rounded-[6px] bg-white overflow-hidden flex flex-col [&_.ProseMirror]:p-[20px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:font-sans [&_.ProseMirror]:text-[15px] [&_.ProseMirror]:leading-[1.6] [&_.ProseMirror_p]:mb-[10px] [&_.ProseMirror_h1]:mt-[15px] [&_.ProseMirror_h1]:mb-[10px] [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:mt-[15px] [&_.ProseMirror_h2]:mb-[10px] [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:mt-[15px] [&_.ProseMirror_h3]:mb-[10px] [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_ul]:pl-[20px] [&_.ProseMirror_ul]:mb-[10px] [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:pl-[20px] [&_.ProseMirror_ol]:mb-[10px] [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_blockquote]:border-l-[3px] [&_.ProseMirror_blockquote]:border-[#ccc] [&_.ProseMirror_blockquote]:pl-[10px] [&_.ProseMirror_blockquote]:ml-0 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-[#666] [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-[4px] [&_.ProseMirror_img]:block [&_.ProseMirror_img]:my-[10px] [&_.ProseMirror_img.ProseMirror-selectednode]:outline-[2px] [&_.ProseMirror_img.ProseMirror-selectednode]:outline-[#2c3e50] [&_.ProseMirror_a]:text-[#007bff] [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:cursor-pointer [&_.tiptap-content]:min-h-[400px] [&_.tiptap-content]:max-h-[600px] [&_.tiptap-content]:overflow-y-auto [&_.tiptap-content]:cursor-text [&_.tiptap-content]:bg-white">
                <MenuBar
                  editor={editor}
                  onOpenAI={() => setShowAIModal(true)}
                />
                <EditorContent editor={editor} className="tiptap-content" />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="flex-[3] border-l border-[#eee] pl-[30px] max-lg:border-l-0 max-lg:border-t max-lg:border-[#eee] max-lg:pl-0 max-lg:pt-[30px]">
            <div>
              <label className="font-bold text-[14px] mb-[5px] block text-[#444]">
                Chuyên mục <span className="text-red-500 ml-[3px]">*</span>
              </label>
              <select
                className="w-full p-[8px_12px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15"
                value={formData.categoryid}
                onChange={(e) =>
                  setFormData({ ...formData, categoryid: e.target.value })
                }
                required
              >
                <option value="">-- Chọn chuyên mục --</option>
                {categories.map((c) => (
                  <option key={c.categoryid} value={c.categoryid}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-[20px]">
              <label className="font-bold text-[14px] mb-[5px] block text-[#444]">Trạng thái</label>
              <select
                className="w-full p-[8px_12px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 font-bold"
                value={formData.newsstatus}
                onChange={(e) =>
                  setFormData({ ...formData, newsstatus: e.target.value })
                }
                style={{
                  color:
                    formData.newsstatus === "Đã xuất bản" ? "green" : "orange",
                }}
              >
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã xuất bản">Đã xuất bản</option>
                <option value="Trả lại">Trả lại</option>
                <option value="Lưu nháp">Lưu nháp</option>
              </select>
            </div>

            <div className="mt-[20px]">
              <label className="font-bold text-[14px] mb-[5px] block text-[#444]">Ảnh đại diện (URL)</label>
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full p-[9px_12px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15"
                  value={formData.imagelink}
                  onChange={(e) =>
                    setFormData({ ...formData, imagelink: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="mt-[10px] w-full h-[150px] bg-[#f8f9fa] border border-dashed border-[#ced4da] rounded-[4px] flex items-center justify-center overflow-hidden relative">
                {formData.imagelink ? (
                  <>
                    <img
                      src={formData.imagelink}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-[5px] right-[5px] bg-black/50 text-white border-none rounded-full w-[24px] h-[24px] cursor-pointer flex items-center justify-center hover:bg-black/70 transition-colors"
                      onClick={() =>
                        setFormData({ ...formData, imagelink: "" })
                      }
                      title="Xóa ảnh"
                    >
                      <FaTimes size={12} />
                    </button>
                  </>
                ) : (
                  <span className="text-[#adb5bd] text-[13px]">Chưa có ảnh</span>
                )}
              </div>
            </div>

            <div className="mt-[20px]">
              <label className="font-bold text-[14px] mb-[5px] block text-[#444]">Ngày xuất bản</label>
              <div className="relative w-full">
                <input
                  type="datetime-local"
                  className="w-full p-[9px_12px] border border-[#ccc] rounded-[4px] text-[14px] h-[40px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15"
                  value={formData.publisheddate}
                  onChange={(e) =>
                    setFormData({ ...formData, publisheddate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-[20px] bg-[#fff3cd] p-[10px] rounded-[4px] border border-[#ffeeba]">
              <label className="cursor-pointer flex items-center gap-[10px] m-0">
                <input
                  type="checkbox"
                  className="w-[20px] h-[20px] cursor-pointer"
                  checked={formData.isfeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isfeatured: e.target.checked })
                  }
                />
                <span className="font-bold text-[#856404]">Đánh dấu Tin nổi bật</span>
              </label>
            </div>

            <div className="mt-[20px]">
              <label className="font-bold text-[14px] mb-[5px] block text-[#444]">Ghi chú nội bộ</label>
              <textarea
                className="w-full p-[9px_12px] border border-[#ccc] rounded-[4px] text-[14px] outline-none bg-white transition-all duration-200 focus:border-[#0d6efd] focus:ring-[3px] focus:ring-[#0d6efd]/15 min-h-[100px]"
                rows="4"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Ghi chú cho biên tập viên..."
              ></textarea>
            </div>
          </div>
        </form>
      </div>

      {/* --- MODAL AI WRITER --- */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-[500px] rounded-[8px] shadow-[0_10px_25px_rgba(0,0,0,0.2)] overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="bg-[#f8f9fa] p-[15px_20px] border-b border-[#eee] flex justify-between items-center">
              <h3 className="m-0 text-[18px] text-[#333] flex items-center gap-[8px]">
                <FaMagic /> Viết bài tự động với AI
              </h3>
              <button className="bg-transparent border-none text-[18px] cursor-pointer text-[#999] hover:text-[#555]" onClick={() => setShowAIModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-[20px]">
              <label className="block font-bold mb-[8px] text-[#555]">Nhập yêu cầu hoặc chủ đề bài viết:</label>
              <textarea
                className="w-full p-[10px] border border-[#ddd] rounded-[4px] font-inherit resize-y outline-none focus:border-[#0d6efd]"
                rows="5"
                placeholder="Ví dụ: Viết một bài tin tức về Lễ hội Chuyển đổi số Quốc gia năm 2025..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGeneratingAI}
              ></textarea>
            </div>
            <div className="p-[15px_20px] border-t border-[#eee] flex justify-end gap-[10px]">
              <button
                className="bg-[#f1f3f5] border-none p-[8px_16px] rounded-[4px] cursor-pointer font-medium hover:bg-[#e2e6ea]"
                onClick={() => setShowAIModal(false)}
                disabled={isGeneratingAI}
              >
                Hủy bỏ
              </button>
              <button
                className="bg-[#764ba2] text-white border-none p-[8px_20px] rounded-[4px] cursor-pointer font-bold hover:bg-[#6c4494] disabled:bg-[#ccc] disabled:cursor-not-allowed"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? "Đang viết..." : "Tạo nội dung"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsForm;
