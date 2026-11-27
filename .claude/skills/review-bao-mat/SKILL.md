---
name: review-bao-mat
description: Review bảo mật diff chạm xác thực / session, cookie, CSRF, CORS, redirect, render HTML, storage trình duyệt, `eval` / `exec`, SQL / file / URL từ input, quyền theo bản ghi. Dùng khi code-reviewer gặp diff như vậy, hoặc USER nói "review bảo mật", "soát lỗ hổng", "check JWT / CSRF / XSS / SSRF".
---

<!-- Rút ý từ github.com/cloudflare/security-audit-skill · skills/security-audit/ WEB-PROTOCOL-AND-AUTH.md, CLIENT-SIDE.md, ATTACK-CLASSES.md › Obvious things (MIT, © 2025-2026 Cloudflare, Inc.), commit c1c8a8c; viết lại. -->

# Review bảo mật

Checklist cho reviewer. Không định nghĩa lại cách ra finding: dùng khối "Bằng chứng cho finding bảo mật" của
reviewer (ai ít quyền · input · kiểm soát · ranh giới · tài nguyên · kết quả; "Cần xác minh" khi phụ thuộc cấu
hình ngoài repo). Project có quy chuẩn bảo mật đánh số của stack (vd `reviewing-backend-code` J1–J7, F3, F4) → quy
chuẩn đó thắng mục trùng ở đây.

## 1 · Mở reference theo diff

| Diff chạm | Mở |
|---|---|
| Đọc / phát token, JWT, OAuth / OIDC, session, cookie, login / logout, reset mật khẩu, MFA, API key, header `Host` / `X-Forwarded-*`, cache response | `references/web-auth.md` |
| Render HTML / Markdown, `href` / `src` động, điều hướng, `postMessage`, WebSocket, `localStorage` / `sessionStorage` / IndexedDB, service worker, CORS, iframe | `references/client.md` |
| Endpoint không yêu cầu đăng nhập hoặc bỏ kiểm quyền, biến cấu hình bật / tắt debug, seed / fixture tài khoản, `eval` / `exec` / `child_process` / `Function()`, response lỗi, redirect từ input | `references/obvious.md` |
| Truy vấn / template ghép từ input, deserialize, đường dẫn file, upload, server tải URL người dùng đưa, kiểm quyền theo bản ghi, list / export / import / batch, sinh token / so sánh secret, thao tác kiểm rồi ghi | `references/server.md` |

Khớp nhiều dòng → mở đủ các file khớp.

## 2 · Cờ thiếu một mình không phải finding

Thiếu header, cờ cookie, CSP, MFA → chỉ thành finding khi nêu được kết quả: request sai được chấp nhận, dữ liệu / phiên
người khác bị đọc hoặc sửa, credential lộ, mức xác thực bị hạ. Không nêu được → ghi một dòng ở "Gợi ý" (hardening),
không vào CRITICAL–LOW.

Không áp cho: endpoint công khai thiếu rate limit, trả PII quá mức, credential trong code vẫn là
finding theo mức của luật đó và của reviewer.

Mặc định của framework là kiểm soát thật, nhưng tuỳ cấu hình (vd React, Razor escape nội dung; antiforgery của ASP.NET
không tự áp cho API JSON). Đọc cấu hình thật trong repo trước khi kết luận; không thấy → "Cần xác minh", không hạ thành
finding mức thấp.

## 3 · Đường yếu nhất

Một thao tác nhạy cảm có nhiều cửa (UI, API, batch, đường cũ, đường lỗi, retry, đổi tài khoản) → kiểm từng cửa.
Chính sách thật là cửa yếu nhất, không phải cửa UI dùng.
