# Cổng Thông Tin Điện Tử - Frontend (FE)

Ứng dụng Frontend được xây dựng bằng **React.js** và **Tailwind CSS**.

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Yêu cầu hệ thống
- Node.js (phiên bản v16 trở lên được khuyến nghị).
- npm hoặc yarn.

### 2. Cài đặt các phụ thuộc (Dependencies)
Mở terminal tại thư mục `FE` và chạy lệnh:
```bash
npm install
```

### 3. Khởi động ứng dụng ở chế độ phát triển
Chạy lệnh sau để bắt đầu:
```bash
npm start
```
Ứng dụng sẽ tự động mở tại: [http://localhost:3000](http://localhost:3000)

### 4. Xây dựng bản sản xuất (Production Build)
Nếu bạn muốn đóng gói ứng dụng để triển khai:
```bash
npm run build
```

---

## 🛠 Công nghệ sử dụng
- **Framework:** React.js
- **Styling:** Tailwind CSS, Vanilla CSS
- **Icons:** Lucide-React, React-Icons
- **Routing:** React Router v7
- **Database Integration:** Supabase (được cấu hình trong `src/supabaseClient.js`)

## 📝 Lưu ý
- Nếu gặp lỗi về kết nối dữ liệu, hãy kiểm tra lại thông tin trong `src/supabaseClient.js`.
- Đảm bảo Backend (BE) đã được khởi động nếu bạn cần sử dụng các tính năng liên quan đến API nội bộ.
