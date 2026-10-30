# Marketplace implementation notes

## Compact MRs interaction correction

Session views now copy and restore applied provider queries exactly, including empty queries; applying a view clears stale validation and restores the correct sample state. GitLab accepts raw or encoded Unicode values while rejecting malformed parameters, control characters, and decoded credential keys including `job_token`. Both open menus stay within narrow sidebars and exclude each other; chip removal returns focus to Filters, and rows show their provider. The sandbox assertions reproduced the defects before the fixes and now cover the corrected behavior at 240/320/360/480 px. The generated modern panel matches the legacy HTML. Live requests and durable views remain unsupported by the observed host sandbox.

## Provider query editor increment

The compact Filters popover now includes a labelled GitHub/GitLab provider query editor. It retains the exact entered GitHub search text or GitLab MR list parameter text, including unknown filters and duplicate or array parameters. A committed query explicitly shows “Not executed in sample mode — requires live provider data” instead of sample matches. Clear restores ordinary local filtering. Full endpoint input, malformed GitLab parameter strings, and GitLab credential/control parameters are rejected with generic messages; rejected input leaves the committed query unchanged. The panel sandbox test covers these cases and regenerates the [rendered screenshot](plugins/mrs-panel/screenshots/mrs-sidebar-sample.png).

Session views still snapshot only common chips and search; provider query round-trip is the next increment. The panel still cannot fetch live provider data, persist views durably, or open a native review session through the observed host API.

## Compact MRs sidebar increment (0.1.1 legacy / 0.2.1 modern)

The expanded filter and preset forms are now compact Filters and Views popovers beside request search. Removable chips retain OR within one field and AND across fields. The request list has collapsible repository headings, status icons with text, and keyboard-selectable rows that open a sample detail view with back navigation. Session views preserve common filters and search. The first row renders above 210 px at 360 px width; the [rendered screenshot](plugins/mrs-panel/screenshots/mrs-sidebar-sample.png) shows the new list.

The panel check passed under the shipped CSP and opaque iframe at 240/320/360/480 px, across old and new light/dark theme tokens, including layout, chips, views, collapse, popover Escape/focus, detail/back, and no remote requests. `npm test`, old/new manifest parser compatibility, exact modern HTML identity, and `git diff --check` passed. Modern schema validation passed, while `verify:modern` reports expected MRs catalog drift because the published release pin remains immutable; pin the new committed package after review.

Native GitHub and GitLab query editing and unsupported-execution messaging remain for the next increment. The public sandbox still blocks live provider requests and durable views.

## Current increment: interactive sample MRs sidebar

Final UI review correction: inputs and selects now use the normalized `--surface` token, and native `color-scheme` follows Orca's `html.light`/`html.dark` class. The panel check verifies computed control backgrounds and color scheme for both token APIs with browser preference opposite the host theme; the updated screenshot shows the dark panel controls. `node plugins/mrs-panel/scripts/verify-panel.cjs` and `npm run verify:manifest-compatibility -- /Applications/Orca.app /private/tmp/orca-native-mr-host` passed.

The unpublished right-sidebar panel now filters five varied sample requests by status, author, assignee, reviewer, repository, and provider with removable chips. Results group by repository, show a result count and empty state, and support named presets in memory for the current panel session. The panel explicitly says SESSION ONLY. The useful filter UI appears above a compact sandbox limitation notice. There are no inert connect or review controls.

The panel uses nested fallbacks for the newer Orca tokens and stock 1.4.244 tokens. The panel verification script passed in the installed stock CSP and opaque iframe wrapper: add/remove filters, OR within a field and AND across fields, repository grouping, presets, empty state, Enter/Escape/Tab, accessible labels, body/card/text/focus computed colors in light and dark for both token schemes, remote-request guard, and no overflow at 240/320/480 px. The test saved a [screenshot of the real rendered sample UI](plugins/mrs-panel/screenshots/mrs-sidebar-sample.png). This is a host-wrapper screenshot; the parent still needs to capture the separate stock-app installation screenshot.

Live provider fetching, durable presets, and native review-session actions remain blocked by the observed panel CSP and host API. The MRs package remains unpublished and absent from the production catalog.

## Current increment: unpublished panel manifest compatibility

The MRs prototype now uses legacy manifest format 1 and `engines.orca >=1.4.244`; format 1 derives its panel execution profile, while the production theme and icon manifests remain format 2. The compatibility check parses the actual MRs manifest with both the installed Orca 1.4.244 parser and the newer source snapshot, including its single panel and safe `code` icon. The pinned modern schema check covers only the two production format 2 packages. The prototype is still absent from both catalogs.

Verification: `npm run verify:manifest-compatibility -- /Applications/Orca.app /private/tmp/orca-native-mr-host` passed both real parsers. `npm run verify:modern -- /private/tmp/orca-native-mr-host/docs/schemas/plugins` passed the pinned production manifests and catalog checks. No new panel screenshot was captured in this increment. Interactive sample filtering, actual app rendering, live MRs, durable presets, and native review-session opening remain outstanding; the latter three are blocked by the observed panel CSP and host API.

## Earlier increment: pinned icon catalog

Regenerated `orca-catalog.json` from the complete committed icon package at `06cba47256dc2ed7e762186816299b0693b987fb`. JetBrains Icons `1.0.1` now pins tree hash `a0aac9ea69c2f261a396fed78326b5729d131178c1701904358730e9f3e2b311`; its existing `1.0.0` commit and hash remain unchanged. The production catalog still contains only the theme and icon packages; the MRs prototype remains unpublished.

