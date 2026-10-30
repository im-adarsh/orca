# Native merge request inbox

Status: approved; implementing. Latest user corrections: one entry named MRs below Tasks and Automations; group requests by repository; add Review locally using Orca’s Tasks workspace composer and its terminal/chat agent picker. Use installed Ponytail 5.3.2 and REA.

## Intent and agreed scope

Keep the deliverable in `https://github.com/im-adarsh/orca`, the existing marketplace repository. Remove the Developer Commands and Agent Profiles implementation. Add a native entry below Orca's task/automation/review navigation group, opening a full-page inbox that pulls GitHub pull requests and GitLab merge requests, including self-hosted GitLab. Users connect their own accounts and filter results by user, status and repository. The user explicitly chose host-source changes over a browser-tab workaround.

This is a host extension plus a plugin, not a theme-only change. Installing the plugin on stock Orca cannot create the requested native entry.

## Approaches

1. A local service in an Orca browser tab works on the installed build, but does not provide the requested navigation placement. The user declined this route.
2. Extend Orca's host and supply the inbox as an installable plugin. The user selected this route. The builder's proposed boundary is a reusable navigation-panel placement and an authenticated panel-to-own-worker request method. Provider code stays in the plugin.
3. Hardcode the entire inbox into a private Orca fork. This would couple every provider/UI change to a new desktop build. Prefer the small reusable extension in option 2.

## Repository and host identity

- All durable plugin code, host patch, provenance, tests and instructions live in `im-adarsh/orca`. Preserve its existing themes, setup panel, icons and Excalidraw entry, and preserve unrelated working changes.
- Use the temporary upstream checkout `/private/tmp/orca-native-mr-host` to develop/test the host patch. Its inspected base is `400266a9ce259337ec46836c2a8e18a449d49f4a`; retain this exact base in the patch metadata.
- Store the reproducible host patch and a cross-platform Node preparation script under `host/`. The script takes an explicit host checkout, verifies its base and clean worktree, checks the patch before applying, and never rewrites the plugin repository or replaces `/Applications/Orca.app`.
- Document build commands and separate test-profile launch. Provide a source-build route first; do not claim signed macOS/Windows/Linux installers, an upstream release, or marketplace publication until those artifacts actually exist.
- Source package versions are not proof of the extension. A patched-host feature marker and strict manifest fields must distinguish it from stock hosts. Unsupported hosts fail with a clear compatibility message; no browser-tab fallback.

## Remove the old implementation

Delete both panels, panel source styles/bridge, developer command/profile data, profile launcher, panel generator and their dedicated tests. Remove their registrations and workspace/terminal permissions from the theme manifest. Regenerate the modern GoLand package without these files. Update current documentation and scripts, retaining historical release/evidence records as history. An existing desktop install changes only after installing an updated package; source deletion does not retroactively alter published immutable versions.

## Host extension

### Navigation

Add an optional panel placement field with right-sidebar as the existing default and navigation as the new value. Carry it through the host list projection and preload types. Navigation panels appear after the built-in task/automation/review group, and are omitted from the right activity bar. Reuse the existing `PluginPanel` frame, theme tokens, watchdog, error handling and host-issued session machinery; do not expose Node or `allow-same-origin` to the document.

Use a normal top-level plugin-page route and a selected panel key. Integrate it with view hydration, back/return behavior and layout. Only enabled, consented plugins appear. Removing, disabling or changing a plugin revokes its sessions and unmounts its page; a stale persisted selection returns to a valid view. The page works with no selected workspace, including folder workspaces.

### Own-worker requests

Add one bounded request/reply method for panel/editor surfaces to invoke a command declared by their own trusted-worker plugin. Resolve plugin identity from the host-issued session; the document cannot supply or override it. Reuse the existing worker command invocation path and its content/consent checks, command registration validation, timeout and shutdown handling. Do not expose arbitrary runtime RPC or cross-plugin invocation.

The new method needs an explicit consented capability. Validate strict JSON envelopes, bound request and response byte sizes/depth, and limit concurrent calls. Return a structured error on overflow, stale consent, unavailable worker or timeout. Never log arguments/results: connection setup may contain a token. Audit only command id and outcome. Prevent a worker from recursively invoking itself through this facade. Preserve existing panel CSP and transport admission limits. Tests must prove the feature cannot call another plugin or bypass revocation.

Update the host schema/reference generation and feature detection. Ship compatibility refusal on mixed versions rather than silently accepting unsupported fields. Remote clients must route requests to the plugin's owning execution host, using the existing plugin bridge; no desktop-wide credential reads. This first deliverable adds desktop navigation, not a new mobile screen. An older mobile/remote client retains existing behavior and never receives private connection data through UI persistence.

## Plugin and account setup

Create a separate `im-adarsh.merge-request-inbox` package under `plugins/merge-request-inbox`, so palette users do not acquire trusted-worker permissions. It contributes a navigation panel and the declared worker command used for inbox operations. The theme collection remains independent.

First run shows Connect account. Choose GitHub or GitLab, enter a display name, server URL and personal access token, and test the connection before saving. Defaults are github.com and gitlab.com; GitLab accepts HTTPS self-hosted URLs, including a configured instance path prefix. GitHub Enterprise can use the same configurable-origin adapter where supported. Display the authenticated provider username after validation. Multiple connections to different accounts/hosts are supported, each with an immutable local connection id.

Tokens go only into Orca's encrypted plugin secrets store through the worker. Nonsecret account metadata and saved views go into private plugin storage. The worker never returns stored tokens. Clear token input after a successful save; removing a connection deletes its credential and metadata. Fail closed if encrypted storage is unavailable. No credentials are committed, included in saved-view exports, written to ordinary storage, placed in URLs or logged. Personal tokens are the first authentication method; hosted OAuth registration/device flow is outside the first release.

