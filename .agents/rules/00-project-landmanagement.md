---
trigger: always_on
---

# Dự án LandManagement

## Tổng quan
- Tên: LandManagement — hệ thống quản lý đất đai cấp xã.
- Stack: BE .NET 10 + FastEndpoints + MediatR + EF Core/Postgres · FE React 19 + Vite + TS + Mantine + Zustand + orval, kiến trúc FSD (không còn shadcn/Tailwind/motion).
- Ưu tiên dùng tối đa hệ sinh thái Mantine (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/modals`, `@mantine/dates`, `@mantine/charts`, `@mantine/dropzone`, `@mantine/spotlight`, `@mantine/nprogress`, `@mantine/tiptap`, `@mantine/lightbox`, `@mantine/carousel`, `Transition` cho animation) kết hợp mượt mà với nhà TanStack (`@tanstack/react-router`, `@tanstack/react-query`, `mantine-datatable`), `react-hook-form` + `zod` cho form, `date-fns` cho ngày tháng, `orval` cho API; hạn chế tối đa viết CSS/JS thủ công hoặc cài thêm thư viện ngoài.
- Thêm module/menu/trang danh sách FE: thêm 1 dòng vào `FE/src/widgets/layout-admin/model/menuConfig.ts`, thêm route con trong `adminLayoutRoute` (`FE/src/app/routes.tsx`), dùng `ListPageLayout` (`@/shared/ui/templates`) + `DataTable` (`@/shared/ui/data-table`).
- Lỗi BE: `ErrorOr` + `ToMessageForUser()` + `ToResult()` của `ChienDeepEyes.ResultLib`.
- Quy ước chi tiết: `CLAUDE.md` ở gốc repo. Tài liệu: `docs/`.

## Cấu trúc repo
- BE: `BE/` · FE: `FE/` (cùng một repo).

## CodeGraphContext 
- Chỉ dùng `codegraphcontext` (`find_code`, `analyze_code_relationships`…), không dùng MCP `codegraph`.
- BE → không tham số; FE → truyền `projectPath: "FE"`.
- Đồ thị rỗng → kiểm tra lại tham số trước khi kết luận code không tồn tại.

## Verify
- BE: `dotnet build BE/LandManagement.slnx` rồi `dotnet test` (nếu đã có project test).
- FE: `pnpm -C FE typecheck` · `pnpm -C FE build` (lệnh thật theo `FE/package.json`).
- Chưa có CI → xanh ở máy là bằng chứng duy nhất; báo rõ phần chưa kiểm.

## Commit
- Tiếng Việt, tiền tố Conventional Commits (`feat:`, `fix:`…).
