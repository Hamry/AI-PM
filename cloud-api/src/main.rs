use anyhow::Result;
use axum::{
    Extension, Json, Router,
    extract::{Path, Request, State},
    http::StatusCode,
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{delete, get, patch, post},
};
use fractalist_core::models::{TaskDraft, TaskUpdate};
pub mod db;
use jsonwebtoken::{DecodingKey, decode, decode_header};

use std::sync::Arc;
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

async fn fetch_jwks(url: &str) -> Result<Jwks> {
    let res = reqwest::get(url).await?;
    let jwks: Jwks = res.json::<Jwks>().await?;
    tracing::debug!("Fetched JWKS response: {}", jwks.keys.len());
    Ok(jwks)
}

#[derive(serde::Deserialize)]
struct Claims {
    sub: String, // Clerk puts the user's clerk_id here
    exp: usize,  // expiry — jsonwebtoken checks this automatically
}

struct JwksState {
    jwks: Option<Jwks>,
    last_fetch: Option<std::time::Instant>,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Jwks {
    pub keys: Vec<Jwk>,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Jwk {
    pub kid: String,
    pub kty: String,
    pub alg: String,
    pub n: String, // RSA modulus (base64url)
    pub e: String, // RSA exponent (base64url)
}

#[derive(Clone)]
struct AppState {
    pool: sqlx::SqlitePool,
    jwks_url: String,
    jwks: Arc<RwLock<JwksState>>,
}

// CRUD API for tasks, with SQLx integration.

async fn list_tasks(
    State(state): State<AppState>,
    Extension(user_id): Extension<i64>,
) -> impl IntoResponse {
    match db::list_tasks(&state.pool, user_id).await {
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
    Extension(user_id): Extension<i64>,
    Json(draft): Json<TaskDraft>,
) -> impl IntoResponse {
    match db::create_task(&state.pool, user_id, draft).await {
        Ok(task) => (StatusCode::CREATED, Json(task)).into_response(),
        Err(e) => {
            tracing::error!("create_task failed: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

async fn get_task(
    State(state): State<AppState>,
    Path(id): Path<u32>,
    Extension(user_id): Extension<i64>,
) -> impl IntoResponse {
    match db::get_task(&state.pool, user_id, id).await {
        Ok(Some(task)) => Json(task).into_response(),
        Ok(None) => StatusCode::NOT_FOUND.into_response(),
        Err(e) => {
            tracing::error!("get_task failed: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

async fn update_task(
    State(state): State<AppState>,
    Path(id): Path<u32>,
    Extension(user_id): Extension<i64>,
    Json(update): Json<TaskUpdate>,
) -> impl IntoResponse {
    match db::update_task(&state.pool, user_id, id, update).await {
        Ok(task) => Json(task).into_response(),
        Err(e) => {
            tracing::error!("update_task failed: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

async fn delete_task(
    State(state): State<AppState>,
    Path(id): Path<u32>,
    Extension(user_id): Extension<i64>,
) -> impl IntoResponse {
    match db::delete_task(&state.pool, user_id, id).await {
        Ok(true) => StatusCode::NO_CONTENT.into_response(),
        Ok(false) => StatusCode::NOT_FOUND.into_response(),
        Err(e) => {
            tracing::error!("delete_task failed: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    }
}

// Authentication middleware for clerk JWTs.

fn validate_jwt(token: &str, jwks: &Jwks, kid: String) -> Result<Claims, StatusCode> {
    //let kid_string = kid.ok_or(StatusCode::BAD_REQUEST)?;

    // Find the corresponding JWK in the JWKS
    let jwk = match jwks.keys.iter().find(|k| k.kid == kid) {
        Some(j) => j,
        None => {
            tracing::warn!("No matching JWK found for KID: {}", kid);
            return Err(StatusCode::UNAUTHORIZED);
        }
    };

    let decoder = match DecodingKey::from_rsa_components(&jwk.n, &jwk.e) {
        Ok(d) => d,
        Err(e) => {
            tracing::error!("Failed to create decoding key: {:?}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    let mut validation = jsonwebtoken::Validation::new(jsonwebtoken::Algorithm::RS256);

    validation.validate_aud = false; // Clerk doesn't use the 'aud' claim, so we disable audience validation

    match decode::<Claims>(token, &decoder, &validation) {
        Ok(data) => Ok(data.claims),
        Err(e) => {
            tracing::debug!("JWT validation failed: {:?}", e);
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}

async fn user_verified(
    token: &str,
    state: &AppState,
    kid: Option<String>,
) -> Result<String, StatusCode> {
    // Phase 1: populate or refresh cache if over 24 hours old
    let needs_refresh = {
        let guard = state.jwks.read().await;
        guard
            .last_fetch
            .map(|t| t.elapsed() > std::time::Duration::from_hours(24))
            .unwrap_or(true)
    };

    if needs_refresh {
        let mut guard = state.jwks.write().await;
        match fetch_jwks(&state.jwks_url).await {
            Ok(fresh) => {
                guard.jwks = Some(fresh);
                guard.last_fetch = Some(std::time::Instant::now());
            }
            Err(e) => {
                tracing::error!("Failed to refresh JWKS cache: {:?}", e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }
    }

    // Phase 2: try to validate with current cache
    let jwks = {
        let guard = state.jwks.read().await;
        guard
            .jwks
            .clone()
            .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?
    };

    if let Ok(claims) = validate_jwt(token, &jwks, kid.clone().unwrap()) {
        return Ok(claims.sub);
    }

    // Phase 3: validation failed — if cache is over 2 minutes old, refresh and retry once
    let cache_is_stale = {
        let guard = state.jwks.read().await;
        guard
            .last_fetch
            .map(|t| t.elapsed() > std::time::Duration::from_mins(2))
            .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?
    };

    if cache_is_stale {
        let mut guard = state.jwks.write().await;
        match fetch_jwks(&state.jwks_url).await {
            Ok(fresh) => {
                guard.jwks = Some(fresh);
                guard.last_fetch = Some(std::time::Instant::now());
            }
            Err(e) => {
                tracing::error!("Failed to refresh JWKS cache: {:?}", e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }
        let jwks = guard.jwks.clone().unwrap();
        drop(guard);
        if let Ok(claims) = validate_jwt(token, &jwks, kid.clone().unwrap()) {
            return Ok(claims.sub);
        }
    }

    Err(StatusCode::UNAUTHORIZED)
}

// Main auth middleware function. Validates user requests against clerk JWT cache.
async fn auth_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    tracing::debug!("Request received at: {}", request.uri());

    // get the JWT
    let token = request
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "));

    let Some(token) = token else {
        return StatusCode::UNAUTHORIZED.into_response();
    };

    let header = match decode_header(token) {
        Ok(h) => h,
        Err(_) => return StatusCode::UNAUTHORIZED.into_response(),
    };
    tracing::debug!("Decoded JWT header: {:?}", header);
    // get KID
    let kid = header.kid;
    tracing::debug!("Extracted KID: {:?}", kid);
    if kid.is_none() {
        return StatusCode::UNAUTHORIZED.into_response();
    }

    let clerk_id = match user_verified(token, &state, kid).await {
        Ok(id) => id,
        Err(status) => return status.into_response(),
    };

    // if valid call next, else return 401
    let user_id = match db::get_or_create_user(&state.pool, &clerk_id).await {
        Ok(id) => id,
        Err(e) => {
            tracing::error!("Failed to get or create user: {:?}", e);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    };
    request.extensions_mut().insert(user_id);

    let response = next.run(request).await;
    tracing::debug!("Response status: {}", response.status());
    response
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

    let state = AppState {
        pool,
        jwks_url: std::env::var("CLERK_JWKS_URL").expect("CLERK_JWKS_URL must be set"),
        jwks: Arc::new(RwLock::new(JwksState {
            jwks: None,
            last_fetch: None,
        })),
    };
    let cors = CorsLayer::new()
        .allow_origin(
            "http://localhost:5173"
                .parse::<axum::http::HeaderValue>()
                .unwrap(),
        )
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/tasks", get(list_tasks).post(create_task))
        .route(
            "/tasks/:id",
            get(get_task).patch(update_task).delete(delete_task),
        )
        .with_state(state.clone())
        .layer(middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ))
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