The plugin's provider adapters use authenticated HTTPS APIs in the worker, with no extra `gh` or `glab` installation required. Existing host clients were inspected, but they depend on host/repository-specific CLI configuration and are not exposed to plugins; reuse their conventions without importing internal host modules into the distributable plugin. No shell commands or automatic terminal actions.

Pin each connection's API origin and path. Build endpoints with URL encoding, reject credential-bearing/non-HTTPS base URLs and cross-origin redirects/pagination links, and retain TLS verification. Enterprise certificates use the host's documented trust mechanism; no ignore-certificate toggle.

## Inbox behavior

Title and native entry: MRs. No separate MR Inbox or duplicate MRs entry. Group rows by repository, host and account. Use the inherited Orca color/typography/spacing tokens and dense accessible rows; avoid the oversized form layout in the removed panels.

- Connection/provider selector, repository/project selector or input, text search, status (open, closed, merged, all), draft (any, draft, ready), author, assignee, reviewer and labels.
- User filters mean provider usernames/login identifiers, not Git's free-form `user.name`. Use a person-role selector or explicitly labeled username fields so the semantics are visible.
- Default to open requests. Provide shortcuts for authored by me, assigned to me and review requested from me, resolved separately against each selected connection.
- Save named views containing only filters and connection ids. Restore filters on reopen and provide reset/delete actions. Saved views do not execute actions on a request.
- Latest approved refinement: use a GitLab-style single token filter bar with removable/editable chips and field/value suggestions, replacing the form grid. Keep named saved filter sets.
- Remove the top personal-queue shortcut tabs; author/assignee/reviewer chips and saved filters manage those queues.
- Show provider/host, repository, request number, title, author, open/merged/closed and draft states, labels and updated time. Preserve the exact host/project identity in row keys and URLs.
- Paginated loading and explicit Refresh. Cancel or discard stale responses when filters/connections change. Show partial provider failures alongside successful results and never present incomplete results as a complete total.
- Provide a safe action to open the provider's request URL using a narrowly validated host method if the current frame API cannot open external URLs. Restrict to HTTP(S) URLs from a configured provider; keep the panel navigation restrictions.

The first release pulls and browses requests and adds Review locally. This action opens Orca’s existing workspace composer with the exact MR linked, a review prompt and the native agent/surface picker. A matching local checkout is required; otherwise show the native add/clone guidance. Creation/startup still follows the composer’s normal user action. Merge, approve, comment and close are outside scope.

## Provider contract

Define a small adapter interface for connection validation, identity, query compilation, one-page listing and normalization. Implement GitHub and GitLab adapters and document the extension seam for further providers. Do not advertise other providers until implemented.

Normalize provider differences: GitHub PRs are a subset of issue search; distinguish merged from unmerged closed PRs and exclude issues. GitLab uses opened/closed/merged states, username-based author/reviewer filters and project paths with nested namespaces. When a filter cannot be supported server-side, do not filter only the current page and imply completeness; use a documented correct endpoint/query or show that filter as unavailable for the provider.

Pagination tokens stay bound to connection and filter identity. Cap page sizes so responses fit the host bridge. Handle authentication failure, insufficient scopes, missing repository, unavailable server, rate limits/retry-after and partial failures with actionable inline messages. Retry only bounded, idempotent reads. Avoid auto-polling and per-row detail requests in the initial list.

## Verification and acceptance

1. Removal: source and generated manifests expose only GoLand Setup, removed implementation files are absent, and existing theme validation/installed-host schema checks pass.
2. Host: schema/list projection and navigation lifecycle tests; session-bound own-worker bridge tests for wrong-plugin attempts, disabled/stale consent, invalid input, oversized output, timeout and concurrent calls. Required host `pnpm check:changed --maxWorkers=2` must pass or its precise blocker must be reported.
3. Providers: fixture-based HTTP tests assert actual request URLs/headers and GitHub/GitLab filtering, self-hosted instance paths, pagination and error mapping. Check secrets cannot appear in worker results/logs/storage metadata.
4. UI: setup, connection removal, saved filters, page loading and stale-response/error behavior under the actual CSP shell. Verify theme inheritance, keyboard access and narrow/wide layouts.
5. Integration: apply the checked-in patch to its exact clean base, build/launch an isolated hidden host test profile with `ORCA_BACKGROUND_LAUNCH=1`, install the plugin, confirm native placement and run connection/list flows with local fixtures. Use hidden-renderer CDP screenshots; never replace or foreground the user's personal app.
6. Clearly separate fixture verification from live provider verification. A real private-account check requires credentials supplied through the UI; do not ask users to paste secrets into chat. Cross-platform source paths/build instructions are required; only claim platform runtime coverage that was actually run.

## Decisions delegated to the builder

Choose precise method/field names, module boundaries, pagination cursor encoding, list-row responsive layout and test fixtures using existing host conventions. Set byte/concurrency/time limits to fit the existing transport. If a constraint invalidates the design, report the concrete conflict before broadening permissions or replacing the chosen native route.

## Evidence

- `docs/mr-inbox-compatibility.json` retains REA provenance for the installed 1.4.244 plugin contracts; six selected files parsed completely, with the rest of the application outside scope.
- The source checkout listed above supplies current manifest, worker, frame, navigation and lifecycle implementation details. Source inspection is separate from REA shipped-artifact evidence.
- Upstream panel/worker limitation: https://github.com/stablyai/orca/issues/25129
- Provider contracts: https://docs.github.com/en/rest/search/search and https://docs.gitlab.com/api/merge_requests/

Source delivery and isolated testing precede any separate publication or replacement of the user's installed Orca app.
