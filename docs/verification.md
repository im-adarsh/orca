# Verification and compatibility

Validated against the installed Orca 1.4.244 macOS build. This covers static checks, isolated browser checks, and installation/theme switching in a separate real Orca profile. It does not cover every Orca screen or operating system.

## Regression found

Orca's document-theme renderer discards token pairs with less than 4.5:1 text contrast and focus rings with less than 2:1 contrast. Rejected pairs fall back to built-in styling. The 1.1.0 JetBrains Dark palette retained only 31/37 tokens; JetBrains Light retained 30/37, including losing its background. Parsing the JSON did not catch this renderer behavior.

The 1.3.1 palettes pass all 15 renderer text pairs, all three ring pairs, and the host's actual filtering function: 37/37 tokens retained for every palette. Tests also enforce cohesive dark/light surfaces, exact editor/terminal background matches, cursor and selection readability, and complete ANSI palettes.

## Repeatable checks

- `npm test`: dependency-free file validation, color contrast, complete token sets and paired theme modes.
- `npm run verify:orca -- /Applications/Orca.app`: installed-host schema validation for the marketplace, plugin, all theme files, navigation commands and setup panel registration; then executes the installed host's pure color filter in an isolated Node VM.
- The host verifier is intentionally tied to the inspected renderer structure. If a later Orca build changes that structure, it errors instead of silently claiming compatibility.

## Browser inspection

For a repeat run, install the pinned development dependency with `npm ci`, then run `npm run test:browser`. The test uses installed Google Chrome on macOS; set `CHROME_PATH` for another executable and `ORCA_APP_PATH` for another macOS Orca bundle. Tests use an isolated browser profile and do not control a personal browser session.


The self-contained setup panel was opened in an isolated headless Chrome browser. Each of the twelve theme selections was exercised using the installed host's actual color filter and a browser Canvas color probe. All 37 tokens were retained; computed editor and terminal backgrounds matched for every pair. Desktop, 768 px and 360 px widths were checked for horizontal overflow. No JavaScript errors were observed. The same twelve selections were then tested inside the installed host's actual CSP shell and an opaque-origin `sandbox="allow-scripts"` iframe at narrow width. All remained functional without overflow. The panel also starts on the host's matching palette for all twelve themes, including light themes. Navigation shortcuts were checked against the host's conflict identities on macOS, Linux, and Windows. The comparison PNG is rendered from this panel, not from a running Orca workspace.

## Host configuration limits

The selected terminal theme, saved color overrides, sidebar tint, opacity, and terminal application's colors can change the result. App and terminal selections remain separate in Orca. In the investigated installation, a 50% terminal background opacity and the dark terminal assigned to both modes contributed to inconsistent results. The setup checklist addresses these settings without editing live application databases.

The personal Orca profile was not modified. Real-app checks used a separately launched instance with temporary profile and Chromium directories; the test instance was selected through its dedicated CDP endpoint. Orca's security/consent dialogs deliberately retain built-in colors.

## REA evidence

The installed renderer was inspected with REA static JavaScript analysis. Evidence ID: `ev_db4f6df5c7c45aa13ef8110dae8d3e9778163d1d31bb891af74807493bc205bf`. The selected source was `document-theme-BsShw26q.js`; other application modules were outside this focused analysis. Runtime filtering results above were corroborated by executing the pure filter and by isolated browser color probes.


## Version 1.3 runtime installation

A clean release folder was installed through the real `plugins.install` API and approved through `plugins.consent` in Orca 1.4.244. All twelve app and terminal pairs appeared in the actual host catalog. Each pair was selected through the same renderer settings store used by the UI: all 37 computed root CSS tokens matched the package, the correct light/dark root class was present, and the corresponding terminal theme and 100% opacity settings persisted. Reload retained the selected app palette. [Structured results](runtime-verification.json) record the twelve observations.

This probe did not launch a terminal process or inspect historical TUI scrollback. It checked the applied app colors and persisted terminal pairing. Screenshots of onboarding in both Islands modes confirmed visible mode changes; preview images remain explicitly illustrative. Cross-platform manifest and shortcut checks do not substitute for native Windows/Linux installation tests.

A local install initially rejected the development `node_modules` symlink. A clean release directory excluding development dependencies installed successfully. Marketplace Git installs materialize tracked release files and do not include local `node_modules`.

REA passive runtime inspection of the separate test instance produced Evidence `ev_f62be0c52a9e26e30b02e9f1c4ff152e995620189457e074c408c01b06a1af76`. It observed the Electron target; the Playwright/API probe performed installation and selection. REA did not click controls or invoke APIs. Earlier target discovery Evidence: `ev_5cec53caa2694d9d18e8a17dc9dcb3a2934fd13834555033067d5fb6b11d3e74`.

## Installation portability

The published 1.2.0 marketplace fetched the index separately from an SSH plugin source. It reached review successfully on the test Mac, which has working credentials. Version 1.3.0 changes the public plugin URL to HTTPS, avoiding the SSH prerequisite. The other laptop's exact failure remains unconfirmed without its Orca version and underlying console error. See [troubleshooting](install-troubleshooting.md).


## Published HTTPS release check

After publishing tag `v1.3.0`, the temporary Orca instance refreshed the HTTPS marketplace, fetched the pinned release, prepared its real review, installed it through `installMarketplacePlugin`, and approved its current consent fingerprint. The host reported version 1.3.0 with marketplace provenance, no pending reconsent, all twelve theme pairs, and the installed sandbox panel correctly inherited the selected Slate palette. [Published installation results](marketplace-install-verification.json) retain the resolved commit and content hash. The dedicated test instance was then closed.


## Version 1.3.1 consistent surfaces

