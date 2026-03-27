import React, { useState, useRef, useEffect } from "react";
import { FaCommentDots, FaTimes, FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import "./FloatingChatbot.css";

const tools = [
  {
    type: "function",
    function: {
      name: "query_database",
      description: "Tra cứu thông tin từ cơ sở dữ liệu của Cổng Thông tin điện tử. Gọi hàm này khi người dùng hỏi về tin tức (news), văn bản pháp quy (documents), chuyên mục (categories), danh bạ liên kết (weblinks), cơ quan ban hành (agencies), người ký (signers), v.v.",
      parameters: {
        type: "object",
        properties: {
          table: {
            type: "string",
            enum: ["news", "documents", "categories", "menus", "agencies", "documenttypes", "fields", "weblinks", "signers"],
            description: "Tên bảng cơ sở dữ liệu cần tra cứu."
          },
          keyword: {
            type: "string",
            description: "Từ khóa tìm kiếm (tùy chọn). Ví dụ: 'chuyển đổi số', 'thông tư'."
          },
          limit: {
            type: "integer",
            description: "Số lượng bản ghi tối đa trả về. Mặc định 5."
          }
        },
        required: ["table"]
      }
    }
  }
];

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào! Tôi là trợ lý ảo AI của Cổng Thông tin điện tử. Tôi có thể tra cứu trực tiếp cơ sở dữ liệu để giải đáp thắc mắc của bạn." }
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

  // Hàm thực thi DB query khi AI gọi Tool
  const executeTool = async (tableName, keyword, limit = 5) => {
    let query = supabase.from(tableName);
    
    // Custom select & filter based on table
    switch (tableName) {
      case 'news':
        query = query.select('newsid, title, summary, publisheddate, isfeatured');
        if (keyword) query = query.ilike('title', `%${keyword}%`);
        query = query.order('publisheddate', { ascending: false });
        break;
      case 'documents':
        query = query.select('docid, title, number, symbol, publisheddate, effectivedate');
        if (keyword) query = query.ilike('title', `%${keyword}%`);
        query = query.order('publisheddate', { ascending: false });
        break;
      case 'categories':
      case 'menus':
        query = query.select('*');
        if (keyword) query = query.ilike('title', `%${keyword}%`);
        break;
      default:
        query = query.select('*');
        if (keyword) query = query.ilike('name', `%${keyword}%`);
        break;
    }

    const { data, error } = await query.limit(limit);
    if (error) return { error: error.message };
    return data;
  };

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

      // Chuẩn bị lịch sử chat cho AI (Chỉ gửi user và assistant)
      let chatHistory = [
        { role: "system", content: "Bạn là trợ lý ảo AI Cổng Thông tin điện tử. Hãy trả lời ngắn gọn, lịch sự, chính xác bằng tiếng Việt dựa trên dữ liệu được cung cấp. Nếu cần tìm thông tin, hãy gọi tool query_database." },
        ...messages.map(m => ({ role: m.role === "bot" ? "assistant" : m.role, content: m.content })),
        { role: "user", content: userMsg }
      ];

      const makeRequest = async (currentMessages) => {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: aiModel,
            messages: currentMessages,
            tools: tools,
            tool_choice: "auto",
            temperature: 0.3
          })
        });

        if (!res.ok) throw new Error("Lỗi kết nối AI API");
        return res.json();
      };

      let data = await makeRequest(chatHistory);
      let responseMessage = data.choices[0].message;

      // Xử lý nếu AI gọi Tool
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        chatHistory.push(responseMessage); // Thêm lời gọi tool vào lịch sử
        
        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.function.name === "query_database") {
            const args = JSON.parse(toolCall.function.arguments);
            const dbData = await executeTool(args.table, args.keyword, args.limit);
            
            // Gửi lại kết quả Database cho AI
            chatHistory.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify(dbData)
            });
          }
        }
        
        // Gọi AI lần 2 với dữ liệu từ DB
        data = await makeRequest(chatHistory);
        responseMessage = data.choices[0].message;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: responseMessage.content }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Xin lỗi, không thể kết nối đến AI trực tuyến. Vui lòng kiểm tra lại API Key hoặc cấu hình mạng." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      <button className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
        {isOpen ? <FaTimes /> : <FaCommentDots />}
      </button>

      <div className={`chatbot-window ${isOpen ? 'show' : ''}`}>
        <div className="chatbot-header">
          <FaRobot className="chatbot-header-icon" />
          <h4>Trợ Lý Ảo Cổng Thông Tin</h4>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role === 'assistant' || msg.role === 'bot' ? 'bot' : 'user'}`}>
              <div className="msg-icon">
                {msg.role === "assistant" || msg.role === "bot" ? <FaRobot /> : <FaUser />}
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
