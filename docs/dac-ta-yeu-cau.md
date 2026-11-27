# Đặc tả yêu cầu: Hệ thống Quản lý & Phân tích Biến động Đất đai cấp Xã

> **Nguồn đầu vào**: Đề tài *"Ứng dụng công nghệ trong phân tích, thống kê và quản lý số liệu đất đai từ dữ liệu Excel phục vụ công tác quản lý nhà nước tại UBND cấp xã"*.
> **Mục đích tài liệu**: Chuyển hóa mô tả nghiệp vụ hành chính/Excel sang đặc tả phần mềm (từ tổng quan đến chi tiết) để làm cơ sở thiết kế DB, API và giao diện cho dự án `LandManagement`.

---

## 1. Tổng quan & Bối cảnh bài toán

### 1.1. Hiện trạng & Nỗi đau (Pain points)
- Cán bộ địa chính cấp xã đang quản lý khối lượng lớn dữ liệu đất đai rời rạc qua nhiều file Excel:
  - Hồ sơ cấp Giấy chứng nhận quyền sử dụng đất (GCN).
  - Biến động đất đai (chuyển nhượng, tách/hợp thửa, chuyển mục đích sử dụng...).
  - Hiện trạng sử dụng đất, danh mục thửa đất.
  - Dữ liệu kiểm kê đất đai, quy hoạch / kế hoạch sử dụng đất.
- Việc tổng hợp, lọc, cộng số liệu làm thủ công trên Excel dẫn đến: tốn nhiều giờ, dễ sai sót công thức, khó đối chiếu lịch sử biến động và khó tổng hợp nhanh cho lãnh đạo.

### 1.2. Mục tiêu phần mềm
Thay thế thao tác cộng/lọc thủ công bằng một **ứng dụng Web (BE + FE)** cho phép:
1. **Import dữ liệu từ Excel** (chuẩn hóa, kiểm tra lỗi/thiếu dữ liệu tự động).
2. **Quản lý tập trung** danh mục thửa đất, hồ sơ cấp GCN và lịch sử biến động đất đai.
3. **Dashboard trực quan** cho lãnh đạo xem ngay chỉ số tổng hợp, cơ cấu đất, tiến độ hồ sơ.
4. **Xuất báo cáo tự động** (Tháng, Quý, Năm, Kiểm kê) từ dữ liệu đã cập nhật, giảm thời gian tổng hợp từ nhiều giờ xuống vài phút.

---

## 2. Đối tượng sử dụng & Phạm vi nhân rộng

| Vai trò | Nhu cầu chính |
|---|---|
| **Cán bộ địa chính (UBND cấp xã)** | Import file Excel, nhập/cập nhật biến động thửa đất, xử lý cảnh báo thiếu dữ liệu, xuất báo cáo định kỳ. |
| **Lãnh đạo UBND cấp xã** | Xem Dashboard tổng quan (diện tích, cơ cấu đất, hồ sơ tồn/đã cấp/biến động) để ra quyết định nhanh. |
| **Người dân (giai đoạn mở rộng)** | Tra cứu nhanh thông tin/tiến độ hồ sơ (nếu mở cổng tra cứu công khai). |
| **Đơn vị nhân rộng** | UBND các xã khác, Phòng Nông nghiệp & Môi trường, Văn phòng Đăng ký đất đai (cần hỗ trợ đa đơn vị/xã hoặc lọc theo đơn vị hành chính). |

---

## 3. Yêu cầu chức năng chi tiết

### Phân hệ 1: Nhập liệu & Chuẩn hóa dữ liệu Excel (Data Import & Validation)
- **Upload file Excel** (`.xlsx`, `.xls`) theo từng nhóm dữ liệu:
  - Danh mục thửa đất / Hiện trạng sử dụng đất.
  - Hồ sơ cấp Giấy chứng nhận (GCN).
  - Dữ liệu biến động đất đai.
  - Dữ liệu kiểm kê / Quy hoạch, kế hoạch sử dụng đất.
