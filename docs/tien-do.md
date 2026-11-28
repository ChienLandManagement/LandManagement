# Tiến độ LandManagement

Cập nhật khi xong từng mục. Đặc tả nghiệp vụ: [dac-ta-yeu-cau.md](dac-ta-yeu-cau.md). Dữ liệu mẫu thật: `docs/data/`.

Quy ước: `[x]` xong, `[~]` đang làm, `[ ]` chưa làm.

## MVP

### Phase 0 – Nền tảng
- [x] Đăng nhập, refresh token, log đăng nhập
- [x] Seed tài khoản admin đầu tiên
- [x] Deploy BE (Heroku container), FE (Vercel)
- [x] Người dùng BE: danh sách/tìm kiếm, tạo, sửa, khóa/mở khóa, đặt lại mật khẩu, xóa mềm, tự đổi mật khẩu (chưa có test, chưa chạy thử trên DB)
- [ ] Người dùng FE: màn quản lý user, đổi mật khẩu
- [~] Gán user với xã/phường (BE xong, FE chờ)
- [~] Địa giới hành chính 2 cấp Tỉnh → Xã/Phường (BE xong, FE đang chuyển theo mẫu VBDT; không seed, Admin tự nhập)

### Phase 1 – Danh mục
- [x] Loại đất `LandType` (cây 67 mục, seed từ JSON; cờ B02/B05 và dòng "Trong đó" `IsMemo` cho `RSN`; Admin quản lý, vai trò khác chỉ xem)
- [x] Đối tượng sử dụng / được giao quản lý `LandHolderType` (18 mã: 14 người sử dụng + 4 người được giao quản lý, seed từ JSON)

### Phase 2 – Kỳ kiểm kê và số liệu (cách A: ghi biến động theo tổng, chưa có thửa đất)
- [x] Kỳ kiểm kê (xã, ngày chốt, loại 5 năm/hằng năm, khóa/mở khóa), cán bộ chỉ thấy xã mình
- [x] Ghi biến động (loại đất cũ → mới, diện tích ha, đối tượng; tăng khác/giảm khác)
- [x] Lưới số liệu B01 (diện tích) và B02 (số lượng) theo ô lá, dòng cha và tổng tự tính
- [x] Import Excel B01, B02, B05 (B05 thành biến động nguồn Import)
- [x] Khởi tạo số liệu kỳ từ kỳ trước và áp biến động
- [x] Kiểm tra: lệch so với kỳ trước cộng biến động (dung sai 0,005 ha), diện tích và số lượng chưa khớp
- [ ] Chưa làm: biến động theo loại đất tổng hợp ở B01 (vd LUA) chưa tự phân bổ xuống LUC/LUK

### Phase 3 – Báo cáo biểu kiểm kê
- [x] Xuất Excel B01, B02, B04 (cơ cấu), B05 (chu chuyển) một file theo kỳ: nút "Xuất Excel" ở trang kỳ (chưa có màn xem riêng, chưa khớp định dạng mẫu chính thức)
- [ ] Biểu 03, 06 (chờ file mẫu)

### Phase 4 – Dashboard
- [x] Tổng diện tích, cơ cấu đất, % nông nghiệp / phi nông nghiệp (trang Tổng quan, theo kỳ)
- [~] Biến động giữa hai kỳ: hiện chỉ hiện biến động ròng trong kỳ và chênh tổng diện tích so với kỳ trước

## Mở rộng (cần xin thêm file mẫu)

### Phase 5 – Thửa đất
- [x] Danh mục thửa (thêm, sửa, xóa, tìm, lọc), cảnh báo thiếu người sử dụng / đối tượng / địa chỉ
- [ ] Import Excel thửa (chờ file mẫu)

### Phase 6 – Hồ sơ GCN và biến động
- [x] Lý do cho tăng khác / giảm khác (đo đạc lại, sửa sai, lấn biển, sạt lở, địa giới, khác có nhập chữ); bắt buộc khi nhập tay, dòng nhập từ Excel B05 chưa có lý do. Sai thì sửa hoặc xóa khi kỳ chưa khóa (xóa mềm, giữ vết trong DB)
- [ ] Nhật ký sửa ô lưới B01 (ai sửa, giá trị cũ và mới); địa giới (sáp nhập, chia tách xã) chưa có
- [ ] Trạng thái hồ sơ, lịch sử biến động thửa, tìm kiếm và lọc

### Phase 7 – Báo cáo định kỳ và mở rộng
- [ ] Báo cáo tháng / quý / năm
- [ ] Đa xã, cổng tra cứu cho dân

## Việc cần xin / chưa rõ
- [ ] Mẫu Biểu 03/TKKK và 06/TKKKQPAN
- [ ] Nội dung chú thích (1), (2) trong tiêu đề các biểu
- [ ] File Excel mẫu: thửa đất, hồ sơ GCN, biến động

## Phân quyền theo xã
- [x] Một tài khoản gán được nhiều xã/phường (bảng `user_wards`); Admin thấy tất cả. Tạo kỳ / thửa: nhiều xã thì phải chọn xã, một xã thì tự lấy.
