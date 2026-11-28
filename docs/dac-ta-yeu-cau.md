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
  - **Báo cáo kiểm kê đất đai** — xuất đúng các biểu `01/TKKK`, `02/TKKK`, `04/TKKK`, `05/TKKK` (và `03/TKKK`, `06/TKKKQPAN` khi có mẫu) của Thông tư 08/2024/TT-BTNMT, chi tiết ở **mục 5**.
- Khi dữ liệu thửa đất hoặc biến động được cập nhật, số liệu trên các bảng biểu báo cáo tự động cập nhật theo (không phải cộng tay lại).

---

## 4. Yêu cầu phi chức năng & Định hướng kỹ thuật

- **Độ chính xác số liệu**: Tổng diện tích các loại đất phải khớp với tổng diện tích tự nhiên; lịch sử biến động không ghi đè mất dữ liệu gốc.
- **Dễ sử dụng**: Giao diện đơn giản, quen thuộc với cán bộ cấp xã (hỗ trợ tải file Excel mẫu, import nhanh, lọc/tìm kiếm trực quan).
- **Khả năng nhân rộng**: Thiết kế dữ liệu gắn với **Đơn vị hành chính (Xã/Phường)** để sau này có thể triển khai cho nhiều xã hoặc cấp Phòng/Văn phòng Đăng ký đất đai xem tổng hợp.
- **Kiến trúc triển khai**:
  - **Backend**: `BE/` (.NET 10, FastEndpoints, MediatR, EF Core Postgres, `ChienDeepEyes.ResultLib`; entity POCO, không DDD).
  - **Frontend**: `FE/` (React 19, Vite, Zustand, `ky` + `orval`, kiến trúc FSD).

---

## 5. Chuẩn biểu thống kê, kiểm kê đất đai (Thông tư 08/2024/TT-BTNMT)

> **Nguồn**: `docs/Phuluc.xls` – Phụ lục I, số liệu thật xã **Văn Lang, tỉnh Thái Nguyên**, đến **31/12/2024** (chu chuyển 31/12/2019 → 31/12/2024). Toàn bộ số liệu của từng sheet đã được trích nguyên văn (không làm tròn, không bỏ ô) sang `docs/data/*.json` để dùng làm seed và dữ liệu test.

### 5.1. Dữ liệu đã trích (`docs/data/`)

| File | Nguồn (sheet) | Nội dung |
|---|---|---|
| `pl-i-danh-muc-bieu.json` | `PL-I-DMBiểu` | Danh mục 6 biểu của Phụ lục I (01–05/TKKK, 06/TKKKQPAN). |
| `danh-muc-loai-dat.json` | `B01-TKKK` | Cây loại đất: STT, mã, tên, mã cha; cờ có mặt trong Biểu 02 / Biểu 05. 67 mục = 3 nhóm + 64 loại. |
| `danh-muc-doi-tuong.json` | `B01`, `B02`, `B04` | 18 mã đối tượng (14 nhóm sử dụng + 4 nhóm quản lý), có mã cha. |
| `b01-dien-tich.json` | `B01-TKKK` | Diện tích (ha) theo loại đất × đối tượng. 1 dòng tổng + 67 dòng loại đất. |
| `b02-so-luong-doi-tuong.json` | `B02-TKKKNSDĐất` | Số lượng người sử dụng / được giao quản lý. 1 dòng tổng + 58 dòng. |
| `b04-co-cau.json` | `B04-CCau` | Diện tích (ha) và cơ cấu (%) cho 17 nhóm cột (tổng + 16 đối tượng). 1 dòng tổng + 67 dòng. |
| `b05-chu-chuyen.json` | `B05-CChuyen` | Ma trận 52 × 52 (loại đất 2019 → 2024) + cột *Giảm khác* + hàng *Tăng khác* + hàng diện tích 2024. |

Hai sheet ẩn `00000000`, `10000000` rỗng (do phần mềm kết xuất), bỏ qua. Biểu `03/TKKK` (theo đơn vị hành chính) và `06/TKKKQPAN` (đất quốc phòng, an ninh) **chỉ có tên trong mục lục, file mẫu chưa có nội dung** → cần xin mẫu trước khi làm.

### 5.2. Danh mục loại đất (cây 3 cấp, mã chuẩn)

