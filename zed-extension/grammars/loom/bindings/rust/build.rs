fn main() {
    let src_dir = std::path::Path::new("src");

    let mut c_config = cc::Build::new();
    c_config.std("c11").include(src_dir);

    #[cfg(target_env = "msvc")]
    c_config.flag("-utf-8");

    if std::env::var("TARGET").unwrap() == "wasm32-unknown-unknown" {
        let wasm_headers = std::env::var("DEP_TREE_SITTER_LANGUAGE_WASM_HEADERS")
            .expect("DEP_TREE_SITTER_LANGUAGE_WASM_HEADERS must be set");
        let wasm_src = std::env::var("DEP_TREE_SITTER_LANGUAGE_WASM_SRC")
            .map(std::path::PathBuf::from)
            .expect("DEP_TREE_SITTER_LANGUAGE_WASM_SRC must be set");

        c_config.include(&wasm_headers);
        c_config.files([
            wasm_src.join("stdio.c"),
            wasm_src.join("stdlib.c"),
            wasm_src.join("string.c"),
        ]);
    }

    for path in &[src_dir.join("parser.c"), src_dir.join("scanner.c")] {
        c_config.file(path);
        println!("cargo:rerun-if-changed={}", path.to_str().unwrap());
    }

    c_config.compile("tree-sitter-loom");
}
