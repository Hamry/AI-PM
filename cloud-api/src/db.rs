use fractalist_core::models::{
    Estimation, SourceRef, Task, TaskDraft, TaskId, TaskMetadata, TaskStatus,
};
use sqlx::SqlitePool;

#[derive(sqlx::FromRow)]
struct TaskRow {
    id: i64,
    parent_id: Option<i64>,
    title: String,
    description: String,
    status: String, // "Todo", "InProgress", etc.
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
            status: row.status.parse().map_err(|e: String| anyhow::anyhow!(e))?,
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

pub async fn list_tasks(pool: &SqlitePool) -> Result<Vec<Task>, anyhow::Error> {
    let rows: Vec<TaskRow> = sqlx::query_as::<_, TaskRow>(
        "SELECT id, parent_id, title, description, status, due_date,
            estimation_minutes, confidence_score, estimation_updated,
            metadata_tags, metadata_chat_id FROM tasks",
    )
    .fetch_all(pool)
    .await?;

    rows.into_iter()
        .map(Task::try_from)
        .collect::<Result<Vec<_>, _>>()
        .map_err(anyhow::Error::from)
}

pub async fn create_task(pool: &SqlitePool, draft: TaskDraft) -> Result<Task, anyhow::Error> {
    let tags_json = serde_json::to_string(&draft.metadata.tags)?;
    let parent_id = draft.parent_id.map(|p| p.value() as i64);
    let chat_id = draft.metadata.derived_from.chat_id as i64;

    let result = sqlx::query(
        "INSERT INTO tasks (title, description, parent_id, metadata_tags, metadata_chat_id)
        VALUES (?, ?, ?, ?, ?)",
    )
    .bind(draft.title)
    .bind(draft.description)
    .bind(parent_id)
    .bind(tags_json)
    .bind(chat_id)
    .execute(pool)
    .await?;

    let new_id = u32::try_from(result.last_insert_rowid())
        .map_err(|_| anyhow::anyhow!("task_id {} overflows u32", result.last_insert_rowid()))?;
    get_task(pool, new_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("task not found after insert"))
}

pub async fn get_task(pool: &SqlitePool, id: u32) -> Result<Option<Task>, anyhow::Error> {
    let row = sqlx::query_as::<_, TaskRow>(
        "SELECT id, parent_id, title, description, status, due_date,
            estimation_minutes, confidence_score, estimation_updated,
            metadata_tags, metadata_chat_id FROM tasks WHERE id = ?",
    )
    .bind(id as i64)
    .fetch_optional(pool)
    .await?;

    row.map(Task::try_from)
        .transpose()
        .map_err(anyhow::Error::from)
}
