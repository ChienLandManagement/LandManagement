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
| **Đọc / phân tích** | tóm tắt module, đọc log to, git log dài, tìm xuyên repo | `--mode plan` |
| **Thực thi** (sửa code) | viết một handler theo mẫu, đổi tên hàng loạt, sinh test | `--mode accept-edits` |

Cả hai chạy **thẳng trên nhánh hiện tại** (Chiến đã chọn: không tạo worktree riêng). Việc đụng secret, migration, hoặc quyết định thiết kế thì **không giao**, Claude tự làm.

## 1b. Hỏi Chiến chọn model (bắt buộc, không tự chọn)

Trước mỗi lần giao, **luôn hỏi Chiến** bằng `AskUserQuestion`, không tự đoán model:

1. Chạy `& "$env:LOCALAPPDATA\agy\bin\agy.exe" models` để lấy danh sách thật (id + tên). Danh sách đổi theo tài khoản và thời điểm, đừng dùng danh sách nhớ sẵn.
2. Hỏi một câu "Giao cho model nào?", tối đa 4 lựa chọn, **xếp rẻ trước, mạnh sau**: lựa chọn đầu tiên (đánh dấu "Recommended") là `gemini-4-hydrogen-low` nếu còn trong danh sách; tiếp theo là các mức low/medium khác hoặc Flash; cuối cùng mới đến mức high/xhigh. Ghi id đầy đủ trong mô tả. Chiến luôn có thể chọn "Other" để gõ id khác trong danh sách.
3. Mức effort đã nằm trong tên model (`...-high`, `...-low`), nên chọn model là chọn luôn effort. Chỉ thêm `--effort` khi Chiến yêu cầu riêng.
4. Chiến đã nói rõ model trong câu lệnh ("dùng gemini-4-neon-high") thì dùng luôn, không hỏi lại.

Giữ id Chiến chọn đến hết bước 3 và ghi vào báo cáo ở bước 5. Việc khó (nhiều file, logic phức tạp) mà Chiến chọn model rẻ nhất thì nhắc một câu rằng kết quả có thể phải làm lại, rồi vẫn làm theo lựa chọn.

## 2. Chuẩn bị (chụp mốc trước khi giao)

Cây `dev` thường đang có thay đổi chưa commit của Chiến, nên `git diff` sau này không tách được phần của `agy`. Vì vậy **luôn chụp mốc trước**, lưu vào thư mục scratchpad của phiên:

```powershell
git status --short > "$SCRATCH\before.status.txt"
git diff > "$SCRATCH\before.patch"
git ls-files -o --exclude-standard > "$SCRATCH\before.untracked.txt"
```

Viết prompt gồm đủ 4 phần: **mục tiêu**, **file/thư mục được phép đọc/sửa** (liệt kê cụ thể), **điều cấm** (không sửa ngoài phạm vi, không commit, không đụng file đang có thay đổi chưa commit nếu không nằm trong phạm vi, không đụng `.env`/`appsettings.Development.json`/`.mcp.json`), **tiêu chí xong** (lệnh build/test phải xanh). Việc sửa code thì dẫn quy ước từ `CLAUDE.md` (ErrorOr, entity POCO, validator file riêng...). Nếu phạm vi giao trùng với file Chiến đang sửa dở, **báo Chiến trước**, đừng giao.

## 3. Giao

Qua bridge: gọi `delegate` (thực thi) hoặc `analyze_files` / `deep_search` (đọc), **luôn truyền tham số `model` = id Chiến đã chọn ở bước 1b** (không để bridge tự định tuyến).

Gọi thẳng:

```powershell
# đọc
& "$env:LOCALAPPDATA\agy\bin\agy.exe" --mode plan --dangerously-skip-permissions --model <id-đã-chọn> --print-timeout 240s -p "<prompt>"
# thực thi
& "$env:LOCALAPPDATA\agy\bin\agy.exe" --mode accept-edits --dangerously-skip-permissions --model <id-đã-chọn> --print-timeout 600s -p "<prompt>"
```

Headless không hỏi được quyền nên thiếu `--dangerously-skip-permissions` thì `agy` bị từ chối chạy lệnh. Bù lại bằng phạm vi trong prompt và bước 4. Việc dài chạy nền, đừng chờ treo.

## 4. Kiểm lại, không tin báo cáo của agy

So trạng thái hiện tại với mốc ở bước 2 để lọc ra **đúng phần `agy` đã đổi**: file mới trong `git status`/danh sách untracked, và `git diff` khác `before.patch`.

- **Đọc:** `git status` và `git diff` phải **giống hệt** mốc. Lệch tức `agy` đã sửa file ngoài ý muốn: báo Chiến và dừng. Mở file thật đối chiếu các chi tiết dùng làm căn cứ (tên hàm, số lượng, đường dẫn).
- **Thực thi:** đọc từng file `agy` đã đổi: có file ngoài phạm vi không, có đè lên thay đổi chưa commit của Chiến không, có secret lọt vào không. Phần nào ngoài phạm vi thì **hoàn tác đúng phần đó** (không `git checkout`/`reset` cả cây, vì sẽ mất việc của Chiến) và báo lại. Rồi chạy verify thật: `dotnet build BE/LandManagement.slnx` (và `dotnet test` nếu có), FE thì `pnpm -C FE typecheck` / `pnpm -C FE build`. Với diff `.cs` gọi thêm `code-gon-de-doc`.
- Không commit thay Chiến. Chiến tự quyết commit sau khi xem diff.

## 5. Báo cáo

Ngắn gọn, đủ 5 ý: đã giao việc gì · **model đã dùng** · kết quả đối chiếu với mốc (file nào đổi, build/test: số thật) · phần **chưa kiểm** · việc Chiến cần quyết (giữ, hoàn tác, commit).
