<!-- Rút ý từ github.com/cloudflare/security-audit-skill · skills/security-audit/WEB-PROTOCOL-AND-AUTH.md (MIT, © 2025-2026 Cloudflare, Inc.), commit c1c8a8c; viết lại. -->

# Web và xác thực

Với mỗi credential (token, cookie phiên, mã reset, API key), đi đủ vòng: phát → lưu → gửi → kiểm → làm mới → thu hồi.
So đường thường với đường lỗi, retry, migrate, đường cũ, đổi tài khoản.

## Token và phiên

- **WA1 — JWT.** Kiểm chữ ký với thuật toán và khoá ghim ở server, rồi `exp`, `nbf`, `aud`, `iss`. `kid`, `jku`, `x5u`
  trong token là input không tin. Đọc claim bằng hàm chỉ decode, không verify → finding. Token hợp lệ của dịch vụ khác
  (sai `aud`) không hợp lệ ở đây. Sửa: verify bằng thư viện với danh sách thuật toán và khoá cố định ở server, bật kiểm
  `exp` / `aud` / `iss`; chọn khoá theo `kid` chỉ trong tập khoá server đã nạp.
- **WA2 — Đổi và huỷ phiên.** Session id / refresh token phải đổi khi đăng nhập, đổi tài khoản, xong MFA, giả danh
  (impersonate), đổi quyền. Phải hết hiệu lực khi logout, đổi mật khẩu, thu quyền, khoá tài khoản — kể cả bản trong
  cache, WebSocket đang mở, endpoint dự phòng. Sửa: cấp phiên mới ở mỗi lần đổi mức quyền; thu hồi phía server (danh
  sách thu hồi, `security stamp`, xoá refresh token) và xoá cache quyền cùng lúc.
- **WA3 — CSRF.** Endpoint đổi trạng thái xác thực bằng cookie (tự gửi) mà không có token anti-CSRF, SameSite đúng cho
  cookie đó, hay kiểm `Origin` chặt. Kiểm cả form, JSON, multipart, method override, route cũ. Endpoint chỉ đọc, hoặc
  chỉ nhận bearer token trong header, không thuộc mục này. Sửa: bật antiforgery của framework cho mọi route đổi trạng
  thái dùng cookie, hoặc chuyển sang bearer token trong header.
- **WA4 — Cookie.** Cookie phiên / token thiếu `HttpOnly`, `Secure`, `SameSite`; `Domain` / `Path` quá rộng; trùng tên
  cookie khác mà hai thành phần chọn khác nhau. Kiểm cookie có giá trị nhạy cảm không, JS có cần đọc nó theo thiết kế
  không; thiếu cờ một mình → SKILL §2. Sửa: đặt đủ ba cờ, `Domain` hẹp nhất, tiền tố `__Host-` khi được.

## OAuth / OIDC và liên kết danh tính

Xác định vai trước: server cấp quyền hay client nhận. Lỗi kiểm / gắn thuộc về bên nhận.

- **WA5 — Callback.** `redirect_uri` khớp chính xác (phía server cấp) · `state` gắn với phiên · PKCE · ID token đúng
  `iss` / `aud` / chữ ký / `nonce` · nhiều IdP thì gắn IdP đã chọn. So callback đầu, retry, deep link mobile, liên kết.
  Sửa: so `redirect_uri` bằng chuỗi đầy đủ; lưu `state`, `nonce`, `code_verifier`, IdP đã chọn vào phiên và đối chiếu
  khi callback, dùng xong xoá.
- **WA6 — Liên kết tài khoản.** Thêm IdP, email, số điện thoại, thiết bị, passkey vào tài khoản có sẵn mà không có phiên
  đang đăng nhập, không chứng minh sở hữu danh tính mới, không step-up khi policy đòi, hoặc `state` không gắn tài khoản
  khởi tạo. Soát cả unlink / relink, nhận lời mời vào tenant. Sửa: đòi phiên hiện tại và xác minh sở hữu (mã gửi tới
  danh tính mới) trước khi gắn; không tự gộp tài khoản theo email trùng.
