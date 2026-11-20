# Contributing to SlopCheck

Thanks for helping make SlopCheck better. Most contributions are rule additions, and those are deliberately simple: the whole detector is a table of regular expressions in one file. This guide covers local setup, the pull-request flow, and the conventions we follow.

## Running locally

```bash
git clone https://github.com/webxiongda/slopcheck.git
cd slopcheck
npm install
npm run dev
```

Open `http://localhost:5173`. Analysis runs entirely in the browser, so there is no env file, API key, or backend to configure. Before opening a PR, run:

```bash
npm run build
```

This runs `tsc` with strict mode and then produces a static bundle with Vite. Both must pass.

## Proposing a change

1. Fork the repository and create a small branch off `main` (for example `add-cliche-rules`).
2. Keep the change focused: one category of rules, one bug fix, or one page improvement per PR.
3. Describe what changed and why. For a new rule, include a sample sentence that should trigger it and the substitution you expect.
4. Open a pull request against `main`. For larger refactors, open an issue first so the approach can be discussed.

Rules live in [`src/rules.ts`](src/rules.ts); scoring and rewriting live in [`src/analyzer.ts`](src/analyzer.ts); pages live in `src/pages/`. Adding a word or phrase usually means touching only `src/rules.ts`.

## Code style

- **TypeScript strict**: all source is strict-mode TypeScript. Do not add `any` or suppress compiler errors to make a change pass.
- **Chinese business comments**: inline comments explaining domain intent are written in Chinese, matching the existing codebase. Keep them short and factual.
- **One rule per line**: follow the existing `Rule` shape — `category`, `source`, `flags`, `reason`, `suggestion`, and optional `replacement` / `minCount`. Add English rules under the English section and Chinese rules under the Chinese section.
- **No new runtime dependencies**: the rule engine is intentionally zero-dependency. Do not introduce a package for regex, scoring, or charting without discussing it first.
- **Keep it readable**: prefer a clear regex over a clever one, and write suggestions the way you would explain the fix to a colleague.

## Commit convention

Use a short, imperative subject with a type prefix:

- `feat:` — a new rule, page, or capability.
- `fix:` — a bug in detection, dedup, scoring, or UI.
- `refactor:` — restructuring without changing behavior.
- `chore:` — docs, tooling, dependencies, or cleanup.

For example: `feat: add Chinese buzzword rules for 颗粒度` or `fix: preserve capitalization after rewrite`.

## Good first issues

- Add an English cliché with a natural, plainer replacement (and a short `reason`).
- Add a Chinese internet buzzword with a concrete substitute rather than a vague synonym.
- Improve an existing `suggestion` so it is more specific and actionable.
- Cover an edge case in overlap dedup or in token counting for mixed Chinese/English text.
- Refine the SVG charts or improve keyboard accessibility on the workbench.
- Fix a typo or clarify wording in either README.

## Code of conduct

Be respectful and constructive; assume good intent and keep discussions focused on the work.

MIT © SlopCheck contributors.
