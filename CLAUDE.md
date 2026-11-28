# LandManagement

Hệ thống quản lý đất đai cấp xã. BE `BE/` (.NET 10, FastEndpoints, MediatR, EF Core Postgres), FE `FE/` (React 19, Vite, FSD, Zustand).

## Nguyên tắc làm việc

- **Copy trước, tự chế sau.** Việc gì đã có ở VBDT (`D:\cty\vbdt`) hoặc `D:\Project\ScheduleManagement` thì xem và copy/ghép hai bên trước.
- BE đơn giản, không DDD: entity POCO setter public, không UnitOfWork (DbContext đã là UoW), validator đặt file riêng, interface và implementation chung một file.
- Lỗi: `ErrorOr` + `ToMessageForUser()` + `ToResult()` của `ChienDeepEyes.ResultLib`; bắt lỗi toàn cục bằng `AddResultLibExceptionHandler`.
- FE: HTTP bằng `ky`, API sinh bằng `orval`, giữ kiến trúc FSD (`shared` không import ngược lên `entities`/`features`).
- Không ghi secret vào file commit; khóa S3/JWT lấy từ biến môi trường hoặc `appsettings.Development.json` (gitignore).

## Tham chiếu nhanh bằng CGC (CodeGraphContext)

Cần mẫu code chuẩn thì **tra bằng CGC trước, đọc file sau**: `find_code` (từ khóa, tên class/hàm; truyền `repo_path` để khỏi lẫn dự án khác) và `analyze_code_relationships` (ai gọi ai). Tìm đúng chỗ rồi mới `Read` file đó để chép.

| Cần gì | `repo_path` đã index | Dùng để |
|---|---|---|
| Pattern service, validator, auth, import/export Excel | `D:\Project\ScheduleManagement\BE` | Service trả `ErrorOr`, controller trả `Result`, request nằm ở `ViewModels`. |
| FE mẫu (orval, FSD, bảng, form) | `D:\Project\ScheduleManagement\FE`, `D:\cty\vbdt\app\fe\vbdt-fe` | Chép cấu trúc trang, hook, bảng. |
| BE nghiệp vụ lớn (hồ sơ, ký, phân quyền, storage S3) | `D:\cty\vbdt\app\be` | Mẫu thật đang chạy production. |
| API của ResultLib | `D:\Project\ResultLib` | Xem `Result`, `ToResult()`, `PaginationRequest`, `PagedResponse`, `PaginationRequestValidator`, `AuditableEntity`, worker nền **trước khi tự viết**. |

Ví dụ: `find_code("PaginationRequest", repo_path="D:\Project\ResultLib")`, `find_code("BulkDelete", repo_path="D:\Project\ScheduleManagement\BE")`.

- ResultLib đã có sẵn: phân trang (`PaginationRequest` + `PaginationRequestValidator<T>` + `PagedResponse<T>`), `ErrorOr<T>.ToResult()`, `AuditableEntity`, `IsEmpty()`/`IsNotEmpty()`. Dùng, không viết lại. `Result.Data` là `object?` nên Swagger không biết kiểu `data`: endpoint khai `Produces<ApiResult<T>>()`. `AddResultLibOpenApi()` chỉ đặt tên OperationId cho OpenAPI của controller, không dùng cho FastEndpoints.
- Dự án này chưa chắc đã được index. Chưa có thì chạy `add_code_to_graph` với đường dẫn `D:\Project\LandManagement` (`.cgcignore` ở gốc đã loại thư mục sinh tự động).
- Index cũ có thể lệch bản hiện tại: chép xong nhớ mở file thật để đối chiếu trước khi dán.

## Giao việc cho Antigravity (MCP `agy-bridge`)

Server `agy-bridge` (khai trong `.mcp.json`, gitignore) chạy `agy` local. Tool: `delegate`, `analyze_files`, `deep_search`, `adversarial_review`, `web_lookup`, `follow_up`.

- **Nên giao:** phân tích file lớn (>300 dòng), tìm context xuyên repo, đào git log/diff dài, đọc log to. Chỉ giao việc **đọc/phân tích**.
- **Không giao:** việc sửa code, chạy migration, đụng secret. `agy` chạy với `AGY_SKIP_PERMISSIONS=true` nên có thể sửa/xóa file không hỏi.
- Kết quả trả về là dữ liệu tham khảo, không phải kết luận: mở file thật đối chiếu trước khi dùng.
- Sau mỗi lần giao việc chạy `git status` để chắc `agy` không sửa gì ngoài ý muốn.
- Chưa dùng được nếu `agy` chưa đăng nhập hoặc server chưa được duyệt trong `/mcp`.
