# Literate Framework — agent install prompt

Paste the following into your coding agent. The agent will
execute the manual install path documented in the repo-root
README. The agent's path and a human's path are the same path;
this document just packages it for the agent context.

---

> Install the Literate Framework on this machine following
> the canonical path: https://github.com/athrio-com/literate#install
>
> Specifically:
>
> 1. Check if Bun is installed (`bun --version`). If absent,
>    install via `curl -fsSL https://bun.sh/install | bash`
>    and source the user's shell rc to pick up the PATH.
>    Verify Bun is invocable.
>
> 2. Run `bun install -g @literate/cli`. This installs the CLI
>    globally under `~/.bun/bin/literate`.
>
> 3. Verify the install: run `literate --version` and confirm
>    the output matches the latest published alpha version (or
>    a version the user explicitly pinned).
>
> 4. If the user is in a project directory and asked to
>    initialize, run `literate init <name>` per their
>    instruction. Otherwise stop after step 3 and tell the
>    user the install is complete.
>
> Constraints:
>
> - Do not use mise, asdf, volta, or any tool manager unless
>   the user already has one configured and explicitly asks
>   for project-scoped install.
> - Do not modify global tool versions for any tool other than
>   adding Bun (if missing).
> - Do not invent shell scripts. Do not modify shell rc files
>   beyond what Bun's own installer does.
> - If `bun install -g` fails for any reason (auth, network,
>   permissions), report the exact error and stop. Do not
>   improvise an alternative install vector.
> - Report which steps were taken and which were skipped
>   (Bun-was-already-installed → step 1 skipped, etc.).
