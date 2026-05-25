# Hướng dẫn push lên GitHub

Repo: https://github.com/hinouser29/Web-Salon-System

## Lỗi thường gặp

```
Permission denied to namdo525
```

Máy đang đăng Git bằng tài khoản **namdo525**, trong khi repo thuộc **hinouser29**.

## Cách 1 — Đăng nhập đúng owner (khuyến nghị)

1. Tạo Personal Access Token: GitHub → Settings → Developer settings → Tokens → `repo` scope
2. Push:

```powershell
cd a:\FPT_university\ky5\ky5_swp301
git add -A
git commit -m "Add pom.xml and config files"
git push -u origin main
```

Khi hỏi username/password:
- Username: `hinouser29`
- Password: **PAT token** (không dùng mật khẩu GitHub)

## Cách 2 — Thêm collaborator

Owner `hinouser29` vào repo → Settings → Collaborators → thêm `namdo525` (Write).

Sau đó push lại với tài khoản `namdo525`.

## Cách 3 — Xóa credential cũ (Windows)

Control Panel → Credential Manager → Windows Credentials → xóa `git:https://github.com` → push lại.
