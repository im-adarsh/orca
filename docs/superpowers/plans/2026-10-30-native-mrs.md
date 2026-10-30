# Native MRs Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. Track verified progress below.

**Goal:** A single native MRs entry below Tasks and Automations, with requests grouped by repository and portable GitHub/GitLab connections.

**Architecture:** Reuse Orca's sandboxed panel and worker infrastructure. Extend panel placement and the authenticated host facade; ship the provider worker and UI in `plugins/merge-request-inbox` and a reproducible upstream host patch in `host/`.

**Tech Stack:** Node ESM, browser HTML/CSS/JS, Orca TypeScript/React/Zod, node:test, existing Playwright.

**Spec:** `docs/superpowers/specs/2026-10-30-native-merge-request-inbox-design.md`, approved with subsequent correction: one MRs tab, grouped by repository. Use installed Ponytail 5.3.2 and REA.

## Global Constraints

- Deliver everything in im-adarsh/orca; preserve unrelated README edits and existing palettes/setup.
- Remove agent-profile/developer-command implementation (already done and verified).
- Preserve sandbox/CSP, encrypted credentials, per-plugin consent and remote-owner boundaries.
- No new runtime dependency, CLI requirement, terminal actions, or automatic provider mutations.
- Host patch base: 400266a9ce259337ec46836c2a8e18a449d49f4a. Source build and local fixtures precede publication.

## Review Focus

- Identical repository names on different hosts/accounts must remain separate groups.
- Closed GitHub PRs must exclude merged PRs; queries must never return issues.
- Self-hosted GitLab paths and pagination must preserve the configured instance prefix and origin.
- A stale/revoked frame or worker result must not leak secrets or update a new query.
- Failed secret/storage writes must not leave a broken connection advertised as saved.

### Task 1: Provider queries and grouping

Files: `plugins/merge-request-inbox/providers.mjs`, `model.mjs`, `tests/providers.test.mjs`.

Interfaces: `validateConnection(input)`, `identity(connection, token, fetcher)`, `listRequests(connection, token, filters, page, fetcher)`, `groupRequests(items)`.

- [x] Write and run failing node:test cases for GitHub state/username/repository query encoding, GitLab prefix/filters and origin confinement, pagination, and host/account-aware grouping.
- [x] Implement provider functions with fetch timeouts, bounded responses, strict connection/filter input, normalized rows and page metadata.
- [x] Run `node --test plugins/merge-request-inbox/tests/providers.test.mjs`; expect no failures.

### Task 2: Connections, secrets and saved views

Files: `plugins/merge-request-inbox/worker.mjs`, `tests/worker.test.mjs`, `orca-plugin.json`.

Interface: `createInbox(orca, {fetcher})` dispatches `{operation, ...params}`; default activate registers `inbox`.

- [x] Write and run failing tests using an in-memory host facade for encrypted credentials, sanitized results, persistence failure, connection removal, query paging and saved filters.
- [x] Implement serialized mutations, validation-before-save, worker-only token access, named views, bound pagination and read-only request opening.
- [x] Run `node --test plugins/merge-request-inbox/tests/*.test.mjs`; expect no failures.

### Task 3: Native host extension

Files in pinned host checkout: panel contribution/list types and projection, capability/API/binding/service, native navigation/page/route, right activity filtering; related tests and generated reference/schema.

Interfaces: panel `placement: 'navigation'`; `worker.invokeOwn({commandId,args})` and `links.openExternal({url})` behind explicit capabilities, using the existing frame host facade. `plugin-page` is a top-level view, with an in-memory selected panel key and valid return behavior.

- [x] Add failing tests for navigation placement and frame-bound own-worker invocation, forbidden cross-plugin/worker callers, revoked approval, malformed/deep/oversized payloads and concurrency limits.
- [x] Implement using existing session/worker command paths and bounded JSON result validation. Suppress argument/result audit logging. Keep stored page routes free of connection data.
- [x] Validate targeted host tests and `pnpm check:changed --maxWorkers=2`; record any environment blocker exactly.

### Task 4: Grouped MRs UI and browser verification

