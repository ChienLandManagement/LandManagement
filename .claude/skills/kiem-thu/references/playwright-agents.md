# Playwright test agents

<!-- Theo playwright.dev/docs/test-agents (Apache-2.0, © Microsoft), đọc 2026-10-29. -->

Dùng khi cần nhiều test cho một luồng mới, hoặc sửa một loạt test đỏ. Mỗi lượt agent gọi model tính phí; báo USER
trước khi chạy cho cả suite.

## Cài

`npx playwright init-agents --loop=claude` (Codex: `--loop=codex`). Lệnh sinh định nghĩa agent và `seed.spec.ts`.
Định nghĩa agent là file sinh: không sửa tay, không chép vào kit; nâng phiên bản Playwright → chạy lại lệnh. Commit
file sinh chỉ khi USER đồng ý.

## Quy trình

1. **Seed** — `seed.spec.ts` mở app ở trạng thái bắt đầu, đã đăng nhập theo `e2e.md` §1. Seed đỏ → dừng, sửa seed
   trước.
2. **Planner** — đầu vào: luồng cần test (lời USER, dòng acceptance trong intent / spec) và seed. Đầu ra: plan
   Markdown trong `specs/`. Main đối chiếu plan với acceptance trước bước 3; thiếu luồng → bảo planner bổ sung.
3. **Generator** — đầu vào: một file `specs/*.md`. Đầu ra: test trong `tests/`. Rà test sinh ra theo `viet-test.md`
   rồi chạy theo `e2e.md` §3.
4. **Healer** — đầu vào: tên test đỏ. Healer chạy lại, xem giao diện, sửa test. Kết quả của healer là đề xuất: main xem
   diff trước khi giữ.

## Rào cho healer

- Healer chỉ được đổi locator và bước chờ theo `viet-test.md`.
- Diff bỏ hoặc nới assertion, đổi giá trị mong đợi, thêm `waitForTimeout`, thêm `test.skip` / `test.fixme` → không
  giữ; xếp test đó vào "app sai hoặc cần USER".
- Healer cho rằng chức năng hỏng và skip test → coi là báo lỗi app: báo USER kèm trace, không merge bản skip.
