<div align="center">

<pre>
██╗      ██████╗  ██████╗ ███╗   ███╗
██║     ██╔═══██╗██╔═══██╗████╗ ████║
██║     ██║   ██║██║   ██║██╔████╔██║
██║     ██║   ██║██║   ██║██║╚██╔╝██║
███████╗╚██████╔╝╚██████╔╝██║ ╚═╝ ██║
╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝
</pre>

**Literate programming framework for AI-assisted engineering.**

[![npm](https://img.shields.io/npm/v/@athrio/loom-cli.svg?color=14b8a6&label=%40athrio%2Floom-cli)](https://www.npmjs.com/package/@athrio/loom-cli)
![license](https://img.shields.io/badge/license-MIT%20AND%20Apache--2.0-blue.svg)
![status](https://img.shields.io/badge/status-pre--release-f59e0b.svg)
[![Telegram](https://img.shields.io/badge/Telegram-athrio-26A5E4?logo=telegram&logoColor=white)](https://t.me/athrio)

</div>

> [!NOTE]
> **Loom is a work in progress.** The parser, the tangler, and
> the `loom` command-line tool work today; the editor language and the
> multi-language support are landing now. We are aiming for a first public
> release by the end of summer 2026. Until then, the syntax and the tangled
> output will change.

## 📖 What is Loom?

Loom is a literate programming framework. You write one `.loom` file in which
prose and code live together, in the order that best explains the program. From
that single source the `loom` command-line tool does two things: it **tangles**
the code into real source files on disk, and it serves the file to your editor
as a **live language** — type-checked, navigable, and highlighted, section by
section.

The idea is Donald Knuth's. "Instead of imagining that our main task is to
instruct a computer what to do, let us concentrate rather on explaining to human
beings what we want a computer to do," he wrote in 1984 — a program as "a work
of literature." Loom takes that literally. The prose is not a comment on the
code; it is the code's other half, and neither half ships without the other.

Loom is language-agnostic. A document names its primary language, and any
section may switch — TypeScript in one, a JSON manifest in the next, a shell
script below.

## 💡 Why Loom?

Loom grew out of the daily experience of building software with large language
models. A handful of problems kept coming back, and Loom answers them.

- 📄 **Docs drift from code.** A document describes the code until the code
  changes; then it lies, to every person and every model that reads it. In a
  loom there is nothing to drift — the prose and the code are one file, edited
  together and tangled together.
- 🧭 **Generated code forgets why it exists.** A model can write code that runs
  and explains nothing. Loom keeps the reasoning beside the implementation, so
  the next reader — a teammate, or the next model — inherits the intent and not
  just the result.
- 📐 **Standards are hard to hold.** Conventions scatter across a wiki, a style
  guide, and people's memory, and every contributor reinvents them. A loom
  states its standards in prose, in place, where the author and the model both
  read them as they work.
- 🎯 **Models work best with intent in view.** A model guided by a clear
  specification next to the code wanders less and guesses less. Loom puts the
  specification and the implementation in one window, so good context is the
  default rather than something you assemble by hand.

The thread through all four is one source of truth, written for people first.
That serves the humans on the team, and it is exactly the context a model needs
to do good work.

## 🧵 A taste

Here is a whole Loom program. Read the prose top to bottom; the code blocks fall
wherever the story needs them.

```loom
---
Language: TypeScript
Package: src/main.ts
---

# A greeting

The `greet` function welcomes someone by name.

=>

export const greet = (name: string): string => `Hello, ${name}!`

# The entry point {Tangle}

The program greets the world and prints the result.

=>

::[A greeting]

console.log(greet("world"))
```

The rhythm is two marks: `=>` turns prose into code, and `~` turns it back. The
frontmatter names the file this loom writes; the `{Tangle}` heading marks the
section written there, and `::[A greeting]` pulls another section in by name.

Running `loom tangle greeting.loom` drops the prose, assembles the code in
composition order, and writes `src/main.ts`:

```ts
export const greet = (name: string): string => `Hello, ${name}!`

console.log(greet("world"))
```

Open the same `.loom` in your editor and it is live, not a flat document. Each
section is highlighted in its own language, the greeting is type-checked as
TypeScript, and a broken `::[…]` anchor or a malformed tag is reported as a
diagnostic, right where the problem is. Go-to-definition follows an anchor to
the section it names.

## 🌍 Any language

Loom composes any language, so the editor serves each section in the language it
was written in:

- **TypeScript and JavaScript** — the languages Loom itself is built in.
- **Markdown, CSS, HTML, and JSON** — and everything else
  [Volar](https://volarjs.dev) supports — out of the box.
- **Python, Kotlin, and Scala** — next, each through its own language server.
- More on the roadmap. Framework support is in progress, starting with Vue, Astro, and Next.js.

## ⚡ Using Loom

Install the command-line tool (Node.js 18 or newer):

```sh
npm install -g @athrio/loom
```

It gives you three commands:

```sh
# Scaffold a package — pick its primary language and the editor services to turn on
loom init

# Tangle a .loom file (or a directory of them) into real source files
loom tangle greeting.loom

# Start the language server for any editor, over standard input and output
loom lsp --stdio
```

An editor extension for Visual Studio Code ships in this repository, built as a
`.vsix` package; a Marketplace listing is on the roadmap. Any editor that speaks
the Language Server Protocol can use `loom lsp --stdio` today.

## 🗺️ Status & roadmap

Loom is pre-release. The core works, and the rest is landing on the way to a
first public release by the end of summer 2026.

- [x] Literate parser, product composition, and the `loom` tangler
- [x] Live language in the editor — diagnostics, navigation, and per-section highlighting
- [x] Loom's own health surfaced as editor diagnostics
- [ ] Multi-language editor support — the TypeScript service first, then Python, Kotlin, and Scala
- [ ] Framework support, starting with Vue, Astro, and Next.js
- [ ] The Visual Studio Code extension on the Marketplace
- [ ] Stable command-line and language interfaces — the first public release

## 🪡 Loom is written in Loom

Loom builds itself. Every package in this repository is a `.loom` corpus that
the published `loom` tool tangles to source — the parser, the command-line tool,
and the language packages alike. A literate framework that could not compose its
own code would have no business composing yours.

## 📚 Further reading

- [`corpus/book.loom`](./corpus/book.loom) — the book: Loom's own source and
  its only specification, every chapter's prose beside the code it describes.
- [`CLAUDE.md`](./CLAUDE.md) — the vision and the working directives.
- The prose standard, [`.claude/skills/prose/SKILL.md`](./.claude/skills/prose/SKILL.md)
  — how a loom is written.
- Donald E. Knuth, "Literate Programming," *The Computer Journal* 27(2), 1984 —
  where the idea begins.

## 💬 Community

Questions, ideas, and progress updates land on Telegram. Come say hello at
**[t.me/athrio](https://t.me/athrio)**.

## 🤝 Contributing

Loom is early and its surface moves quickly, so please open an issue before a
large change. Be kind — see [CONDUCT.md](./CONDUCT.md).

## ⚖️ License

Dual-licensed under [MIT](./LICENSE-MIT) and [Apache-2.0](./LICENSE-APACHE).

<details>
<summary>Maintainers — packaging notes</summary>

The Vite build for `packages/loom-lang` and `packages/loom-vscode`
**externalizes all runtime `dependencies`** rather than bundling them. This is
deliberate: rolldown (Vite 8's bundler) cannot statically rewrite the
`require()` calls inside the UMD wrappers used by packages such as
`vscode-html-languageservice`, so bundling them produces a `MODULE_NOT_FOUND` at
runtime. The externals list is derived from each package's `dependencies` field
— any package added there is excluded from the bundle and resolved by Node
against `node_modules` at runtime.

- **Dev (Extension Development Host):** works as-is. pnpm links
  `packages/*/node_modules/` with symlinks into `.pnpm/`, so the spawned
  language-server process resolves its dependencies normally.
- **VSIX packaging:** `vsce package` does not follow pnpm's symlinks correctly.
  Flatten the dependency tree first:

  ```sh
  pnpm deploy --filter @athrio/loom-lang <staging-dir>
  ```

  Then run `vsce package` from the staged directory, or have the extension's
  `vscode:prepublish` step copy the deployed server in before packaging.

</details>
