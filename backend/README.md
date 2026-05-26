# Backend — Spring Boot API

Xem `docs/backend-api-guide.md` và Swagger: http://localhost:8080/swagger-ui.html

```bash
# Cấu hình: copy .env.example → set env vars (Supabase, JWT, Google, Gmail)
cd database && docker compose up -d   # hoặc Supabase
cd backend && mvn clean install && mvn spring-boot:run
```

Web demo: http://localhost:8080/login
