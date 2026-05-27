# RoadWatch

Full-stack road damage reporting: Android app → Spring Boot API → YOLO AI → PostgreSQL → Admin dashboard.

## Repository structure

```
RoadWatch/
├── ai_service/       # Python FastAPI + YOLO model (best.pt)
├── backend/          # Spring Boot REST API
├── Website/          # React admin dashboard (deployed to Vercel)
├── docker-compose.yml
└── vercel.json       # Tells Vercel to build Website/ from the repo root
```

## Quick start (Docker)

Requires Docker on a supported Windows / Mac / Linux host.

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8080 |
| AI service | http://localhost:8000 |
| Admin UI (dev) | `cd Website && npm install && npm run dev` → http://localhost:5173 |

Default admin login: `admin` / `admin123`.

## Deploy admin UI (Vercel)

The root `vercel.json` configures Vercel to build the React app inside `Website/` and serve `Website/dist` with SPA rewrites for React Router. No Vercel UI customization is required.

1. Push this repo to GitHub.
2. Import on Vercel — keep **Root Directory** as repo root (default).
3. Add a Project Environment Variable: `VITE_API_BASE_URL` = your AWS EC2 API URL (e.g. `https://api.your-domain.com`).
4. Deploy.

If you prefer the per-folder approach: set Vercel **Root Directory** to `Website`. Both modes are supported and produce identical output.

See [Website/README.md](Website/README.md) for full details.

## Production stack

| Component | Host |
|-----------|------|
| Admin UI | Vercel |
| API | AWS EC2 (Spring Boot) |
| Database | AWS RDS / Neon / Supabase (PostgreSQL) |
| AI | HuggingFace Spaces |

> Remember: the Spring Boot API on EC2 must include the Vercel domain in `CORS_ALLOWED_ORIGINS`.

## Environment variables for AWS EC2 Backend

The backend requires the following production variables on the AWS EC2 instance:

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
