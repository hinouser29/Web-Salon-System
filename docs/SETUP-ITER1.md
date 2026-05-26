# ITER 1 — Authentication Demo Setup

## 1. Database (Supabase PostgreSQL)

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/aorrdsecmfvdauvozxgo).
2. **Settings → Database** → copy **Host**, **Database**, **User**, **Password**, **Port**.
3. Copy `backend/.env.example` to `backend/.env` (or set environment variables) and fill:

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-password
```

Schema is created automatically by Hibernate (`ddl-auto: update`) on first run.

**Local alternative:** `cd database` → `docker compose up -d` → use `localhost` / `spa_management` / `postgres` / `postgres`.

## 2. Google OAuth2

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create **OAuth 2.0 Client ID** (Web application).
3. **Authorized redirect URIs:**
   - `http://localhost:8080/login/oauth2/code/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

## 3. Gmail SMTP (verify & reset emails)

1. Enable 2FA on Gmail → create **App Password**.
2. Set in `.env`:

```env
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-16-char-app-password
```

Links in emails point to `http://localhost:8080/verify-email` and `/reset-password`.

## 4. JWT secret

```env
JWT_SECRET=your-very-long-random-secret-at-least-32-characters
```

## 5. Run backend

```powershell
cd backend
# If Maven is installed:
mvn clean install
mvn spring-boot:run

# Or load .env then run (IDE / terminal with env vars set)
```

Open: **http://localhost:8080/login**

## 6. Demo checklist

| Feature | URL / action |
|---------|----------------|
| Register | `/register` |
| Verify email | link in email → `/verify-email?token=...` |
| Login | `/login` |
| Google login | "Login with Google" |
| Forgot password | `/forgot-password` |
| Reset password | email link → `/reset-password?token=...` |
| Dashboard | `/dashboard` |
| Profile & avatar | `/profile` |
| Logout | header Logout button |

REST API + Swagger: `http://localhost:8080/swagger-ui.html`
