# LandManagement Backend

Hệ thống quản lý đất đai — Backend API (.NET 10)

## Tech Stack

- **Runtime**: .NET 10 (net10.0)
- **Web Framework**: FastEndpoints 8.2.0
- **CQRS**: MediatR 14.2.0
- **ORM**: Entity Framework Core 10 + Npgsql
- **Database**: PostgreSQL 16
- **Cache**: FusionCache + Redis
- **Auth**: JWT Bearer + Google OAuth
- **File Storage**: SeaweedFS (S3-compatible)

## Yêu cầu

- [.NET SDK 10.0.302](https://dotnet.microsoft.com/download/dotnet/10.0)
- NuGet source `ResultLib` local: `D:\Project\ResultLib\nupkg`

## Cấu trúc

```
├── Api/              # Presentation — FastEndpoints
├── Application/      # Use cases — CQRS Handlers
├── Domain/           # Entities, ValueObjects, Interfaces
├── Infrastructure/   # EF Core, Redis, S3, Email...
├── docs/             # Tài liệu
└── LandManagement_BE.sln
```

## Khởi chạy

### 1. Database migration

```bash
dotnet ef database update --project Infrastructure --startup-project Api
```

### 3. Run

```bash
dotnet run --project Api
```

API tại: `http://localhost:5155` | Swagger: `http://localhost:5155/swagger`

## Scripts hữu ích

| Command | Mô tả |
|---------|-------|
| `dotnet build` | Build toàn bộ solution |
| `dotnet test` | Chạy tests |
| `dotnet ef migrations add <Name>` | Tạo migration mới |
| `dotnet ef database update` | Apply migration |
| `dotnet run --project Api` | Chạy API |

## Packages

Xem chi tiết trong file `architect.md`.

## CI/CD

Deploy lên Heroku (app `land-management`) từ nhánh `main`; cấu hình qua biến môi trường Heroku.

## GitLab

- Repository: `https://gitlab.com/land-management/landmanagement_be.git`
- Branch: `main`
