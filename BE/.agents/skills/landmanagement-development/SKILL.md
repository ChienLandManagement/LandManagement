---
name: landmanagement-backend-development
description: Clean Architecture ASP.NET Core backend for LandManagement
---

# LandManagement Backend Development

## Solution Layout

| Project | Role |
|---------|------|
| `Domain` | Entities, aggregates, enums, value objects |
| `Application` | MediatR commands/queries, validators, interfaces |
| `Infrastructure` | EF Core AppDbContext, repositories, services |
| `Api` | FastEndpoints, Swagger, DI bootstrap |

## Conventions

- Use **FastEndpoints** (`Endpoint<TRequest, TResponse>` or `EndpointWithoutRequest`)
- CQRS with MediatR: `*Command` / `*Query` + `*Handler` + `*Validator`
- Return `ErrorOr<T>` from handlers, map via ResultLib
- Soft delete on `ISoftDelete` entities
- PostgreSQL via EF Core + Npgsql

## Verify locally
```powershell
dotnet build
dotnet run --project Api
```
