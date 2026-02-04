# 🛍️ Shop Affiliate - Trang Web Tiếp Thị Liên Kết

Một trang web affiliate chuyên nghiệp, hiện đại với giao diện Glassmorphism, tối ưu SEO và hiệu suất cao.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)

## ✨ Tính năng

- 🎨 **Giao diện Glassmorphism** - Hiệu ứng kính mờ hiện đại, gradient tím-hồng-xanh
- 📱 **Responsive hoàn hảo** - Mobile (danh sách dọc) / Desktop (Grid)
- 🔍 **Tìm kiếm real-time** - Lọc sản phẩm theo tên
- 🏷️ **Phân loại danh mục** - Tabs để lọc theo category
- 🔥 **Badge HOT** - Đánh dấu sản phẩm nổi bật
- 📋 **Copy mã giảm giá** - Click để copy discount code
- 🎬 **Animations mượt mà** - Framer Motion effects
- 🗄️ **Quản lý qua Supabase** - Thêm sản phẩm trực tiếp trên Dashboard

---

## 🚀 Bắt đầu nhanh

### 1. Clone và cài đặt

```bash
cd affiliate-shop
npm install
```

### 2. Cấu hình Supabase

1. Đăng ký tài khoản tại [supabase.com](https://supabase.com)
2. Tạo project mới
3. Sao chép `.env.local.example` thành `.env.local`:

```bash
copy .env.local.example .env.local
```

4. Điền thông tin vào `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> 💡 Lấy URL và Key từ: **Project Settings > API**

### 3. Tạo bảng Products trong Supabase

Vào **SQL Editor** trong Supabase Dashboard và chạy:

```sql
-- Tạo bảng products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  discount_code TEXT,
  is_hot BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai (ai cũng xem được)
CREATE POLICY "Allow public read access"
  ON products FOR SELECT
  USING (true);

-- (Tùy chọn) Thêm dữ liệu mẫu
INSERT INTO products (name, image_url, affiliate_link, category, price, old_price, discount_code, is_hot) VALUES
('Serum Vitamin C Dưỡng Sáng Da', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop', 'https://shopee.vn/product-link', 'Skincare', 199000, 350000, 'SERUM50', true),
('Tai Nghe Bluetooth TWS', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop', 'https://shopee.vn/product-link', 'Tech', 289000, 599000, 'TECH30', true),
('Nồi Chiên Không Dầu 5.5L', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=500&fit=crop', 'https://shopee.vn/product-link', 'Đồ gia dụng', 890000, 1500000, NULL, false);
```

### 4. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem trang web!

---

## 📝 Quản lý sản phẩm

### Thêm sản phẩm mới

1. Vào Supabase Dashboard > **Table Editor** > **products**
2. Click **Insert row**
3. Điền thông tin:
   - `name`: Tên sản phẩm
   - `image_url`: URL ảnh (dùng Imgur, Unsplash, hoặc upload lên Supabase Storage)
   - `affiliate_link`: Link affiliate từ Shopee/TikTok
   - `category`: Danh mục (Skincare, Tech, Đồ gia dụng,...)
   - `price`: Giá bán
   - `old_price`: Giá gốc (để hiển thị % giảm)
   - `discount_code`: Mã giảm giá (nếu có)
   - `is_hot`: true/false (đánh dấu sản phẩm HOT)

### Các danh mục gợi ý

- `Skincare` - Mỹ phẩm, chăm sóc da
- `Tech` - Công nghệ, điện tử
- `Đồ gia dụng` - Thiết bị nhà bếp
- `Thời trang` - Quần áo, phụ kiện
- `Sức khỏe` - Thực phẩm chức năng

---

## 🌐 Deploy lên Vercel (Miễn phí)

### Cách 1: Deploy từ GitHub

1. Push code lên GitHub repository
2. Vào [vercel.com](https://vercel.com) và đăng nhập
3. Click **"New Project"** > Import từ GitHub
4. Chọn repository của bạn
5. Thêm Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

### Cách 2: Deploy bằng Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel

# Thêm biến môi trường
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy lại với biến môi trường
vercel --prod
```

---

## 🎨 Tùy chỉnh

### Thay đổi thông tin Shop

Mở `src/app/page.tsx` và sửa object `shopInfo`:

```typescript
const shopInfo: ShopInfo = {
  name: "Tên Shop Của Bạn 🔥",
  avatar: "https://your-avatar-url.jpg",
  bio: "Mô tả ngắn về shop của bạn",
  socialLinks: {
    tiktok: "https://tiktok.com/@yourshop",
    facebook: "https://facebook.com/yourshop",
    instagram: "https://instagram.com/yourshop",
    shopee: "https://shopee.vn/yourshop",
  },
};
```

### Thay đổi màu sắc

Mở `src/app/globals.css` để tùy chỉnh:

- Gradient background
- Glassmorphism effects
- Button colors

---

## 📁 Cấu trúc thư mục

```
affiliate-shop/
├── src/
│   ├── app/
│   │   ├── globals.css      # Styles toàn cục
│   │   ├── layout.tsx       # Layout + SEO
│   │   └── page.tsx         # Trang chủ
│   ├── components/
│   │   ├── CategoryTabs.tsx # Tabs danh mục
│   │   ├── Header.tsx       # Header với avatar
│   │   ├── ProductCard.tsx  # Card sản phẩm
│   │   ├── SearchBar.tsx    # Thanh tìm kiếm
│   │   └── SocialLinks.tsx  # Icons mạng xã hội
│   ├── lib/
│   │   └── supabaseClient.ts # Kết nối Supabase
│   └── types/
│       └── index.ts         # TypeScript types
├── .env.local.example       # Mẫu biến môi trường
└── package.json
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

---

Made with ❤️ by Your Shop
