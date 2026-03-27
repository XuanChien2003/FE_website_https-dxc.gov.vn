const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const GROQ_API_KEY = process.env.REACT_APP_AI_API_KEY || "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";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const parser = new Parser();

// RSS Feed (Tin mới nhất VnExpress)
const RSS_FEED_URL = "https://vnexpress.net/rss/tin-moi-nhat.rss";

/**
 * Hàm gọi API Llama trên Groq để viết lại Tiêu đề và Tóm tắt
 */
async function generateAIContent(originalTitle, originalSnippet) {
  const prompt = `Bạn là biên tập viên của một Cổng Thông tin điện tử. 
Tôi có một bài báo với Tiêu đề: "${originalTitle}"
Và Tóm tắt (có thể chứa ký tự thừa): "${originalSnippet}"

Nhiệm vụ của bạn là:
1. Viết lại một Tiêu đề ngắn gọn, khách quan, phù hợp văn phong cơ quan nhà nước / cổng thông tin uy tín.
2. Viết lại Tóm tắt thành đoạn văn ngắn (tối đa 3 câu). Đảm bảo rõ nội dung, không lặp lại nguyên văn tiêu đề.
3. Chắc chắn trả về JSON hợp lệ với 2 trường duy nhất: "title" và "summary".
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
        summary: parsed.summary || originalSnippet
      };
    }
    return { title: originalTitle, summary: originalSnippet };
  } catch (error) {
    console.error("Lỗi khi gọi AI API:", error.message || error);
    return { title: originalTitle, summary: originalSnippet };
  }
}

/**
 * Hàm chính thực thi luồng Crawler + AI + Database insert
 */
async function fetchAndSaveNews() {
  console.log("=== BẮT ĐẦU CHẠY AUTO CRAWLER TIN TỨC ===");
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    if (!feed.items || feed.items.length === 0) {
      console.log("❌ Không tìm thấy bài viết nào trong RSS feed.");
      return;
    }

    // Lấy bài mới nhất trên cùng
    const latestItem = feed.items[0];
    console.log(`📌 Đang xử lý bài: "${latestItem.title}"`);

    // Trích xuất nội dung HTML từ RSS
    const originalContent = latestItem.content || latestItem.contentSnippet || "";

    // VnExpress thường nhúng thẻ <img> ngay trong description, 
    // nhưng cũng có thể nằm trong <enclosure> hoặc <media:content>
    let imageUrl = "";

    // 1. Check enclosure (thường là url ảnh)
    if (latestItem.enclosure && latestItem.enclosure.url) {
      imageUrl = latestItem.enclosure.url;
    }

    // 2. Check media:content (nếu có)
    if (!imageUrl && latestItem['media:content'] && latestItem['media:content'].$ && latestItem['media:content'].$.url) {
      imageUrl = latestItem['media:content'].$.url;
    }

    // 3. Check description img tag (cũ)
    if (!imageUrl) {
      const imgMatch = originalContent.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }

    // Dọn HTML để lấy snippet sạch gửi cho AI
    const cleanSnippet = originalContent.replace(/<[^>]+>/g, "").replace(/\n/g, "").trim();

    // Dùng AI xử lý dữ liệu thô
    console.log("🤖 Đang nhờ AI (Llama 3.3) viết lại tiêu đề và tóm tắt...");
    const aiResult = await generateAIContent(latestItem.title, cleanSnippet);

    console.log("✅ Kết quả AI:");
    console.log("   - Tiêu đề:", aiResult.title);
    console.log("   - Tóm tắt:", aiResult.summary);

    // Render HTML Full Content (Bản sạch - không kèm link gốc)
    const fullContent = `
      <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6;">
        ${originalContent}
      </div>
    `;

    const dbEntry = {
      title: aiResult.title,
      summary: aiResult.summary,
      content: fullContent,
      imagelink: imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaan-6fYNdJBoZtSm16UYlr7S9fFm5OV42Dw&s',
      categoryid: 1, // 1 là "Tin tức" trong bảng Categories
      isfeatured: true, // Cho tin tự động mọc lên Featured cho dễ xem
      createdby: 'Xuan Chien',
      newsstatus: 'Đã duyệt', // Tự động Public luôn
      publisheddate: new Date().toISOString()
    };

    console.log("☁️ Đang lưu thông tin vào Supabase...");
    const { data, error } = await supabase
      .from('news')
      .insert([dbEntry]);

    if (error) {
      console.error("❌ Lỗi khi lưu vào CSDL:", error.message);
    } else {
      console.log("🎉 THÀNH CÔNG! Đã thêm 1 bản tin mới vào trang web.");
    }

  } catch (error) {
    console.error("❌ Lỗi trong quá trình chạy kịch bản:", error.message || error);
  }
}

fetchAndSaveNews();
