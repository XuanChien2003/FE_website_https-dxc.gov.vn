import React, { useState, useRef, useEffect } from "react";
import { FaCommentDots, FaTimes, FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
// import api from "../pages/services/api"; // Decommissioned
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
      // Gọi trực tiếp Local AI Server (VD: LM Studio, vLLM)
      const res = await fetch("http://127.0.0.1:8045/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-4a02b88bd1dd4eacb072351ae94298c0"
        },
        body: JSON.stringify({
          model: "gemini-3-flash",
          messages: [
            { role: "system", content: "Bạn là trợ lý ảo AI của Cổng Thông tin điện tử. Hãy trả lời ngắn gọn, lịch sự bằng tiếng Việt." },
            ...messages.map(m => ({ role: m.role === "bot" ? "assistant" : m.role, content: m.content })),
            { role: "user", content: userMsg }
          ],
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error("Lỗi kết nối AI");

      const data = await res.json();
      const reply = data.choices[0].message.content;
      
      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { role: "bot", content: "Xin lỗi, không thể kết nối đến AI. Hãy chắc chắn rằng Local AI Server (VD: LM Studio) đang chạy ở http://127.0.0.1:8045" }
      ]);
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
