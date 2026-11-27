<!-- Rút ý từ github.com/cloudflare/security-audit-skill · skills/security-audit/ATTACK-CLASSES.md › Obvious things (MIT, © 2025-2026 Cloudflare, Inc.), commit c1c8a8c; viết lại. -->

# Lỗi hiển nhiên

Ai cũng nghĩ người khác đã kiểm. Kiểm đủ từng mục, theo chữ; mục nào khớp diff thì ghi kết quả kiểm ở "Đã kiểm mà
không thấy vấn đề" hoặc thành finding. Một dấu hiệu chưa phải finding: lần theo đường code tới tác động rồi mới báo
(SKILL §2).

- **OB1 — Secret trong code.** `password`, `secret`, `apikey`, `token`, `Bearer`, `-----BEGIN`, mật khẩu mặc định; file
  `.env*`, `credentials.json`, `*.pem`, `*.key` được commit; `.gitignore` không phủ secret, upload, config cục bộ. Mức:
  CRITICAL theo reviewer. Sửa: chuyển sang biến môi trường / kho secret, thêm vào `.gitignore`,
  báo USER đổi secret đã lộ.
- **OB2 — Comment bảo mật dở.** `TODO` / `FIXME` / `HACK` nhắc auth, validate, quyền (`TODO: add auth`,
  `HACK: skip permission`). Comment nói "an toàn vì…" → kiểm lời giải thích đó. Sửa: làm phần comment hẹn, hoặc
  chặn đường code đó tới khi làm.
- **OB3 — Chế độ debug.** Debug / dev mode, Swagger, trang lỗi chi tiết bật được ở production qua biến môi trường,
  query, header. Sửa: chỉ bật theo môi trường build / host (vd `IsDevelopment()`), không theo input request.
- **OB4 — Endpoint lộ.** `/debug`, `/admin`, `/test`, `/status`, `/health`, `/metrics`, `/env`, `/.env`, `/config`,
  `/swagger` không chặn, hoặc trả nhiều hơn mức cần (biến môi trường, version, chuỗi kết nối). Sửa: đặt sau xác thực /
  mạng nội bộ; `/health` công khai chỉ trả trạng thái.
- **OB5 — Tài khoản seed / test.** Credential seed, fixture, ví dụ còn đăng nhập được ở production. Sửa: seed chỉ chạy
  ở môi trường dev / test; tài khoản mẫu không có mật khẩu cố định.
- **OB6 — Thực thi động.** `eval`, `exec`, `child_process`, `Function()`, `vm.runInContext`, `import()` động,
  `Process.Start`, shell ghép chuỗi — với input không phải hằng. Sửa: bỏ thực thi động; cần chạy lệnh thì truyền mảng
  tham số (`execFile`, `ArgumentList`), lệnh và đường dẫn trong danh sách cố định.
- **OB7 — CORS rộng.** `Access-Control-Allow-Origin: *` hoặc phản chiếu `Origin` cho API có dữ liệu riêng; kèm
  credential → `client.md` CL5. Sửa: danh sách origin cố định.
- **OB8 — Cờ cookie.** → `web-auth.md` WA4.
- **OB9 — Open redirect.** Tham số `redirect`, `returnUrl`, `next`, `url`, `goto`, `continue` đi vào redirect không kiểm
  đích. Sửa: chỉ cho đường dẫn tương đối cùng site (ASP.NET: `Url.IsLocalUrl`), hoặc host trong danh sách.
- **OB10 — TLS.** Endpoint chỉ HTTP, thiếu chuyển hướng HTTPS / HSTS ở tầng app khi repo tự lo việc này. Sửa: bật
  chuyển hướng HTTPS và HSTS ở app, hoặc ghi rõ proxy lo (không thấy → "Cần xác minh").
- **OB11 — Lỗi lộ chi tiết.** Response production chứa stack trace, đường dẫn nội bộ, câu SQL, `ex.Message` (.NET:
  `reviewing-backend-code` J5 nếu project có). Sửa: thông điệp chung cho người dùng, chi tiết ghi log server kèm mã
  tương quan.
- **OB12 — Phụ thuộc không ghim.** Lockfile thiếu, hoặc phiên bản dải rộng cho gói mới thêm. CVE trong cây dependency
  → `kiem-thu` › `bao-mat.md` §3, không thành finding review. Sửa: commit lockfile, ghim phiên bản gói mới.
