# Web Salon System — Spa SaaS Platform

Monorepo quản lý chuỗi Spa / Nails / Hair Salon.

## Cấu trúc 3 phần chính

| Folder | Mô tả |
|--------|--------|
| **backend/** | Spring Boot 3 — Auth & Profile API (Java 21) |
| **database/** | PostgreSQL Docker Compose |
| **docs/** | Tài liệu API, Postman, kiến trúc |

## Quick start

Xem chi tiết cấu hình Supabase / Google OAuth / Gmail: **[docs/SETUP-ITER1.md](docs/SETUP-ITER1.md)**

```powershell
# Database (local) hoặc dùng Supabase — set biến môi trường theo backend/.env.example
cd database; docker compose up -d

# Backend
cd backend
mvn clean install
mvn spring-boot:run
```

- **Web UI (Thymeleaf):** http://localhost:8080/login
- **REST API / Swagger:** http://localhost:8080/swagger-ui.html

Repository: https://github.com/hinouser29/Web-Salon-System

## Run full stack with Docker

```powershell
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/swagger-ui.html
- PostgreSQL: localhost:5432
