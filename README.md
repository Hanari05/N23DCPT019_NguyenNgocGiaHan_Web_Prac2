# 🛒 Lab 2 — RESTful API Quản lý Đơn hàng

**Sinh viên:** Nguyễn Ngọc Gia Hân  
**MSSV:** N23DCPT019  
**Nội dung:** Backend với Node.js, Express và MongoDB Atlas

API quản lý đơn hàng phục vụ thực hành CRUD, kết nối cơ sở dữ liệu qua Mongoose và kiểm thử bằng Postman. Dự án có chức năng lọc trạng thái, tìm kiếm tên khách hàng và sắp xếp tổng tiền theo mục Challenge của Lab 2.

## 1. Công nghệ

| Công nghệ | Vai trò |
| --- | --- |
| Node.js | Chạy JavaScript phía server |
| Express | Khai báo middleware và các route API |
| MongoDB Atlas | Lưu dữ liệu trên cloud |
| Mongoose | Định nghĩa schema, model và truy vấn MongoDB |
| dotenv | Đọc biến môi trường từ `.env` |
| cors | Cho phép truy cập API từ nguồn khác |
| nodemon | Tự khởi động lại server khi sửa code trong chế độ dev |
| Postman | Gửi request và kiểm tra response |

## 2. Cấu trúc dự án

```text
order-management-api/
├── models/
│   └── Order.js
├── routes/
│   └── orderRoutes.js
├── postman/
│   └── Order-Management.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

Sau khi chạy `npm install`, npm tạo `node_modules/` và có thể tạo hoặc cập nhật `package-lock.json`. Nên commit `package-lock.json` để cố định phiên bản thư viện; không commit `node_modules/`.

`server.js` nạp biến môi trường, cấu hình middleware, gắn router tại `/api/orders`, kết nối Atlas rồi mở cổng HTTP. `models/Order.js` định nghĩa cấu trúc dữ liệu. `routes/orderRoutes.js` tiếp nhận request và thao tác với model.

## 3. Cài đặt và kết nối Atlas

### Chuẩn bị

- Node.js đáp ứng `engines` trong `package.json` (>=18).
- Cluster MongoDB Atlas đang hoạt động.
- Database User có quyền đọc/ghi database sử dụng trong ứng dụng.
- IP của máy chạy server đã được cho phép trong IP Access List.
- Postman Desktop hoặc Postman Web kết hợp Desktop Agent.

### Cài thư viện

Mở terminal trong thư mục chứa `package.json`:

```bash
npm install
```

### Cấu hình môi trường

Tạo `.env` từ `.env.example`. Trên PowerShell:

```powershell
Copy-Item .env.example .env
```

Điền thông tin thật trên máy của mình:

```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/OrderDB?retryWrites=true&w=majority
```

- Giữ nguyên hostname Atlas cấp qua **Connect → Drivers**.
- Dùng đúng tên biến **MONGO_URI**, khớp `process.env.MONGO_URI` trong server.
- `/OrderDB` chỉ định database lưu dữ liệu. Chuyển từ `test` sang `OrderDB` trong URI không tự di chuyển dữ liệu cũ.
- Mật khẩu chứa ký tự đặc biệt phải được mã hóa phù hợp khi đưa vào URI.
- Không commit `.env` hoặc file chứa mật khẩu; `.env.example` chỉ chứa giá trị mẫu.

### Chạy server

```bash
npm run dev
```

Kết nối thành công sẽ in:

```text
MongoDB Connected!
Server is running on port 5000
```

Chạy không dùng nodemon:

```bash
npm start
```

Mở `http://localhost:5000/` để xem thông báo server hoạt động. Giữ terminal chạy trong lúc kiểm thử API. Sau khi sửa `.env`, lưu file và khởi động lại server.

## 4. Order Model

| Trường | Kiểu | Quy định trong model |
| --- | --- | --- |
| customerName | String | Bắt buộc |
| customerEmail | String | Bắt buộc |
| items | Array | Danh sách sản phẩm |
| items.productName | String | Bắt buộc cho mỗi item |
| items.quantity | Number | Bắt buộc, tối thiểu 1 |
| items.unitPrice | Number | Bắt buộc |
| totalAmount | Number | Bắt buộc |
| status | String | Thuộc danh sách trạng thái, mặc định pending |
| createdAt | Date | Mặc định thời điểm tạo |

