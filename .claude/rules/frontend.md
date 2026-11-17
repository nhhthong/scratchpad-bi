---
paths:
  - "resources/js/**"
  - "resources/css/**"
  - "resources/views/**"
---

# Frontend

- Dùng MCP `shadcn` để tìm và thêm component. Xem `resources/js/components/ui/` trước, không viết lại component đã có.
- Dùng `<script setup lang="ts">`, Inertia cho điều hướng và form, hàm Wayfinder cho route.
- Chỉ dùng Tailwind và CSS variables của shadcn-vue, không thêm UI framework khác.
- Bảng BI: HTML table với CSS sticky và `overflow-x`, không thêm DataGrid.
- Màu semantic: positive, negative, warning, neutral, actual, target, forecast.
