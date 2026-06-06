CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_id    TEXT NOT NULL UNIQUE,  -- Clerk's user ID, e.g. "user_2abc123"
    email       TEXT UNIQUE, -- Todo add email storage from clerk
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);