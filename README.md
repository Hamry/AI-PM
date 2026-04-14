# Fractalist

An AI-powered task manager that minimizes decision fatigue. It breaks tasks into sub-tasks, estimates how long they'll take, and recommends what to work on next — so you spend less time planning and more time doing.

> Design intent and architectural decisions: see [SDD.md](./SDD.md)

---

## Project Structure

```
AI-PM/
├── apps/
│   ├── web/               # React 19 + Vite 7 web app
│   └── desktop/           # Tauri v2 desktop wrapper
├── shared-ui/             # @fractalist/shared-ui component library
├── fractalist-core/       # Rust core (models, TaskEngine trait)
├── cloud-api/             # Rust Axum REST API (WIP)
├── Cargo.toml             # Rust workspace root
└── package.json           # pnpm workspace root
```

---

## Prerequisites

| Tool      | Version   | Install                      |
|-----------|-----------|------------------------------|
| Node.js   | 20+       | https://nodejs.org           |
| pnpm      | 10.6.5    | `npm install -g pnpm@10.6.5` |
| Rust      | stable    | https://rustup.rs            |
| Tauri CLI | v2        | installed as devDependency   |
| sqlx-cli  | latest    | `cargo install sqlx-cli --no-default-features --features sqlite` |

---

## Setup

```bash
# 1. Install Node dependencies
pnpm install --force

# 2. Approve any native build scripts (pnpm v10 blocks them by default)
pnpm approve-builds
```

---

## Common Commands

### Development

```bash
# Start everything (web dev server + desktop hot-reload)
pnpm dev

# Web app only (http://localhost:5173)
pnpm --filter web dev

# Desktop app only (starts web dev server internally)
pnpm --filter @fractalist/desktop dev
```

### Building

```bash
# Build all packages
pnpm build

# Web app only
pnpm --filter web build

# Desktop app (bundles web dist into native binary)
pnpm --filter @fractalist/desktop build
```

### Linting

```bash
pnpm --filter web lint
```

### Rust

```bash
# Build all Rust workspace members (debug)
cargo build

# Release build
cargo build --release

# Run tests
cargo test

# Export Rust types to TypeScript (outputs to shared-ui/src/types/bindings.ts)
cargo run -p fractalist-core --bin export-types

# Run the cloud API locally
cargo run -p cloud-api

# Run DB migrations (from workspace root, requires sqlx-cli)
sqlx migrate run --database-url sqlite://cloud-api/fractalist.db
```

---

## Notes

- **Tailwind v4** is CSS-first — config lives in `apps/web/src/index.css` via `@theme {}`. There is no `tailwind.config.ts`.
- **`@source` directives** in `index.css` are required for Tailwind to detect classes in `shared-ui` (symlinked packages are not auto-scanned).
- **pnpm v10** blocks build scripts by default. If you add a new package that requires native compilation, add it to `onlyBuiltDependencies` in `pnpm-workspace.yaml` and run `pnpm approve-builds`.
- **Rust types → TypeScript**: `fractalist-core` uses [specta](https://github.com/oscartbeaumont/specta) to export TypeScript types automatically. Run `cargo run -p fractalist-core --bin export-types` from the workspace root to regenerate `shared-ui/src/types/bindings.ts`.
- **`TaskEngine` trait**: defined in `fractalist-core/src/lib.rs`. Uses `async_trait` for object safety and `Send + Sync` bounds for Tauri state compatibility. `DummyTaskEngine` is the stub implementation — `pub` intentionally so the Tauri app can use it during development.
- **Error handling**: engine errors use `thiserror` (`TaskEngineError` in `models.rs`). Do not derive `Serialize/Deserialize/Type` on error enums — they are internal, not frontend-facing types.
- **Database**: `cloud-api` uses SQLite locally via `sqlx`. The DB file (`fractalist.db`) is gitignored. Run migrations with `sqlx migrate run` before starting the API. Schema uses a self-referential `tasks` table — tree queries use `WITH RECURSIVE`.
- **Write path**: clients send `TaskDraft` (no ID). The server inserts, reads back the DB-generated ID, and returns a full `Task`.

- **Auth**: Clerk (JWT-based). Frontend: `@clerk/clerk-react`. Backend validates the JWT in Axum middleware, extracts `clerk_id`, maps to internal `user_id`. Users table stores `clerk_id TEXT UNIQUE` as the link between Clerk identity and app data.