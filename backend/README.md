# EPCENTRA Backend (Flask)

Local-first Flask API to power the React frontend. No containers required.

## Quickstart

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your secrets:
- `DATABASE_URL`: default uses Postgres; for quick testing you can use `sqlite:///epcentra.db`
- `JWT_SECRET_KEY`: set to a strong secret
- `CORS_ORIGINS`: allowed frontend origins (comma-separated)

Run the API:
```bash
flask --app manage run --debug
# or
python manage.py
```

## Migrations

Flask-Migrate is configured. After setting `DATABASE_URL`:
```bash
flask --app manage db init     # first time only
flask --app manage db migrate  # create migration scripts
flask --app manage db upgrade  # apply migrations
```

## Check DB connectivity quickly
Set `DATABASE_URL` (e.g. the provided Aiven URI with `sslmode=require`) and run:
```bash
python backend/scripts/db_ping.py
```

## Endpoints (initial)
- `POST /api/auth/register` – email/password signup
- `POST /api/auth/login` – login
- `POST /api/auth/refresh` – refresh access token (requires refresh token)
- `GET /api/auth/me` – current user + memberships
- `GET /api/organizations/` – list orgs for the current user
- `POST /api/organizations/` – create org + add current user as owner
- `GET /api/tasks/` – list tasks
- `POST /api/tasks/` – create task
- `PUT /api/tasks/:id` – update task
- `DELETE /api/tasks/:id` – delete task
- `GET /health/live`, `GET /health/ready` – health checks

## Next Steps
- Flesh out projects, tasks, workflows, priorities, labels, teams, timeline resources
- Add RBAC enforcement per route using `app/rbac.py`
- Add seeding scripts to mirror existing defaults
- Wire the frontend API client to these endpoints (replace Firebase calls)
