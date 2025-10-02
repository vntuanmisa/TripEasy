# TripEasy - Ứng dụng Quản lý Du lịch Thông minh

## 🌟 Tổng quan

TripEasy là ứng dụng web quản lý du lịch toàn diện với thiết kế mobile-first, giúp người dùng và nhóm bạn bè/gia đình dễ dàng:

- ✈️ Lên kế hoạch và tổ chức chuyến đi
- 📅 Theo dõi lịch trình hoạt động trực quan
- 💰 Quản lý chi tiêu minh bạch
- 🤝 Tự động chia tiền công bằng với thuật toán thông minh

## 🚀 Tính năng chính

### 📋 Quản lý Chuyến đi
- Dashboard hiển thị tất cả chuyến đi (sắp tới, đang diễn ra, đã kết thúc)
- Tạo chuyến đi mới với thông tin chi tiết
- Tham gia chuyến đi bằng mã mời duy nhất
- Tích hợp bản đồ để chọn điểm đến

### 🗓️ Quản lý Lịch trình
- Lịch trình theo từng ngày có thể mở rộng/thu gọn
- Thêm/sửa/xóa hoạt động với thông tin chi tiết
- Gắn địa điểm từ bản đồ tương tác
- Tự động sắp xếp theo thời gian

### 💸 Quản lý Chi phí
- Theo dõi chi phí theo ngày và danh mục
- Bộ lọc mạnh mẽ (người trả, danh mục, ngày)
- Hỗ trợ nhiều loại tiền tệ với tỷ giá quy đổi
- Phân loại chi phí chung/riêng

### 👥 Quản lý Thành viên
- Thêm/sửa/xóa thành viên
- Điều chỉnh hệ số chia tiền cho từng người
- Hỗ trợ hệ số đặc biệt cho trẻ em

### 📊 Báo cáo & Chia tiền
- **Thuật toán chia tiền thông minh:**
  1. Tính tổng hệ số của tất cả thành viên
  2. Chi phí trên một đơn vị = Tổng chi phí chung / Tổng hệ số
  3. Số tiền phải trả = Chi phí trên một đơn vị × Hệ số thành viên
  4. Số dư = Đã trả - Phải trả
- Biểu đồ trực quan (tròn, cột) cho chi tiêu
- Bảng tổng kết thanh toán chi tiết
- Xuất báo cáo PDF/CSV

## 🛠️ Công nghệ sử dụng

### Backend
- **FastAPI** - Framework Python hiện đại
- **MySQL** - Cơ sở dữ liệu với SSL
- **SQLAlchemy** - ORM
- **Pydantic** - Validation

### Frontend
- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **next-intl** - Đa ngôn ngữ (vi/en)
- **React Query** - State management
- **Leaflet** - Bản đồ tương tác
- **Chart.js** - Biểu đồ

### Tính năng nâng cao
- **PWA** - Progressive Web App
- **Offline Mode** - IndexedDB caching
- **Mobile-first** - Responsive design
- **i18n** - Hỗ trợ Tiếng Việt & Tiếng Anh

## 🚀 Cài đặt & Chạy

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL database

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Tạo file `.env` trong thư mục backend:
```env
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
PORT=8000
```

## 📱 PWA Installation

Ứng dụng hỗ trợ cài đặt như một Progressive Web App:
1. Truy cập website trên mobile/desktop
2. Nhấn "Cài đặt TripEasy" khi xuất hiện banner
3. Sử dụng như ứng dụng native với offline support

## 🌐 Deployment

### Vercel Deployment
1. **Manual Deployment Only** (không tự động deploy khi commit)
2. Cấu hình environment variables trên Vercel Dashboard
3. Deploy thủ công từ Vercel Dashboard

### Git Workflow
```bash
git add .
git commit -m "feat: description"
git push origin main
# Sau đó deploy thủ công trên Vercel
```

## 📊 Database Schema

### Trips
- id, name, destination, dates, currency, settings
- invite_code (unique)

### Members
- id, trip_id, name, factor, is_child

### Activities
- id, trip_id, name, location, times

### Expenses
- id, trip_id, amount, currency, category
- paid_by, is_shared, exchange_rate

## 🎯 Thuật toán Settlement

```python
# 1. Tính tổng hệ số
total_factor = sum(member.factor for member in members)

# 2. Chi phí trên một đơn vị
cost_per_factor = total_shared_expenses / total_factor

# 3. Số tiền phải trả của mỗi người
member_owes = cost_per_factor * member.factor

# 4. Số dư
balance = total_paid - member_owes

# 5. Tối ưu hóa giao dịch (Greedy algorithm)
# Minimize số lượng giao dịch cần thiết
```

## 🔒 Security Features

- SSL/TLS encryption
- Input validation với Pydantic
- SQL injection protection
- XSS protection headers
- CORS configuration

## 📱 Mobile-First Design

- Responsive breakpoints
- Touch-friendly interface
- Optimized for mobile screens
- Fast loading với lazy loading
- Offline-first architecture

## 🌍 Internationalization

- Vietnamese (default)
- English
- Date/number formatting theo locale
- Currency formatting
- RTL support ready

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.

---

**TripEasy** - Làm cho việc quản lý du lịch trở nên dễ dàng! 🎉
