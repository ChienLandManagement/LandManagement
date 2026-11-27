---
name: kiem-thu
description: 'Viết test đúng: đỏ trước khi sửa (bugfix, đổi hành vi từ MEDIUM, refactor / migrate code chưa có test), e2e Playwright, test phân quyền 401 / 403 / IDOR, audit dependency. Dùng khi sửa bug, refactor, viết test, test đỏ hoặc chập chờn, USER nói "TDD", "e2e", "Playwright", "test phân quyền".'
---
<!-- Rút từ github.com/obra/superpowers · skills/test-driven-development/ (MIT, © 2025 Jesse Vincent), bản 6.4.1. -->

# Kiểm thử


**Chưa thấy test đỏ thì chưa biết test bắt đúng thứ cần bắt.** Phạm vi: mọi bugfix, đổi hành vi code chạy
được từ MEDIUM; đổi LOW cơ học miễn; luật / skill thử bằng eval (`bao-tri-luat`).

| Việc | Mở |
|---|---|
| Bugfix, đổi hành vi, refactor code chưa có test: đỏ – xanh – dọn, mock, kiểm đột biến | §1–§5 dưới |
| Test e2e luồng người dùng trên web (Playwright), test e2e đỏ hoặc chập chờn, Playwright test agents, kiểm a11y tự động (axe) | `references/e2e.md` |
| Test phân quyền theo ma trận vai × endpoint (401, 403, IDOR) · audit dependency có lỗ hổng | `references/bao-mat.md` |

Chi tiết e2e: `references/viet-test.md` (locator, chờ, dữ liệu, chập chờn, CI) · `references/playwright-agents.md` (planner / generator / healer sinh và sửa test; mỗi lượt gọi model tính phí).

## Chụp hành vi trước khi sửa code chưa có test

Refactor, nâng cấp hay migrate code chưa có test phủ → trước tiên viết test chụp hành vi **hiện tại** (kể cả hành vi
sai, đánh dấu `// hành vi cũ`), cho xanh trên code cũ, rồi mới sửa. Đổi hành vi cố ý → sửa test đó trong cùng commit,
nêu trong báo cáo.

## 1 · Đỏ – xanh – dọn

1. **Đỏ.** Một test cho một hành vi; tên test nói hành vi đó. Dùng code thật; mock chỉ khi phụ thuộc chậm hoặc ở ngoài (§3).
2. **Kiểm đỏ đúng lý do.** Chạy riêng test đó. Phải FAIL (assert trượt), không ERROR (lỗi biên dịch, sai import, gõ
   sai); thông báo trượt nói đúng thứ đang thiếu. Xanh ngay → test đang thử hành vi đã có, sửa test. ERROR → sửa lỗi đó,
   chạy lại tới khi FAIL đúng lý do.
3. **Xanh.** Viết code ít nhất để test qua. Không thêm tuỳ chọn, không sửa code bên cạnh.
4. **Kiểm xanh.** Test đó qua, rồi chạy **lệnh verify đầy đủ** của artifact (dùng verify-be). Lọc một test
   (`--filter`, chạy một file) chỉ để đo đỏ / xanh trong vòng lặp; báo xong chỉ sau lệnh đầy đủ. Test khác đỏ → báo
   đích danh, kể cả test không do mình làm đỏ.
5. **Dọn** sau khi xanh: bỏ lặp, đặt lại tên. Không thêm hành vi. Chạy lại test.


## 2 · Trước khi viết thân test

- **Nêu bug test chặn:** thay đổi nào ở code thật làm test này đỏ? Không nêu được → chuyển sang một hành vi quan sát
  được. Chỉ nêu được "chữ trong file nguồn đổi" → chạy artifact, assert kết quả. Chỉ quyết định cố ý (giá trị hằng, câu
  thông báo) làm test đỏ → test bắt thay đổi chứ không bắt bug; thử hành vi phụ thuộc quyết định đó.
- **Kỳ vọng suy độc lập:** giá trị mong đợi là literal hoặc dữ liệu kiểm bằng tay, không tính bằng chính code đang thử
  hay helper của nó.
- Thử contract của code mình ở ranh giới (route, câu truy vấn, payload), không thử cơ chế của framework.

## 3 · Mock

- Không assert lên mock. Assert hành vi của thành phần thật; đang kiểm chính mock → bỏ mock hoặc bỏ assert.
- Mock đúng tầng: liệt kê tác dụng phụ của hàm thật trước; giữ thật phần test cần, chỉ mock tầng chậm / ở ngoài bên dưới.
- Dữ liệu mock đủ cấu trúc thật, không chỉ các field test đọc.
- Hàm chỉ test gọi → đặt ở tiện ích test, không đặt trong class sản phẩm.
- Dựng mock dài hơn nửa test → chuyển sang test tích hợp với thành phần thật.

Chi tiết test double của stack: skill test của project (ví dụ `api-testing-dotnet`).

## 4 · Kiểm đột biến

Trước khi báo xong, đột biến code trong đầu. Mỗi đột biến thực tế phải làm ít nhất một test đỏ: sai hằng hoặc đối số ·
sai nhánh · thiếu đổi trạng thái hoặc tác dụng phụ · trả rỗng / mặc định · thiếu kiểm rỗng, số không, sai quyền, sai
định dạng. Không test nào đỏ → hành vi chưa được bảo vệ, hoặc test luôn đúng.

Stack có công cụ mutation trong skill test của project (ví dụ `api-testing-dotnet` › mục Mutation test) → logic nghiệp vụ từ MEDIUM
chạy công cụ thật, không chỉ đột biến trong đầu.

## 5 · Test viết sau fix — red-green revert

Bắt buộc khi test được viết **sau** khi đã có fix. Chứng minh test đỏ khi bỏ fix:

1. `git status --short`: có file lạ ngoài task → dừng, hỏi USER.
2. Lưu patch **chỉ gồm file fix**, không gồm file test, ra thư mục tạm ngoài repo:
   `git diff -- <file fix…> > <tạm>/fix.patch`. File fix mới chưa track không vào patch → ở bước 3 dời nó ra thư mục
   tạm, ở bước 4 trả về chỗ cũ. Fix đã commit → `git diff <commit trước fix> HEAD -- <file fix…> > <tạm>/fix.patch`.
   Patch rỗng → dừng, báo; không coi là qua.
3. `git apply -R <tạm>/fix.patch` → chạy test: phải FAIL, không ERROR.
4. `git apply <tạm>/fix.patch` → file fix trở lại như trước bước 3 (fix chưa commit: `git diff -- <file fix…>` khớp
   patch; fix đã commit: `git diff -- <file fix…>` rỗng) → chạy test: xanh.

Không dùng `stash`, `checkout --`, `restore`, `reset`.

## Ngụy biện

| Nghĩ | Thật |
|---|---|
| "Đơn giản quá, khỏi test" | Code đơn giản vẫn hỏng; bugfix và đổi hành vi từ MEDIUM bắt buộc test đỏ trước |
| "Viết test sau cũng vậy" | Test viết sau xanh ngay, không chứng minh gì → red-green revert (§5) |
| "Test xanh ngay lần đầu, tốt" | Test chưa từng đỏ là test chưa được kiểm (§1 bước 2) |
| "Đã thử tay rồi" | Thử tay không chạy lại được; test chạy giống nhau mọi lần |
| "Một test xanh là xong" | Báo xong sau lệnh verify đầy đủ |
