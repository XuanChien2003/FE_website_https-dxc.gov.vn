const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');

// Vercel handles env vars via project settings
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const GROQ_API_KEY = process.env.REACT_APP_AI_API_KEY;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const parser = new Parser();

// RSS Feed (Tin mới nhất VnExpress)
const RSS_FEED_URL = "https://vnexpress.net/rss/tin-moi-nhat.rss";

/**
 * Hàm gọi API Llama trên Groq để viết lại Tiêu đề và Tóm tắt
 */
async function generateAIContent(originalTitle, originalSnippet) {
  const prompt = `Bạn là biên tập viên của một Cổng Thông tin điện tử. 
Tôi có một thông tin với Tiêu đề: "${originalTitle}"
Và Tóm tắt/Nội dung gốc: "${originalSnippet}"

Nhiệm vụ của bạn là:
1. Viết lại một Tiêu đề khách quan, phù hợp văn phong cơ quan nhà nước.
2. Viết đoạn Tóm tắt (khoảng 4-5 câu) đầy đủ ý chính, rõ ràng.
3. Viết phần Nội dung chi tiết (dài khoảng 3-5 đoạn văn, sử dụng các thẻ HTML như <p>, <strong> để trình bày cho đẹp). Viết mở rộng, chi tiết và phân tích sâu hơn dựa trên nội dung gốc, với hành văn trang trọng, chuẩn mực của báo chí nhà nước.
4. Chắc chắn trả về JSON hợp lệ với 3 trường: "title", "summary" và "content".
Không trả về bất kỳ giải thích nào bên ngoài JSON.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    const data = await res.json();
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || originalTitle,
        summary: parsed.summary || originalSnippet,
        content: parsed.content || originalSnippet
      };
    }
    return { title: originalTitle, summary: originalSnippet, content: originalSnippet };
  } catch (error) {
    console.error("Lỗi khi gọi AI API:", error.message || error);
    return { title: originalTitle, summary: originalSnippet, content: originalSnippet };
  }
}

/**
 * Hàm chính thực thi luồng Crawler + AI + Database insert
 */
async function fetchAndSaveNews() {
  const feed = await parser.parseURL(RSS_FEED_URL);
  if (!feed.items || feed.items.length === 0) {
    throw new Error("Không tìm thấy bài viết nào trong RSS feed.");
  }

  // Lấy bài mới nhất
  const latestItem = feed.items[0];
  const originalContent = latestItem.content || latestItem.contentSnippet || "";

  let imageUrl = "";
  if (latestItem.enclosure && latestItem.enclosure.url) {
    imageUrl = latestItem.enclosure.url;
  }
  if (!imageUrl && latestItem['media:content'] && latestItem['media:content'].$ && latestItem['media:content'].$.url) {
    imageUrl = latestItem['media:content'].$.url;
  }
  if (!imageUrl) {
    const imgMatch = originalContent.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) imageUrl = imgMatch[1];
  }

  // Dọn HTML để lấy snippet sạch
  const cleanSnippet = originalContent.replace(/<[^>]+>/g, "").replace(/\n/g, "").trim();

  // Dùng AI xử lý
  const aiResult = await generateAIContent(latestItem.title, cleanSnippet);

  // Render HTML Full Content
  const fullContent = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6;">
      ${aiResult.content}
    </div>
  `;

  const dbEntry = {
    title: aiResult.title,
    summary: aiResult.summary,
    content: fullContent,
    imagelink: imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaan-6fYNdJBoZtSm16UYlr7S9fFm5OV42Dw&s',
    categoryid: 1, 
    isfeatured: true,
    createdby: 'Xuan Chien',
    newsstatus: 'Đã duyệt',
    publisheddate: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('news')
    .insert([dbEntry]);

  if (error) throw error;
  
  return { success: true, title: aiResult.title };
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  // Cho phép chạy thủ công để test
  try {
    const result = await fetchAndSaveNews();
    res.status(200).json({
      message: "🎉 Success! News updated.",
      article: result.title
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      error: error.message
    });
  }
};
