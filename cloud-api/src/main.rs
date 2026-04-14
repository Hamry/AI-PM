use anyhow::Result;
use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use fractalist_core::models::{Task, TaskDraft, TaskId, TaskMetadata, TaskStatus};
use std::sync::{Arc, Mutex};

#[derive(Clone)]
struct AppState {
    //temp dummy database thing
    tasks: Arc<Mutex<Vec<Task>>>,
}

async fn list_tasks(State(state): State<AppState>) -> impl IntoResponse {
    let tasks: Vec<Task> = state.tasks.lock().expect("mutex poisoned").clone();
    Json(tasks)
}

// Adds a new user defined task, bypassing user approval of auto generated tasks.
async fn create_task(
    State(state): State<AppState>,
    Json(draft): Json<TaskDraft>,
) -> (StatusCode, Json<Task>) {
    let mut tasks = state.tasks.lock().expect("mutex poisoned");
    let new_task = Task {
        id: TaskId::new(tasks.len() as u32 + 1),
        title: draft.title,
        description: draft.description,
        status: TaskStatus::Todo,
        parent_id: None,
        due_date: None,
        estimation: None,
        metadata: draft.metadata,
    };

    tasks.push(new_task.clone());

    (StatusCode::CREATED, Json(new_task))
}

async fn get_task(
    State(state): State<AppState>,
    Path(id): Path<u32>,
) -> Result<Json<Task>, StatusCode> {
    let tasks = state.tasks.lock().expect("mutex poisoned");
    tasks
        .iter()
        .find(|t| t.id.value() == id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

#[tokio::main]
async fn main() -> Result<()> {
    let state = AppState {
        tasks: Arc::new(Mutex::new(vec![])),
    };

    let app = Router::new()
        .route("/tasks", get(list_tasks).post(create_task))
        .route("/tasks/:id", get(get_task))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
