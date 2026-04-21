CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id   INTEGER REFERENCES tasks(id),
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'Todo',
    due_date    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    estimation_minutes  INTEGER,
    confidence_score REAL,
    estimation_updated TEXT,
    metadata_tags TEXT NOT NULL DEFAULT '[]',
    metadata_chat_id INTEGER NOT NULL DEFAULT 0,
    CHECK (
        (estimation_minutes IS NULL AND confidence_score IS NULL AND estimation_updated IS NULL)
        OR
        (estimation_minutes IS NOT NULL AND confidence_score IS NOT NULL AND estimation_updated IS NOT NULL)
    )

);