- **3 nhóm**: `NNP` Nông nghiệp, `PNN` Phi nông nghiệp, `CSD` Chưa sử dụng.
- Cây cha–con lấy từ cột STT: ví dụ `CHN > LUA > (LUC, LUK)`, `CHN > HNK`, `LNP > (RDD, RPH, RSX)`, `OTC > (ONT, ODT)`, `CQA > (CQP, CAN)`, `DSN > (DVH … DSK)`, `CSK > (SCC > (SKK, SKN, SCT), TMD, SKC, SKS)`, `CCC > (DGT … DKV)`, `TVC > (MNC, SON)`.
- `RSN` (đất rừng sản xuất là rừng tự nhiên) là dòng **"Trong đó"** của `RSX`: chỉ để theo dõi, **không cộng vào tổng** của cha.
- Mỗi biểu dùng một mức chi tiết khác nhau (xem 5.4). Danh mục phải lưu **cả cây** và đánh dấu mức nào dùng ở biểu nào.
- STT trong file Excel bị Excel biến `4.10` thành `4.1`, `6.10` thành `6.1`; bản JSON đã sửa lại đúng (`4.10` = `DSK`, `6.10` = `DKV`).

### 5.3. Danh mục đối tượng

| Nhóm | Mã (cha → con) |
|---|---|
| **Đối tượng sử dụng đất** | `CNC` Cá nhân trong nước, người VN định cư ở nước ngoài → `CNV` Cá nhân trong nước, `CNN` Người VN định cư ở nước ngoài |
| | `TCC` Tổ chức trong nước → `TCN` Cơ quan nhà nước/đảng/vũ trang, `TSN` Đơn vị sự nghiệp công lập, `TXH` Tổ chức xã hội, `TKT` Tổ chức kinh tế, `TKH` Tổ chức khác |
| | `TTG` Tổ chức tôn giáo, `CDS` Cộng đồng dân cư, `TNG` Tổ chức nước ngoài có chức năng ngoại giao, `NGV` Người gốc VN định cư ở nước ngoài, `TVN` Tổ chức kinh tế có vốn đầu tư nước ngoài |
| **Đối tượng được giao quản lý đất** | `TCQ` Cơ quan nhà nước/đảng/vũ trang, `TSQ` Đơn vị sự nghiệp công lập, `KTQ` Tổ chức kinh tế, `CDQ` Cộng đồng dân cư |

Cột lá (có số liệu) của B01/B02/B04: `CNV, CNN, TCN, TSN, TXH, TKT, TKH, TTG, CDS, TNG, NGV, TVN` (12 cột sử dụng) và `TCQ, TSQ, KTQ, CDQ` (4 cột quản lý). `CNC`, `TCC` chỉ là tiêu đề gộp, **tính ra, không lưu**.

### 5.4. Cấu trúc và công thức từng biểu

**Biểu 01/TKKK – Diện tích (ha)**
- Dòng: tổng diện tích + 67 loại đất (đủ cả nhóm, nhóm trung gian, `LUC`, `LUK`, `RSN`).
- Cột: (4) Tổng diện tích của đơn vị hành chính = (5) + (18); (5) Tổng đối tượng sử dụng = (6) + … + (17), gồm 12 cột lá; (18) Tổng đối tượng được giao quản lý = (19) + … + (22), gồm 4 cột lá.
- Dòng cha = tổng các dòng con; dòng tổng = `NNP` + `PNN` + `CSD`.
- Ô không có số liệu để **trống** (khác với `0`: file mẫu chỉ ghi `0` ở cột tổng và dòng cha/dòng tổng).
- Chân biểu: Người lập biểu, Phòng Kinh tế, TM. UBND xã (ký tên, đóng dấu), ngày tháng năm.

**Biểu 02/TKKK – Số lượng đối tượng (người)**
- Mức chi tiết **khác Biểu 01**: 3 nhóm + 55 dòng, không có nhóm trung gian `CHN`, `LNP`, `OTC`, `CQA`, `SCC`, `TVC`, không có `LUC`/`LUK`/`RSN`. `LUA`, `HNK`, `CLN`… đứng riêng; `ONT`, `ODT`, `CQP`, `CAN` đứng riêng; `SKK`, `SKN`, `SCT` là 7.1–7.3; `MNC`, `SON` là 12, 13.
- Dòng nhóm trung gian còn lại (`DSN`, `CSK`, `CCC`) là tổng các dòng con.
- Cột: (4) = (5) + …, 16 cột lá như Biểu 01. Đây là số **đối tượng**, một người dùng nhiều loại đất được đếm ở mỗi loại nên **không** cộng dọc để ra số người duy nhất.