- **WA7 — SAML.** Phần tử được kiểm chữ ký khác phần tử dùng làm danh tính; có đường lùi không ký; parser XML mở entity
  ngoài. Sửa: lấy danh tính từ đúng assertion đã verify, tắt DTD / entity ngoài, kiểm `Audience`, `Recipient`, hạn.

## Khôi phục và MFA

- **WA8 — Reset mật khẩu và khôi phục.** Token reset không ngẫu nhiên an toàn, không gắn người và hành động, không hạn,
  dùng lại được, không rate limit, hoặc không huỷ token và phiên cũ sau khi dùng. URL trong mail dựng từ header `Host`
  (WA10). Đổi email / số điện thoại, admin khôi phục hộ, mã dự phòng đi cùng checklist này. Sửa: token ≥ 128 bit từ
  CSPRNG, lưu hash, hạn ngắn, xoá khi dùng; URL lấy từ cấu hình; huỷ mọi phiên sau khi đặt lại.
- **WA9 — MFA / step-up.** Bật, thay, tắt MFA, sinh mã dự phòng, tin thiết bị mà không cần mức xác thực mới; challenge
  xong nâng nhầm phiên, tài khoản, thao tác; đường API, batch, khôi phục bỏ qua bước này. WebAuthn: challenge, RP ID,
  origin, credential, user không gắn với phiên khởi tạo. Sửa: đòi xác thực lại gần đây cho thao tác MFA; lưu kết quả
  challenge vào đúng phiên kèm thao tác và hạn; kiểm mức xác thực ở mọi cửa của thao tác.

## Header, cache, API key

- **WA10 — Tin header `Host` / `X-Forwarded-*`.** Giá trị client gửi được dùng để dựng URL tuyệt đối, link reset,
  callback, định tuyến tenant, key cache, IP cho phân quyền / rate limit. Không thấy cấu hình proxy trong repo → "Cần
  xác minh". Sửa: lấy host / base URL từ cấu hình; chỉ đọc `X-Forwarded-*` từ proxy khai tin cậy (ASP.NET:
  `ForwardedHeadersOptions.KnownProxies`).
- **WA11 — Cache response riêng.** Response theo người dùng bị cache chung (CDN, output cache, `Cache-Control: public`),
  hoặc giá trị đổi nội dung mà không nằm trong key cache (host, cookie, ngôn ngữ, trạng thái đăng nhập). Sửa:
  `Cache-Control: private, no-store` cho response riêng; đưa mọi giá trị đổi nội dung vào key, hoặc `Vary`.
- **WA12 — Header response.** Input đi vào `Location`, `Set-Cookie`, CSP có ký tự CR / LF; kiểm framework có chặn trước
  khi báo. Sửa: từ chối CR / LF, dựng header bằng API của framework, không ghép chuỗi.
- **WA13 — API key.** Key truy cập rộng hơn bản ghi server cấp (tenant, tài nguyên, môi trường), tham số request ghi đè
  phạm vi, nhầm key công khai với key bí mật, thu hồi mà cache vẫn nhận. Key bí mật lộ ở bundle client, URL, log,
  response lỗi. Mã định danh công khai gọi là "key" không phải bí mật. Sửa: phạm vi lấy từ bản ghi key ở server, không
  từ request; so sánh hash key constant-time; thu hồi xoá cả cache; key bí mật chỉ ở server.
- **WA14 — mTLS / proxy cắt TLS.** Backend tin header danh tính chứng chỉ từ mọi peer; chứng chỉ hết hạn / thu hồi thì
  lùi về chế độ không xác thực. Sửa: chỉ proxy tin cậy được nối tới backend, proxy xoá header danh tính client gửi;
  chứng chỉ lỗi → từ chối, không lùi.
- **WA15 — Lệch parse giữa proxy và app.** Chỉ khi repo có proxy / parser HTTP tự viết: `Content-Length` trùng,
  `Transfer-Encoding`, chuẩn hoá tên header khác nhau → nêu đủ hai thành phần và giá trị mỗi bên thấy. Sửa: từ chối
  request mơ hồ (hai `Content-Length`, có cả `Transfer-Encoding` và `Content-Length`) ở thành phần đầu tiên.
