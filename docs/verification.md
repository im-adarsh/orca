# Verification and compatibility

Validated against the installed Orca 1.4.244 macOS build. This is a bounded static and isolated browser verification, not a claim of testing every Orca screen or every operating system.

## Regression found

Orca's document-theme renderer discards token pairs with less than 4.5:1 text contrast and focus rings with less than 2:1 contrast. Rejected pairs fall back to built-in styling. The 1.1.0 JetBrains Dark palette retained only 31/37 tokens; JetBrains Light retained 30/37, including losing its background. Parsing the JSON did not catch this renderer behavior.

The 1.2.0 palettes pass all 15 renderer text pairs, all three ring pairs, and the host's actual filtering function: 37/37 tokens retained for every palette. Tests also enforce cohesive dark/light surfaces, exact editor/terminal background matches, cursor and selection readability, and complete ANSI palettes.

## Repeatable checks

- `npm test`: dependency-free file validation, color contrast, complete token sets and paired theme modes.
- `npm run verify:orca -- /Applications/Orca.app`: installed-host schema validation for the marketplace, plugin, all theme files, navigation commands and setup panel registration; then executes the installed host's pure color filter in an isolated Node VM.
- The host verifier is intentionally tied to the inspected renderer structure. If a later Orca build changes that structure, it errors instead of silently claiming compatibility.

## Browser inspection

For a repeat run, install the pinned development dependency with `npm ci`, then run `npm run test:browser`. The test uses installed Google Chrome on macOS; set `CHROME_PATH` for another executable and `ORCA_APP_PATH` for another macOS Orca bundle. Tests use an isolated browser profile and do not control a personal browser session.


The self-contained setup panel was opened in an isolated headless Chrome browser. Each of the six theme selections was exercised using the installed host's actual color filter and a browser Canvas color probe. All 37 tokens were retained; computed editor and terminal backgrounds matched for every pair. Desktop, 768 px and 360 px widths were checked for horizontal overflow. No JavaScript errors were observed. The same six selections were then tested inside the installed host's actual CSP shell and an opaque-origin `sandbox="allow-scripts"` iframe at narrow width. All remained functional without overflow. The panel also starts on the host's matching palette for all six themes, including light themes. Navigation shortcuts were checked against the host's conflict identities on macOS, Linux, and Windows. The comparison PNG is rendered from this panel, not from a running Orca workspace.

## Host configuration limits

The selected terminal theme, saved color overrides, sidebar tint, opacity, and terminal application's colors can change the result. App and terminal selections remain separate in Orca. In the investigated installation, a 50% terminal background opacity and the dark terminal assigned to both modes contributed to inconsistent results. The setup checklist addresses these settings without editing live application databases.

Live app GUI changes were unavailable because macOS Accessibility permission for Orca Computer Use was not granted. Therefore current on-device preferences have not been changed by this release. Orca's security/consent dialogs deliberately retain built-in colors.

## REA evidence

The installed renderer was inspected with REA static JavaScript analysis. Evidence ID: `ev_db4f6df5c7c45aa13ef8110dae8d3e9778163d1d31bb891af74807493bc205bf`. The selected source was `document-theme-BsShw26q.js`; other application modules were outside this focused analysis. Runtime filtering results above were corroborated by executing the pure filter and by isolated browser color probes.
