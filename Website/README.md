# RoadWatch Admin

React admin dashboard for the RoadWatch full-stack platform (Spring Boot API, AI service, Android app).

## Project structure

```
src/
├── api/              # HTTP client & API calls
├── components/
│   ├── complaints/   # Complaint UI
│   ├── layout/       # Shell & auth guard
│   ├── map/          # Leaflet map
│   └── ui/           # Shared UI primitives
├── constants/        # Routes, config
├── context/          # Auth state
├── hooks/            # Data fetching hooks
├── pages/            # Route pages
├── types/
└── utils/
```

## Local development

1. Copy `.env.example` to `.env.local`
2. Start the backend on port `8080`
3. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:5173 — default login: `admin` / `admin123`

## Deploy to Vercel

| Setting | Value |
|---------|--------|
| Root Directory | `Website` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment | `VITE_API_BASE_URL` = your production API URL |

`vercel.json` includes SPA rewrites for React Router.

## Full stack (not hosted on Vercel)

| Service | Suggested host |
|---------|----------------|
| This admin UI | Vercel |
| Spring Boot API | Render / Railway |
| PostgreSQL | Neon / Supabase |
| AI (YOLO) | Render / GPU VPS |
| Android app | Play Store / APK |