Các trạng thái: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`.

Mongoose tạo `_id` cho document và ánh xạ model `Order` đến collection `orders`. Bản cơ bản chưa kiểm tra định dạng email, chưa bắt buộc items không rỗng và chưa đối chiếu totalAmount với tổng tiền sản phẩm.

## 5. API CRUD

Base URL: `http://localhost:5000`

| Method | Endpoint | Chức năng | Thành công |
| --- | --- | --- | --- |
| GET | `/` | Kiểm tra server | 200 |
| POST | `/api/orders` | Tạo đơn hàng | 201 |
| GET | `/api/orders` | Lấy danh sách | 200 |
| GET | `/api/orders/:id` | Lấy theo ID | 200 |
| PUT | `/api/orders/:id` | Cập nhật đơn hàng | 200 |
| DELETE | `/api/orders/:id` | Xóa theo ID | 200 |

`:id` là `_id` của đơn hàng, không phải `_id` của sản phẩm trong `items`.

### POST — Tạo đơn hàng

Chọn **Body → raw → JSON**, gửi:

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

Response HTTP 201 trả document đã lưu, có `_id`, `status: "pending"` và `createdAt`. Route POST hiện đặt trạng thái theo mặc định của model; muốn đổi trạng thái, dùng PUT.

### PUT — Cập nhật trạng thái

URL: `http://localhost:5000/api/orders/{{orderId}}`

```json
{
  "status": "confirmed"
}
```

Response HTTP 200 trả document sau cập nhật. Bản code dùng PUT để bám theo lab; với thiết kế API mới, cập nhật một phần như ví dụ này thường dùng PATCH.

### DELETE — Xóa đơn hàng

URL: `http://localhost:5000/api/orders/{{orderId}}`. Không cần body.

```json
{
  "message": "Da xoa don hang thanh cong!"
}
```

Gọi GET cùng ID sau khi xóa sẽ trả HTTP 404.

### Response lỗi

ID sai định dạng trả 400; ID đúng định dạng nhưng không có document trả 404. Validation khi tạo hoặc cập nhật trả 400. Lỗi truy vấn trong các route GET/DELETE trả 500. Nội dung lỗi có dạng `{ "message": "..." }`.

## 6. Ba Challenge

Thứ tự triển khai: **lọc → sắp xếp → tìm kiếm**. Cả ba đã có code trong `routes/orderRoutes.js`.

| Chức năng | Request |
| --- | --- |
| Lọc trạng thái | `GET /api/orders?status=pending` |
| Tổng tiền tăng dần | `GET /api/orders?sort=asc` |
| Tổng tiền giảm dần | `GET /api/orders?sort=desc` |
| Kết hợp lọc và sắp xếp | `GET /api/orders?status=pending&sort=asc` |
| Tìm một phần tên | `GET /api/orders/search?name=nguyen` |

- Lọc đọc `req.query.status`, truyền điều kiện vào `Order.find()`.
- Sắp xếp đọc `req.query.sort`, dùng `.sort({ totalAmount: 1 })` hoặc `-1`; code thêm `_id` để thứ tự ổn định khi tổng tiền bằng nhau.
- Không có sort: trả đơn mới nhất trước.
- Tìm kiếm dùng `$regex` với `$options: 'i'`; loại khoảng trắng ở đầu/cuối và xử lý ký tự regex như văn bản thường.
- Tìm kiếm không phân biệt hoa thường nhưng vẫn phân biệt dấu tiếng Việt: `nguyen` không tự khớp `Nguyễn`.
- `/search` được khai báo trước `/:id` để không bị hiểu là ID.
- Không có kết quả phù hợp: HTTP 200 và `[]`.
- Status không hợp lệ, sort khác `asc`/`desc`, name thiếu hoặc chỉ có khoảng trắng: HTTP 400.

## 7. Kiểm thử Postman và Atlas

Import `postman/Order-Management.postman_collection.json`.

Biến collection:

| Biến | Giá trị |
| --- | --- |
| baseUrl | `http://localhost:5000` |
| orderId | Tự lưu từ response POST thành công |

Không bắt buộc tạo Environment riêng. Nếu dùng Postman Web, chọn Desktop Agent để gửi tới localhost.

### Luồng CRUD

1. POST tạo một đơn và ghi nhận `_id`.
2. GET danh sách và GET theo ID để đối chiếu dữ liệu.
3. PUT đổi status thành confirmed, GET lại cùng ID.
4. DELETE, sau đó GET cùng ID phải trả 404.
5. Tạo lại dữ liệu để thử Challenge; không xóa trước khi kiểm tra lọc/tìm/sắp xếp.

