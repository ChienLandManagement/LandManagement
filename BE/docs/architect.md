# LandManagement BE — Kiến trúc tổng quan

## Tech Stack
- **Runtime**: .NET 10 (net10.0) — SDK 10.0.302
- **Web Framework**: FastEndpoints 8.2.0 (endpoint-first, thay thế Controller)
- **CQRS**: MediatR 14.2.0 (Command/Query/Handler pattern)
- **ORM**: Entity Framework Core 10.0.10 + Npgsql 10.0.0
- **Database**: PostgreSQL 16 (snake_case naming qua `EFCore.NamingConventions` 10.0.1)
- **Cache**: FusionCache 11.1.0 + Redis (StackExchange.Redis)
- **Auth**: JWT Bearer + Google OAuth
- **Validation**: FastEndpoints.Validation (FluentValidation built-in)
- **Result Pattern**: `ChienDeepEyes.ResultLib` 2.1.1 (NuGet local)
- **Swagger**: FastEndpoints.Swagger 8.2.0 (Scalar UI)
- **File Storage**: SeaweedFS via S3-compatible API (AWSSDK.S3)

## Solution Structure (4-layer)

```
LandManagement_BE/
├── Api/                          # Presentation layer
│   ├── Endpoints/                # FastEndpoints (module-based)
│   ├── Middlewares/               # Custom middleware (exception, logging...)
│   ├── Extensions/               # DI registration, pipeline config
│   ├── Properties/
│   │   └── launchSettings.json
│   └── Program.cs
│
├── Application/                  # Use cases / business logic
│   ├── Behaviors/                # MediatR pipelines (logging, validation, transaction)
│   ├── Common/                   # Shared DTOs, interfaces, helpers
│   ├── Features/[Module]/        # Feature modules
│   │   ├── Commands/
│   │   ├── Queries/
│   │   └── Validators/
│   └── DependencyInjection.cs
│
├── Domain/                       # Enterprise business rules
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   ├── Events/                   # Domain events
│   ├── Interfaces/               # Repository interfaces
│   └── Exceptions/
│
├── Infrastructure/               # External concerns
│   ├── Persistence/              # AppDbContext, migrations, repos
│   ├── Services/                 # Email, S3, Auth implementations
│   ├── BackgroundJobs/           # Hangfire/Quartz jobs (future)
│   └── DependencyInjection.cs
│
├── docs/
│   └── architect.md
├── LandManagement_BE.sln
├── Dockerfile
└── .gitlab-ci.yml
```

## Request Flow

```
HTTP Request
  → FastEndpoints Endpoint
    → MediatR Send(Command/Query)
      → Pipeline Behaviors (validation → transaction → logging)
        → Handler (use case logic)
          → Domain Services / Infra Services
            → EF Core / Redis / S3 / Email
  → Response (Result<T> pattern)
```

## Database

### Naming
- Tables: snake_case, plural (`land_parcels`, `users`)
- Columns: snake_case (`created_at`, `full_name`)
- PK: `id` (bigint identity)
- Timestamps: `created_at`, `updated_at`, `deleted_at` (UTC)
- Soft delete: global query filter (`IsDeleted`)

### Key Tables (planned)
- `users` — authentication & profile
- `land_parcels` — thửa đất
- `land_parcel_histories` — lịch sử biến động
- `land_uses` — mục đích sử dụng đất
- `zoning_plans` — quy hoạch
- `documents` — tài liệu / file đính kèm
- `audit_logs` — trace thay đổi dữ liệu (future)

## Infrastructure Services

| Service | Implementation | Notes |
|---------|---------------|-------|
| Email | MailKit via `IEmailService` | SMTP configurable |
| File Storage | SeaweedFS S3 via `IFileStorageService` | Bucket `landmanagement` |
| Auth | JWT + Google (`IGoogleAuthService`) | Placeholder |
| Password | BCrypt via `IPasswordHasher` | BCrypt.Net-Next |
| Cache | FusionCache + Redis | Distributed + L1 |
| Database | EF Core + Npgsql | Snake_case naming |

## CQRS Conventions

- **Command**: `CreateXCommand` → handler trả về `Result<XId>`
- **Query**: `GetXQuery` → handler trả về `Result<XDto>`
- **Delete**: soft delete (cập nhật `IsDeleted`)
- **Update**: patch-style (chỉ gửi fields thay đổi)
- **Validator**: FluentValidation đi kèm mỗi Command/Query
- **Pagination**: `OffsetPaginationQuery` — `Offset`, `Limit`, `Search`, `SortBy`, `SortDir`

## DI Registration

Mỗi layer tự đăng ký qua phương thức mở rộng `Add{Layer}()`:
- **Domain**: không có DI
- **Application**: MediatR, Behaviors, validators, AutoMapper (nếu có)
- **Infrastructure**: DbContext, Redis, services (Email, S3, Auth...)
- **Api**: FastEndpoints, Swagger, auth, CORS, health checks
