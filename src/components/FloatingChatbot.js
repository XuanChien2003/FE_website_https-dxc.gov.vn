import React, { useState, useRef, useEffect } from "react";
import { FaCommentDots, FaTimes, FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import api from "../pages/services/api";
import "./FloatingChatbot.css";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Xin chào! Tôi là trợ lý ảo AI của Cổng Thông tin điện tử. Tôi đã đọc qua các bài viết mới nhất trên trang, bạn cần hỏi thông tin gì nào?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: userMsg });
      setMessages((prev) => [...prev, { role: "bot", content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "bot", content: "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối AI. Vui lòng thử lại sau!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Nút bấm tròn nổi */}
      <button className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
        {isOpen ? <FaTimes /> : <FaCommentDots />}
      </button>

      {/* Cửa sổ chat */}
      <div className={`chatbot-window ${isOpen ? 'show' : ''}`}>
        <div className="chatbot-header">
          <FaRobot className="chatbot-header-icon" />
          <h4>Trợ Lý Ảo Cổng Thông Tin</h4>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className="msg-icon">
                {msg.role === "bot" ? <FaRobot /> : <FaUser />}
              </div>
              <div className="msg-content">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message bot typing">
              <div className="msg-icon"><FaRobot /></div>
              <div className="msg-content typing-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input-area" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Bạn cần hỏi gì..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FloatingChatbot;
