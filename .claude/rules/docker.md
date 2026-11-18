---
paths:
  - "compose.yaml"
  - "docker/**"
  - ".env.example"
  - "vite.config.ts"
---

# Docker

- Source bind-mount từ host, gồm cả `vendor/` và `node_modules/` (chỉ dùng cho Linux). Production không bind-mount.
- Chỉ 3 container: `app` chạy `php artisan dev` (server, queue, Pail, Vite), `mysql`, `redis`. Không tách Vite hay queue ra container riêng.
- Trước khi đổi hoặc thêm port host: chạy `make ports`, `ss -ltnp`, `docker ps --format "table {{.Names}}\t{{.Ports}}"` và tìm port cố định trong compose khác. Port bị chiếm thì chọn port khác, không dừng service khác.
- Service gọi nhau bằng tên service (`mysql:3306`, `redis:6379`), không dùng port host.
- MySQL và Redis chỉ publish vào `127.0.0.1`; secrets qua biến môi trường.
- Sau khi sửa: `docker compose config -q`, rồi `make up` (hoặc `make restart` nếu chỉ sửa `vite.config.ts`, `.env`) và kiểm tra `make ps`.
