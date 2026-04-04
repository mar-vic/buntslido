# Buntslido

Local self-hosted Q&A app inspired by Slido. No accounts, no cloud.

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite — `backend/`
- **Frontend:** React + TypeScript + Vite — `frontend/`
- **Realtime:** WebSockets (server-push only; all writes go through REST)

## Running the app

### Backend
```bash
cd backend
.venv/bin/uvicorn app.main:app --reload --port 8080 --host 0.0.0.0
```

First-time setup:
```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

### Frontend
Requires Node 18 (`nvm use 18`).
```bash
cd frontend
npm run dev -- --host
```

App is available at `http://localhost:5173`.

## Architecture

### Auth model
- **Audience URL:** `/event/:joinCode` — anyone with the link can join
- **Host URL:** `/event/:joinCode/host?t=<host_token>` — host token is shown once at creation; bookmark it
- Host-gated mutations send `X-Host-Token` request header
- No accounts or sessions

### Backend layout
```
backend/app/
  main.py          # FastAPI app, CORS, lifespan, /api/info endpoint
  database.py      # SQLAlchemy engine + SessionLocal
  models.py        # Event, Question ORM models
  schemas.py       # Pydantic request/response schemas
  crud.py          # DB query functions
  dependencies.py  # get_db, get_event_or_404, verify_host
  ws_manager.py    # ConnectionManager — broadcasts to all clients in an event
  routers/
    events.py      # GET/POST/PATCH/DELETE /api/events
    questions.py   # CRUD + upvote for /api/events/:join_code/questions
    websocket.py   # WS /ws/:join_code
```

### Frontend layout
```
frontend/src/
  api/             # fetch wrappers: client.ts, events.ts, questions.ts
  hooks/
    useWebSocket.ts    # WS connection with exponential backoff reconnect
    useQuestions.ts    # question list state, merges WS messages
    useRole.ts         # derives host/audience role from URL
    usePublicOrigin.ts # resolves LAN IP when accessed via localhost
  pages/
    HomePage.tsx       # create event + list past sessions with delete
    AudiencePage.tsx   # submit + upvote questions
    HostPage.tsx       # same + mark answered / archive / delete questions
    NotFoundPage.tsx
  components/
    EventHeader.tsx    # title, QR code, audience URL + copy button
    QuestionCard.tsx   # single question with upvote and host controls
    QuestionList.tsx   # sorted list; host sees archived section
    SubmitForm.tsx     # new question textarea
    HostControls.tsx   # mark answered / archive / delete buttons
```

### WebSocket message protocol
All messages are JSON sent server → client only.

| type | payload |
|---|---|
| `question_created` | `{ question: Question }` |
| `question_upvoted` | `{ question_id, upvotes }` |
| `question_updated` | `{ question_id, status }` |
| `question_deleted` | `{ question_id }` |
| `event_updated` | `{ is_active, title }` |

### Public IP detection
`GET /api/info` returns `{ ip }` — the server's LAN IP detected via OS routing table (no internet required). The frontend uses this to build QR codes and links that work on other devices when the host opens the app via `localhost`.

### Upvote deduplication
In-memory set of `(question_id, author_token)` pairs per process. The `author_token` is a UUID stored in `localStorage` under `buntslido_author_token`.

## Database
SQLite file at `backend/buntslido.db` — created automatically on first run. Delete it to reset all data.

Port 8000 may be occupied by another service (e.g. Django). Use `lsof -i :8000` to check. The app uses port 8080 by default.

## Theming
Dark mode by default (follows system preference via `prefers-color-scheme`). All colors use CSS variables defined in `frontend/src/index.css`:
`--color-border`, `--color-card-bg`, `--color-card-answered-bg`, `--color-card-archived-bg`, `--color-muted-bg`, `--color-text-muted`, `--color-link`.
