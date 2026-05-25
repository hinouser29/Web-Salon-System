# Web Salon System — Spa SaaS Platform

Monorepo quản lý chuỗi Spa / Nails / Hair Salon.

## Cấu trúc 3 phần chính

| Folder | Mô tả |
|--------|--------|
| **backend/** | Spring Boot 3 — Auth & Profile API (Java 21) |
| **database/** | PostgreSQL Docker Compose |
| **docs/** | Tài liệu API, Postman, kiến trúc |

## Quick start

```bash
# Database
cd database && docker compose up -d

# Backend
cd backend && .\mvnw.cmd spring-boot:run

# Frontend (optional)
cd apps/web && npm install && npm run dev
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

Repository: https://github.com/hinouser29/Web-Salon-System