**Biểu 04/TKKK – Cơ cấu**
- Cùng các dòng như Biểu 01 (1 dòng tổng + 67 loại đất). Mỗi nhóm cột có 2 giá trị: **Diện tích (ha)** và **Cơ cấu (%)**; 17 nhóm: tổng + 12 cột sử dụng + 4 cột quản lý (cột tổng + `CNV` … `CDQ`).
- Diện tích lấy nguyên từ Biểu 01 (đã đối chiếu khớp 100%).
- Cơ cấu cột **Tổng**: diện tích loại đất / tổng diện tích xã × 100.
- Cơ cấu cột **đối tượng**: diện tích của đối tượng đó trong loại đất / tổng diện tích loại đất đó × 100 (ví dụ `LUA`: `CNV` 99,844%, `CDQ` 0%). Tức mỗi dòng cộng các đối tượng ra 100%.
- Ô cơ cấu để trống khi diện tích loại đất bằng 0 (chia cho 0).
- Số liệu này **tính ra từ Biểu 01**, không nhập tay.

**Biểu 05/TKKK – Chu chuyển diện tích 2019 → 2024**
- Hàng = loại đất kỳ trước, cột = loại đất kỳ sau, **52 loại** (loại dùng ở Biểu 05: bỏ 9 nhóm trung gian `CHN`, `LNP`, `OTC`, `CQA`, `DSN`, `CSK`, `SCC`, `CCC`, `TVC`, bỏ `LUC`, `LUK`, `RSN`, bỏ 3 nhóm; có `LUA`).
- Cột thêm: **Năm 2019** (tổng hàng = diện tích kỳ trước) và **Giảm khác (2)**; hàng thêm: **Tăng khác (2)** và **Diện tích năm 2024**.
- Hàng: `Năm 2019` = Σ chuyển sang các loại + `Giảm khác`.
- Cột: `Diện tích 2024` của loại = Σ cột (từ các loại 2019, gồm đường chéo giữ nguyên) + `Tăng khác`.
- Đường chéo = diện tích giữ nguyên loại. Ô có số ngoài đường chéo = có chuyển mục đích. File mẫu có 190 ô không trống trong ma trận (gồm cả các ô `0` trên đường chéo).
- `Giảm khác` / `Tăng khác`: phần diện tích ra/vào ngoài danh sách loại (do đo đạc lại, điều chỉnh ranh giới hành chính, kỳ trước thiếu số liệu…).
- Số liệu thật: Σ 2019 = **17.129,23 ha**; 2024 = **17.159,33 ha**; chênh +30,10 ha = Tăng khác 34,1054 − Giảm khác 3,99204. Tăng khác: `LUA` 0,70646; `HNK` 0,76859; `CLN` 0,59017; `RDD` 25,00797; `NTS` 0,22506; `TSC` 0,00405; `CAN` 0,00091; `SKS` 0,00487; `SON` 6,79732. Giảm khác: `RSX` 1,38713; `ONT` 1,02141; `DGT` 1,29018; `DTL` 0,17429; `BCS` 0,0907; `NTD` 0,0158; còn lại ≤ 0,01 (toàn bộ nằm trong `b05-chu-chuyen.json`).
- Đây chính là **dữ liệu biến động đất đai theo kỳ kiểm kê** của phân hệ 2, tính từ hai kỳ kiểm kê chứ không nhập tay.

### 5.5. Quy tắc kiểm tra (đã kiểm chứng trên số liệu thật)