Verification: `npm run verify:modern -- /private/tmp/orca-native-mr-host/docs/schemas/plugins` passed pinned manifest and catalog schemas, package hashes, versions, and engine gates. `npm test` passed all 12 theme pairs. An explicit catalog assertion checked both icon release pins and absence of MRs. Existing icon screenshot: [JSP/JSPX contact sheet](plugins/jetbrains-icons/screenshots/jsp-coverage.png). No new panel screenshot was captured in this increment. Live MRs, durable filters, and native review-session opening remain blocked by the observed panel host API/CSP; the sample panel corrections and real host render are still pending.

## Earlier increment: right-sidebar MRs prototype

Added an unpublished `plugins/mrs-panel` package with one `contributes.panels` entry. Its static panel uses Orca's exported `--orca-*` design tokens, shows repository-grouped examples, and labels the content as sample mode with the live API limitation in the panel itself. It has no misleading review or filter controls. The package is not in the catalog and has not been installed in stock Orca; a real in-app screenshot is still required.

Verification: the new pinned modern manifest schema check passed for the MRs package. `node plugins/mrs-panel/scripts/verify-panel.cjs` passed with the installed Orca CSP and opaque-origin sandbox at 240, 320, and 480 px, including no remote requests or horizontal overflow. Existing `npm test`, `npm run verify:orca -- /Applications/Orca.app`, `npm run test:browser`, and `npm run verify:manifest-compatibility -- /Applications/Orca.app /private/tmp/orca-native-mr-host` passed. `npm run verify:modern -- /private/tmp/orca-native-mr-host/docs/schemas/plugins` validated all three manifests, then reported the pre-existing `im-adarsh.jetbrains-icons` catalog hash drift from the preceding unpublished icon changes.

Remaining API blocker: the observed panel CSP uses `connect-src 'none'`; panel methods do not expose secrets/storage or a worker-call bridge. Authenticated GitHub/GitLab requests, persistent saved filters, and native review-session creation cannot be claimed complete. The next panel increment can implement local sample filtering without claiming live data; an in-app stock Orca render and screenshot should verify the actual tab position.

## Earlier increment: JetBrains JSP/JSPX icons

The existing four JetBrains file-icon themes now use dedicated JSP and JSPX artwork from the pinned IntelliJ Community commit `278ea91039deaad8105adf8827f84897de9d8b8f`. The six new SVGs are unmodified Apache-2.0 files with source URLs, Git blob IDs, and SHA-256 hashes in `plugins/jetbrains-icons/provenance.json`. Package version is `1.0.1`; the existing `1.0.0` catalog release remains unchanged.

Verification: `python3 plugins/jetbrains-icons/scripts/validate.py`, `npm test`, `npm run verify:orca -- /Applications/Orca.app`, `npm run test:browser`, `npm run verify:manifest-compatibility -- /Applications/Orca.app /private/tmp/orca-native-mr-host`, and `node plugins/jetbrains-icons/scripts/verify-browser.cjs` passed. The icon browser check decoded all 138 SVGs and checked 360/768/1440 px widths. [Contact sheet screenshot](plugins/jetbrains-icons/screenshots/jsp-coverage.png) shows the added icons across all four variants.

The pinned modern schema check accepted both package manifests; at that point its catalog check reported `Catalog drift: im-adarsh.jetbrains-icons`. The later pinned icon catalog increment above resolved that drift. No catalog release or Git commit was made during the earlier icon increment.

MRs panel: no implementation claim in this increment. Prior scoped REA evidence is in `/private/tmp/orca-tab-doublecheck-rea-evidence.json` and `/private/tmp/orca-marketplace-tab-findings.md`. The supported right-sidebar panel cannot currently fetch authenticated GitHub/GitLab MRs or persist saved filters under the observed panel CSP and worker-only storage/secrets boundary. A future sample-mode panel must label those limits explicitly; it must not be published as a live MRs integration.


## Independent final review and stock-app verification

Accepted for the supported prototype/icon scope after c4d3065. The parent independently ran theme validation, pinned modern schema/package hashes, old/new manifest and catalog provenance checks, and icon asset/provenance validation. A disposable stock Orca 1.4.244 profile installed/approved MRs, opened the actual right-sidebar tab, and verified status filtering (2/5), combined provider filtering (1/5), and session preset reapplication (2/5). `plugins/mrs-panel/stock-orca-verification.json` records the results; `plugins/mrs-panel/screenshots/stock-orca-right-sidebar.png` is the actual app screenshot. The installed application and real user profile were not changed.

This supersedes earlier notes that stock-app verification was pending. Full live provider fetching, durable saved filters, and native review-session creation remain blocked by the examined public panel API. MRs stays out of production catalogs. The icons and supported prototype are reviewable on this branch; nothing from this branch has been published or merged.

## Publication authorized

The user subsequently requested merge and publication. The reviewed branch was merged into main. Release v1.5.3 publishes the icon update and a clearly labeled sample-only MRs prototype through both marketplace formats; the live API limitations remain unchanged. Earlier unpublished-status notes describe the pre-release review state.

## v1.5.4 independent acceptance

UI/UX Pro Max and Ponytail review, scoped Paradev/Orca REA evidence, and stock-app checks accepted the compact sidebar correction. Actual stock Orca 1.4.244 verified filtering, session views, exact cross-provider query restoration, Unicode input, explicit unexecuted state, local-view restoration and detail/back. First request top was 153px. Screenshots and sanitized verification are updated. The existing merge/publish instruction authorizes this UI correction release. Provider-query editing does not remove the live API, persistent storage or review-session blockers.
