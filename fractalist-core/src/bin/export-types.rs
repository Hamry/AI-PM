#[allow(unused_imports)]
use fractalist_core::models::{Estimation, Task, TaskDraft, TaskId, TaskMetadata, TaskStatus};
use specta_typescript::Typescript;

fn main() {
    let types = specta::collect();

    Typescript::default()
        .export_to("shared-ui/src/types/bindings.ts", &types)
        .expect("Failed to export types");
}
