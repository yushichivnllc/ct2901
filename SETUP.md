# 🚀 CT2901 Attendance System - Setup Guide

## ✅ Cài đặt và Khởi động

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Setup Supabase Database

#### Bước 1: Tạo bảng database
1. Đăng nhập vào [Supabase Console](https://app.supabase.com)
2. Chọn project của bạn
3. Mở **SQL Editor** từ menu bên trái
4. Dán toàn bộ code từ file `SUPABASE_SETUP.sql` và chạy

Hoặc copy-paste SQL sau:

```sql
-- 1. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  recorded_by TEXT NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  records JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Attendance History Table
CREATE TABLE IF NOT EXISTS attendance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  session_name TEXT NOT NULL,
  recorded_by TEXT NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  total_students INT NOT NULL,
  present_count INT NOT NULL,
  absent_excused_count INT NOT NULL,
  absent_unexcused_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Student Statistics Table (thống kê CHUNG toàn lớp)
CREATE TABLE IF NOT EXISTS student_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  total_sessions INT DEFAULT 0,
  present_count INT DEFAULT 0,
  absent_excused_count INT DEFAULT 0,
  absent_unexcused_count INT DEFAULT 0,
  attendance_rate FLOAT DEFAULT 0,
  recorded_by TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  UNIQUE(student_name)
);
```

#### ⚠️ Migration cho database đang chạy
Nếu database của bạn được tạo theo phiên bản cũ (`UNIQUE(student_name, recorded_by)`), chạy thêm SQL sau trong SQL Editor:

```sql
DELETE FROM student_statistics;
ALTER TABLE student_statistics
  DROP CONSTRAINT IF EXISTS student_statistics_student_name_recorded_by_key;
ALTER TABLE student_statistics
  ADD CONSTRAINT student_statistics_student_name_key UNIQUE (student_name);
```

#### Bước 2: Kiểm tra biến môi trường
Đảm bảo file `.env.local` có các biến sau:

```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
VITE_SUPABASE_JWT_SECRET="your-jwt-secret"
```

### 3. Chạy Development Server
```bash
npm run dev
```

Truy cập: `http://localhost:5173`

### 4. Build cho Production
```bash
npm run build
npm run preview
```

---

## 📋 Danh sách Cán bộ Lớp

Những người sau có thể đăng nhập và sử dụng hệ thống:
- Hà Đức Hiếu
- Phạm Văn Hoàng
- Hoàng Thị Nhiên
- Trần Duy Khánh

Bạn có thể chỉnh sửa danh sách trong `src/data/classRoster.ts`:

```typescript
export const CAN_BO_LOP = [
  "Hà Đức Hiếu",
  "Phạm Văn Hoàng",
  "Hoàng Thị Nhiên",
  "Trần Duy Khánh",
];
```

---

## 🎯 Tính năng Chính

✅ **Quét QR Code** - Điểm danh nhanh bằng mã QR  
✅ **Điểm danh thủ công** - Nhập tay từng học sinh  
✅ **Ghi tên người thực hiện** - Mỗi phiên lưu kèm tên cán bộ lớp đã điểm danh (hiện trong Lịch sử & báo cáo Zalo)  
✅ **Đồng bộ giữa các cán bộ lớp** - Tự tải dữ liệu chung khi đăng nhập + nút 🔄 "Đồng bộ" để lấy phiên mới nhất của các cán bộ khác  
✅ **Thống kê** - Thống kê chung toàn lớp, cộng dồn từ phiên của tất cả cán bộ  
✅ **Lịch sử** - Xem lịch sử phiên điểm danh của cả nhóm cán bộ (kèm người thực hiện)  
✅ **Xuất báo cáo Zalo** - Gửi báo cáo qua Zalo cho giáo viên (kèm tên người báo cáo)  
✅ **Xóa dữ liệu test** - Xóa dữ liệu khi test  
✅ **Lưu Supabase** - Sao lưu dữ liệu cloud  

---

## 🐛 Troubleshooting

### ❌ "Web không vô được"

**Nguyên nhân:** Supabase URL hoặc API key không đúng

**Cách fix:**
1. Kiểm tra `.env.local` có đúng các biến `VITE_*`
2. Kiểm tra Supabase project URL và API key
3. Chạy lại `npm run build` và `npm run dev`

### ❌ "Lỗi khi lưu dữ liệu"

**Nguyên nhân:** Các bảng database chưa được tạo

**Cách fix:**
1. Mở Supabase Console
2. Chạy SQL từ `SUPABASE_SETUP.sql`
3. Refresh web page

### ❌ "Không thấy nút điểm danh"

**Nguyên nhân:** Người dùng không phải cán bộ lớp

**Cách fix:**
1. Đăng nhập bằng tài khoản trong danh sách `CAN_BO_LOP`
2. Hoặc thêm tên của bạn vào `src/data/classRoster.ts`

---

## 📱 Đồng bộ Zalo

Để gửi báo cáo qua Zalo:
1. Click nút "Zalo" trên màn hình
2. Click "📱 Gửi cho GV (Zalo)"
3. Chọn contact giáo viên và gửi

---

## 💾 Dữ liệu được Lưu

- **Local Storage**: Dữ liệu phiên hiện tại (offline support)
- **Supabase**:
  - `attendance_records` - Chi tiết từng lần điểm danh
  - `attendance_history` - Lịch sử phiên điểm danh
  - `student_statistics` - Thống kê học sinh

---

## 🔐 Bảo mật

- ✅ Chỉ cán bộ lớp mới vào được
- ✅ Supabase API key an toàn (client-side)
- ✅ Dữ liệu được mã hóa
- ✅ Có thể xóa dữ liệu nếu cần

---

## 📞 Liên hệ

Nếu có vấn đề, kiểm tra:
1. Console log (F12) xem có lỗi gì
2. Kiểm tra network tab có request đến Supabase không
3. Xem `.env.local` có đủ biến môi trường không

**Happy Coding! 🎉**
