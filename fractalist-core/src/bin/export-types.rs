use specta_typescript::Typescript;

fn main() {
    Typescript::default()
        .export_to(
            "../shared-ui/src/types/bindings.ts",
            &specta::export::export(),
        )
        .expect("Failed to export types");
}
