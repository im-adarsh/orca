# Developer kit

The Orca 1.4.244-compatible collection adds two panels alongside GoLand Setup: **Developer Commands** and **Agent Profiles**. Updating to 1.4.0 asks for focused-workspace metadata and terminal text permissions. There is no worker process. The panels never submit text automatically.

## Commands

Open Developer Commands, choose a Git, Go, Node.js, or Python check, review/edit its text, and select the intended visible shell terminal. Paste prepares one line; review it and press Enter yourself. The panel refreshes the focused workspace before pasting and refuses a terminal that is no longer in that workspace. These commands use your existing toolchain; installing this plugin does not install Go, Node.js, pytest, or project dependencies.

## Agent instruction profiles

The Implementer, Reviewer, and Debugger profiles are reusable prompts, independent of provider and model. Open Agent Profiles, choose a profile, add the task, and select a terminal already running your intended coding agent. Paste prepares a single line without submitting it. Alternatively copy the instructions from the text area into a chat. These are not native imported Orca agent presets: the inspected 1.4.244 build accepts an agents declaration but has no activation/import implementation for it.

For a new agent, run the launcher from a checkout:

```sh
node scripts/launch-profile.mjs --profile reviewer --agent codex --worktree active --task "Review the current diff"
```

Use any agent id supported by your Orca host. Optional `--model` and `--effort` are forwarded; effort requires a model. `--surface chat` or `--surface terminal` selects a surface. `--dry-run` prints the proposed CLI arguments without launching. The helper invokes the executable with an argument array and `shell:false`; it does not interpolate task text into shell code. Set `ORCA_CLI_COMMAND` or `--cli` to an executable path if the CLI is not on PATH. On Linux outside Orca it chooses `orca-ide`, avoiding the GNOME screen reader's `orca` command. Windows users should supply the actual Orca CLI executable if their PATH entry is a command-shell wrapper. Runtime launcher checks were performed on macOS; instructions remain portable.

## JetBrains icons and Excalidraw

The newer `orca-catalog.json` adds the separate **JetBrains File Icons** package and the pinned official **Excalidraw** editor. Both require **Orca 1.4.245+**. At verification time, GitHub's latest stable release was 1.4.244. Neither native package can be installed on that host; they are prepared and version-gated, not reported as installed.

Icons offer New UI Dark/Light and Classic Dark/Light variants. They change file/folder icons in the explorer and editor tabs, not the entire app's toolbar icons. See the package's [coverage and attribution](../plugins/jetbrains-icons/README.md). Proprietary GoLand artwork is not included.

On a compatible host, refresh this marketplace, install JetBrains File Icons and Excalidraw, then choose the icon variant matching your app mode. Excalidraw remains published by `stablyai`; this marketplace points to its immutable upstream release and hash rather than rebranding or copying the editor build. It handles `.excalidraw` and `.excalidraw.json` files and contributes a new-drawing action.

## Compatibility layout

- `orca-marketplace.json` retains the legacy root collection, version 1.4.0, compatible with 1.4.244.
- `plugins/goland-style/` is generated from the same source for the newer manifest field names and icon identifiers. Its higher 2.0.0 version allows migration after upgrading to 1.4.245+.
- `plugins/jetbrains-icons/` is a separate data-only package, version 1.0.0.
- `marketplace/upstream-excalidraw.json` records the exact official editor release.
- `orca-catalog.json` references committed package subdirectories with content hashes. Keep both indexes; 1.4.244 cannot read the newer catalog or icon/editor APIs.

After changing panel source, run `npm run build:panels`, the tests, then `npm run package:marketplace`. Commit package files first, generate the catalog with `node scripts/build-catalog.cjs <full-package-commit>`, validate it, and commit the catalog separately. Generated package directories should not be edited directly. Bump the corresponding package version for any published package change.

## Validation

```sh
npm ci
npm test
npm run verify:orca -- /Applications/Orca.app
npm run test:browser
npm run test:developer-browser
```

To check newer manifests/catalogs before a compatible host is available, download the two immutable schemas identified by URL and SHA-256 in `docs/orca-contracts.json`, then run:

```sh
npm run verify:modern -- /path/to/downloaded/schema-directory
```

The schema verifier checks those hashes before validation. It does not claim runtime compatibility with an unreleased build.

REA Evidence `ev_88e8123a4432a58f9390d65ca8542020060bf68898c6ae29c73b485c328f7143` records the bounded shipped agent/activation contracts. [Source identities and limits](developer-kit-rea.json) are retained. [Real-host panel installation results](developer-kit-runtime.json) distinguish actual host checks from sandbox bridge simulation. No agent was launched or terminal text written during the real-host probe.

[Compatibility observations](developer-compatibility.json) record the host/release gate. Native Excalidraw installation remains blocked by that gate.

The published legacy-compatible 1.4.0 tag was fetched over HTTPS, reviewed, installed and approved in the isolated 1.4.244 test profile. All three panels were registered and the extra permissions were reviewed. [Published installation result](developer-published-install.json). The personal Orca profile was not changed.
