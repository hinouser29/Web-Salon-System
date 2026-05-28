# Beauty Salon Rewrite

Rewrite tu project cu sang stack:

- React SPA frontend
- ASP.NET Core Web API backend
- PostgreSQL database

## Nguyen tac rewrite

Project nay giu nguyen cac phan noi dung co dinh cua ban cu:

- Frontend React, route, page component, CSS va text UI duoc copy tu project cu.
- Static assets goc duoc giu lai: `images/home`, `images/services`, `images/technicians`, `uploads/avatars`.
- API path va response shape chinh duoc giu de frontend cu tiep tuc goi duoc.
- Cac file tham chieu goc duoc dat trong `legacy-original/` de doi chieu khi can.

Phan duoc rewrite:

- Backend Express/Node duoc thay bang ASP.NET Core Web API.
- SQL Server schema duoc chuyen thanh PostgreSQL schema/seed moi trong `database/`.

Backend giu cac API path chinh cua project cu de frontend hien tai tiep tuc chay:

- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verify-code`
- `POST /api/auth/login`
- `POST /api/auth/google-login`
- `POST /api/auth/logout`
- `PUT /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/customers/me/profile`
- `PUT /api/customers/me/profile`
- `PUT /api/customers/me/avatar`
- `GET /api/services`
- `GET /api/employees`

## Database

Tao database PostgreSQL:

```sql
CREATE DATABASE beauty_salon;
```

Sau do chay:

```bash
psql -d beauty_salon -f database/schema-postgresql.sql
psql -d beauty_salon -f database/seed-postgresql.sql
```

Seed account dung chung password `123456`.

## Backend

Sua `backend/appsettings.json` hoac set environment variables:

- `ConnectionStrings__PostgreSql`
- `Jwt__Secret`
- `FrontendUrl`
- `Google__ClientId`
- `Email__Username`
- `Email__Password`

Chay API:

```bash
cd backend
dotnet restore
dotnet run
```

API mac dinh: `http://localhost:5000`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Neu can, tao `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## File goc duoc giu lai

- `legacy-original/README.original.md`
- `legacy-original/README_AUTH_FEATURES.original.md`
- `legacy-original/database-mssql/schema.sql`
- `legacy-original/database-mssql/schema_user_original.sql`
- `legacy-original/database-mssql/migration_auth_profile.sql`
- `legacy-original/database-mssql/seed.sql`
