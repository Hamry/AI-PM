use fractalist_core::models::{
    Estimation, SourceRef, Task, TaskDraft, TaskId, TaskMetadata, TaskStatus, TaskUpdate,
};
use sqlx::SqlitePool;

#[derive(sqlx::FromRow)]
struct TaskRow {
    id: i64,
    parent_id: Option<i64>,
    title: String,
    description: String,
    status: TaskStatus, // "Todo", "InProgress", etc.
    due_date: Option<chrono::DateTime<chrono::Utc>>,
    estimation_minutes: Option<i64>,
    confidence_score: Option<f64>,
    estimation_updated: Option<chrono::DateTime<chrono::Utc>>,
    metadata_tags: String, // JSON string: '["coding","focus"]'
    metadata_chat_id: i64,
}

impl TryFrom<TaskRow> for Task {
    type Error = anyhow::Error;
    fn try_from(row: TaskRow) -> Result<Self, Self::Error> {
        let estimation = match row.estimation_minutes {
            None => None,
            Some(mins) => Some(Estimation {
                predicted_minutes: u32::try_from(mins)
                    .map_err(|_| anyhow::anyhow!("predicted minutes {} overflows u32", mins))?,
                confidence_score: row.confidence_score.ok_or_else(|| {
                    anyhow::anyhow!("estimation_minutes set but confidence_score is NULL")
                })?,
                last_updated: row.estimation_updated.ok_or_else(|| {
                    anyhow::anyhow!("estimation_minutes set but estimation_updated is NULL")
                })?,
            }),
        };

        let tags: Vec<String> = serde_json::from_str(&row.metadata_tags)?;

        Ok(Task {
            id: TaskId::new(
                u32::try_from(row.id)
                    .map_err(|_| anyhow::anyhow!("task id {} overflows u32", row.id))?,
            ),
            parent_id: row
                .parent_id
                .map(|p| {
                    u32::try_from(p)
                        .map_err(|_| anyhow::anyhow!("parent_id {} overflows u32", p))
                        .map(TaskId::new)
                })
                .transpose()?,
            title: row.title,
            description: row.description,
            status: row.status,
            due_date: row.due_date,
            estimation,
            metadata: TaskMetadata {
                tags,
                derived_from: SourceRef {
                    chat_id: u32::try_from(row.metadata_chat_id).map_err(|_| {
                        anyhow::anyhow!("chat_id {} overflows u32", row.metadata_chat_id)
                    })?,
                },
            },
        })
    }
}

pub async fn list_tasks(pool: &SqlitePool, user_id: i64) -> Result<Vec<Task>, anyhow::Error> {
    let rows: Vec<TaskRow> = sqlx::query_as::<_, TaskRow>(
        "SELECT id, parent_id, title, description, status, due_date,
            estimation_minutes, confidence_score, estimation_updated,
            metadata_tags, metadata_chat_id FROM tasks WHERE user_id = ?",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    rows.into_iter()
        .map(Task::try_from)
        .collect::<Result<Vec<_>, _>>()
        .map_err(anyhow::Error::from)
}

pub async fn create_task(
    pool: &SqlitePool,
    user_id: i64,
    draft: TaskDraft,
) -> Result<Task, anyhow::Error> {
    let tags_json = serde_json::to_string(&draft.metadata.tags)?;
    let parent_id = draft.parent_id.map(|p| p.value() as i64);
    let chat_id = draft.metadata.derived_from.chat_id as i64;

    let result = sqlx::query(
        "INSERT INTO tasks (title, description, parent_id, metadata_tags, metadata_chat_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(draft.title)
    .bind(draft.description)
    .bind(parent_id)
    .bind(tags_json)
    .bind(chat_id)
    .bind(user_id)
    .execute(pool)
    .await?;

    let new_id = u32::try_from(result.last_insert_rowid())
        .map_err(|_| anyhow::anyhow!("task_id {} overflows u32", result.last_insert_rowid()))?;
    get_task(pool, user_id, new_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("task not found after insert"))
}

pub async fn get_task(
    pool: &SqlitePool,
    user_id: i64,
    id: u32,
) -> Result<Option<Task>, anyhow::Error> {
    let row = sqlx::query_as::<_, TaskRow>(
        "SELECT id, parent_id, title, description, status, due_date,
            estimation_minutes, confidence_score, estimation_updated,
            metadata_tags, metadata_chat_id FROM tasks WHERE id = ? AND user_id = ?",
    )
    .bind(id as i64)
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    row.map(Task::try_from)
        .transpose()
        .map_err(anyhow::Error::from)
}

pub async fn update_task(
    pool: &SqlitePool,
    user_id: i64,
    id: u32,
    updated: TaskUpdate,
) -> Result<Task, anyhow::Error> {
    let current = get_task(pool, user_id, id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("task {} not found", id))?;

    let new_title = updated.title.unwrap_or(current.title);
    let new_description = updated.description.unwrap_or(current.description);
    let new_status = updated.status.unwrap_or(current.status);
    let new_due_date = updated.due_date.or(current.due_date); // for Option<T> fields, use .or() not .unwrap_or()

    let new_estimation = updated.estimation.or(current.estimation);

    let new_metadata = updated.metadata.unwrap_or(current.metadata);
    let new_metadata_tags = serde_json::to_string(&new_metadata.tags)?;
    let new_metadata_chat_id = new_metadata.derived_from.chat_id as i64;
    let new_parent_id = updated.parent_id.or(current.parent_id);

    sqlx::query(
        "UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ?, estimation_minutes = ?,
    confidence_score = ?,
    estimation_updated = ?,
    metadata_tags = ?,
    metadata_chat_id = ? , parent_id = ?  WHERE id = ? AND user_id = ?",
    )
    .bind(new_title)
    .bind(new_description)
    .bind(new_status)
    .bind(new_due_date)
    .bind(new_estimation.as_ref().map(|e| e.predicted_minutes as i64))
    .bind(new_estimation.as_ref().map(|e| e.confidence_score))
    .bind(new_estimation.as_ref().map(|e| e.last_updated))
    .bind(&new_metadata_tags)
    .bind(new_metadata_chat_id as i64)
    .bind(new_parent_id.map(|p| p.value() as i64))
    .bind(id as i64)
    .bind(user_id)
    .execute(pool)
    .await?;

    get_task(pool, user_id, id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("task not found after update"))
}

pub async fn delete_task(pool: &SqlitePool, user_id: i64, id: u32) -> Result<bool, anyhow::Error> {
    let result = sqlx::query("DELETE FROM tasks WHERE id = ? AND user_id = ?")
        .bind(id as i64)
        .bind(user_id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn get_or_create_user(pool: &SqlitePool, clerk_id: &str) -> Result<i64, anyhow::Error> {
    sqlx::query("INSERT OR IGNORE INTO users (clerk_id) VALUES (?)")
        .bind(clerk_id)
        .execute(pool)
        .await?;

    let user_id: Option<i64> = sqlx::query_scalar("SELECT id FROM users WHERE clerk_id = ?")
        .bind(clerk_id)
        .fetch_optional(pool)
        .await?;
    user_id.ok_or_else(|| {
        anyhow::anyhow!(
            "Failed to retrieve or create user with clerk_id {}",
            clerk_id
        )
    })
}
