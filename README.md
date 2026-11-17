# BI YGK

Ứng dụng BI: Laravel 13 · Inertia 3 · Vue 3 (TypeScript) · shadcn-vue (reka-ui) · Tailwind 4 · Vite · MySQL 8.4 · Redis 7 · Docker Compose.
Quy ước cho AI agent: [AGENTS.md](AGENTS.md) và `.claude/rules/`.

## 1. Yêu cầu trên máy host

| Công cụ | Dùng để | Ghi chú |
| --- | --- | --- |
| Docker + Docker Compose v2 | Chạy toàn bộ stack | Bản đã dùng: Docker 29.8.2, Compose 5.6.0 |
| Git | Clone repo | |
| Node.js (có `npx`) | Chỉ để chạy MCP `shadcn` | Bản đã dùng: 24.x |
| Claude Code | AI agent (tùy chọn) | Cần ≥ 2.1.277 để đọc `AGENTS.md` |

Không cần cài PHP, Composer hay pnpm trên host: mọi lệnh chạy trong container. Vì vậy `vendor/` và `node_modules/` không có trên host (nằm trong named volume); IDE muốn gợi ý code thì tự cài thêm bản local.

## 2. Cổng host

Đã kiểm tra trống ngày 2026-11-17 bằng `ss -ltn` và `docker ps`. Giá trị nằm trong `.env`.

| Service | Cổng host | Biến |
| --- | --- | --- |
| App (`php artisan serve`) | 8090 | `APP_PORT` |
| Vite dev server / HMR | 5180 | `VITE_PORT` |
| MySQL (chỉ `127.0.0.1`) | 3310 | `MYSQL_FORWARD_PORT` |
| Redis (chỉ `127.0.0.1`) | 6380 | `REDIS_FORWARD_PORT` |

Máy bạn có thể đang dùng các cổng này. Kiểm tra trước khi chạy, và nếu trùng thì đổi trong `.env`, không dừng service khác:

```bash
ss -ltnp                                            # Linux
lsof -nP -iTCP -sTCP:LISTEN                         # macOS
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Các container gọi nhau bằng tên service (`mysql:3306`, `redis:6379`), không dùng cổng host.

## 3. Cài đặt lần đầu

```bash
git clone https://github.com/nhhthong/scratchpad-bi.git
cd scratchpad-bi

