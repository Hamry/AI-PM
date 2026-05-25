use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use specta::Type;
#[derive(Debug, thiserror::Error)]
pub enum TaskEngineError {
    #[error("breakdown failed: {0}")]
    BreakdownFailed(String),

    #[error("estimation failed: {0}")]
    EstimationFailed(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub enum TaskStatus {
    PendingReview,
    Todo,
    InProgress,
    Completed,
    Archived, // For "deleting" without losing data
}

impl std::str::FromStr for TaskStatus {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "PendingReview" => Ok(Self::PendingReview),
            "Todo" => Ok(Self::Todo),
            "InProgress" => Ok(Self::InProgress),
            "Completed" => Ok(Self::Completed),
            "Archived" => Ok(Self::Archived),
            _ => Err(format!("failed to parse status {}!", s)),
        }
    }
}

impl std::fmt::Display for TaskStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Self::PendingReview => "PendingReview",
            Self::Todo => "Todo",
            Self::InProgress => "InProgress",
            Self::Completed => "Completed",
            Self::Archived => "Archived",
        };
        write!(f, "{}", s)
    }
}

#[cfg(feature = "sqlx")]
impl sqlx::Type<sqlx::Sqlite> for TaskStatus {
    fn type_info() -> <sqlx::Sqlite as sqlx::Database>::TypeInfo {
        <String as sqlx::Type<sqlx::Sqlite>>::type_info()
    }
}

#[cfg(feature = "sqlx")]
impl<'q> sqlx::Encode<'q, sqlx::Sqlite> for TaskStatus {
    fn encode_by_ref(
        &self,
        buf: &mut <sqlx::Sqlite as sqlx::Database>::ArgumentBuffer<'q>,
    ) -> Result<sqlx::encode::IsNull, sqlx::error::BoxDynError> {
        <String as sqlx::Encode<'q, sqlx::Sqlite>>::encode_by_ref(&self.to_string(), buf)
    }
}

#[cfg(feature = "sqlx")]
impl<'r> sqlx::Decode<'r, sqlx::Sqlite> for TaskStatus {
    fn decode(
        value: <sqlx::Sqlite as sqlx::Database>::ValueRef<'r>,
    ) -> Result<Self, sqlx::error::BoxDynError> {
        // read the raw string from the DB, then parse via your existing FromStr
        let s = <String as sqlx::Decode<sqlx::Sqlite>>::decode(value)?;
        s.parse::<TaskStatus>().map_err(|e: String| e.into())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Task {
    pub id: TaskId, // Use a Newtype for ID safety
    pub title: String,
    pub description: String,
    pub status: TaskStatus,
    pub due_date: Option<DateTime<Utc>>,
    pub estimation: Option<Estimation>, // A separate struct for time logic
    pub parent_id: Option<TaskId>,      // Flat structure for easier DB syncing
    pub metadata: TaskMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct TaskDraft {
    pub title: String,
    pub description: String,
    pub due_date: Option<DateTime<Utc>>,
    pub estimation: Option<Estimation>,
    pub parent_id: Option<TaskId>,
    pub metadata: TaskMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct TaskUpdate {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<TaskStatus>,
    pub due_date: Option<DateTime<Utc>>,
    pub estimation: Option<Estimation>, // A separate struct for time logic
    pub parent_id: Option<TaskId>,      // Flat structure for easier DB syncing
    pub metadata: Option<TaskMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct TaskMetadata {
    pub tags: Vec<String>,       // e.g., "coding", "high-focus"
    pub derived_from: SourceRef, // Link to a chat ID or source
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Estimation {
    pub predicted_minutes: u32,
    pub confidence_score: f64, // 0.0 to 1.0 (from your SLM)
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Type)]
pub struct TaskId(u32);

impl TaskId {
    pub fn new(id: u32) -> Self {
        Self(id)
    }

    pub fn value(&self) -> u32 {
        self.0
    }
}

impl<'de> serde::Deserialize<'de> for TaskId {
    fn deserialize<D: serde::Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        let raw = u32::deserialize(d)?;
        Ok(TaskId::new(raw)) // or TaskId::new(raw).map_err(...) if fallible
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SourceRef {
    pub chat_id: u32,
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn sample_task() -> Task {
        Task {
            id: TaskId(1),
            title: "Write tests".to_string(),
            description: "".to_string(),
            status: TaskStatus::Todo,
            due_date: None,
            estimation: None,
            parent_id: None,
            metadata: TaskMetadata {
                tags: vec!["coding".to_string()],
                derived_from: SourceRef { chat_id: 1 },
            },
        }
    }

    #[test]
    fn task_serializes_to_json() {
        let task = sample_task();
        let json = serde_json::to_string(&task).expect("serialization failed");
        assert!(json.contains("\"title\":\"Write tests\""));
        assert!(json.contains("\"Todo\""));
    }

    #[test]
    fn task_round_trips_through_json() {
        let original = sample_task();
        let json = serde_json::to_string(&original).unwrap();
        let restored: Task = serde_json::from_str(&json).unwrap();
        // TaskId derives PartialEq so this works
        assert_eq!(restored.id, original.id);
        assert_eq!(restored.title, original.title);
        assert_eq!(restored.metadata.tags, original.metadata.tags);
    }

    #[test]
    fn datetime_serializes_as_rfc3339() {
        let est = Estimation {
            predicted_minutes: 30,
            confidence_score: 0.85,
            last_updated: Utc::now(),
        };
        let json = serde_json::to_string(&est).unwrap();
        // chrono with serde serializes as ISO 8601 string, not a unix timestamp
        assert!(json.contains("last_updated"));
        let restored: Estimation = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.predicted_minutes, 30);
    }
    #[test]
    fn task_id_equality() {
        assert_eq!(TaskId(1), TaskId(1));
        assert_ne!(TaskId(1), TaskId(2));
    }

    #[test]
    fn task_id_round_trips() {
        let id = TaskId(42);
        let json = serde_json::to_string(&id).unwrap();
        let restored: TaskId = serde_json::from_str(&json).unwrap();
        assert_eq!(id, restored);
    }
}
