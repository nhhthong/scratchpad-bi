## 1. Nghĩ trước khi code
- Nêu rõ giả định. Có nhiều cách hiểu thì nói ra, không tự chọn im lặng.
- Có cách đơn giản hơn thì đề xuất. Chỗ nào chưa rõ thì dừng lại và hỏi.

## 2. Đơn giản trước
- Viết ít code nhất đủ giải quyết vấn đề. Không thêm tính năng, abstraction dùng một lần hay cấu hình không ai yêu cầu.
- Không xử lý tình huống không thể xảy ra.

## 3. Thay đổi tối thiểu
- Chỉ sửa những gì yêu cầu cần. Theo style sẵn có của file.
- Thấy code chết không liên quan thì báo, đừng xóa. Chỉ dọn thứ thừa do chính thay đổi của bạn tạo ra.

## 4. Làm theo mục tiêu kiểm chứng được
- Biến việc thành mục tiêu kiểm tra được: bug thì viết test tái hiện rồi sửa cho pass.
- Việc nhiều bước: nêu kế hoạch ngắn, mỗi bước kèm cách kiểm tra.

## 5. Chạy lệnh trong Docker

- Không chạy `php`, `composer`, `pnpm` trên host (không có `vendor/`, `node_modules/`). Dùng `docker compose exec app php artisan ...` và `docker compose exec vite pnpm run <script>`. Khi tài liệu ghi `php artisan ...`, vẫn thêm tiền tố này.

## 6. Xác thực dữ liệu bằng truy vấn Docker trước khi đánh giá

Trước khi kết luận về dữ liệu hoặc trạng thái (số liệu BI, lỗi, "bảng trống", "migration đã chạy"), phải truy vấn thực tế từ container. Không suy ra từ code, migration, seeder, log cũ hay trí nhớ.

- Kiểm tra stack trước: `docker compose ps`. Service không chạy hoặc không healthy thì nói rõ và dừng, không đoán.
- Ưu tiên MCP `laravel-boost`: `database-query` (chỉ đọc), `database-schema`.
- Không có MCP thì dùng container, không gõ password vào lệnh:
  - MySQL: `docker compose exec -T mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT ..."'`
  - Redis: `docker compose exec -T redis sh -c 'redis-cli --no-auth-warning -a "$REDIS_PASSWORD" <LỆNH ĐỌC>'`
- Chỉ chạy lệnh đọc (`SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`; Redis `GET`, `DBSIZE`, `TTL`, `SCAN`). Lệnh ghi cần người dùng xác nhận.
- Báo cáo kèm câu truy vấn và kết quả. Dữ liệu lớn thì dùng `COUNT`, `LIMIT` hoặc tổng hợp.
- Không truy vấn được thì nói rõ là chưa xác thực và coi mọi nhận định còn lại là giả định.
