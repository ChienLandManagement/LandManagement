# Viết test e2e

<!-- Rút ý từ github.com/currents-dev/playwright-best-practices-skill · playwright-best-practices/core/locators.md, core/assertions-waiting.md, core/test-data.md, debugging/flaky-tests.md (MIT, © 2026 Currents Software Inc.). -->

## Locator

- Thứ tự: `getByRole` (kèm `name`) → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId`.
- Không dùng class CSS, id sinh tự động, XPath theo cấu trúc DOM.
- Nhiều phần tử khớp → `filter({ hasText })` hoặc lồng locator theo vùng
  (`getByRole('row', { name }).getByRole('button', { name })`); `nth()` chỉ khi thứ tự là nghiệp vụ.
- Không tìm được locator theo vai hoặc nhãn → báo FE thiếu nhãn (lỗi accessibility), không thêm `data-testid` để né.

## Chờ và assert

- Dùng web-first assertion: `await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`. Chúng tự chờ.
  Không viết `expect(await locator.textContent())`.
- Không `page.waitForTimeout`, không `setTimeout`. Chờ API → `page.waitForResponse` đặt trước thao tác gây ra nó.
  Chờ điều kiện ngoài DOM → `expect.poll` hoặc `expect(...).toPass()`.
- `{ force: true }` chỉ khi đã biết vì sao phần tử bị che; ghi lý do ở comment.

## Dữ liệu

- Tạo qua API hoặc fixture trong test; dọn ở teardown của fixture.
- Dữ liệu ngẫu nhiên có seed, in seed ra log để chạy lại đúng ca.
- Không phụ thuộc thứ tự test: mỗi test chạy riêng được (`npx playwright test <file> -g "<tên>"`).

## Chập chờn

1. Chạy `--repeat-each=10`, rồi chạy lại với `--workers=1`.
2. Xanh với một worker, đỏ với nhiều worker → dữ liệu hoặc tài khoản dùng chung.
3. Đỏ khi chạy cùng file khác → trạng thái rò giữa các test.
4. Chỉ đỏ ở CI → máy chậm, headless, mạng: chạy local headless với biến `CI=1`.
5. Đỏ đúng ở một thao tác → thiếu chờ đúng trạng thái.

Sửa nguyên nhân. `retries` trong config chỉ để thu trace (`trace: 'on-first-retry'`); test chỉ xanh ở lần retry vẫn
là test chập chờn, phải báo.

## CI

Khi đỏ, lưu `playwright-report/` và trace làm artifact. Suite chậm → chia `--shard=<i>/<n>`.
