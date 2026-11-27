<!-- Rút ý từ currents-dev/playwright-best-practices-skill (MIT, © 2026 Currents Software Inc.), đọc 2026-10-29 và playwright.dev/docs/test-agents (Apache-2.0, © Microsoft), đọc 2026-10-29. -->

# Test e2e bằng Playwright

FE kiểm bằng e2e: test đi đúng luồng người dùng trên app chạy thật. Unit test dành cho BE (`SKILL.md` của skill này).
Dùng thử bằng tay qua trình duyệt là việc của `ux-tester`, không thay test e2e.

## 1 · Trước khi viết

- Đọc `playwright.config.ts`, thư mục test và lệnh e2e project khai (`package.json` hoặc README).
  Chưa có Playwright → báo USER: `@playwright/test` là dependency mới; USER đồng ý rồi mới cài theo package manager
  của repo.
- Mỗi test một luồng người dùng, tên theo kết quả người dùng thấy (ví dụ "quản trị viên khoá được tài khoản").
- Dữ liệu: mỗi test tự tạo dữ liệu của nó qua API hoặc fixture, tên mang tiền tố duy nhất; không dựa vào dữ liệu test
  khác tạo, không dùng chung tài khoản giữa các worker.
- Đăng nhập: một setup project lưu `storageState` cho từng vai; credential lấy từ biến môi trường, không ghi vào file
  test.
- Chỉ chạy trên local hoặc môi trường USER xác nhận được ghi dữ liệu thử.

## 2 · Viết

Locator, chờ, dữ liệu, chập chờn, CI: `references/viet-test.md`.

- Assert điều người dùng thấy và trạng thái sau thao tác (bản ghi còn ở danh sách sau khi mở lại trang), không assert
  chi tiết cài đặt.
- Mỗi luồng chính có thêm một nhánh sai: bỏ trống trường bắt buộc, hoặc vai thiếu quyền.

## 3 · Chạy và báo

- Chạy đúng lệnh e2e của project. Test mới chạy thêm `--repeat-each=3` trước khi báo xanh.
- Đỏ → mở trace (`npx playwright show-trace <file>`), xếp nguyên nhân: app sai · test sai · môi trường · dữ liệu.
  App sai → báo, không sửa test cho qua.
- Không `test.skip`, `test.fixme`, nới timeout hay bỏ assertion để test xanh khi USER chưa đồng ý.
- Báo: lệnh, dòng kết quả cuối, test đỏ kèm đường dẫn trace.

## 4 · Playwright test agents

Sinh plan, sinh test, sửa test đỏ bằng planner / generator / healer: `references/playwright-agents.md`.

## 5 · Kiểm a11y tự động

- Màn có tương tác: dùng `@axe-core/playwright` (dependency mới, USER đồng ý trước), quét sau khi màn đạt trạng thái cần
  kiểm; fail khi có vi phạm `serious` hoặc `critical`; mục `incomplete` ghi vào báo cáo cho người xem, không fail.
- axe bắt khoảng một nửa số lỗi a11y; bàn phím, screen reader vẫn kiểm tay.
- Screenshot so sánh (`toHaveScreenshot`) chỉ khi baseline sinh và chạy cùng một môi trường; máy khác ra diff giả.

## Ngụy biện

| Nghĩ | Thật |
|---|---|
| "Thêm `waitForTimeout` cho chắc" | Chờ cứng làm chậm mà vẫn chập chờn; dùng web-first assertion |
| "Test chập chờn, bật retry là xong" | Retry che lỗi; tìm nguyên nhân theo `viet-test.md` › Chập chờn |
| "Healer báo xanh rồi" | Xem diff của healer: assertion bị nới hoặc bỏ là hỏng, không phải xanh |
| "Test cũ đỏ, skip để merge" | Skip cần USER đồng ý, kèm lý do |
