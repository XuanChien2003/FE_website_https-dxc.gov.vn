-- Kịch bản tạo Database cho Supabase (PostgreSQL)

-- 1. Bảng Users
CREATE TABLE public.Users (
    UserID SERIAL PRIMARY KEY,
    Username TEXT UNIQUE NOT NULL,
    Password TEXT NOT NULL,
    FullName TEXT,
    Role TEXT DEFAULT 'user',
    Avatar TEXT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Categories
CREATE TABLE public.Categories (
    CategoryID SERIAL PRIMARY KEY,
    Title TEXT NOT NULL,
    Description TEXT,
    STT INT DEFAULT 0,
    ParentID INT REFERENCES public.Categories(CategoryID) ON DELETE SET NULL,
    Status TEXT DEFAULT 'Active',
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng News
CREATE TABLE public.News (
    NewsID SERIAL PRIMARY KEY,
    Title TEXT NOT NULL,
    ImageLink TEXT,
    Summary TEXT,
    Content TEXT,
    CategoryID INT REFERENCES public.Categories(CategoryID) ON DELETE SET NULL,
    PublishedDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    IsFeatured BOOLEAN DEFAULT FALSE,
    Note TEXT,
    CreatedBy TEXT,
    NewsStatus TEXT DEFAULT 'Chờ duyệt',
    UpdatedBy TEXT
);

-- 4. Bảng Agencies (Cơ quan ban hành)
CREATE TABLE public.Agencies (
    AgencyID SERIAL PRIMARY KEY,
    Name TEXT NOT NULL,
    IsDefault BOOLEAN DEFAULT FALSE
);

-- 5. Bảng Signers (Người ký)
CREATE TABLE public.Signers (
    SignerID SERIAL PRIMARY KEY,
    Name TEXT NOT NULL
);

-- 6. Bảng DocumentTypes (Loại văn bản)
CREATE TABLE public.DocumentTypes (
    TypeID SERIAL PRIMARY KEY,
    Name TEXT NOT NULL,
    Code TEXT
);

-- 7. Bảng Fields (Lĩnh vực)
CREATE TABLE public.Fields (
    FieldID SERIAL PRIMARY KEY,
    Name TEXT NOT NULL,
    Code TEXT
);

-- 8. Bảng Documents (Tài liệu/Văn bản)
CREATE TABLE public.Documents (
    DocID SERIAL PRIMARY KEY,
    Title TEXT NOT NULL,
    Number TEXT,
    Symbol TEXT,
    PublishedDate TIMESTAMP WITH TIME ZONE,
    EffectiveDate TIMESTAMP WITH TIME ZONE,
    TypeID INT REFERENCES public.DocumentTypes(TypeID) ON DELETE SET NULL,
    FieldID INT REFERENCES public.Fields(FieldID) ON DELETE SET NULL,
    AgencyID INT REFERENCES public.Agencies(AgencyID) ON DELETE SET NULL,
    SignerID INT REFERENCES public.Signers(SignerID) ON DELETE SET NULL,
    Content TEXT,
    FileLink TEXT,
    Views INT DEFAULT 0,
    CreatedBy TEXT,
    Status TEXT DEFAULT 'Active',
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Bảng Menus (Menu điều hướng)
CREATE TABLE public.Menus (
    MenuID SERIAL PRIMARY KEY,
    Title TEXT NOT NULL,
    Url TEXT,
    STT INT DEFAULT 0,
    IsShow BOOLEAN DEFAULT TRUE,
    ParentID INT REFERENCES public.Menus(MenuID) ON DELETE SET NULL,
    Position TEXT DEFAULT 'Top'
);

-- 10. Bảng Slides (Banner/Slider)
CREATE TABLE public.Slides (
    SlideID SERIAL PRIMARY KEY,
    Name TEXT NOT NULL,
    ImageLink TEXT,
    Description TEXT,
    ModifiedDate TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Bảng WebLinks (Liên kết Website)
CREATE TABLE public.WebLinks (
    LinkID SERIAL PRIMARY KEY,
    Name TEXT NOT NULL,
    Url TEXT NOT NULL,
    ImageLink TEXT,
    Description TEXT,
    STT INT DEFAULT 0,
    IsShow BOOLEAN DEFAULT TRUE
);

-- =============================================
-- DỮ LIỆU MẪU (SEED DATA)
-- =============================================

-- 1. Users
INSERT INTO public.Users (Username, Password, FullName, Role, Avatar) VALUES
('admin', '$2b$10$hashedpassword1', N'Quản trị viên', 'admin', NULL),
('editor1', '$2b$10$hashedpassword2', N'Nguyễn Văn A', 'editor', NULL),
('editor2', '$2b$10$hashedpassword3', N'Trần Thị B', 'editor', NULL),
('user1', '$2b$10$hashedpassword4', N'Lê Văn C', 'user', NULL);

-- 2. Categories
INSERT INTO public.Categories (Title, Description, STT, ParentID, Status) VALUES
(N'Tin tức', N'Chuyên mục tin tức tổng hợp', 1, NULL, 'Active'),
(N'Thông báo', N'Các thông báo chính thức', 2, NULL, 'Active'),
(N'Văn bản pháp quy', N'Văn bản quy phạm pháp luật', 3, NULL, 'Active'),
(N'Tin tức trong nước', N'Tin tức trong nước', 1, 1, 'Active'),
(N'Tin tức quốc tế', N'Tin tức quốc tế', 2, 1, 'Active'),
(N'Thông báo tuyển dụng', N'Thông báo tuyển dụng nhân sự', 1, 2, 'Active'),
(N'Thông báo đào tạo', N'Thông báo các khóa đào tạo', 2, 2, 'Active'),
(N'Hoạt động đơn vị', N'Tin hoạt động đơn vị', 3, NULL, 'Active');

-- 3. Agencies (Cơ quan ban hành)
INSERT INTO public.Agencies (Name, IsDefault) VALUES
(N'Chính phủ', TRUE),
(N'Bộ Tư pháp', FALSE),
(N'Bộ Nội vụ', FALSE),
(N'Bộ Tài chính', FALSE),
(N'Ủy ban nhân dân tỉnh', FALSE),
(N'Bộ Giáo dục và Đào tạo', FALSE),
(N'Bộ Y tế', FALSE),
(N'Bộ Công Thương', FALSE);

-- 4. Signers (Người ký)
INSERT INTO public.Signers (Name) VALUES
(N'Nguyễn Xuân Phúc'),
(N'Phạm Minh Chính'),
(N'Lê Minh Khái'),
(N'Nguyễn Hòa Bình'),
(N'Trần Hồng Hà'),
(N'Đặng Việt Dũng'),
(N'Nguyễn Thị Kim Tiến');

-- 5. DocumentTypes (Loại văn bản)
INSERT INTO public.DocumentTypes (Name, Code) VALUES
(N'Nghị định', 'ND'),
(N'Thông tư', 'TT'),
(N'Quyết định', 'QD'),
(N'Chỉ thị', 'CT'),
(N'Nghị quyết', 'NQ'),
(N'Công văn', 'CV'),
(N'Thông báo', 'TB'),
(N'Quy chế', 'QC');

-- 6. Fields (Lĩnh vực)
INSERT INTO public.Fields (Name, Code) VALUES
(N'Hành chính', 'HC'),
(N'Giáo dục', 'GD'),
(N'Y tế', 'YT'),
(N'Tài chính', 'TC'),
(N'Đất đai', 'DD'),
(N'Lao động', 'LD'),
(N'Giao thông', 'GT'),
(N'Môi trường', 'MT');

-- 7. Documents (Văn bản)
INSERT INTO public.Documents (Title, Number, Symbol, PublishedDate, EffectiveDate, TypeID, FieldID, AgencyID, SignerID, Content, FileLink, Views, CreatedBy, Status) VALUES
(N'Nghị định về quản lý cán bộ công chức', '01', N'01/2024/NĐ-CP', '2024-01-15 00:00:00+07', '2024-02-01 00:00:00+07', 1, 1, 1, 2, N'Nội dung nghị định về quản lý cán bộ công chức viên chức', NULL, 120, 'admin', 'Active'),
(N'Thông tư hướng dẫn thực hiện chế độ tiền lương', '05', N'05/2024/TT-BTC', '2024-02-20 00:00:00+07', '2024-03-15 00:00:00+07', 2, 4, 4, 3, N'Hướng dẫn chi tiết về chế độ tiền lương mới', NULL, 85, 'admin', 'Active'),
(N'Quyết định phê duyệt kế hoạch đào tạo năm 2024', '12', N'12/QĐ-UBND', '2024-01-10 00:00:00+07', '2024-01-10 00:00:00+07', 3, 2, 5, 1, N'Phê duyệt kế hoạch đào tạo bồi dưỡng cán bộ năm 2024', NULL, 56, 'editor1', 'Active'),
(N'Chỉ thị về tăng cường công tác bảo vệ môi trường', '03', N'03/CT-TTg', '2024-03-01 00:00:00+07', '2024-03-01 00:00:00+07', 4, 8, 1, 2, N'Nội dung chỉ thị bảo vệ môi trường', NULL, 200, 'admin', 'Active'),
(N'Nghị quyết về phát triển kinh tế xã hội', '15', N'15/NQ-CP', '2024-01-20 00:00:00+07', '2024-01-20 00:00:00+07', 5, 4, 1, 1, N'Nghị quyết phát triển kinh tế xã hội giai đoạn 2024-2025', NULL, 310, 'admin', 'Active'),
(N'Thông tư quy định về khám chữa bệnh bảo hiểm y tế', '09', N'09/2024/TT-BYT', '2024-04-01 00:00:00+07', '2024-05-01 00:00:00+07', 2, 3, 7, 7, N'Quy định mới về khám chữa bệnh bảo hiểm y tế', NULL, 175, 'editor1', 'Active');

-- 8. News (Tin tức)
INSERT INTO public.News (Title, ImageLink, Summary, Content, CategoryID, PublishedDate, IsFeatured, Note, CreatedBy, NewsStatus, UpdatedBy) VALUES
(N'Hội nghị tổng kết năm 2024 của đơn vị', NULL, N'Đơn vị tổ chức hội nghị tổng kết đánh giá kết quả hoạt động năm 2024 và triển khai phương hướng nhiệm vụ năm 2025.', N'<p>Ngày 15/01/2025, đơn vị đã tổ chức hội nghị tổng kết năm 2024...</p>', 8, '2025-01-15 09:00:00+07', TRUE, NULL, 'admin', N'Đã duyệt', 'admin'),
(N'Thông báo tuyển dụng viên chức năm 2025', NULL, N'Đơn vị thông báo tuyển dụng viên chức năm 2025, hạn nộp hồ sơ đến ngày 28/02/2025.', N'<p>Căn cứ kế hoạch tuyển dụng viên chức năm 2025...</p>', 6, '2025-01-20 08:00:00+07', FALSE, NULL, 'editor1', N'Đã duyệt', 'admin'),
(N'Kết quả thực hiện nhiệm vụ quý I năm 2025', NULL, N'Báo cáo kết quả thực hiện nhiệm vụ quý I năm 2025 của các phòng ban đơn vị.', N'<p>Trong quý I năm 2025, đơn vị đã hoàn thành các nhiệm vụ...</p>', 8, '2025-04-05 10:00:00+07', FALSE, NULL, 'editor1', N'Đã duyệt', 'admin'),
(N'Triển khai phần mềm quản lý văn bản điện tử', NULL, N'Đơn vị chính thức triển khai phần mềm quản lý văn bản và hồ sơ điện tử từ tháng 3/2025.', N'<p>Nhằm nâng cao hiệu quả công tác quản lý văn bản...</p>', 1, '2025-03-01 08:30:00+07', TRUE, NULL, 'admin', N'Đã duyệt', 'admin'),
(N'Tập huấn kỹ năng công nghệ thông tin cho cán bộ', NULL, N'Lớp tập huấn kỹ năng CNTT được tổ chức từ ngày 10-14/3/2025.', N'<p>Nhằm nâng cao năng lực sử dụng CNTT của cán bộ...</p>', 7, '2025-03-10 07:30:00+07', FALSE, NULL, 'editor2', N'Đã duyệt', 'admin'),
(N'Thông báo lịch nghỉ lễ 30/4 và 1/5 năm 2025', NULL, N'Thông báo lịch nghỉ lễ 30/4 và 1/5 theo quy định của Nhà nước.', N'<p>Thực hiện quy định về ngày nghỉ lễ...</p>', 2, '2025-04-15 08:00:00+07', FALSE, NULL, 'editor1', N'Đã duyệt', 'admin'),
(N'Hội thảo chuyên đề về cải cách hành chính công', NULL, N'Hội thảo chuyên đề về nâng cao hiệu quả cải cách hành chính công sẽ diễn ra ngày 20/4/2025.', N'<p>Hội thảo quy tụ các chuyên gia hành chính đầu ngành...</p>', 4, '2025-04-18 09:00:00+07', TRUE, NULL, 'admin', N'Đã duyệt', 'admin'),
(N'Kết quả kiểm tra, đánh giá cán bộ năm 2024', NULL, N'Công bố kết quả kiểm tra, đánh giá, xếp loại cán bộ công chức viên chức năm 2024.', N'<p>Căn cứ kết quả đánh giá, xếp loại cán bộ năm 2024...</p>', 8, '2025-01-25 14:00:00+07', FALSE, NULL, 'editor2', N'Chờ duyệt', NULL);

-- 9. Menus (Menu điều hướng)
INSERT INTO public.Menus (Title, Url, STT, IsShow, ParentID, Position) VALUES
(N'Trang chủ', '/', 1, TRUE, NULL, 'Top'),
(N'Giới thiệu', '/gioi-thieu', 2, TRUE, NULL, 'Top'),
(N'Tin tức - Sự kiện', '/tin-tuc', 3, TRUE, NULL, 'Top'),
(N'Văn bản pháp quy', '/van-ban', 4, TRUE, NULL, 'Top'),
(N'Liên hệ', '/lien-he', 5, TRUE, NULL, 'Top'),
(N'Tin tức trong nước', '/tin-tuc/trong-nuoc', 1, TRUE, 3, 'Top'),
(N'Tin tức quốc tế', '/tin-tuc/quoc-te', 2, TRUE, 3, 'Top'),
(N'Hoạt động đơn vị', '/tin-tuc/hoat-dong', 3, TRUE, 3, 'Top'),
(N'Nghị định', '/van-ban/nghi-dinh', 1, TRUE, 4, 'Top'),
(N'Thông tư', '/van-ban/thong-tu', 2, TRUE, 4, 'Top'),
(N'Quyết định', '/van-ban/quyet-dinh', 3, TRUE, 4, 'Top'),
(N'Sơ đồ trang', '/so-do-trang', 1, TRUE, NULL, 'Bottom'),
(N'Chính sách bảo mật', '/chinh-sach-bao-mat', 2, TRUE, NULL, 'Bottom');

-- 10. Slides (Banner)
INSERT INTO public.Slides (Name, ImageLink, Description) VALUES
(N'Banner chào mừng', 'https://via.placeholder.com/1200x400?text=Banner+1', N'Banner chào mừng trang chủ'),
(N'Hội nghị năm 2025', 'https://via.placeholder.com/1200x400?text=Banner+2', N'Hội nghị tổng kết năm 2025'),
(N'Chương trình đào tạo', 'https://via.placeholder.com/1200x400?text=Banner+3', N'Chương trình đào tạo nâng cao'),
(N'Cải cách hành chính', 'https://via.placeholder.com/1200x400?text=Banner+4', N'Đẩy mạnh cải cách hành chính');

-- 11. WebLinks (Liên kết Website)
INSERT INTO public.WebLinks (Name, Url, ImageLink, Description, STT, IsShow) VALUES
(N'Cổng thông tin Chính phủ', 'https://chinhphu.vn', NULL, N'Cổng thông tin điện tử Chính phủ nước CHXHCN Việt Nam', 1, TRUE),
(N'Bộ Nội vụ', 'https://moha.gov.vn', NULL, N'Cổng thông tin điện tử Bộ Nội vụ', 2, TRUE),
(N'Bộ Tư pháp', 'https://moj.gov.vn', NULL, N'Cổng thông tin điện tử Bộ Tư pháp', 3, TRUE),
(N'Cổng dịch vụ công Quốc gia', 'https://dichvucong.gov.vn', NULL, N'Cổng dịch vụ công quốc gia', 4, TRUE),
(N'Bộ Tài chính', 'https://mof.gov.vn', NULL, N'Cổng thông tin điện tử Bộ Tài chính', 5, TRUE),
(N'Bộ Giáo dục và Đào tạo', 'https://moet.gov.vn', NULL, N'Cổng thông tin điện tử Bộ GD&ĐT', 6, TRUE);
