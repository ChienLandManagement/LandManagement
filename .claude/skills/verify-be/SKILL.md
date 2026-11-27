---
name: verify-be
description: Vòng tự kiểm backend .NET bằng lệnh verify duy nhất của dự án. Dùng NGAY SAU KHI sửa bất kỳ file nào trong mã backend, trước khi báo "xong", trước khi commit, khi cần trả lời "code này chạy được chưa", và khi job test backend trong CI báo đỏ.
---

# Vòng tự kiểm — backend .NET

Với BE .NET, đây là "lệnh đúng" mà dự án cần — không tự
chọn lệnh build/test khác.

## Yêu cầu ở dự án tiêu thụ

Skill này không mang script thật — mỗi dự án có solution/project riêng. Dự án cần tự có **một lệnh
duy nhất** (ví dụ `scripts/verify.py`, hoặc tương đương) làm đúng việc dưới đây, và mọi nơi (người,
agent, CI) đều gọi **cùng** lệnh đó — chép tay ba nơi ba lần thì sớm muộn lệch nhau:

1. `dotnet build` toàn bộ solution (gồm cả project test).
2. Chạy test xUnit theo **hai tầng**, cả hai đều trên **CSDL test riêng** (không phải CSDL dev):
   - **core** — unit test + integration test in-memory qua `WebApplicationFactory`. Luôn chạy.
   - **live** — lớp test đặt tên theo quy ước cố định (ví dụ hậu tố `*LiveHttpTests`), gọi API môi
     trường Testing thật. Chỉ chạy khi có cờ (ví dụ `--live`) hoặc khi instance môi trường đó đã bật;
     script tự bật/tắt instance nếu cần.
3. In **dòng tổng kết thật** cho từng tầng (số bài chạy / đạt / trượt / bỏ qua) — không suy diễn,
   không tự nới lỏng phạm vi test bằng `--filter` riêng.

Nếu dự án chưa có script này, tự thêm nó (đặt ở đường dẫn dự án quy ước) trước khi coi skill là
dùng được — đừng chạy `dotnet build` + `dotnet test` rời rạc thay thế, vì khi đó không ai đảm bảo
người, agent và CI chạy cùng một thứ.

## Vòng lặp

1. Chạy lệnh verify của dự án.
2. Xanh → xong, dán nguyên đoạn tổng kết vào chỗ báo cáo.
3. Đỏ → đọc **dòng `[FAIL]` đầu tiên**, không phải dòng cuối. Dòng cuối thường chỉ là hệ quả.
4. Sửa **một** nguyên nhân. Chạy lại.
5. **Cùng một giả thuyết nguyên nhân sai lần thứ hai → dừng vá.** Đọc lại từ đầu, xem hết
   chỗ gọi hàm đang sửa. Vá lần ba là đang đoán.

## Bẫy

- **Nếu script có cờ `--no-build` ở bước test, đó là cố ý** (bước dựng đã chạy ngay trước đó).
  Đừng thêm `dotnet test` riêng ở ngoài — nó dựng lại lần nữa và mất thêm vài chục giây mỗi vòng.
- **Đừng nới lỏng bài kiểm cho nó xanh.** Chỉ sửa bài kiểm khi **bài kiểm sai**, và phải
  nói rõ trong merge request là sửa gì, vì sao. Đây là hành vi hay xảy ra nhất lúc bí. Trước khi báo xanh, rà
  `git diff` của chính mình tìm năm dấu hiệu:
  1. Ngưỡng bị hạ — coverage, số cảnh báo cho phép, bước kiểm bị bỏ khỏi script.
  2. Test dễ đi — `[Fact(Skip = …)]`, file test bị xoá, assertion bị gỡ khỏi test còn lại.
  3. Checker bị tắt — `#pragma warning disable`, `[SuppressMessage]`, `<NoWarn>` mới.
  4. Việc dở giả làm xong — `throw new NotImplementedException()`, `catch { }` rỗng, `// TODO` thay cho code.
  5. Ngoại lệ mới — dòng mới trong danh sách bỏ qua / allowlist mà chưa ai bàn.
  Có dấu hiệu nào → nêu trong báo cáo, không im lặng.
- **Đừng tự gõ `--filter` rồi báo xanh.** Phân tầng nên nằm cố định trong script; lọc thêm là xanh một phần.
- **Cảnh báo lỗ hổng NuGet đã biết trong thư viện có sẵn** (ví dụ `NU1903`/`NU1904`) không phải lỗi
  của bạn — ghi phiếu riêng, đừng sửa kèm, đừng nhắc lại mỗi lần. Phiếu ghi: mức · gói chạy lúc runtime hay chỉ
  test/build · code có gọi tới phần lỗi không · có bản vá chưa. High/critical mà chạm tới được → báo USER ngay.
- **Mọi tầng chạy trên CSDL test riêng, không bao giờ CSDL dev.** Instance đang chạy môi trường khác thì
  fixture live nên từ chối chạy — tắt instance đó, đừng sửa fixture cho qua.
- Cảnh báo kiểu `CS86xx` về `null` là cảnh báo, không chặn. Chỉ sửa nếu diff của bạn sinh ra nó.

## Nghiệm thu thao tác ghi DB và schema

- Schema drift = nguồn lỗi hệ thống → **verify DB schema thực tế trước khi code merge/SP**.
- Bug silent không crash → review chủ động, đừng tin "build pass = đúng".
- Mỗi finding phải re-verify trên code **sau khi** sửa, không tin báo cáo đã sửa.
- "Build xanh" chỉ được nói sau khi chạy `dotnet build <đường dẫn solution>` — solution phải gồm
  cả project test; build riêng project chính không tính. Đường dẫn solution do project khai (ví
  dụ trong README hoặc CLAUDE.md hoặc script verify riêng).
- Thao tác ghi DB **không được nghiệm thu bằng build xanh**. Dựng console dùng-một-lần (đã gitignore), đọc chuỗi kết nối
  từ biến môi trường hoặc file cấu hình đã gitignore — **không gán giá trị kết nối trong code** — rồi gọi thẳng
  lớp truy cập dữ liệu trên DB dev, chạy đủ kịch bản, dọn sạch dữ liệu thử. Không có bước này thì bug loại "ghi sai âm
  thầm" lọt tới tay người dùng. Console này khác bộ test tự động: bộ test vẫn chạy trên CSDL test riêng (mục Bẫy).

## Chưa đủ để gọi là xong

Lệnh xanh mới là **một** phần. Còn phải: thay đổi hành vi thì có bài kiểm chạm tới nó ·
rà dữ liệu nhạy cảm trước commit · FE (nếu có) thì mở trình duyệt xem thật.

Đổi rule hay skill (không phải code) thì lệnh verify **không kiểm được gì** — cấu hình không có
bài kiểm. Sửa xong phải chạy lại `apm install ; apm compile` của dự án.
