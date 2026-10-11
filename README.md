# You are my Universe — 20/10 Memory Showcase

Next.js (App Router) + TypeScript + Tailwind CSS v4 + React Three Fiber + Framer Motion.
Thuần frontend: dữ liệu lưu trong `localStorage` của trình duyệt.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## Lệnh khác

```bash
npm run typecheck   # kiểm tra TypeScript
npm run build       # build production
npm run start       # chạy bản build
```

## Ghi chú

- Nền thiên hà được vẽ bằng CSS (`.galaxy-*` trong `src/app/globals.css`), không dùng ảnh. Muốn chỉnh vệt sáng thì sửa các `galaxy-streak` trong `page.tsx`.
- Phóng to/thu nhỏ: cuộn chuột, chụm 2 ngón, hoặc nút +/− bên phải. Nút "Quản lý" mở danh sách để xem / sửa / xóa ảnh.

- Dữ liệu mẫu nằm ở `src/data/memories.ts`, lần đầu mở app sẽ được nạp vào `localStorage`.
- Ảnh chọn từ máy được thu nhỏ (tối đa 1200px) rồi lưu base64; `localStorage` ~5 MB nên chứa khoảng 15–25 ảnh.
- Link ảnh dán vào phải có CORS (WebGL texture). Ảnh trong `public/photos/` dùng đường dẫn `/photos/ten-anh.jpg`.
- Font Google (Be Vietnam Pro, Cormorant Garamond) được tải lúc build/dev, cần có internet.
# GF_UNIVER
