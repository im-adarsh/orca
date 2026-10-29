# JetBrains File Icons for Orca

Four file-icon themes built from the Apache-licensed IntelliJ Community icon sources:

| Theme | Use with | Unique SVGs |
|---|---|---:|
| JetBrains New UI Dark | Islands Dark, New UI Dark, Graphite, Slate | 50 |
| JetBrains New UI Light | Islands Light, New UI Light, Matte, Paper | 50 |
| JetBrains Classic Dark | Classic Dark or Islands Darcula | 29 |
| JetBrains Classic Light | Classic Light | 29 |

Each theme supplies **265 mappings**: 173 extensions, 89 exact filenames, and default file, folder and expanded-folder icons. Coverage includes Go, JavaScript/TypeScript, Java, C/C++, C#, Python, Rust, Kotlin, Dart, Swift, shell, SQL, JSON, YAML, XML, TOML, config files, archives, images and common build tools. Some categories intentionally share a neutral fallback; mapping coverage does not mean every language has a distinct logo.

Select the theme in Orca's file-icon theme picker after installing and approving the plugin. **Orca 1.4.245 or newer is required.** Orca 1.4.244 does not implement the `iconThemes` contribution. This package changes the file icons exposed by that contribution; it does not replace global toolbar, status, provider, activity-bar or application icons. Icon selection is independent of the app color theme. Choose a light/dark variant that matches the workspace; Orca does not automatically pair these four themes with app palettes.

Open [preview.html](preview.html) for a local contact sheet. It loads only bundled SVGs and has no remote assets or scripts.

## Artwork and licensing

JetBrains SVGs are copied **without modification** from IntelliJ Community commit [`278ea91039deaad8105adf8827f84897de9d8b8f`](https://github.com/JetBrains/intellij-community/tree/278ea91039deaad8105adf8827f84897de9d8b8f). New UI uses `platform/icons/src/expui/fileTypes` and `expui/nodes/folder`; Classic uses `platform/icons/src/fileTypes` and `nodes/folder`. Dark variants use the official `_dark.svg` when one exists; some Classic artwork is shared by light and dark themes upstream.

[provenance.json](provenance.json) records every bundled file's path, immutable source URL, Git blob SHA-1 and SHA-256, including the unmodified upstream notice. It also records every fallback category. [LICENSE.txt](LICENSE.txt) contains the full Apache 2.0 license. [NOTICE.txt](NOTICE.txt) retains the upstream notice. The repository's separate [upstream build terms](licenses/JetBrains-UPSTREAM-LICENSE.txt) are retained for provenance; the copied icon headers specify Apache 2.0. This package does not distribute an IntelliJ product build.

The following SVGs are **original artwork by im-adarsh**, also Apache-2.0:

- A simple geometric G/o glyph for Go files, `go.mod`, `go.sum` and `go.work`. It is not the GoLand product icon, a copied Go wordmark, or a Go gopher.
- A neutral code document for languages without matching artwork in the selected community file-type directory. Examples include Python, Rust, Kotlin and Dart; Classic also uses this fallback for TypeScript and C/C++.
- A distinct expanded-folder indicator. Collapsed folders use the official JetBrains artwork.

Classic preserves its older icon style rather than borrowing missing categories from New UI. Markdown and shell files therefore use the Classic text icon; modern config categories use its config icon. New UI has dedicated artwork for more categories. Orca's current artifact contract supports default folders and files plus filename/extension maps, not special folder names such as `src`, `test` or `.git`. Filenames and extensions match without case distinctions.

JetBrains, IntelliJ and GoLand are trademarks of their respective owners. This community package is not affiliated with or endorsed by JetBrains. No proprietary GoLand assets are included.

## Validation

Run `python3 scripts/validate.py`. The dependency-free check verifies the four manifests/artifacts, path containment, mapping limits, bundled file hashes, upstream Git blob identities, XML syntax, SVG size limits, and absence of scripts, fonts, event handlers and remote references. Local fragment references for gradients, clipping and masks are permitted by Orca's SVG sanitizer.

The optional `node scripts/verify-browser.cjs` check requires Playwright in your development environment (or `PLAYWRIGHT_MODULE` pointing at an existing installation). It loads every SVG from its exact bytes, verifies 16 × 16 decoding and nonempty pixel alpha, checks the contact sheet at 360/768/1440 px, and writes [validation-results.json](validation-results.json). It uses an isolated headless Chrome profile. Set `CHROME_PATH` when Chrome is installed elsewhere.

The generated SVGs contain paths/shapes only. They require no fonts, JavaScript, embedded bitmaps or network access. Original upstream SVGs retain their copyright comments. Host SVG sanitization and theme registration still require a compatible Orca build; static validation on 1.4.244 is not a claim of native installation testing on 1.4.245.
