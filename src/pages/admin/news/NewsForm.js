import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
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
  FaMagic, // Icon cho AI
} from "react-icons/fa";

// --- TIPTAP IMPORTS ---
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

import "../../admin/document/DocumentList.css";
import "./NewsForm.css";

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

  return (
    <div className="editor-toolbar">
      {/* NÚT AI WRITER */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={onOpenAI}
          className="btn-ai-magic"
          title="Viết bài tự động bằng AI"
        >
          <FaMagic /> <span>Viết bằng AI</span>
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Group: Format Text */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          title="In đậm"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          title="In nghiêng"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          title="Gạch chân"
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
          title="Gạch ngang"
        >
          <FaStrikethrough />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Group: Alignment */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
        >
          <FaAlignRight />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" }) ? "is-active" : ""
          }
        >
          <FaAlignJustify />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Group: Lists & Heading */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <FaListUl />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          <FaListOl />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Group: Insert */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive("link") ? "is-active" : ""}
        >
          <FaLink />
        </button>
        <button type="button" onClick={addImage}>
          <FaImage />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          <FaQuoteRight />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <FaUndo />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
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
    categoryID: "",
    imageLink: "",
    summary: "",
    content: "",
    isFeatured: false,
    note: "",
    publishedDate: "",
    newsStatus: "Chờ duyệt",
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
    content: "", // Nội dung ban đầu
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  // Cập nhật nội dung vào editor khi dữ liệu API tải xong (chỉ 1 lần lúc đầu)
  // Logic này đảm bảo khi F5 trang edit, dữ liệu sẽ nhảy vào khung soạn thảo
  useEffect(() => {
    if (editor && formData.content && editor.isEmpty && isEditing) {
      editor.commands.setContent(formData.content);
    }
  }, [editor, formData.content, isEditing]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNewsDetail = async (newsId) => {
    try {
      const res = await api.get(`/news/${newsId}`);
      const item = res.data;
      setFormData({
        title: item.Title,
        categoryID: item.CategoryID,
        imageLink: item.ImageLink,
        summary: item.Summary,
        content: item.Content,
        isFeatured: item.IsFeatured,
        note: item.Note,
        publishedDate: formatDateTimeLocal(item.PublishedDate),
        newsStatus: item.NewsStatus || "Chờ duyệt",
      });

      // Force set content cho editor ngay khi lấy được dữ liệu
      if (editor) {
        editor.commands.setContent(item.Content);
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
      const payload = {
        ...formData,
        categoryID: parseInt(formData.categoryID),
        // Lấy content mới nhất từ editor để chắc chắn
        content: editor ? editor.getHTML() : formData.content,
      };
      if (isEditing) {
        await api.put(`/news/${id}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post("/news", payload);
        toast.success("Thêm mới thành công!");
      }
      navigate("/admin/news");
    } catch (err) {
      toast.error("Lỗi lưu dữ liệu!");
    }
  };

  // --- HÀM XỬ LÝ AI GENERATE ---
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast.warning("Vui lòng nhập yêu cầu cho AI!");
      return;
    }

    setIsGeneratingAI(true);

    try {
      // Gọi API Backend (Đã cấu hình Gemini ở các bước trước)
      const res = await api.post("/ai/generate", { prompt: aiPrompt });
      const aiContent = res.data.content;

      // Chèn nội dung AI trả về vào vị trí con trỏ hiện tại
      if (editor) {
        editor.chain().focus().insertContent(aiContent).run();
      }

      toast.success("Đã tạo nội dung xong!");
      setShowAIModal(false);
      setAiPrompt("");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi gọi AI! Hãy kiểm tra Server.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="document-manager news-form-page">
      <div className="page-header">
        <h2 className="page-title">
          {isEditing ? "CHỈNH SỬA BÀI VIẾT" : "THÊM BÀI VIẾT MỚI"}
        </h2>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/news")}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <button className="btn btn-success" onClick={handleSubmit}>
            <FaSave /> {isEditing ? "Cập nhật" : "Lưu bài viết"}
          </button>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="form-layout">
          {/* CỘT TRÁI */}
          <div className="form-main-col">
            <div className="form-group">
              <label className="form-label-bold form-label-lg">
                Tiêu đề bài viết <span className="req">*</span>
              </label>
              <input
                type="text"
                className="form-control input-lg"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Nhập tiêu đề tại đây..."
              />
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label-bold">Mô tả tóm tắt</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                placeholder="Mô tả ngắn gọn về bài viết..."
              ></textarea>
            </div>

            {/* --- TRÌNH SOẠN THẢO TIPTAP --- */}
            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label-bold">Nội dung bài viết</label>
              <div className="tiptap-container">
                <MenuBar
                  editor={editor}
                  onOpenAI={() => setShowAIModal(true)}
                />
                <EditorContent editor={editor} className="tiptap-content" />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="form-sidebar-col">
            <div className="form-group">
              <label className="form-label-bold">
                Chuyên mục <span className="req">*</span>
              </label>
              <select
                className="form-control"
                value={formData.categoryID}
                onChange={(e) =>
                  setFormData({ ...formData, categoryID: e.target.value })
                }
                required
                style={{ padding: "8px" }}
              >
                <option value="">-- Chọn chuyên mục --</option>
                {categories.map((c) => (
                  <option key={c.CategoryID} value={c.CategoryID}>
                    {c.Title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label-bold">Trạng thái</label>
              <select
                className="form-control status-select"
                value={formData.newsStatus}
                onChange={(e) =>
                  setFormData({ ...formData, newsStatus: e.target.value })
                }
                style={{
                  color:
                    formData.newsStatus === "Đã xuất bản" ? "green" : "orange",
                }}
              >
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã xuất bản">Đã xuất bản</option>
                <option value="Trả lại">Trả lại</option>
                <option value="Lưu nháp">Lưu nháp</option>
              </select>
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label-bold">Ảnh đại diện (URL)</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  className="form-control"
                  value={formData.imageLink}
                  onChange={(e) =>
                    setFormData({ ...formData, imageLink: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="image-preview-box">
                {formData.imageLink ? (
                  <>
                    <img
                      src={formData.imageLink}
                      alt="Preview"
                      className="preview-img"
                    />
                    <button
                      type="button"
                      className="btn-remove-img"
                      onClick={() =>
                        setFormData({ ...formData, imageLink: "" })
                      }
                      title="Xóa ảnh"
                    >
                      <FaTimes size={12} />
                    </button>
                  </>
                ) : (
                  <span className="no-image-text">Chưa có ảnh</span>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label-bold">Ngày xuất bản</label>
              <div className="input-with-icon">
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.publishedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, publishedDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="featured-box">
              <label className="featured-label">
                <input
                  type="checkbox"
                  className="checkbox-lg"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                />
                <span className="featured-text">Đánh dấu Tin nổi bật</span>
              </label>
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label-bold">Ghi chú nội bộ</label>
              <textarea
                className="form-control"
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
        <div className="ai-modal-overlay">
          <div className="ai-modal-content">
            <div className="ai-modal-header">
              <h3>
                <FaMagic /> Viết bài tự động với AI
              </h3>
              <button onClick={() => setShowAIModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="ai-modal-body">
              <label>Nhập yêu cầu hoặc chủ đề bài viết:</label>
              <textarea
                rows="5"
                placeholder="Ví dụ: Viết một bài tin tức về Lễ hội Chuyển đổi số Quốc gia năm 2025..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGeneratingAI}
              ></textarea>
            </div>
            <div className="ai-modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAIModal(false)}
                disabled={isGeneratingAI}
              >
                Hủy bỏ
              </button>
              <button
                className="btn-generate"
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
