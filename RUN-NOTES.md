# Marketplace implementation notes

## Current increment: right-sidebar MRs prototype

Added an unpublished `plugins/mrs-panel` package with one `contributes.panels` entry. Its static panel uses Orca's exported `--orca-*` design tokens, shows repository-grouped examples, and labels the content as sample mode with the live API limitation in the panel itself. It has no misleading review or filter controls. The package is not in the catalog and has not been installed in stock Orca; a real in-app screenshot is still required.

Verification: the new pinned modern manifest schema check passed for the MRs package. `node plugins/mrs-panel/scripts/verify-panel.cjs` passed with the installed Orca CSP and opaque-origin sandbox at 240, 320, and 480 px, including no remote requests or horizontal overflow. Existing `npm test`, `npm run verify:orca -- /Applications/Orca.app`, `npm run test:browser`, and `npm run verify:manifest-compatibility -- /Applications/Orca.app /private/tmp/orca-native-mr-host` passed. `npm run verify:modern -- /private/tmp/orca-native-mr-host/docs/schemas/plugins` validated all three manifests, then reported the pre-existing `im-adarsh.jetbrains-icons` catalog hash drift from the preceding unpublished icon changes.

Remaining API blocker: the observed panel CSP uses `connect-src 'none'`; panel methods do not expose secrets/storage or a worker-call bridge. Authenticated GitHub/GitLab requests, persistent saved filters, and native review-session creation cannot be claimed complete. The next panel increment can implement local sample filtering without claiming live data; an in-app stock Orca render and screenshot should verify the actual tab position.

## Current increment: JetBrains JSP/JSPX icons

The existing four JetBrains file-icon themes now use dedicated JSP and JSPX artwork from the pinned IntelliJ Community commit `278ea91039deaad8105adf8827f84897de9d8b8f`. The six new SVGs are unmodified Apache-2.0 files with source URLs, Git blob IDs, and SHA-256 hashes in `plugins/jetbrains-icons/provenance.json`. Package version is `1.0.1`; the existing `1.0.0` catalog release remains unchanged.

Verification: `python3 plugins/jetbrains-icons/scripts/validate.py`, `npm test`, `npm run verify:orca -- /Applications/Orca.app`, `npm run test:browser`, `npm run verify:manifest-compatibility -- /Applications/Orca.app /private/tmp/orca-native-mr-host`, and `node plugins/jetbrains-icons/scripts/verify-browser.cjs` passed. The icon browser check decoded all 138 SVGs and checked 360/768/1440 px widths. [Contact sheet screenshot](plugins/jetbrains-icons/screenshots/jsp-coverage.png) shows the added icons across all four variants.

The pinned modern schema check accepts both package manifests. Its catalog hash check currently reports `Catalog drift: im-adarsh.jetbrains-icons`, as expected for unpublished package bytes. The catalog must be generated from the exact committed package bytes in a later iteration; no catalog release or Git commit was made in this iteration.

MRs panel: no implementation claim in this increment. Prior scoped REA evidence is in `/private/tmp/orca-tab-doublecheck-rea-evidence.json` and `/private/tmp/orca-marketplace-tab-findings.md`. The supported right-sidebar panel cannot currently fetch authenticated GitHub/GitLab MRs or persist saved filters under the observed panel CSP and worker-only storage/secrets boundary. A future sample-mode panel must label those limits explicitly; it must not be published as a live MRs integration.