All twelve palettes now set background, card, popover, sidebar, worktree-sidebar, editor-surface, and terminal background to the same per-theme base. Controls, selections, and semantic colors retain contrast. Islands Dark uses #191A1C, the inner surface preferred in the supplied screenshot. Family base and exact surface-equality assertions were first run against 1.3.0 and failed, then passed after the palettes were changed.

Focused REA Evidence `ev_a391772632664fd12096aa1f143aeb181fa090071adfe121eda315aa481efb4c` explains the original Settings split: the shell uses background, navigation uses worktree-sidebar, and inner panels blend card at 50% over their parent. Four bounded verbatim shipped-code excerpts parsed completely; excluded imports keep the application graph partial. [Provenance and limits](surface-consistency-rea.json) retain source hashes and offsets. REA did not execute the app or apply settings.

A separate Orca 1.4.244 test profile installed and approved the clean 1.3.1 package. Every theme was selected on the actual Appearance screen. Browser Canvas source-over compositing of the real computed CSS confirmed equal outer, inner and sidebar colors for every theme; all 37 root tokens matched the package, and the paired terminal selection persisted. Canvas composited ancestor colors before readback to avoid intermediate alpha-rounding errors. [Results for all twelve themes](surface-consistency-verification.json) and actual Settings screenshots for [Islands Dark](../previews/islands-dark-settings.png) and [Islands Light](../previews/islands-light-settings.png) record this check. No terminal process was launched.

The browser preview check also compares all seven representative surfaces for every palette and uses the actual panel token allowlist. All twelve startup selections and narrow sandbox previews passed. Token and host-schema checks pass for all twelve pairs.

The personal profile was inspected read-only. It still used tinted sidebar styling and 30% inactive-pane opacity; those host overrides can change the rendered result. The inspected tint helper overrides sidebar CSS variables, while inactive opacity affects the entire terminal container. Use Default sidebar appearance and 100% active/inactive/background opacity. The marketplace cannot write these global settings. Applying them to the personal app was unavailable because macOS Accessibility permission for Orca Computer Use was not granted. Security dialogs, semantic badges, and terminal programs' explicit colors remain host/program controlled.


After publication, the temporary profile refreshed the real marketplace and fetched, reviewed, installed, and approved `v1.3.1` over HTTPS. All twelve registered palettes retained 37 tokens and equal main surface values. [Published 1.3.1 installation evidence](surface-consistency-published-install.json) records the resolved commit and content hash.


## Local im appearance update, 2026-10-31

The local 1.6.0 collection has 13 app/terminal pairs, 37 tokens per app and 22 terminal colors per pair. All current visible names use `im-`. Islands Darcula was consolidated into Classic Dark because they shared base, foreground, primary and all 16 ANSI colors; small secondary/selection differences were deliberately consolidated. Ten exact duplicate icon files were removed with their mapping references redirected and source records retained as provenance aliases.

All themes now use related sidebar, editor and raised-panel shades, with a clear selection and focus accent. Earlier equal-surface results above describe historical releases and do not describe this update.

Fresh checks passed on installed Orca 1.4.245: `npm test`, `npm run verify:orca -- /Applications/Orca.app`, `npm run test:browser`, `npm run verify:icons`, and `python3 plugins/jetbrains-icons/scripts/validate.py`. The actual installed renderer filter retained all 37 tokens for every theme. Actual host manifest/artifact parsers accepted the local plugins. The setup panel passed every theme selection and startup matching inside the installed CSP shell and an opaque sandbox, including narrow viewport checks. All 247 SVG files across both icon packages matched their recorded hashes, parsed safely, and painted nonempty browser pixels. The Material preview passed 360/768/1440px widths. Previews are illustrative plugin layouts, not screenshots of an installed workspace.

The supplied install folders and archive are local builds. They have not been installed/activated in the user's running profile or published as a marketplace release. Source changes can be submitted for review independently of publication. The existing marketplace indexes remain pinned to the previously published versions, so users will not be sent to a nonexistent release. The catalog builder includes the new Material package for the next publication. Global toolbar replacement and native Islands pane geometry remain outside the public theme/file-icon API. REA tools were unavailable; the external reference was inspected as public source rather than through REA runtime evidence.


## Global IDE palette expansion, 2026-10-31

The 1.7.0 legacy / 2.3.0 modern collection contains 39 matched pairs. REA 6.8.0 statically inspected 26 selected shipped `@shikijs/themes@4.5.0` modules with 0 parse failures and explicit unselected-source limitations. [Pinned source provenance](popular-theme-sources.json) and compressed portable Evidence retain that record; no runtime execution is inferred.

Superdesign supplied 26 palette directions. The offline generator preserves source editor backgrounds while adapting structural shades, selection fills, text, focus and information-bearing ANSI colors to the host contract. One malformed generated hex was rejected and corrected, with the correction retained in source data. Native ANSI black/white semantics are preserved. Both prior visual review findings—weak selection and insufficient structural depth—were addressed for all 39 palettes; the illustrative selection stripe was removed.

Tests cover every pair, source identity, exact original license hashes, absence of byte-identical palette artifacts, all 37 public tokens, 22 terminal colors, native host contrast filtering, metadata/preview/checklist parity, native manifest/artifact parsing, browser sandbox startup matching, grouped search, no-match feedback, preserved selection while searching, and responsive widths. A separate isolated-filesystem test proves byte-for-byte generator repeatability and no partial artifact writes when directions contain invalid colors.

Representative screenshots were inspected visually. These are actual rendered plugin previews, not native workspace screenshots. The shared Material and studio icon packs are unchanged and work across the expanded palette set. The new source is submitted in the existing PR; published marketplace releases and the user's running profile remain unchanged.
