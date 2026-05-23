# RoadWatch

Full-stack road damage reporting: Android app → Spring Boot API → YOLO AI → PostgreSQL → Admin dashboard.

## Repository structure

```
RoadWatch-App-1/
├── ai_service/      # Python FastAPI + YOLO model (best.pt)
├── backend/         # Spring Boot REST API
├── Website/         # React admin dashboard (Vercel)
└── docker-compose.yml
```

## Quick start (Docker)

Requires Docker Desktop on a supported Windows/Mac/Linux host.

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8080 |
| AI service | http://localhost:8000 |
| Admin UI | `cd Website && npm install && npm run dev` → http://localhost:5173 |

Default admin login: `admin` / `admin123`

## Deploy admin UI (Vercel)

1. Push this repo to GitHub
2. Import on Vercel — **Root Directory:** `Website`
3. Set env: `VITE_API_BASE_URL` = your production API URL
4. Build: `npm run build` · Output: `dist`

See [Website/README.md](Website/README.md) for details.

## Production stack

| Component | Suggested host |
|-----------|----------------|
| Admin UI | Vercel |
| API | Render / Railway |
| Database | Neon / Supabase (PostgreSQL) |
| AI | Render / GPU server |

## Environment variables for Render

The backend requires the following production variables in Render or your hosting environment:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `AI_SERVICE_URL`
- `ROADWATCH_UPLOADS_DIR`
- `ROADWATCH_PUBLIC_BASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`

For development, use `docker-compose.yml` or `.env.example`.

## License

See [LICENSE](LICENSE).
