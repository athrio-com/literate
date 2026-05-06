use zed_extension_api as zed;

struct LoomExtension;

impl zed::Extension for LoomExtension {
    fn new() -> Self {
        LoomExtension
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> zed::Result<zed::Command> {
        worktree
            .read_text_file("src/server.ts")
            .map_err(|_| "Not a Loom project".to_string())?;

        let bun = worktree
            .which("bun")
            .ok_or_else(|| "bun not found on PATH".to_string())?;

        let server = format!("{}/src/server.ts", worktree.root_path());

        Ok(zed::Command {
            command: bun,
            args: vec!["run".into(), server, "--stdio".into()],
            env: vec![],
        })
    }
}

zed::register_extension!(LoomExtension);
