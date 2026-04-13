pub mod models;
use crate::models::{Estimation, SourceRef, Task, TaskDraft, TaskEngineError, TaskMetadata};
use async_trait::async_trait;

#[async_trait]
pub trait TaskEngine: Send + Sync {
    // Defines how to turn one task into many sub-tasks
    async fn breakdown(&self, task: &Task) -> Result<Vec<TaskDraft>, TaskEngineError>;

    // Defines how to estimate the time for a single task
    async fn estimate(&self, task: &Task) -> Result<Estimation, TaskEngineError>;
}

pub struct DummyTaskEngine;

#[async_trait]
impl TaskEngine for DummyTaskEngine {
    async fn breakdown(&self, task: &Task) -> Result<Vec<TaskDraft>, TaskEngineError> {
        Ok(vec![TaskDraft {
            title: String::from("Subtask A"),
            description: format!("Subtask A of: {}", task.title),
            parent_id: task.id,
            metadata: TaskMetadata {
                tags: vec![String::from("tests"), String::from("coding")],
                derived_from: SourceRef { chat_id: 15 },
            },
            due_date: None,
            estimation: None,
        }])
    }

    async fn estimate(&self, task: &Task) -> Result<Estimation, TaskEngineError> {
        Ok(Estimation {
            predicted_minutes: 10,
            confidence_score: 0.8,
            last_updated: chrono::Utc::now(),
        })
    }
}
#[cfg(test)]
mod tests {
    use super::*;
}
