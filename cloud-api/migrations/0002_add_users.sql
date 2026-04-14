CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_id    TEXT NOT NULL UNIQUE,  -- Clerk's user ID, e.g. "user_2abc123"
    email       TEXT NOT NULL UNIQUE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);