### Dữ liệu gợi ý cho Challenge

Tạo ba đơn với mỗi đơn có một item, quantity = 1, unitPrice bằng totalAmount:

| customerName | customerEmail | totalAmount | status |
| --- | --- | --- | --- |
| Nguyen An | an@example.com | 100000 | pending |
| Tran Binh | binh@example.com | 300000 | pending |
| NGUYEN Chi | chi@example.com | 200000 | confirmed |

Dùng PUT để đổi trạng thái đơn Chi sau POST. Nếu database chỉ có ba đơn này:

- Lọc pending: An, Binh.
- Sort asc: An → Chi → Binh; desc: Binh → Chi → An.
- Lọc pending và sort asc: An → Binh.
- Tìm nguyen: An và Chi (đối chiếu tập kết quả, không yêu cầu thứ tự theo tên).

Các request 6–13 có sẵn ví dụ Challenge và query sai. Script Postman kiểm tra mã HTTP; cần kiểm tra thêm giá trị từng trường và thứ tự kết quả.

Trên Atlas, mở **Data Explorer → OrderDB → orders → Documents**. Đối chiếu `_id` với Postman, tải lại sau POST/PUT/DELETE để xác nhận dữ liệu thật đã thay đổi.

### Lỗi thường gặp

| Hiện tượng | Cách kiểm tra |
| --- | --- |
| Thiếu MONGO_URI | Tên biến, vị trí `.env`, file đã lưu chưa |
| Không kết nối được Atlas | URI, Database User, IP Access List, mạng và log cụ thể |
| Postman không gọi được localhost | Server đang chạy và Desktop Agent đã bật |
| ID không hợp lệ | Biến orderId phải là `_id` của đơn vừa POST |
| Dữ liệu nằm trong test | Kiểm tra tên database trong URI |
| Collection trống sau test | Có thể đã DELETE; POST lại một đơn |
| Search bị coi là ID | Đặt `/search` trước `/:id` |

## 8. Tiến độ và phần mở rộng

| Nội dung Lab 2 | Tình trạng bản code |
| --- | --- |
| Mục III: Khởi tạo, model, kết nối, CRUD | Đã triển khai |
| Mục IV: Postman | Có collection và hướng dẫn; CRUD đã được kiểm tra trên môi trường cá nhân |
| Mục VI: 3 Challenge | Đã triển khai; cần kiểm tra với dữ liệu Atlas của người chạy |
| Mục V: Validation tổng tiền | Chưa triển khai |
| Mục V: Response chuẩn hóa | Chưa triển khai |
| Mục V: Logging bằng morgan | Chưa triển khai |
| Mục VII: Deploy backend | Chưa triển khai |

Mục V được tài liệu ghi rõ là gợi ý mở rộng. Mục VII có hướng dẫn deploy nhưng tài liệu không nêu rõ đây có phải tiêu chí chấm bắt buộc hay không; cần đối chiếu yêu cầu nộp bài của giảng viên.

Nếu làm tiếp mục V: kiểm tra `totalAmount = tổng(quantity × unitPrice)`; thống nhất response `{ success, data, message }`; thêm middleware morgan. Khi thay cấu trúc response, phải cập nhật script Postman lấy orderId cho khớp.

Theo mục VII, có thể triển khai backend lên Render hoặc Railway và đặt `MONGO_URI` cùng cấu hình cổng theo môi trường hosting. Nếu repo chứa backend trong thư mục con, cần đặt thư mục gốc dịch vụ tới nơi có `package.json`. GitHub lưu code; GitHub Pages không chạy server Express. Sau deploy, đổi baseUrl trong Postman thành URL dịch vụ và kiểm tra lại API.

## 9. Đưa code lên GitHub

Kiểm tra `git status` trước khi commit. Bảo đảm `.env`, các file credentials và `node_modules/` được bỏ qua. File chứa credentials ở thư mục cha cần được bỏ qua bởi `.gitignore` ở cấp phù hợp.

Với repo đã cấu hình remote:

```bash
git status
git add .
git commit -m "Complete Lab 2 CRUD and challenges"
git push
```

Không đưa mật khẩu vào README, collection hoặc ảnh minh chứng. Khi chuẩn bị nộp, có thể bổ sung ảnh Postman và Atlas để thể hiện kết quả thực tế, nếu giảng viên yêu cầu.