Chạy trên toàn bộ file mẫu, **tất cả đều khớp** (sai số ≤ 0,005 ha do làm tròn):
1. B01: tổng dòng = Σ cột lá; (4) = (5) + (18); dòng cha = Σ con; dòng tổng = `NNP` + `PNN` + `CSD` = **17.159,33 ha** (= `NNP` 16.709,41 + `PNN` 345,43 + `CSD` 104,49).
2. B02: mỗi dòng tổng = Σ cột lá (5.801 = 5.651 + 16 + 17 + 15 + 1 + 101).
3. B04 diện tích = B01; B04 cơ cấu = diện tích / mẫu số × 100 (sai số ≤ 0,01%).
4. B05: mỗi hàng khớp diện tích 2019; mỗi cột + Tăng khác = diện tích 2024; diện tích 2024 mỗi loại = B01.
- Lưu ý: diện tích tổng của các **nhóm** (`NNP`, `PNN`, `CSD`) trong file mẫu đã **làm tròn 2 số lẻ** nên chênh tối đa 0,005 so với Σ chi tiết → so sánh khi kiểm tra phải có dung sai 0,005 ha (hoặc lưu thô, làm tròn khi hiển thị).
- Lưu giá trị gốc kiểu `numeric` (không dùng `float`), hiển thị làm tròn theo biểu (diện tích 2 số lẻ, hoặc 5 số lẻ như bản gốc, cơ cấu 2 số lẻ).

### 5.6. Điểm lưu ý / lệch trong file mẫu

- **B02 nhãn cột**: cột `NGV` bị ghi là "Người gốc Việt Nam định cư ở nước ngoài **(CNN)**" (trùng mã `CNN`); dữ liệu và thứ tự khớp Biểu 01 nên hiểu là `NGV`.
- **B05 ô tổng nằm lệch cột**: ở hàng *Tăng khác* và *Diện tích năm 2024*, tổng (17.129,23 và 17.159,33) nằm ở cột **Mã** thay vì cột "Năm 2019". Khi import cần xử lý riêng hai hàng này (đã lưu vào `tangKhac.cot2` và `dienTich2024.cot2`).
- Tên đơn vị và ngày ở đầu/chân biểu (xã Văn Lang, tỉnh Thái Nguyên, "Đến ngày 31/12/2024", Phòng Kinh tế, ngày ký 2025) là **tham số đơn vị hành chính và kỳ báo cáo**, không hard-code.
- Ghi chú (1), (2) trong tiêu đề: file mẫu chưa kèm nội dung chú thích, cần xin lại bản gốc của Thông tư.

### 5.7. Mô hình dữ liệu gợi ý

| Bảng | Khóa / trường chính | Ghi chú |
|---|---|---|
| `DonViHanhChinh` | Id, Ma, Ten, Cap (Xã/Huyện/Tỉnh), CapChaId | Đa đơn vị (mục 4). |
| `KyKiemKe` | Id, DonViHanhChinhId, NgayChot, Loai (Thống kê / Kiểm kê), TrangThai | Ví dụ 31/12/2019, 31/12/2024. |
| `LoaiDat` | Ma (PK), Ten, MaCha, Stt, LaDongTrongDo | Seed từ `danh-muc-loai-dat.json`. |
| `DoiTuong` | Ma (PK), Ten, MaCha, Nhom (SuDung / QuanLy) | Seed từ `danh-muc-doi-tuong.json`. |
| `DienTichKiemKe` | KyKiemKeId, MaLoaiDat, MaDoiTuong, DienTich `numeric` | Chỉ lưu **ô lá**; dòng cha, tổng, cơ cấu % tính ra. Nguồn của B01, B04. |
| `SoLuongDoiTuongKiemKe` | KyKiemKeId, MaLoaiDat, MaDoiTuong, SoLuong `int` | Nguồn của B02. |
| `ChuyenDatKiemKe` | KyTruocId, KySauId, MaLoaiTu, MaLoaiDen, DienTich | Nguồn của B05; `MaLoaiTu`/`MaLoaiDen` nhận thêm giá trị đặc biệt `GIAM_KHAC`, `TANG_KHAC`. |

- Nhập liệu: import từ chính file `Phuluc.xls` (từng biểu), lưu ô lá, rồi tính lại biểu cha và cột tổng để đối chiếu với số trong file (phát hiện lệch).
- Xuất báo cáo: dựng lại biểu theo mẫu (tiêu đề, cột, công thức), điền đơn vị hành chính và kỳ báo cáo.
- Dashboard (phân hệ 3): "Tổng diện tích", "Cơ cấu đất", "% nông nghiệp / phi nông nghiệp" lấy từ `DienTichKiemKe` của kỳ mới nhất (xã Văn Lang: tổng 17.159,33 ha; `NNP` 97,38%, `PNN` 2,01%, `CSD` 0,61%).
