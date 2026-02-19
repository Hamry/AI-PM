use specta::Type;
use serde::Serialize;

#[derive(Type, Serialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub estimation_minutes: u32,
}