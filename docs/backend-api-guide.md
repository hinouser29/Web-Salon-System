# Backend API Guide (Iteration 1)

Base URL: `http://localhost:8080`

## Auth

| Method | Path |
|--------|------|
| POST | `/api/auth/register` |
| GET | `/api/auth/verify?token=` |
| POST | `/api/auth/resend-verification` |
| POST | `/api/auth/login` |
| POST | `/api/auth/logout` |
| POST | `/api/auth/forgot-password` |
| POST | `/api/auth/reset-password` |
| POST | `/api/auth/change-password` |
| POST | `/api/auth/refresh` |

## Profile (JWT required)

| Method | Path |
|--------|------|
| GET | `/api/users/me` |
| PUT | `/api/users/me` |
| PUT | `/api/users/avatar` |

Swagger: http://localhost:8080/swagger-ui.html
