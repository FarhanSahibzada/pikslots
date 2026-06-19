# Documentation

This documentation covers how to get Pikslots Project running locally for development.

---

## Prerequisites

| Tool       | Version | Purpose                                                  |
| ---------- | ------- | -------------------------------------------------------- |
| **Bun**    | ~1.3.9  | Package manager and runtime                              |
| **Docker** | Latest  | Containerized PostgreSQL, Redis, Mailpit                 |
| **Kysely** | Latest  | type-safe SQL query builder for TypeScript and JavaScrip |

Install Bun if you don't have it:

```bash
curl -fsSL https://bun.sh/install | bash
```

```bash
bun install kysely
```

Verify versions:

```bash
bun --version   # 1.3.x
docker --version


```

---

## Clone & install

First fork the repo after on your terminal :

```bash
git clone <your-fork-repository-url>
cd pikslots
bun install
```

This installs dependencies for all packages (`api`, `ui`, `domain`, `shared`) via npm workspaces.

---

## Environment variables

The monorepo uses a single **root `.env`** file that all packages read from.

```bash
cp .env.example .env
```

Edit `.env` with your own values. The full set of variables the project recognises:

| Variable                 | Description                       | Default                                              |
| ------------------------ | --------------------------------- | ---------------------------------------------------- |
| `NODE_ENV`               | Environment mode                  | `development`                                        |
| `PORT`                   | API server port                   | `3000`                                               |
| `DATABASE_URL`           | PostgreSQL connection string      | `postgresql://user:password@localhost:5432/pikslots` |
| `POSTGRES_USER`          | postgres db username              | _(your_username)_                                    |
| `POSTGRES_PASSWORD`      | postgres db password              | _(your_password)_                                    |
| `POSTGRES_DB`            | postgres db name                  | `pikslots`                                           |
| `BACKEND_PUBLIC_URL`     | Public-facing API URL             | `http://localhost:3000`                              |
| `FRONTEND_PUBLIC_URL`    | Public-facing UI URL              | `http://localhost:5173`                              |
| `JWT_SECRET`             | Access-token signing secret       | _(must change)_                                      |
| `JWT_EXPIRES_IN`         | Access-token lifetime             | `15m`                                                |
| `JWT_REFRESH_SECRET`     | Refresh-token signing secret      | _(must change)_                                      |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime            | `7d`                                                 |
| `INVITE_JWT_SECRET`      | Team-invite token secret          | _(must change)_                                      |
| `REDIS_HOST`             | Redis host                        | `localhost`                                          |
| `REDIS_PORT`             | Redis port                        | `6379`                                               |
| `MAIL_HOST`              | SMTP host                         | `localhost`                                          |
| `MAIL_PORT`              | SMTP port                         | `1025`                                               |
| `MAIL_FROM`              | "From" address for outgoing email | `noreply@pikslots.com`                               |

> `.env.example` only includes the core variables. Copy the block above into your `.env` if you need Redis, mail, or invite-secret support.

---

## Infrastructure (Docker)

Start the services you need. **Redis, Postgresql must be running before the API starts** (BullMQ connects on boot).

```bash
# Start PostgreSQL
docker compose -f docker/postgres.yml up -d
or
docker compose --env-file .env -f docker/postgres.yml up -d

# Start Redis (required before API)
docker compose -f docker/redis.yml up -d
or
docker compose --env-file .env -f docker/redis.yml up -d

# Start Mailpit for dev email testing (optional)
docker compose -f docker/mailpit.yml up -d
```

| Service           | Port(s)                    | Required?            |
| ----------------- | -------------------------- | -------------------- |
| **PostgreSQL 18** | `5432`                     | Yes                  |
| **Redis 8**       | `6379`                     | Yes                  |
| **Mailpit**       | `1025` (SMTP), `8025` (UI) | Recommended          |
| **RustFS**        | `9000`, `9001`             | Only for file upload |
| **RedisInsight**  | `5540`                     | Optional GUI         |

Stop all services with:

```bash
docker compose -f docker/postgres.yml down
docker compose -f docker/redis.yml down
# etc.
```

---

## Database

### Run migrations

```bash
# Run all pending migrations
npx nx run @pikslots/api:migration:latest
```

This creates the tables (`users`, `businesses`, `services`, `service_groups`, `classes`, `customers`, etc.).

### Seed a platform owner & demo business

```bash
if Postgresql inside host :
psql "$DATABASE_URL" -f packages/api/src/shared/database/seeders/01-seed.platform.owner.sql
if Postgresql inside docker :
docker exec -i pikslots_postgres psql -U <your_username> -d pikslots < packages/api/src/shared/database/seeders/01-seed.platform.owner.sql
```

This creates:

- **Platform Owner** user with username `afaqjaved` / password `admin12345`
- **Afaq's Demo Business** owned by that user

> You can find the seed file at `packages/api/src/shared/database/seeders/01-seed.platform.owner.sql`.

### Testing emails

Access Mailpit UI at `http://localhost:8025` to view all sent emails in development.

### Accessing Redis

- **CLI**: `redis-cli -p 6379`
- **GUI**: RedisInsight at `http://localhost:5540`

## Troubleshooting

---

## Run the monorepo

### Development mode (hot reload)

```bash
bun run dev
```

This starts all packages in parallel via Nx.

### Individual packages

```bash
# API only (NestJS, port 3000)
bunx nx run api:dev

# UI only (SvelteKit, port 5173)
bunx nx run ui:dev
```

### Start order

1. Docker services (PostgreSQL, Redis)
2. Migrations + seed
3. `bun run dev` (or individual packages)

---

## Verify it works

| Service                       | URL                       |
| ----------------------------- | ------------------------- |
| **UI (dashboard)**            | http://localhost:5173     |
| **API**                       | http://localhost:3000     |
| **Swagger / Scalar API docs** | http://localhost:3000/api |
| **Mailpit UI**                | http://localhost:8025     |

Log in with the seed credentials:

| Field        | Value                |
| ------------ | -------------------- |
| **Username** | `afaqjaved`          |
| **Password** | `admin12345`         |
| **Business** | Afaq's Demo Business |

---

## Useful commands

```bash
bun run build        # Build all packages
bun run lint         # Lint all packages
bun run format       # Format all packages
bunx nx run api:test # Run API tests
```

### Database

```bash
bunx nx run api:migration:create   # Create a new migration
bunx nx run api:migration:latest   # Run pending migrations
bunx nx run api:migration:down     # Roll back last migration
bunx nx run api:migration:redo     # Re-do last migration
```

---

## Troubleshooting

| Problem                          | Likely cause & fix                                            |
| -------------------------------- | ------------------------------------------------------------- |
| `bun install` fails              | Delete `bun.lock` and `node_modules`, re-run `bun install`    |
| Database connection error        | Ensure PostgreSQL is running: `docker ps`                     |
| Migration command not found      | Run from the root so Nx can resolve the target                |
| Redis / BullMQ errors on startup | Start Redis first: `docker compose -f docker/redis.yml up -d` |
| Port `3000` or `5173` in use     | Change `PORT` in `.env` or kill the existing process          |
| JWT auth failures                | Regenerate `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`    |
