use anyhow::Result;
use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use fractalist_core::models::TaskDraft;
pub mod db;
use tower_http::trace::TraceLayer;

#[derive(Clone)]
struct AppState {
    pool: sqlx::SqlitePool,
}

async fn list_tasks(State(state): State<AppState>) -> impl IntoResponse {
    match db::list_tasks(&state.pool).await {
        Ok(tasks) => Json(tasks).into_response(),
        Err(e) => {
            tracing::error!("list_tasks failed: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// Adds a new user defined task, bypassing user approval of auto generated tasks.
async fn create_task(
    State(state): State<AppState>,
    Json(draft): Json<TaskDraft>,
) -> impl IntoResponse {
    match db::create_task(&state.pool, draft).await {
        Ok(task) => (StatusCode::CREATED, Json(task)).into_response(),
        Err(e) => {
            tracing::error!("create_task failed: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

async fn get_task(State(state): State<AppState>, Path(id): Path<u32>) -> impl IntoResponse {
    match db::get_task(&state.pool, id).await {
        Ok(Some(task)) => Json(task).into_response(),
        Ok(None) => StatusCode::NOT_FOUND.into_response(),
        Err(e) => {
            tracing::error!("get_task failed: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let db_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://tasks.db?mode=rwc".to_string());
    let pool: sqlx::Pool<sqlx::Sqlite> = sqlx::SqlitePool::connect(&db_url).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    let state = AppState { pool };

    let app = Router::new()
        .route("/tasks", get(list_tasks).post(create_task))
        .route("/tasks/:id", get(get_task))
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