- **Kiểm tra & Cảnh báo tự động trước/sau khi lưu**:
  - Phát hiện dòng thiếu trường bắt buộc (ví dụ: thiếu mã thửa, số tờ, diện tích, loại đất, chủ sử dụng).
  - Phát hiện sai định dạng (diện tích âm/không phải số, sai ngày tháng, mã loại đất không hợp lệ).
  - Cho phép xem danh sách dòng lỗi/thiếu để cán bộ bổ sung hoặc sửa trực tiếp.

### Phân hệ 2: Quản lý Thửa đất, Hồ sơ GCN & Biến động đất đai
- **Danh mục thửa đất**: Lưu thông tin gốc (Số tờ, Số thửa, Diện tích, Loại đất, Chủ sử dụng, Trạng thái pháp lý).
- **Theo dõi biến động đất đai**:
  - Ghi nhận lịch sử thay đổi của thửa đất theo thời gian (tăng/giảm diện tích, chuyển mục đích sử dụng đất, tách thửa, hợp thửa, chuyển nhượng).
  - Đối chiếu được số liệu **trước biến động** và **sau biến động**.
- **Theo dõi tình hình cấp GCN**:
  - Quản lý trạng thái hồ sơ: *Đang xử lý / Hồ sơ tồn / Đã cấp GCN / Từ chối hoặc Bổ sung*.
  - Tìm kiếm, lọc nhanh theo chủ sử dụng, số tờ/số thửa, trạng thái, khoảng thời gian.

### Phân hệ 3: Dashboard trực quan (Dành cho Lãnh đạo & Chuyên môn)
Màn hình tổng quan tự động tính toán từ dữ liệu mới nhất, gồm các chỉ số & biểu đồ:
1. **Chỉ số diện tích**:
   - Tổng diện tích tự nhiên (ha / m²).
   - Diện tích chi tiết theo từng loại đất.
   - Tỷ lệ (%) đất nông nghiệp vs đất phi nông nghiệp.
2. **Chỉ số hồ sơ**:
   - Tổng số hồ sơ đã cấp GCN.
   - Số lượng hồ sơ tồn (chưa giải quyết xong).
   - Số lượng hồ sơ biến động đất đai trong kỳ.
3. **Biểu đồ**:
   - Biểu đồ cơ cấu sử dụng đất (Pie / Donut chart).
   - Biểu đồ biến động đất đai / tiến độ cấp GCN theo thời gian (Bar / Line chart).
4. **Khối cảnh báo**:
   - Hiển thị số lượng bản ghi/hồ sơ đang thiếu dữ liệu hoặc quá hạn xử lý để bấm vào xử lý ngay.

### Phân hệ 4: Tự động hóa Báo cáo (Auto Reporting)
- Hệ thống tự động tổng hợp số liệu mới nhất để xuất ra file **Excel / PDF** theo biểu mẫu chuẩn:
  - **Báo cáo tháng**
  - **Báo cáo quý**
  - **Báo cáo năm**
  - **Báo cáo kiểm kê đất đai**
- Khi dữ liệu thửa đất hoặc biến động được cập nhật, số liệu trên các bảng biểu báo cáo tự động cập nhật theo (không phải cộng tay lại).

---

## 4. Yêu cầu phi chức năng & Định hướng kỹ thuật

- **Độ chính xác số liệu**: Tổng diện tích các loại đất phải khớp với tổng diện tích tự nhiên; lịch sử biến động không ghi đè mất dữ liệu gốc.
- **Dễ sử dụng**: Giao diện đơn giản, quen thuộc với cán bộ cấp xã (hỗ trợ tải file Excel mẫu, import nhanh, lọc/tìm kiếm trực quan).
- **Khả năng nhân rộng**: Thiết kế dữ liệu gắn với **Đơn vị hành chính (Xã/Phường)** để sau này có thể triển khai cho nhiều xã hoặc cấp Phòng/Văn phòng Đăng ký đất đai xem tổng hợp.
- **Kiến trúc triển khai**:
  - **Backend**: `D:\Project\LandManagement\BE\LandManagement_BE` (.NET 10, Clean Architecture, FastEndpoints, `ChienDeepEyes.ResultLib`).
  - **Frontend**: `D:\Project\LandManagement\FE` (React, TypeScript, Ant Design, TanStack Query, Zustand, kiến trúc FSD).
