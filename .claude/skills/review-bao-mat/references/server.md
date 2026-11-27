<!-- Rút ý từ github.com/cloudflare/security-audit-skill · skills/security-audit/ATTACK-CLASSES.md › Injection, Access control, Resource and file handling, Cryptography and secrets, Business logic, Feature abuse and data leakage (MIT, © 2025-2026 Cloudflare, Inc.), commit c1c8a8c; viết lại. -->

# Phía server

Mỗi finding nêu input người ít quyền điều khiển được, sink hoặc quyết định quyền mà nó tới, và kết quả. Quy chuẩn bảo
mật đánh số của stack (`SKILL.md` đầu file; vd `reviewing-backend-code` J1 / J3 / J4 ↔ SV1 / SV4 / SV3) thắng mục
trùng ở đây.

## Injection

- **SV1 — Ghép input vào ngôn ngữ khác.** Input đi vào SQL / NoSQL query, LDAP, XPath, template engine, biểu thức
  (`ORDER BY`, tên cột, JSON path, regex) bằng ghép chuỗi. Kiểm cả input là **tên field, key, header**, không chỉ giá
  trị; kiểm cả dữ liệu đã lưu an toàn rồi được đọc ra dùng ở chỗ khác (second-order). Shell → `obvious.md` OB6. Sửa:
  tham số hoá; tên cột / hướng sắp xếp / JSON path lấy từ danh sách cố định, input chỉ chọn khoá trong danh sách.
- **SV2 — Deserialize dữ liệu không tin.** `BinaryFormatter`, `TypeNameHandling` khác `None`, `pickle`, `yaml.load`
  không safe, `ObjectInputStream` nhận body, cookie, file upload, message queue. Sửa: JSON với kiểu đích cố định, tắt
  suy kiểu từ dữ liệu.

## Kiểm quyền

- **SV3 — Có xác thực, thiếu phân quyền theo bản ghi.** Endpoint chỉ kiểm đăng nhập / vai, không kiểm bản ghi theo id
  thuộc phạm vi người gọi (IDOR). Soát cả list, search, export, import, batch: mỗi phần tử phải qua cùng kiểm tra.
  Sửa: lọc theo phạm vi người gọi ngay trong truy vấn lấy bản ghi; batch kiểm từng id; viết ca IDOR theo `kiem-thu`
  › `bao-mat.md`.
- **SV4 — Field request ghi đè quyết định quyền.** Body / query mang `userId`, `ownerId`, `tenantId`, `role`,
  `status`, `isAdmin` và server dùng nó thay vì giá trị từ phiên hoặc bản ghi. Sửa: DTO vào chỉ có field client được
  đặt; danh tính và phạm vi lấy từ phiên.
- **SV5 — Hai cửa, hai mức kiểm.** Cùng một thay đổi trạng thái đi được qua đường kiểm quyền yếu hơn (endpoint cũ,
  import, job, webhook, API mà UI không gọi). Nêu cả hai cửa và quyền mỗi cửa kiểm. Sửa: dồn kiểm quyền về một hàm
  dùng chung ở tầng service.

## File và request ra ngoài

- **SV6 — Đường dẫn từ input.** Tên file, đường dẫn, entry trong file nén (zip slip) ghép vào đường dẫn đọc / ghi mà
  không chặn `..`, đường dẫn tuyệt đối, symlink. Upload lưu với tên client gửi, vào thư mục phục vụ tĩnh, hoặc không
  kiểm loại. Sửa: chuẩn hoá đường dẫn rồi kiểm nó vẫn nằm trong thư mục gốc; tên file lưu do server sinh.
- **SV7 — SSRF.** Server tải URL người dùng đưa (webhook, import từ URL, ảnh xem trước, callback) mà không chặn
  `localhost`, IP nội bộ, link-local (`169.254.169.254`), scheme ngoài `http(s)`. Kiểm lại đích sau redirect và sau
  phân giải DNS. Repo không thấy egress proxy / tường lửa → "Cần xác minh" phần chặn mạng, phần code vẫn báo. Sửa:
  phân giải tên, chặn dải nội bộ, gắn kết nối vào IP đã kiểm; tắt tự theo redirect hoặc kiểm lại mỗi bước.

## Mật mã

- **SV8 — Giá trị bí mật sinh yếu hoặc so sánh lộ thời gian.** Token, mã mời, mã OTP, khoá sinh bằng `Math.random`,
  `System.Random`, `random`, thời gian, id tăng dần. So secret / chữ ký / hash bằng `==`. Lỗi giải mã / verify bị nuốt
  rồi chạy tiếp như đã hợp lệ. Token reset / API key → `web-auth.md` WA8 / WA13. Sửa: CSPRNG (`crypto.randomBytes`, `RandomNumberGenerator`, `secrets`); so sánh
  constant-time; lỗi verify → từ chối.

## Logic nghiệp vụ

- **SV9 — Kiểm rồi mới làm, không nguyên tử.** Đọc trạng thái / số dư / lượt còn lại rồi ghi ở bước sau, không khoá
  hoặc điều kiện trong câu `UPDATE` → hai request song song cùng qua (duyệt hai lần, rút quá số dư). Sửa: điều kiện
  nằm trong câu ghi (`UPDATE … WHERE status = 'cho'` rồi kiểm số dòng), unique constraint, hoặc khoá hàng.
- **SV10 — Nhảy bước, số lạ, mặc định mở.** Gọi thẳng bước sau của quy trình nhiều bước; số lượng âm / 0 / quá lớn;
  thiếu cấu hình, cờ tắt, phụ thuộc lỗi thì cho qua thay vì chặn. Sửa: kiểm trạng thái nguồn ở mỗi bước chuyển; kiểm
  miền giá trị ở server; thiếu cấu hình bảo mật → từ chối.
- **SV11 — Tính năng thành kênh lộ.** Export / backup kèm bản ghi ngoài phạm vi, đã xoá, nháp; search / filter /
  sort theo field ẩn cho đoán được giá trị; trả khác nhau giữa "không có" và "không quyền" với tài nguyên riêng. Lộ
  một tài khoản có tồn tại hay không, khi thông tin đó công khai theo thiết kế sản phẩm, không phải finding. Sửa: export và search dùng
  cùng bộ lọc phạm vi với màn xem; field lọc / sắp xếp theo danh sách cho phép; trả cùng mã cho hai trường hợp.
