# LandManagement

Hệ thống quản lý đất đai cấp xã. BE `BE/` (.NET 10, FastEndpoints, MediatR, EF Core Postgres), FE `FE/` (React 19, Vite, FSD, Zustand).

## Nguyên tắc làm việc

- **Copy trước, tự chế sau.** Việc gì đã có ở VBDT (`D:\cty\vbdt`) hoặc `D:\Project\ScheduleManagement` thì xem và copy/ghép hai bên trước.
- BE đơn giản, không DDD: entity POCO setter public, không UnitOfWork (DbContext đã là UoW), validator đặt file riêng, interface và implementation chung một file.
- Lỗi: `ErrorOr` + `ToMessageForUser()` + `ToResult()` của `ChienDeepEyes.ResultLib`; bắt lỗi toàn cục bằng `AddResultLibExceptionHandler`.
- FE: HTTP bằng `ky`, API sinh bằng `orval`, giữ kiến trúc FSD (`shared` không import ngược lên `entities`/`features`).
- Không ghi secret vào file commit; khóa S3/JWT lấy từ biến môi trường hoặc `appsettings.Development.json` (gitignore).