cp .env.example .env
```

Sửa `.env`:
- Đặt mật khẩu thật cho `DB_PASSWORD`, `DB_ROOT_PASSWORD`, `REDIS_PASSWORD`. Không commit `.env`.
- Đặt `UID` và `GID` bằng kết quả của `id -u` và `id -g` (Linux thường là 1000; macOS thường là 501 và 20).
- Đổi `APP_PORT`, `VITE_PORT`, `MYSQL_FORWARD_PORT`, `REDIS_FORWARD_PORT` nếu cổng ở mục 2 bị trùng.

Sau đó:

```bash
docker compose build
docker compose up -d mysql redis
docker compose run --rm --no-deps app composer install
docker compose run --rm --no-deps app pnpm install
docker compose run --rm --no-deps app php artisan key:generate
docker compose run --rm app php artisan migrate
docker compose up -d
docker compose ps        # cả 4 service phải Up; mysql và redis phải healthy
```

Mở http://localhost:8090 (đổi cổng nếu bạn đã sửa `APP_PORT`).

`composer install` và `pnpm install` lần đầu mất vài phút. Nếu `composer install` báo `/var/www/html/vendor/... could not be created`, volume đã tạo bằng image cũ thuộc root: chạy `docker compose down`, `docker volume rm bi-ygk_vendor bi-ygk_node_modules bi-ygk_pnpm_store` (các volume này chỉ chứa dependency, không có dữ liệu), rồi `docker compose build` và làm lại.

## 4. Lệnh hằng ngày

```bash
docker compose up -d                                     # bật stack
docker compose ps                                        # xem trạng thái
docker compose logs -f vite                              # log Vite / HMR
docker compose exec app php artisan test --compact       # test (SQLite :memory:, không đụng MySQL)
docker compose exec app php artisan migrate
docker compose exec vite pnpm run types:check            # kiểm tra kiểu TypeScript
docker compose exec vite pnpm run check                  # lint + format
docker compose exec vite pnpm run build                  # build production
docker compose exec app composer require <pkg>           # thêm package PHP
docker compose exec vite pnpm add <pkg>                  # thêm package JS
```

Source nằm trên host và được bind-mount vào container, sửa file là thấy ngay. Vite HMR hoạt động không cần polling; chỉ đặt `VITE_USE_POLLING=true` khi HMR bỏ sót thay đổi (Docker Desktop, WSL).

Không chạy `docker compose down -v`, `docker volume rm` hay `docker system prune` trên volume `bi-ygk_mysql_data`: mất dữ liệu MySQL.

## 5. Thiết lập AI tooling (Claude Code)

Đã commit sẵn, tự có sau khi clone: `AGENTS.md`, `.claude/rules/`, `.claude/settings.json`, `.mcp.json`, `config/boost.php`.

Dev cần làm thêm, theo thứ tự:

```bash
# 1. Sinh skills của Laravel Boost (không có trong git). Chỉ dùng --skills.
docker compose exec app php artisan boost:install -n --skills
```

Không thêm `--guidelines` (sẽ ghi khối Boost dài vào `AGENTS.md`) và không thêm `--mcp` (sẽ ghi đè mục `laravel-boost` trong `.mcp.json` về `php artisan boost:mcp` chạy trên host, không chạy được).

2. Mở Claude Code ở thư mục gốc repo, chạy `/mcp`, phê duyệt hai server khi được hỏi:
   - `laravel-boost`: chạy trong container `app` (`docker compose run --rm -T --no-deps app php artisan boost:mcp`). Cần stack đang chạy.
   - `shadcn`: chạy `npx shadcn-vue@latest mcp`. Nếu từng từ chối, chạy `claude mcp reset-project-choices` rồi mở lại.
3. Chạy `/memory` để xác nhận `AGENTS.md` và các file trong `.claude/rules/` đã được nạp.

`boost.json` và `.claude/skills/` được sinh tự động và nằm trong `.gitignore`. Rule `ask` trong `.claude/settings.json` sẽ hỏi trước khi chạy lệnh phá hủy (`docker compose down`, `docker volume rm`, `docker system prune`, `migrate:fresh`, `db:wipe`, `FLUSH*`).

Tùy chọn: dùng MCP `codebase-memory-mcp` để đánh index mã nguồn (`index_repository`). Index nằm trên máy mỗi người, không có trong repo.

## 6. Cấu trúc thư mục

Dùng thư mục chuẩn của Laravel và Vue; không tạo thư mục `bi/`, `modules/bi/` hay `features/bi/` lồng nhau.

```text
app/{Actions,DTOs,Enums,Http,Models,Policies,Services}
resources/js/{pages,layouts,components/{ui,tables,shared},composables,lib,types,utils}
docker/php/Dockerfile     compose.yaml     .env.example
.claude/{rules,settings.json}     .mcp.json     AGENTS.md
```

## 7. Xử lý sự cố

| Triệu chứng | Cách xử lý |
| --- | --- |
| `port is already allocated` | Đổi cổng tương ứng trong `.env`, rồi `docker compose up -d` |
| Trang trắng, thiếu CSS/JS | `docker compose logs vite`; kiểm tra `public/hot` là `http://localhost:<VITE_PORT>` |
| File tạo trong container thuộc root | Đặt đúng `UID`/`GID` trong `.env`, rồi `docker compose build` |
| `laravel-boost` không kết nối trong `/mcp` | Chạy `docker compose up -d`; chạy thử `docker compose run --rm -T --no-deps app php artisan boost:mcp` |
| Mất mật khẩu MySQL sau khi đổi `.env` | MySQL chỉ đọc mật khẩu lúc tạo volume lần đầu; đổi bằng SQL, không sửa `.env` |
