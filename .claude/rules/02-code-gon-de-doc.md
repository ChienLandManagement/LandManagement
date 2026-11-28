---
paths:
  - "**/*.cs"
---

# Quy định riêng LandManagement · Code gọn, dễ đọc 

## Code mới viết gọn, mỗi nghiệp vụ một chỗ xử lý

Đọc một lần phải hiểu. Gọn đo bằng điều đó, không đo bằng số dòng.

1. **Một việc một chỗ.** Không tách một xử lý thành hai bước song song: hai vòng lặp trên cùng tập, hai lần parse cùng nguồn, hai nhánh chỉ khác một giá trị, log lỗi rải nhiều nơi. Gộp lại, hoặc đổi dữ liệu một lần rồi suy phần còn lại từ kết quả.
2. **Có helper sẵn thì dùng, viết một dòng:** `x.IsEmpty() ? "" : x.Trim()`, không `!string.IsNullOrWhiteSpace(x) ? x.Trim() : ""` xuống ba dòng.
3. **Vừa ~120 ký tự thì một dòng.** Thân đúng một câu thì bỏ `{ }`, tối đa 2 tầng; từ hai câu bắt buộc có `{ }`.
4. **Collection:** `Count == 0` thay `!Any()` khi có `Count`; lọc ở nguồn vòng lặp bằng `.Where`, không đặt `if` lọc bên trong.
5. **Code mới không để lại thừa:** biến không dùng, nhánh không bao giờ chạy, phép gọi lặp cùng kết quả, namespace viết đủ khi đã có `using`, comment không khớp code. Comment nói vì sao, một ngôn ngữ (tiếng Việt).

## Ghi đè "giữ phong cách cũ"

"Giữ phong cách cũ" chỉ áp cho định dạng và đặt tên của dòng đã có. Đoạn mình viết mới theo tiêu chí gọn-dễ-đọc, kể cả khi nằm cạnh code cũ rườm rà. Thấy code cũ rườm rà hoặc chết thì báo trong báo cáo, không tự sửa; phần còn lại giữ nguyên.

## Tự rà trước khi báo xong

Sắp báo xong task có sửa `.cs` → gọi skill `code-gon-de-doc`, trả lời 5 câu về diff của mình, sửa rồi mới báo. **Xong khi** báo cáo có một dòng `Gọn-dễ-đọc: câu 1–5 đã rà, sửa N chỗ`.

## Khi review

`code-reviewer` kiểm diff theo tiêu chí gọn-dễ-đọc: vi phạm ở dòng mới là MEDIUM; ở code cũ không thuộc diff chỉ ghi chú, không tính finding.

**Vì sao:** subagent không thấy cuộc trao đổi của USER; chỉ rule tự nạp mới chắc chắn tới tay. Quy tắc "giữ phong cách cũ" cộng "không refactor thêm" từng khiến agent bắt chước sự rườm rà của code xung quanh (2026-10-16).
