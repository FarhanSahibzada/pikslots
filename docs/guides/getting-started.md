# Getting Started

## Prerequisites

| Tool               | Version  | Purpose                                           |
| ------------------ | -------- | ------------------------------------------------- |
| **Bun**            | >= 1.3.9 | Package manager and runtime                       |
| **Docker**         | Latest   | Containerized services (Postgres, Redis, Mailpit) |
| **Docker Compose** | V2       | Multi-container orchestration                     |

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd pikslots
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up environment variables

Copy the example env file and customize:

```bash
cp .env.example .env
```

Required environment variables:

| Variable              | Description                  | Default                                              |
| --------------------- | ---------------------------- | ---------------------------------------------------- |
| `NODE_ENV`            | Environment mode             | `development`                                        |
| `PORT`                | API server port              | `3000`                                               |
| `DATABASE_URL`        | PostgreSQL connection string | `postgresql://user:password@localhost:5432/pikslots` |
| `BACKEND_PUBLIC_URL`  | Public backend URL           | `http://localhost:3000`                              |
| `FRONTEND_PUBLIC_URL` | Public frontend URL          | `http://localhost:5173`                              |
| `JWT_SECRET`          | JWT signing secret           | _(change me)_                                        |
| `JWT_REFRESH_SECRET`  | Refresh token secret         | _(change me)_                                        |
| `INVITE_JWT_SECRET`   | Invite token secret          | _(change me)_                                        |
| `REDIS_HOST`          | Redis host                   | `localhost`                                          |
| `REDIS_PORT`          | Redis port                   | `6379`                                               |
| `MAIL_HOST`           | SMTP host                    | `localhost`                                          |
| `MAIL_PORT`           | SMTP port                    | `1025`                                               |
| `MAIL_FROM`           | Email from address           | `noreply@pikslots.com`                               |

### 4. Start infrastructure services

```bash
# Start PostgreSQL + Redis + Mailpit
docker compose -f docker/redis.yml up -d
docker compose -f docker/mailpit.yml up -d
```

**Available Docker services:**

| Service          | Port(s)                | Description                |
| ---------------- | ---------------------- | -------------------------- |
| **PostgreSQL**   | 5432                   | Primary database           |
| **Redis**        | 6379                   | Cache + BullMQ queue       |
| **RedisInsight** | 5540                   | Redis GUI                  |
| **Mailpit**      | 8025 (UI), 1025 (SMTP) | Dev email testing          |
| **RustFS**       | 9000, 9001             | S3-compatible file storage |

### 5. Run database migrations

```bash
# From packages/api directory
cd packages/api
bun run migration:run
```

Or via Nx:

```bash
bunx nx run api:migration:run
```

### 6. Start development servers

```bash
# From root - starts all packages
bun run dev
```

This starts:

- **API server** at `http://localhost:3000`
- **UI dev server** at `http://localhost:5173`
- **Swagger API docs** at `http://localhost:3000/api`
- **Mailpit UI** at `http://localhost:8025`

## Development Workflow

```bash
# Run all packages in dev mode with hot reload
bun run dev

# Build all packages
bun run build

# Lint all packages
bun run lint

# Format code
bun run format

# Run tests (API package)
bunx nx run api:test
```

## Project Scripts

| Script                          | Description                    |
| ------------------------------- | ------------------------------ |
| `bun run dev`                   | Start all packages in dev mode |
| `bun run build`                 | Build all packages             |
| `bun run lint`                  | Lint all packages              |
| `bun run format`                | Format all packages            |
| `bunx nx run api:dev`           | Start API only                 |
| `bunx nx run ui:dev`            | Start UI only                  |
| `bunx nx run api:test`          | Run API tests                  |
| `bunx nx run api:migration:run` | Run database migrations        |
| `bunx nx run api:lint`          | Lint API package               |

## Common Tasks

### Running a single package

```bash
# API only
bunx nx run api:dev

# UI only
bunx nx run ui:dev
```

### Database migrations

```bash
# Run pending migrations
bunx nx run api:migration:run

# Create a new migration (from packages/api)
bunx kysely migrate:make migration_name
```

### Testing emails

Access Mailpit UI at `http://localhost:8025` to view all sent emails in development.

### Accessing Redis

- **CLI**: `redis-cli -p 6379`
- **GUI**: RedisInsight at `http://localhost:5540`

## Troubleshooting

| Problem                   | Solution                                         |
| ------------------------- | ------------------------------------------------ |
| `bun install` fails       | Delete `bun.lock` and `node_modules`, retry      |
| Database connection error | Ensure Docker services are running: `docker ps`  |
| Migration errors          | Check `DATABASE_URL` in `.env`                   |
| Port already in use       | Change `PORT` in `.env` or kill existing process |
| JWT auth failures         | Regenerate `JWT_SECRET` and `JWT_REFRESH_SECRET` |
