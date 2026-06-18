# AGENTS.md

Guidance for AI agents and human contributors working in this repository.

## What this is

`typeahead-standalone` — a **fast, zero-dependency, framework-agnostic** autocomplete/typeahead
library written in TypeScript and shipped as a Vite library build (ES + UMD). It runs in the
**browser** (uses `document`, `fetch`, `ResizeObserver`, etc.).

- Entry point: [src/typeahead-standalone.ts](src/typeahead-standalone.ts) — the main controller.
- Search engine: [src/trie/trie.ts](src/trie/trie.ts) — a Trie-based suggestion index.
- Helpers: [src/helpers.ts](src/helpers.ts) — normalizer, tokenizer, diacritics, escaping.
- Remote I/O: [src/fetchWrapper/fetchWrapper.ts](src/fetchWrapper/fetchWrapper.ts).
- Public types/contracts: [src/common.d.ts](src/common.d.ts) and [src/trie/types.d.ts](src/trie/types.d.ts).
- Styles: [src/style.less](src/style.less) (built to `dist/basic.css`).

## Golden rules

1. **Zero runtime dependencies.** Do not add any. It is a core selling point.
2. **Don't break the public API** without a major version bump. The public surface is:
   the default export `typeahead(config)` returning `{ addToIndex, reset, destroy }`,
   the `Trie` factory, the config/types in `src/common.d.ts`, and the CSS class names
   (`tt-*`, `typeahead-standalone`).
3. **Browser environment.** Code must run in browsers; avoid Node-only APIs in `src/`.
4. **Security:** template callbacks render via `innerHTML` (`templatify`). Treat any consumer/remote
   data flowing into templates as untrusted — never expand the raw-HTML surface, and prefer
   `textContent` for built-in rendering. See `plans/hardening-and-improvement-plan.md` §1.

## Setup & commands

This project uses **pnpm** (CI uses pnpm; matches `pnpm-lock.yaml`).

```bash
pnpm install          # install deps  (or: make install)
pnpm dev              # vite dev server, opens demo/index.umd.html
pnpm prod             # production build to dist/  (or: make prod)
pnpm test             # run unit tests once (Vitest)
pnpm test:dev         # Vitest watch mode
pnpm coverage         # unit tests with coverage
pnpm test-e2e         # Cypress e2e (headless Chrome)  (or: make test-e2e)
pnpm test-e2e-gui     # Cypress interactive
pnpm lint             # eslint --fix over src/ (mutates files)
```

The `Makefile` wraps the common targets (`make install|prod|tests|test-unit|test-e2e`).

`make deploy-docs` rsyncs `docs/` to the static server
(`nikslab:/srv/static/typeahead-docs/`, `--delete` mirrors removals). Requires SSH access
to the `nikslab` host.

> Note: `lint` runs with `--fix` and mutates files — don't rely on it as a CI gate.
> There is currently no standalone `typecheck`/`lint:check` script (see the plan, §5.3).

## Testing expectations

- **Unit tests** (`*.spec.ts`, Vitest, jsdom-style globals): [src/typeahead.spec.ts](src/typeahead.spec.ts),
  [src/trie/trie.spec.ts](src/trie/trie.spec.ts). Currently cover `normalizer` and the trie.
- **E2E** (Cypress, incl. `cypress-axe` accessibility): [cypress/e2e/](cypress/e2e/). Most controller
  behaviour (keyboard nav, remote flow, hint, highlight) is covered here, not in unit tests.
- When changing controller logic, add/extend tests. Prefer a unit test if it can be expressed in
  jsdom; otherwise extend the Cypress specs. Run `pnpm test` and `pnpm test-e2e` before finishing.

## Code style

- TypeScript `strict` mode; keep `noImplicitAny`/`verbatimModuleSyntax` happy.
- Prettier: single quotes, semicolons, `printWidth` 120, 2-space indent, `trailingComma: es5`.
- Match the surrounding functional/closure style of `typeahead-standalone.ts` — the controller is a
  single factory function with closures, not a class.
- Use `Object.create(null)` for lookup maps/caches (prototype-safety; already the convention).

## Conventions & gotchas

- Caches (`remoteQueryCache`/`remoteResponseCache`) are keyed by `JSON.stringify(query)`.
- `reset()` clears the index + caches (keeps local-source items unless `clearLocalSrc`); `destroy()`
  removes listeners, disconnects the `ResizeObserver`, and restores the DOM.
- Error codes are terse strings (`e01`–`e05`); keep that scheme if adding new ones.
- Build output and `dist/` are generated — don't hand-edit `dist/`.

## Active improvement plan

A prioritized hardening / performance / code-review plan lives in
[plans/hardening-and-improvement-plan.md](plans/hardening-and-improvement-plan.md).
Consult it before large changes and keep it updated as items land.

## Commits & PRs

- Current working branch: `develop`. Default/release branch: `master`.
- Conventional, emoji-prefixed commit messages are used in history (e.g. `✨ feat:`, `📝 docs:`,
  `chore:`). Follow the existing style.
- See [contributing.md](contributing.md) and the PR template in `.github/`.
- Report security issues privately per [SECURITY.md](SECURITY.md) — do not open public issues/PRs.
