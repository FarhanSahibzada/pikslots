# Pikslots Documentation

**Pikslots** is a multi-tenant SaaS appointment booking and scheduling platform. Businesses (salons, health centers, fitness studios, medical practices, etc.) use it to offer online booking to their customers, manage team calendars, and control the full booking experience.

## Contents

| Document | Description |
|---|---|
| [Architecture Overview](architecture.md) | System architecture, diagrams, patterns, and design decisions |
| [Getting Started Guide](guides/getting-started.md) | Local development setup, prerequisites, installation |
| [Backend Guide](guides/backend-guide.md) | NestJS API structure, modules, authentication, database |
| [Frontend Guide](guides/frontend-guide.md) | SvelteKit UI structure, routing, state management, data fetching |
| [API Endpoints Reference](api-endpoints.md) | Complete REST API endpoint documentation |
| [Database Schema](database-schema.md) | Tables, columns, relationships, migration guide |
| [Adding a Feature](guides/adding-a-feature.md) | End-to-end walkthrough for implementing new features |

## Project Structure

```
pikslots/
├── packages/
│   ├── api/              # NestJS REST API (backend)
│   ├── ui/               # SvelteKit frontend (dashboard + booking UI)
│   ├── domain/           # Domain entities, use cases, repository interfaces
│   └── shared/           # Zod schemas + TypeScript types shared across packages
├── docker/               # Docker Compose service configs
├── docs/                 # Documentation (this directory)
├── notes/                # Development notes / planning docs
├── nx.json               # Nx monorepo configuration
└── package.json          # Root workspace orchestrator
```

## Quick Links

- **API Swagger Docs**: `/api` (served via Scalar UI when API is running)
- **Feature Implementation Guide**: [notes/feature-implementation-guide.md](../notes/feature-implementation-guide.md)
- **Environment Template**: [.env.example](../.env.example)

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | NestJS 11 (Node.js) |
| **Frontend Framework** | SvelteKit 2 (static adapter) |
| **Language** | TypeScript 5.7+ |
| **Database** | PostgreSQL (Kysely query builder) |
| **Authentication** | JWT (access + refresh tokens) + bcrypt |
| **Job Queue** | BullMQ (Redis-backed) |
| **Email** | Nodemailer + SMTP (Mailpit in dev) |
| **Caching** | Cacheable + Keyv (Redis) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn-svelte + Bits UI |
| **Data Fetching** | TanStack Svelte Query + Axios |
| **Monorepo** | Nx v22 + npm workspaces |
| **Package Manager** | Bun 1.3.9 |
| **Containers** | Docker Compose (Postgres, Redis, Mailpit) |
