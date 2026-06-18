# Typeahead-standalone — Hardening, Performance & Code-Review Plan

> Generated 2026-06-18. Target: `typeahead-standalone` v5.4.0.
> Scope: a zero-dependency, browser-side autocomplete library (TypeScript → Vite lib build).
> This plan is ordered by **risk/impact**. Each item is independently shippable and
> notes whether it is **behaviour-preserving (safe)** or **behaviour-changing**.

---

## 0. How to read this plan

Each item carries tags:

- **[SAFE]** — refactor/fix with no public-API or runtime-behaviour change. Ship freely.
- **[BEHAVIOUR]** — observable change; needs a changelog entry / minor or major bump.
- **[CHORE]** — tooling, CI, docs, repo hygiene.

Effort: **S** (<1h), **M** (a few hours), **L** (a day+).

Public surface to protect (do not break without a major bump): the default export
`typeahead(config)` and its return `{ addToIndex, reset, destroy }`, the `Trie` factory,
the config/type contracts in [src/common.d.ts](../src/common.d.ts), and the CSS class names.

---

## 1. Security hardening

### 1.1 Document & contain the template XSS surface — **[CHORE/BEHAVIOUR] · M** — *highest priority*
- `templatify()` ([src/typeahead-standalone.ts:880](../src/typeahead-standalone.ts#L880)) assigns developer-supplied
  template strings to `template.innerHTML`. Suggestion/header/footer/group/notFound/empty/loader
  templates routinely interpolate **remote data** and the **user's query**, so a careless
  consumer trivially creates a DOM-XSS sink (e.g. `suggestion: (i) => \`<div>${i.label}</div>\``
  with attacker-controlled `label`).
- This is by-design (templates "can contain HTML"), so the fix is **defensive documentation + tooling**, not removal:
  - ✅ **Done (PR5):** added a "Security: escape untrusted data in templates" callout to the README
    (with a copy-paste escaping snippet) and a security note to the `templates` JSDoc in
    [src/common.d.ts](../src/common.d.ts).
  - ✅ **Done (PR5):** added an `escapeHtml()` helper in [src/helpers.ts](../src/helpers.ts) (unit-tested).
    Kept it an internal utility rather than a package named export — adding a named export would
    nest the function under `.default` in the UMD build and **break existing global consumers**.
    The README documents the equivalent snippet for consumers.
  - ✅ Documented that the built-in (non-template) render path uses `textContent` and is safe.
- **Why:** this is the single most likely real-world vulnerability introduced *through* the library.

### 1.2 Harden `fetchWrapper` — **[BEHAVIOUR] · M** — *partially shipped (PR3 safe subset)*
File: [src/fetchWrapper/fetchWrapper.ts](../src/fetchWrapper/fetchWrapper.ts)
- ✅ **Done:** `JSON.parse(text)` is now guarded with `try/catch` — a non-JSON body rejects cleanly
  instead of letting a raw `SyntaxError` escape the wrapper's rejection contract.
- ✅ **Done:** opt-in request **timeout** via `AbortController` — pass `timeout` (ms) inside
  `requestOptions` to auto-abort a slow request. Default is off, so default behaviour is unchanged.
  (Native `signal` in `requestOptions` was already honoured and still is.)
- ⏸️ **Deferred:** rejecting with an `Error` object (instead of the current string reason) — this
  changes the reject-reason type and needs a changelog note + minor bump.
- ⏸️ **Deferred:** aborting the in-flight request when a newer query supersedes it — see 2.4.
- ✅ Dead commented-out `post` block already removed in PR1 (4.3).

### 1.3 Cap the remote caches (memory-growth / soft-DoS) — **[BEHAVIOUR] · M** — *shipped (PR3)*
- `remoteQueryCache` and `remoteResponseCache` ([src/typeahead-standalone.ts](../src/typeahead-standalone.ts))
  were keyed by `JSON.stringify(query)` and **never evicted** within a session.
- ✅ **Done:** both caches are now capped (`REMOTE_CACHE_LIMIT = 200`, FIFO eviction, kept in sync).
  Set high enough to be a no-op for typical usage; `reset()` still clears them entirely.
- ⏸️ **Optional follow-up:** expose the cap as a `cacheSize` config option (additive, public-type change).

### 1.4 Avoid prototype-pollution-shaped object literals — **[SAFE] · S**
- `calcSuggestions` builds `const uniqueItems = {} as Dictionary<T>` then assigns
  `uniqueItems[identity(item)] = item` ([src/typeahead-standalone.ts:618](../src/typeahead-standalone.ts#L618)).
  If `identity()` can return `__proto__`/`constructor`, this writes onto the prototype.
  Use `Object.create(null)` (the trie and the caches already do this — make it consistent).

### 1.5 `isObject` realm/edge robustness — **[SAFE] · S**
- `item?.constructor.name === 'Object'` ([src/helpers.ts:9](../src/helpers.ts#L9)) breaks for
  cross-realm objects (iframes) and throws on `Object.create(null)` inputs (no `constructor`).
  Prefer `Object.prototype.toString.call(item) === '[object Object]'` or a guarded check.

### 1.6 Supply-chain / CI security — **[CHORE] · M** (see §5 for the full CI rewrite)
- Add `pnpm audit` (or Dependabot/Renovate) to CI.
- Modernise the **CodeQL** workflow (currently pinned to sunset actions — see 5.2).

---

## 2. Performance

### 2.1 Don't `await` the no-op `updateHits` hook on every render — **[SAFE] · S**
- `update()` is `async` and unconditionally `await`s `hooks.updateHits(...)`
  ([src/typeahead-standalone.ts:320-329](../src/typeahead-standalone.ts#L320)). The default is `NOOP`,
  yet awaiting it still defers the entire render by a microtask on **every keystroke and every
  arrow-key navigation**. Short-circuit when no hook was supplied (`config.hooks?.updateHits`),
  keeping the async path only when a real hook exists.

### 2.2 Don't arm a remote debounce timer when there is no remote source — **[SAFE] · S**
- `startFetch` sets `remoteDebounceTimer = setTimeout(...)` on every keystroke
  ([src/typeahead-standalone.ts:592](../src/typeahead-standalone.ts#L592)) even when `remote` is `null`;
  the callback then no-ops. Guard the whole `setTimeout`/`clearRemoteDebounceTimer` path behind
  `if (remote)` to avoid needless timer churn in the common local-only case.

### 2.3 Precompute sort keys (Schwartzian transform) — **[SAFE] · S/M**
- `sortByStartingLetter` calls `getNestedValue(item, keys[0]).toLowerCase()` **twice per comparison**
  ([src/typeahead-standalone.ts:712](../src/typeahead-standalone.ts#L712)); `sortByGroup` similarly recomputes
  `getNestedValue` per comparison. For each list, map once to `{item, key}` , sort, then unwrap.
  Turns O(n log n) string ops into O(n) + cheap compares.

### 2.4 Cancel superseded remote requests — **[BEHAVIOUR] · M**
- `fetchDataFromRemote` recurses to fire a fresh request when the query changed mid-flight
  ([src/typeahead-standalone.ts:690](../src/typeahead-standalone.ts#L690)) but never aborts the stale one,
  so responses can land out of order and waste bandwidth. Combine with the `AbortController`
  from 1.2 to cancel the previous in-flight request.

### 2.5 Hoist the highlight regex out of the per-suggestion loop — **[SAFE] · S**
- `highlight()` rebuilds the tokenized/escaped regex from `resultSet.query` for **every** rendered
  suggestion ([src/typeahead-standalone.ts:772-784](../src/typeahead-standalone.ts#L772)). The query is constant
  for a render pass — compute the regex once in `update()` and pass it in.

### 2.6 Build the search index in one pass over multiple keys — **[SAFE] · M**
- `updateSearchIndex` loops `for (const token of keys) trie.add(iterable, token, identity)`
  ([src/typeahead-standalone.ts:700-707](../src/typeahead-standalone.ts#L700)), re-iterating the full dataset once
  per key. For multi-key sources this is N×keys passes. Consider an `add` variant that accepts
  multiple keys and iterates the data once. (Measure first; only matters for large multi-key sets.)

---

## 3. Correctness / code review

### 3.1 `Enter` selection vs. open list — **[BEHAVIOUR] · S** — *verify against intended UX*
- On `Enter`, `useSelectedValue()` is called with no fallback ([src/typeahead-standalone.ts:531-536](../src/typeahead-standalone.ts#L531)),
  so it submits only an explicitly-selected item; `Tab` uses `fallback=true`. Confirm this asymmetry
  is intentional and add a regression test either way (it's easy to break during refactors).

### 3.2 `Escape` does not `preventDefault` — **[BEHAVIOUR] · S**
- `keydownEventHandler` returns `clear()` on `Escape` ([src/typeahead-standalone.ts:497](../src/typeahead-standalone.ts#L497))
  without stopping propagation; in some forms Escape resets the field. Decide and document; add test.

### 3.3 `blur` clear uses a magic 50ms race with `click` — **[SAFE-ish] · M**
- The 50ms `setTimeout` in `blurEventHandler` ([src/typeahead-standalone.ts:887-894](../src/typeahead-standalone.ts#L887))
  races suggestion `click`. The existing `mousedown` `preventDefault` on the list
  ([src/typeahead-standalone.ts:899](../src/typeahead-standalone.ts#L899)) should already keep focus on the input —
  evaluate whether the timeout can be removed entirely, or replace with a `relatedTarget`/
  `pointerdown` check to remove the timing fragility.

### 3.4 `destroy()` leaves the original input's typeahead class — **[SAFE] · S**
- `destroy()` does `wrapper.replaceWith(input.cloneNode())` ([src/typeahead-standalone.ts:931](../src/typeahead-standalone.ts#L931)).
  The clone still carries the `tt-input` class added at init ([:120](../src/typeahead-standalone.ts#L120)) and the
  clone drops listeners the host app may have attached to the original input. Restore the original
  element (minus our class) rather than a clone, or document the cloning behaviour explicitly.

### 3.5 `normalizer` with string array and no key — **[SAFE] · S**
- With no `key`, string items become `{ "undefined": value }` (the literal key `"undefined"`),
  asserted by an existing test ([src/typeahead.spec.ts:19-28](../src/typeahead.spec.ts#L19)). In practice `keys[0]`
  defaults to `'label'`, so this only bites direct `Trie`/helper users. Make the key required for
  the public path or guard it.

### 3.6 Trie `search` builds full match set before truncating to `limit` — **[SAFE] · M**
- `find()` does a full DFS and `search` truncates afterwards (`suggestions.length = limit`,
  [src/trie/trie.ts:126](../src/trie/trie.ts#L126)). `count` legitimately needs the full set, but for very large
  indices the full materialisation is the dominant cost. Optional: short-circuit DFS once enough
  matches are found **when** the caller doesn't need an exact `count`. Keep current behaviour by default.

---

## 4. Redundancy / dead code

### 4.1 Remove the broken/unused Babel config — **[CHORE] · S**
- [babel.config.js](../babel.config.js) references `@babel/preset-env`, which is **not** a dependency,
  and nothing uses Babel (tests run on Vitest/esbuild). Delete it.

### 4.2 Fix the ESLint config drift — **[CHORE] · M**
- [.eslintrc.cjs](../.eslintrc.cjs) declares the `jest` plugin + `jest/globals` env, but the project
  uses **Vitest**; `eslint` core itself is **not in `devDependencies`** (lint relies on an ambient
  global install). It also pins `ecmaVersion: 2017` while the code targets ES2020.
  - Add `eslint` to devDependencies (pin a major), drop the jest plugin/env, bump `ecmaVersion`.
  - Consider migrating to flat config (`eslint.config.js`) since the toolchain is ESLint 9-era.

### 4.3 Delete dead code — **[SAFE] · S**
- `deduplicateArr` in [src/helpers.ts:28-31](../src/helpers.ts#L28) is `@deprecated` and unreferenced.
- The commented-out `post` block in [src/fetchWrapper/fetchWrapper.ts:28-39](../src/fetchWrapper/fetchWrapper.ts#L28).
- Duplicate JSDoc comment blocks for `group`/`loader` in [src/common.d.ts:157-164](../src/common.d.ts#L157)
  and [:195-201](../src/common.d.ts#L195).
- The commented `// trie,` export ([src/typeahead-standalone.ts:944](../src/typeahead-standalone.ts#L944)) and the
  `vite-plugin-dts` commented import in [vite.config.ts](../vite.config.ts) — keep or remove deliberately.

### 4.4 Resolve duplicate lockfiles — **[CHORE] · S**
- Both `package-lock.json` and `pnpm-lock.yaml` are committed; CI uses **pnpm**. The npm lockfile
  drifts silently. Pick pnpm (matches CI) and delete `package-lock.json`, or vice-versa — but keep one.

---

## 5. Tooling, CI & repo hygiene

### 5.1 Pin the toolchain — **[CHORE] · S**
- Add `"engines": { "node": ">=20" }` and `"packageManager": "pnpm@..."` to `package.json`.
  CI installs `pnpm@8` while local dev here is pnpm 10 — pin one to avoid lockfile-format surprises.
- Add a `.nvmrc`.

### 5.2 Modernise GitHub Actions — **[CHORE] · M**
- [.github/workflows/codeql-analysis.yml](../.github/workflows/codeql-analysis.yml) uses
  **`actions/checkout@v2`** and **`github/codeql-action/*@v1`** — both deprecated/sunset and will
  start failing. Bump to `checkout@v4` and `codeql-action@v3`.
- [.github/workflows/build-test.yml](../.github/workflows/build-test.yml): align pnpm version with the
  `packageManager` pin; add a `typecheck` + `lint --check` gate; add `pnpm audit`.

### 5.3 Add a CI-friendly lint + typecheck — **[CHORE] · S**
- `lint` always runs `eslint --fix` ([package.json](../package.json)), which mutates files and can't gate CI.
  Add `"lint:check": "eslint ./src --ext .ts"` (no `--fix`) and run that in CI.
- Add `"typecheck": "tsc --noEmit"` and run it in CI (the build currently emits via Vite/`vite-plugin-dts`
  but there's no standalone type gate).

### 5.4 Raise test coverage of the core — **[CHORE] · L** — *shipped (PR5)*
- ✅ **Done:** added jsdom-based controller tests in [src/typeahead.dom.spec.ts](../src/typeahead.dom.spec.ts)
  (rendering, limit/minLength, keyboard navigation + wrap-around, `addToIndex`/`reset` cleanup) and
  helper tests in [src/helpers.spec.ts](../src/helpers.spec.ts). Added `jsdom` + `@vitest/coverage-v8`
  devDeps. Coverage rose from the normalizer/trie-only baseline to ~64% statements.
- ✅ **Done:** coverage thresholds added to [vite.config.ts](../vite.config.ts) (set just below the
  current baseline) and enforced in CI via `pnpm coverage`.
- ⏸️ **Still light:** the remote/prefetch fetch flow (cache hit/miss, `updateHits` hook return-flags,
  hint/highlight DOM output). Worth a follow-up with a mocked `fetch`.

### 5.5 Documentation — **[CHORE] · S**
- Add the security/escaping section (1.1).
- This repo now ships `AGENTS.md` (agent/contributor quick-start) and `CLAUDE.md` (pointer).

---

## 6. Suggested execution order (PR slices)

1. **PR 1 — Repo hygiene [CHORE, low risk]:** delete `babel.config.js`, dead code (4.3),
   one lockfile (4.4); add `eslint` dep + fix config (4.2); add `engines`/`packageManager`/`.nvmrc` (5.1);
   add `typecheck`/`lint:check` scripts (5.3); modernise CodeQL + build CI (5.2).
2. **PR 2 — Safe perf [SAFE]:** 2.1, 2.2, 2.3, 2.5 + the proto-safe map (1.4) and `isObject` (1.5).
3. **PR 3 — Security/robustness [BEHAVIOUR]:**
   - ✅ *Safe subset shipped:* guarded `JSON.parse` + opt-in `AbortController` timeout (1.2), cache cap (1.3).
     No public-API or default-behaviour change.
   - ⏸️ *Deferred (needs changelog + minor bump):* `Error`-object reject reasons (1.2),
     superseded-request cancellation (2.4) — changes search-index accumulation semantics, and value is
     limited because remote requests are already serialized via the `fetchInProgress` flag.
4. **PR 4 — Correctness review [BEHAVIOUR]:** 3.1–3.6 with accompanying regression tests.
   - ✅ *Regression tests shipped* (in PR5's test commit): the current behaviour of Enter/Tab selection
     (3.1), Escape (3.2), and `destroy()` (3.4) is now locked in by tests so it can't change silently.
   - ⏸️ *Behavioural fixes deferred (need your decision):* 3.2 Escape `preventDefault`, 3.3 blur-timeout
     removal, 3.4 `destroy()` restore-vs-clone, 3.5 `normalizer` no-key. These change existing behaviour,
     so they're not "safe" even as a minor bump — best done behind opt-in flags if desired.
5. **PR 5 — Docs & tests [CHORE]:** ✅ *shipped* — security section + `escapeHtml` (1.1),
   jsdom controller tests + helper tests + coverage thresholds (5.4).

Each PR must keep the public API (§0) intact and pass `lint:check`, `typecheck`, unit + e2e suites.

---

## 7. Out of scope / explicitly not recommended

- Rewriting the trie to a different structure — current implementation is adequate and well-tested.
- Adding runtime dependencies — the zero-dependency promise is a core selling point; keep it.
- Switching bundlers — Vite lib mode is fine.
