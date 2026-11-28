---
name: chien-review-code
description: Review code BE cùng Chiến, từng đoạn một, theo tiêu chí riêng của Chiến. Dùng khi Chiến nói "ngồi review", "review đoạn này", "xem code này có ổn không", hoặc dán code BE để bàn và sửa. Bổ sung tiêu chí mới khi buổi review chốt thêm một điều.
---

# chien-review-code

## Quy trình mỗi đoạn code

1. Đọc cả file chứa đoạn code, không chỉ diff (dòng có sẵn vi phạm vẫn phải báo).
2. Đối chiếu với **Tiêu chí base** dưới đây và `references/tieu-chi-bo-sung.md`.
3. Báo từng finding: dòng · vi phạm tiêu chí nào · cách sửa. Xếp theo mức nghiêm trọng, chưa sửa khi chưa được duyệt.
4. Hai bên chốt cách sửa → sửa.
5. Chiến chỉ ra một lỗi kiểu "hay vi phạm" hoặc buổi này chốt thêm một điều chưa có trong tiêu chí → **tự ghi ngay** vào `references/tieu-chi-bo-sung.md` theo mẫu ở đầu file đó (Chiến đã dặn bổ sung liên tục, 2026-10-21), báo lại mã `S<N>` trong lượt đó. Chỉ hỏi khi tiêu chí mới trùng hoặc đá với B1–B16.

**Xong khi** mọi finding đã có quyết định: sửa, bỏ qua, hoặc thành tiêu chí.

## Tiêu chí base

**Mã và kiểu viết (feedback của Chiến)**
- B1. Không hàm bọc một dòng quanh `Error.*`; viết `Error.Validation("…".ToMessageForUser())` tại chỗ, một tham số. Message lặp từ 3 chỗ trở lên → `const` (S4).
- B2. Không thêm enum, class, hàm phụ khi một `if` là đủ. Code sạch, không rác.
- B3. Mã lỗi, trạng thái, thông báo viết tiếng Việt có dấu, có khoảng trắng ("Trùng số văn bằng"); không dán liền không dấu kiểu `TrungSoVanBang`.
- B4. Thuộc tính đã có kiểu enum thì không ép kiểu thừa `(EnumType)row.X`.

**Gọn, dễ đọc — chỉ áp cho dòng thêm / sửa của diff**
- B16. Rà 5 câu, mỗi nhóm vi phạm là một finding MEDIUM (ví dụ: `references/gon-de-doc-vi-du.md`):
  1. Xử lý nào bị tách làm hai chỗ (hai vòng lặp cùng tập, hai lần parse cùng nguồn, hai nhánh chỉ khác một giá trị, log lỗi rải nhiều nơi)? Gộp lại, hoặc đổi dữ liệu một lần rồi suy phần còn lại.
  2. Có helper sẵn trong dự án hoặc ResultLib chưa dùng (`IsEmpty`, `IsNotEmpty` thay `string.IsNullOrEmpty` — S65)?
  3. `if` một câu lệnh có xuống dòng hoặc `{ }` thừa? Khối từ hai câu thiếu `{ }`, hoặc lồng quá 2 tầng không ngoặc?
  4. Biến, nhánh, tham số, phép gọi thừa? `!Any()` trên collection có `Count`? `if` lọc trong `foreach` thay vì `.Where`?
  5. Comment còn đúng với code không, có nói "vì sao" không? Có namespace viết đủ dù đã có `using`?
  Không đặt chỉ tiêu số dòng: gọn là đọc một lần hiểu. Code cũ rườm rà chỉ ghi chú, không sửa.

**Lỗi và luồng**
- B8. Luồng nghiệp vụ không throw; `catch` trả lỗi có ngữ cảnh và không nuốt lỗi.
- B9. Mọi lời gọi Service/repository kiểm kết quả lỗi ngay và trả lỗi lên. Không dùng `?? default` che "không tìm thấy".
- B10. async đủ `await`, có `CancellationToken`.

**API và quyền**
- B11. Route kebab-case lowercase; GET kiểu phức hợp có `[FromQuery]`. DTO không chứa `RoleId`, `CreatedBy`, `UserId`; danh tính lấy từ claim.
- B12. Endpoint có id: kiểm bản ghi thuộc phạm vi người gọi. Endpoint mới có khai báo quyền.
- B13. Lỗi trả client không lộ `ex.Message`, SQL, stack.