Files: `plugins/merge-request-inbox/panel.html`, `panel.js`, `panel.css`, `scripts/build-mrs-panel.mjs`, `scripts/verify-mrs-browser.cjs`.

Interface: `window.orca.host.call` uses Task 3; UI worker operations use Task 2; groups use Task 1.

- [x] Add browser assertions for empty/setup states, connection save/removal, filters, repository sections, saved views, pagination, query races and escaped remote text.
- [x] Build the compact token-based UI from the approved preview, labeled MRs, with no duplicate tab. Group only fetched rows and state pagination coverage clearly.
- [x] Run browser checks with the actual host shell/protocol and mocked provider fixtures. Capture screenshot of the implemented page.

### Task 5: Reproducible delivery and review

Files: `host/native-mrs.patch`, `host/contract.json`, `scripts/prepare-mrs-host.mjs`, `docs/native-mrs.md`, package scripts and marketplace preparation.

- [x] Test preparation against wrong base/dirty checkout and patch idempotence before writing the script.
- [x] Export host patch with all new files and hashes; verify `git apply --check` against the exact base.
- [x] Update current docs, package versions and approved design wording. Leave published immutable release hashes intact until a release is actually prepared.
- [x] Run plugin/provider/browser/theme checks and host checks; inspect actual results. Use REA on relevant built host artifacts when available and clearly separate source/static/fixture/live evidence.
- [x] Obtain one fresh whole-change review per executing-plans; fix material findings and rerun affected checks.

## Progress / rulings

- Working branches: `feat/native-mrs` in the marketplace and `feat/native-mrs-host` in the separate upstream checkout. Existing working changes remain in place; no user files are stashed or overwritten.
- User's latest UI correction overrides preview labels: MRs is the only entry and results group by repository.


## Verification recorded 2026-10-30

- Removed the 15 old Agent Profiles / Developer Commands implementation files in source and generated packages. Theme/setup manifests no longer advertise them; immutable released catalogs stay pinned until publication.
- `npm test`: 16 provider/worker tests and all 12 palette pairs pass; generated panel matches its sources. `verify:orca` accepts the existing theme/setup manifest, navigation shortcuts and all 37 tokens per palette.
- Host plugin regression suite: 108 files / 884 tests pass, including the existing WebRTC containment test (requires a permitted localhost listener). Targeted native navigation, own-worker bridge and local review tests are included.
- Normal desktop and E2E builds pass. Hidden isolated desktop verification installs and approves the real plugin, finds exactly one MRs entry below Tasks/Automations, exercises its real worker empty state and checks disabling it returns to a valid view. Screenshots live in `previews/`.
- Browser fixture checks under the real host CSP/protocol pass for three accounts, grouping, local-review handoff, saving/restoring filters, remote-text escaping, responsive widths, stale-query races and all 12 palettes.
- Latest user refinements implemented: single GitLab-style token filter bar; edit/remove chips; named saved filters; no top personal-queue tabs. A regression reproduces saving an unapplied filter without updating the results; saving now also applies the query. Dropdown field-to-value and all status choices are covered.
- Whole-change review findings fixed: disconnect/invalid-filter busy races and non-default HTTPS port matching. Follow-up UI review finding fixed: saved draft/result mismatch.
- Final host `check:changed --maxWorkers=2 --timeout=2`: 40 of 41 checks pass. Broad related tests are not green: earlier complete run hit absent historical release refs, sandbox-localhost restrictions and a profile-transfer timeout; the final run stopped the broad test step at its explicit time limit. No pass is claimed for the full host suite.
- Exact-base patch preparation, dirty-checkout refusal, mismatched-base refusal, application and idempotence pass. Patch SHA-256 is in `host/contract.json`.
- REA static evidence for three selected final built bridge/navigation files is recorded in `host/rea-verification.json`; it does not establish execution or live-account behavior. Real private accounts and Windows/Linux desktop startup remain unverified.

## Release design review

The user requested UI/UX Pro Max review before publishing. Two P2 issues were reproduced in browser regressions: keyboard focus lost after dropdown/token removal, and a named saved set remaining selected after manual query edits or Reset. The corrections return focus to the persistent input, allow reopening its menu, and reconcile the selected saved set against normalized active filters. Both are included in the release verification.
