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
      const apiUrl = process.env.REACT_APP_AI_API_URL || "https://api.groq.com/openai/v1/chat/completions";
      const apiKey = process.env.REACT_APP_AI_API_KEY || "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";
      const aiModel = process.env.REACT_APP_AI_MODEL || "llama-3.3-70b-versatile";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: aiModel,
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
        { role: "bot", content: "Xin lỗi, không thể kết nối đến AI trực tuyến. Vui lòng kiểm tra lại API Key hoặc cấu hình mạng." }
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
