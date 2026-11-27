<!-- Ca người dùng A / B rút ý từ github.com/addyosmani/agent-skills · skills/security-and-hardening (MIT, © Addy Osmani); "thiếu dữ liệu thì không đánh giá được" rút ý từ github.com/trailofbits/skills · plugins/supply-chain-risk-auditor (CC-BY-SA-4.0, © Trail of Bits), viết lại. -->

# Test bảo mật

Hai việc: test phân quyền (§1, §2) và audit dependency (§3). Rà code tìm lỗ hổng là việc của reviewer (reviewer,
`reviewing-backend-code` J1–J7); skill này viết test và chạy lệnh để có bằng chứng.

## 1 · Ma trận phân quyền

Trước khi viết test, lập bảng (trong `TestPlan.md` của `api-testing-dotnet`, hoặc spec e2e):

| Endpoint · method | Không token | Vai thiếu quyền | Vai đủ quyền, dữ liệu của mình | Vai đủ quyền, dữ liệu của người / đơn vị khác |
|---|---|---|---|---|

Mỗi ô ghi mã mong đợi: `401` · `403` · `200` · `403` hoặc `404` theo quy ước project (project chưa có quy ước → hỏi
USER). Lấy dữ liệu từ map quyền của project và phạm vi dữ liệu (đơn vị, chủ sở hữu). Endpoint mới hoặc đổi quyền → mỗi
ô một test.

## 2 · Viết test

- Chỉ chạy trên local hoặc môi trường USER xác nhận được ghi / xoá dữ liệu thử; test tự dọn bản ghi nó tạo.
- Mỗi vai một tài khoản test riêng. Hai tài khoản cùng vai thuộc hai đơn vị / chủ sở hữu khác nhau để có ca IDOR.
- Ca IDOR: A tạo bản ghi; B đọc, sửa, xoá bằng id đó → đúng mã ở cột cuối; A đọc lại thấy bản ghi không đổi.
- Thử cả đường gián tiếp: danh sách, tìm kiếm, đếm, export không lộ bản ghi ngoài phạm vi (J7).
- Không dùng superadmin để kết luận về quyền (J6).
- .NET: test xUnit theo `api-testing-dotnet`. Next.js và FE khác: gọi API bằng `request` của Playwright với
  `storageState` theo vai, theo `e2e.md`.
- Credential tài khoản test lấy từ biến môi trường, không ghi vào code.

## 3 · Audit dependency

Chạy theo lockfile có trong repo:

| Repo có | Lệnh |
|---|---|
| `pnpm-lock.yaml` | `pnpm audit --prod` |
| `package-lock.json` | `npm audit --omit=dev` |
| `*.csproj` | `dotnet list package --vulnerable --include-transitive` |

- Báo từng lỗ hổng: gói, phiên bản đang dùng, mức, mã advisory, phiên bản đã sửa, gói trực tiếp kéo nó vào.
- Lệnh lỗi, không có mạng, không đọc được nguồn advisory → báo "không đánh giá được: <lý do>". Không báo sạch.
- Không tự chạy `audit fix`, `--force` hay nâng major. Đề xuất phiên bản sửa nhỏ nhất; USER duyệt rồi giao dev agent.
- Lỗ hổng chỉ ở dev dependency, hoặc ở đường code không gọi tới → vẫn liệt kê, ghi lý do hạ ưu tiên.

## Ngụy biện

| Nghĩ | Thật |
|---|---|
| "Endpoint có `[Authorize]` rồi" | `[Authorize]` chặn người chưa đăng nhập, không chặn B đọc dữ liệu của A; cần ca IDOR |
| "Test bằng admin xanh là đủ" | Admin qua mọi kiểm; test bằng vai thường |
| "Audit lỗi mạng, coi như sạch" | Ghi "không đánh giá được" |
| "`audit fix` cho nhanh" | Có thể nâng major, đổi hành vi; USER duyệt trước |
