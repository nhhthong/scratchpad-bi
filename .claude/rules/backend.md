---
paths:
  - "app/**"
  - "routes/**"
  - "database/**"
  - "config/**"
  - "tests/**"
---

# Backend

- Dùng MCP `laravel-boost`: `search-docs` trước khi dùng API chưa chắc, `database-schema` trước khi viết migration hoặc model.
- Validation bằng Form Request, phân quyền bằng Policy/Gate, dữ liệu bằng Eloquent.
- Nghiệp vụ phức tạp vào `app/Actions` hoặc `app/Services`, không để trong Controller.
- Truyền dữ liệu bằng Inertia props, không tạo REST API cho frontend nội bộ.
- Dữ liệu lớn phải phân trang hoặc tổng hợp phía server.
