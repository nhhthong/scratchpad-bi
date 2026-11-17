---
paths:
  - "compose.yaml"
  - "docker/**"
  - ".env.example"
  - "vite.config.ts"
---

# Docker

- Source bind-mount từ host; `vendor/` và `node_modules/` ở named volume. Production không bind-mount.
- Trước khi đổi hoặc thêm port host: chạy `ss -ltnp`, `docker ps --format "table {{.Names}}\t{{.Ports}}"` và tìm port cố định trong compose khác. Port bị chiếm thì chọn port khác, không dừng service khác.
- Service gọi nhau bằng tên service (`mysql:3306`, `redis:6379`), không dùng port host.
- MySQL và Redis chỉ publish vào `127.0.0.1`; secrets qua biến môi trường.
- Sau khi sửa: `docker compose config -q`, rồi `docker compose up -d` và kiểm tra `docker compose ps`.
