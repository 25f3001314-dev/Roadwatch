# RoadWatch 🛣️

Citizen-driven road infrastructure reporting for India. Spot a pothole, snap a
photo, file a complaint — and let the system route it to the right department.

## What's in this repo

| Folder | What it is |
|---|---|
| `mobile/` | Android app (Java/Kotlin, Gradle) — the citizen-facing client |
| `backend/` | Spring Boot 3 + PostgreSQL/PostGIS — REST API on AWS EC2 |
| `ai_service/` | FastAPI + YOLOv8 — defect-detection microservice |
| `docs/` | Architecture notes, build & release checklists |

The admin dashboard lives in a separate repo (Vite + React on Vercel) and talks
to this backend over HTTP.

## Architecture

```
┌──────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  Mobile app  │ HTTPS  │  Spring Boot API │  HTTP  │  YOLOv8 service  │
│  (Android)   │ ─────► │   (AWS EC2)      │ ─────► │   (FastAPI)      │
└──────────────┘        └────────┬─────────┘        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  PostgreSQL +    │
                        │     PostGIS      │
                        └──────────────────┘
```

- **Mobile** captures a photo + GPS, queues it in Room, and `WorkManager` syncs
  to the backend when network returns.
- **Backend** stores the photo on disk, calls the AI service, runs the decision
  engine (severity + responsible department), and persists the complaint.
- **AI service** runs YOLOv8 inference on the uploaded image and returns
  detections (potholes, broken dividers, etc.).
- **Admin dashboard** (separate repo) reviews complaints and approves/rejects.

## Quick start

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Configure via env vars (see `.env.example`):
- `SPRING_DATASOURCE_PASSWORD` — Postgres password
- `AI_SERVICE_URL` — defaults to `http://localhost:8000`
- `ROADWATCH_UPLOAD_DIR` — where complaint photos are stored
- `ROADWATCH_CORS_ALLOWED_ORIGINS` — comma-separated list of allowed origins

### AI service

```bash
cd ai_service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Mobile

```bash
cd mobile
./gradlew :app:assembleDebug
```

Configure `mobile/local.properties` (gitignored):
```properties
api.base.url=http://YOUR-BACKEND-URL/api/
MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
MISTRAL_API_KEY=YOUR_MISTRAL_KEY
```

### Everything via Docker

```bash
docker compose up --build
```

## Key API endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST`   | `/api/complaints`        | File a complaint with photo (multipart) |
| `GET`    | `/api/complaints`        | List complaints |
| `GET`    | `/api/complaints/{id}`   | Single complaint detail |
| `GET`    | `/api/budgets`           | Road budget records |
| `POST`   | `/api/users/fcm-token`   | Register device for push notifications |
| `GET`    | `/uploads/{filename}`    | Serve uploaded photos |

## Documentation

- [Architecture details](docs/ARCHITECTURE.md)
- [Build & test checklist](docs/BUILD_AND_TEST.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Submission flow diagram](docs/SUBMISSION_FLOW.md)
- [Progress notes](docs/PROGRESS.md)

## License

See [LICENSE](LICENSE).
