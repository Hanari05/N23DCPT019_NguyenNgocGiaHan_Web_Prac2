# Lab 2 — Order Management API

API quản lý đơn hàng theo tài liệu **Lab 2: Backend với Node.js & Express**. Dự án dùng Express, MongoDB Atlas, Mongoose và Postman.

## Cấu trúc

```text
order-management-api/
├── models/
│   └── Order.js                 # Schema và model đơn hàng
├── routes/
│   └── orderRoutes.js           # 5 endpoint CRUD
├── postman/
│   └── Order-Management.postman_collection.json
├── .env.example                 # Mẫu biến môi trường, được phép push
├── .gitignore                   # Chặn .env và node_modules
├── package.json
└── server.js                    # Middleware, kết nối Atlas, khởi động server
```

## Chuẩn bị MongoDB Atlas

1. Tạo cluster trên MongoDB Atlas (cluster **không** nằm trên GitHub).
2. Tạo **Database User**, lưu tên đăng nhập và mật khẩu riêng cho ứng dụng.
3. Trong **Network Access**, thêm IP hiện tại của máy em.
4. Chọn **Connect → Drivers → Node.js** và sao chép chuỗi kết nối.
5. Thay username, password, cluster trong chuỗi; đặt tên database là `OrderDB`.

Không chia sẻ mật khẩu hoặc đưa file `.env` lên GitHub. Nếu mật khẩu có ký tự đặc biệt trong URI, hãy mã hóa chúng theo quy tắc URL.

## Cài đặt và chạy

Yêu cầu Node.js >= 18. Giải nén và mở terminal trong thư mục `order-management-api`:

```bash
npm install
```

Tạo file `.env` từ `.env.example`. Trên PowerShell:

```powershell
Copy-Item .env.example .env
```

Mở `.env`, điền URI **thật của em** vào `MONGO_URI`. Sau đó chạy:

```bash
npm run dev
```

Nếu thành công, terminal in `MongoDB Connected!` và `Server is running on port 5000`. Mở `http://localhost:5000/` để kiểm tra. `npm start` cũng chạy server nhưng không tự khởi động lại khi sửa file.

## Kiểm thử với Postman

Import `postman/Order-Management.postman_collection.json`. Các request dùng biến `baseUrl` là `http://localhost:5000` và `orderId` cho ID một đơn hàng.

| Phương thức | Địa chỉ | Kết quả dự kiến |
| --- | --- | --- |
| POST | `/api/orders` | Tạo đơn hàng, HTTP 201 |
| GET | `/api/orders` | Danh sách, HTTP 200 |
| GET | `/api/orders/:id` | Một đơn hàng, HTTP 200 hoặc 404 |
| PUT | `/api/orders/:id` | Cập nhật trạng thái, HTTP 200 hoặc 404 |
| DELETE | `/api/orders/:id` | Xóa đơn hàng, HTTP 200 hoặc 404 |

**Thứ tự thử:** chạy request **Tạo đơn hàng** trước; Postman sẽ lưu `_id` nhận được vào biến `orderId`. Sau đó chạy GET danh sách, GET theo ID, PUT và DELETE. Nếu biến không tự lưu, sao chép `_id` từ response POST, điền vào biến `orderId` trong collection.

Body mẫu cho POST (Body → raw → JSON):

```json
{
  "customerName": "Nguyen Van A",
  "customerEmail": "vana@email.com",
  "items": [
    { "productName": "Laptop Dell XPS", "quantity": 1, "unitPrice": 25000000 },
    { "productName": "Chuot Logitech", "quantity": 2, "unitPrice": 500000 }
  ],
  "totalAmount": 26000000
}
```

Body mẫu cho PUT: `{ "status": "confirmed" }`. Các trạng thái hợp lệ là `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`.

## Bài tập tự làm trong Lab 2

Ba phần sau **chưa được giải sẵn** để em có thể làm theo mục VI của lab:

1. Sửa GET `/api/orders?status=pending` để lọc theo `req.query.status`.
2. Thêm GET `/api/orders/search?name=...` để tìm tên khách hàng không phân biệt hoa thường. **Đặt route `/search` trước `/:id`.**
3. Sửa GET `/api/orders?sort=asc` hoặc `desc` để sắp xếp `totalAmount`.

Các phần kiểm tra `totalAmount`, chuẩn hóa response và `morgan` thuộc mục *mở rộng* của lab, chưa cài vào bản cơ bản.

## Khi push lên GitHub

Sau khi tạo repo trống trên GitHub, mở terminal trong `order-management-api` và chạy:

```bash
git init
git add .
git commit -m "Set up Lab 2 order management API"
git branch -M main
git remote add origin https://github.com/TEN_TAI_KHOAN/TEN_REPO.git
git push -u origin main
```

Thay URL bằng repo của em. `.env` và `node_modules` đã nằm trong `.gitignore`, nên sẽ không được thêm vào commit. GitHub Pages không chạy được API Express; nếu muốn truy cập API từ Internet, cần triển khai backend trên nền tảng chạy Node.js và cấu hình `MONGO_URI` ở đó.
