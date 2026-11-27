<!-- Rút ý từ github.com/cloudflare/security-audit-skill · skills/security-audit/CLIENT-SIDE.md (MIT, © 2025-2026 Cloudflare, Inc.), commit c1c8a8c; viết lại. -->

# Client-side

Mỗi finding nêu nguồn người tấn công điều khiển được và sink thực thi / lộ dữ liệu, có đường từ nguồn tới sink. Kết quả
phải chạm phiên của nạn nhân, origin khác, hoặc dữ liệu dùng chung; tự chèn vào phiên mình không tính (self-XSS).

Nguồn chỉ có ở trình duyệt, server không thấy: `location` (`hash`, `search`), `document.referrer`, `window.name`,
`event.data`, storage, cache cũ.

## DOM và trạng thái object

- **CL1 — DOM XSS.** Nguồn trên, hoặc dữ liệu người khác nhập, đi vào `innerHTML`, `outerHTML`, `document.write`,
  `dangerouslySetInnerHTML`, `v-html`, `eval` / `new Function` / `setTimeout(string)`, `href` / `src` động, HTML của thư
  viện Markdown / rich text không sanitize. Nội dung React / Razor tự escape không phải finding. Sửa: render dạng text
  (`textContent`, JSX thường); cần HTML thì qua sanitizer (vd DOMPurify) ngay trước sink; URL qua CL10.
- **CL2 — Prototype pollution.** Key người dùng đưa vào deep merge / gán theo đường dẫn (`set(obj, path, v)`) không chặn
  `__proto__`, `constructor`, `prototype`, **và** có chỗ đọc thuộc tính bị nhiễm để quyết định quyền, điều hướng,
  render. Thiếu một trong hai → không phải finding. Sửa: chặn ba key trên trong hàm merge / set, hoặc dùng `Map` /
  `Object.create(null)` cho dữ liệu key động.
- **CL3 — DOM clobbering.** HTML người dùng giữ được `id` / `name`, và code tin một biến toàn cục / cờ cấu hình trùng
  tên đó. Sửa: sanitizer bỏ `id` / `name`, hoặc đọc cấu hình từ biến module, không từ `window.<tên>`.

## Giao tiếp chéo origin

- **CL4 — `postMessage`.** Handler làm việc nhạy cảm với `event.data` mà không so `event.origin` với danh sách khớp
  chính xác (so chuỗi con, tiền tố, regex không neo = không kiểm); nhiều frame cùng origin → kiểm thêm `event.source`.
  Phía gửi: dữ liệu nhạy cảm gửi tới `"*"`. Sửa: `if (!ALLOWED.has(event.origin)) return;` ở dòng đầu handler, kiểm
  kiểu dữ liệu; gửi với `targetOrigin` cụ thể.
- **CL5 — CORS có credential.** Server phản chiếu `Origin` hoặc khớp lỏng, kèm `Access-Control-Allow-Credentials: true`,
  trả dữ liệu riêng. `*` kèm credential trình duyệt đã chặn; báo đúng origin được cho phép. Sửa: danh sách origin cố
  định so khớp đủ chuỗi; chỉ bật credential cho origin trong danh sách.
- **CL6 — WebSocket.** Upgrade nhận cookie mà không kiểm `Origin` hoặc token kênh, và có handler đọc / sửa dữ liệu.
  Sửa: kiểm `Origin` lúc upgrade theo danh sách, hoặc đòi token ngắn hạn trong message đầu.

## Storage và service worker

- **CL7 — Token, dữ liệu riêng trong storage.** Token, response riêng, nháp, quyết định quyền nằm trong `localStorage`,
  `sessionStorage`, IndexedDB, Cache Storage, state persist → còn đọc được sau logout / đổi tài khoản, hoặc thành phần
  cùng origin kém tin hơn đọc được. Chỉ lưu token chưa phải finding; cần người đọc ít quyền hơn hoặc dùng tiếp sau
  logout. Sửa: logout / đổi tài khoản xoá mọi khoá theo người dùng; token phiên dài để ở cookie `HttpOnly` (WA4).
- **CL8 — Đồng bộ giữa tab.** Sự kiện `storage`, `BroadcastChannel`, shared worker mang danh tính / lệnh giữa tab mà
  không gắn phiên hiện tại; tab cũ ghi đè trạng thái đăng nhập mới. Sửa: message mang id người dùng / phiên, tab nhận
  bỏ message khác phiên; đổi phiên ở tab khác → tải lại.
- **CL9 — Service worker.** Cache response theo người dùng mà key / tên cache không có tài khoản, tenant → trả cho tài
  khoản sau khi đổi hoặc logout. Script worker, scope (`Service-Worker-Allowed`), `importScripts` do người ngoài điều
  khiển được. Sửa: không cache response riêng, hoặc tên cache theo người dùng và xoá khi logout; script worker là file
  tĩnh cùng origin.

## Điều hướng và giao diện

- **CL10 — Điều hướng.** URL từ input đi vào `location.href`, `window.open`, `router.push`, `<a href>` mà không kiểm
  scheme (`javascript:`, `data:`) và đích. `window.open` / `target="_blank"` giữ `opener` (tắt `noopener` tường minh)
  sang trang ngoài. Sửa: parse bằng `new URL()`, chỉ cho `https:` / `http:` và host trong danh sách, hoặc chỉ đường dẫn
  tương đối; thêm `rel="noopener noreferrer"`.
- **CL11 — Clickjacking.** Màn có thao tác đổi trạng thái nhạy cảm, nhúng iframe được (thiếu `frame-ancestors` /
  `X-Frame-Options`), và thao tác hoàn tất được trong iframe. Trang chỉ đọc → hardening. Sửa: CSP
  `frame-ancestors 'self'` (hoặc `'none'`).
- **CL12 — XS-Leak.** Trang khác phân biệt được trạng thái riêng (bản ghi có tồn tại, vai gì) qua lỗi tải, redirect,
  kích thước, số frame, thời gian. Cần một vị từ bí mật cụ thể; dao động thời gian chung chung không tính. Sửa: cookie
  `SameSite`, header `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy`, trả cùng mã và dạng cho "không có"
  và "không quyền".
