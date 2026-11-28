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
- [ ] Loại đất (cây 67 mục, seed từ `danh-muc-loai-dat.json`)
- [ ] Đối tượng sử dụng / được giao quản lý (18 mã, seed từ `danh-muc-doi-tuong.json`)

### Phase 2 – Kỳ kiểm kê và nhập số liệu
- [ ] Kỳ kiểm kê (ngày chốt, loại, trạng thái)
- [ ] Import B01 (diện tích)
- [ ] Import B02 (số lượng đối tượng)
- [ ] Import B05 (chu chuyển)
- [ ] Kiểm tra: tổng, cha–con, lệch so với file (dung sai 0,005 ha)

### Phase 3 – Báo cáo biểu kiểm kê
- [ ] Xem và xuất Excel B01
- [ ] Xem và xuất Excel B02
- [ ] Tính và xuất Excel B04 (cơ cấu, tính từ B01)
- [ ] Xem và xuất Excel B05
- [ ] Biểu 03, 06 (chờ file mẫu)

### Phase 4 – Dashboard
- [ ] Tổng diện tích, cơ cấu đất, % nông nghiệp / phi nông nghiệp
- [ ] Biến động giữa hai kỳ

## Mở rộng (cần xin thêm file mẫu)

### Phase 5 – Thửa đất
- [ ] Danh mục thửa, import Excel, cảnh báo thiếu dữ liệu

### Phase 6 – Hồ sơ GCN và biến động
- [ ] Trạng thái hồ sơ, lịch sử biến động thửa, tìm kiếm và lọc

### Phase 7 – Báo cáo định kỳ và mở rộng
- [ ] Báo cáo tháng / quý / năm
- [ ] Đa xã, cổng tra cứu cho dân

## Việc cần xin / chưa rõ
- [ ] Mẫu Biểu 03/TKKK và 06/TKKKQPAN
- [ ] Nội dung chú thích (1), (2) trong tiêu đề các biểu
- [ ] File Excel mẫu: thửa đất, hồ sơ GCN, biến động
