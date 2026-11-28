---
name: dieu-phoi-antigravity
description: Quy trình để Claude điều phối và giao việc cho Antigravity (agy) qua MCP agy-bridge hoặc gọi thẳng agy. Gọi khi Chiến nói "nhờ Antigravity", "giao agy", "đẩy sang Antigravity", hoặc khi cần phân tích file lớn, tìm context xuyên repo, đào git log/diff dài, hoặc cho agy thực thi một việc đã chốt phạm vi.
---

# Giao việc cho Antigravity

Claude là người điều phối và chịu trách nhiệm kết quả. `agy` chỉ làm tay chân: kết quả của nó là dữ liệu tham khảo, không phải kết luận.

## 0. Kiểm tra điều kiện (10 giây)

- Tool `delegate` / `analyze_files` / `deep_search` / `adversarial_review` của `agy-bridge` có trong phiên không? Có thì dùng tool. Chưa có (server chưa duyệt trong `/mcp`) thì gọi thẳng `agy` ở bước 3.
- `agy` chạy được: `& "$env:LOCALAPPDATA\agy\bin\agy.exe" --version` (kỳ vọng 1.5.x). Đường dẫn này cũng được ghim bằng `AGY_PATH` trong `.mcp.json`.

## 1. Chọn loại việc

| Loại | Ví dụ | Chế độ |
|---|---|---|
| **Đọc / phân tích** | tóm tắt module, đọc log to, git log dài, tìm xuyên repo | `--mode plan`, chạy ngay trên cây hiện tại |
| **Thực thi** (sửa code) | viết một handler theo mẫu, đổi tên hàng loạt, sinh test | **worktree riêng**, không chạy trên cây đang có thay đổi chưa commit |

Việc đụng secret, migration, hoặc quyết định thiết kế thì **không giao**, Claude tự làm.

## 2. Chuẩn bị

- **Đọc:** chụp mốc `git status --short | md5sum` và `git diff | md5sum`.
- **Thực thi:** tạo worktree (`using-git-worktrees`), rồi chạy `agy` với `cwd` là worktree đó. Cây chính không bị chạm.
- Viết prompt gồm đủ 4 phần: **mục tiêu**, **file/thư mục được phép đọc/sửa** (liệt kê cụ thể), **điều cấm** (không sửa ngoài phạm vi, không commit, không đụng `.env`/`appsettings.Development.json`/`.mcp.json`), **tiêu chí xong** (lệnh build/test phải xanh). Dẫn quy ước từ `CLAUDE.md` nếu việc sửa code (ErrorOr, entity POCO, validator file riêng...).

## 3. Giao

Qua bridge: gọi `delegate` (thực thi) hoặc `analyze_files` / `deep_search` (đọc).

Gọi thẳng:

```powershell
# đọc
& "$env:LOCALAPPDATA\agy\bin\agy.exe" --mode plan --dangerously-skip-permissions --print-timeout 240s -p "<prompt>"
# thực thi (cwd = worktree)
& "$env:LOCALAPPDATA\agy\bin\agy.exe" --mode accept-edits --dangerously-skip-permissions --print-timeout 600s -p "<prompt>"
```

Headless không hỏi được quyền nên thiếu `--dangerously-skip-permissions` thì `agy` bị từ chối chạy lệnh. Bù lại bằng phạm vi trong prompt và bước 4. Việc dài chạy nền, đừng chờ treo.

## 4. Kiểm lại, không tin báo cáo của agy

- **Đọc:** so lại hai hash ở bước 2, phải **giống hệt**. Lệch tức `agy` đã sửa file, báo Chiến và dừng. Mở file thật đối chiếu các chi tiết dùng làm căn cứ (tên hàm, số lượng, đường dẫn).
- **Thực thi:** `git status` + `git diff` trong worktree, đọc từng file đổi: có file ngoài phạm vi không, có secret lọt vào không. Rồi chạy verify thật: `dotnet build BE/LandManagement.slnx` (và `dotnet test` nếu có), FE thì `pnpm -C FE typecheck` / `pnpm -C FE build`. Với diff `.cs` gọi thêm `code-gon-de-doc`.
- Không gộp vào nhánh chính khi chưa qua verify và chưa có đồng ý của Chiến.

## 5. Báo cáo

Ngắn gọn, đủ 4 ý: đã giao việc gì và chế độ nào · kết quả đối chiếu (hash, diff, build/test: số thật) · phần **chưa kiểm** · việc Chiến cần quyết (merge worktree, bỏ, giao tiếp).
