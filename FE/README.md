# LandManagement Frontend

Hệ thống quản lý đất đai — Frontend (React 19 + TypeScript)

## Tech Stack

- **Framework**: React 19.2.8 + TypeScript 5.9.3
- **Build Tool**: Vite 8.1.5
- **Routing**: TanStack Router 1.170.18
- **Data Fetching**: TanStack Query 5.101.4 + Axios 1.18.1
- **State Management**: Zustand 5.0.14
- **Styling**: Tailwind CSS 3.4.17 + Shadcn UI
- **Forms**: React Hook Form 7.55.0 + Zod 3.24.1
- **Icons**: Lucide React 1.27.0
- **Lint/Format**: Biome 1.9.4
- **Package Manager**: pnpm

## Yêu cầu

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9

## Cấu trúc

```
src/
├── api/          # Axios client + API calls
├── app/          # App root (providers, router, routes)
├── auth/         # Authentication
├── components/   # Shadcn UI components
├── config/       # Environment config
├── constants/    # App constants
├── hooks/        # Custom hooks
├── lib/          # Utility wrappers
├── store/        # Zustand stores
├── types/        # TypeScript types
├── ui/pages/     # Feature pages
├── utils/        # Pure utilities
├── styles/       # Global styles
└── main.tsx      # Entry point
```

## Khởi chạy

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run dev server

```bash
pnpm dev
```

Dev server tại: `http://localhost:5173` (proxy `/api/` → backend)

### 3. Build production

```bash
pnpm build
```

Output: `dist/`

## Scripts

| Command        | Mô tả                                      |
| -------------- | ------------------------------------------ |
| `pnpm dev`     | Dev server                                 |
| `pnpm build`   | Build production (type check + vite build) |
| `pnpm preview` | Preview production build                   |
| `pnpm lint`    | Biome lint                                 |
| `pnpm format`  | Biome format                               |

## Environment

Tạo file `.env`:

```
VITE_API_URL=http://localhost:5155
```

## CI/CD

Deploy lên Vercel (project `land-management`); `vercel.json` rewrite `/api/*` sang Heroku nên FE không cần `VITE_API_URL` khi chạy production.

## GitLab

- Repository: `https://gitlab.com/land-management/landmanagement_fe.git`
- Branch: `main`
