# Adarsh Orca Marketplace

Twelve matched app and terminal palettes for IntelliJ and GoLand users: Islands, New UI, Classic, High Contrast, and four matte alternatives. Both light and dark modes are included.

![Light and dark palette comparison](previews/themes.png)

## Install on any laptop

Requires **Orca 1.4.244 or newer**. In **Settings → Plugins → Marketplace sources**, enter:

- **Git URL:** `https://github.com/im-adarsh/orca.git`
- **Git ref:** `main`

Add the source, install **GoLand Style for Orca**, review it, and enable it. The index pins the plugin to immutable release `v1.3.0`. Public downloads use HTTPS, so a GitHub SSH key is unnecessary. This is a personal marketplace published by `im-adarsh`.

Already added the source? Refresh it before updating. The development Git remote remains SSH. Direct installation also works with **Install plugin → Git URL**: `https://github.com/im-adarsh/orca.git#v1.3.0`. For **Local folder**, supply an absolute filesystem path to this checkout, not a Git URL.

If Install says “Could not prepare this plugin for review,” follow [the installation troubleshooting guide](docs/install-troubleshooting.md).

## Pick a family

| Family | Dark | Light | Character |
|---|---|---|---|
| Islands | Islands Dark; Islands Darcula | Islands Light | Deep neutral surfaces or Darcula, blue selections, distinct tool areas |
| New UI | New UI Dark | New UI Light | GoLand's modern charcoal editor and cool light counterpart |
| Classic | Classic Dark (Darcula) | Classic Light | Traditional Darcula charcoal or neutral gray chrome and a white editor |
| Accessibility | High Contrast | — | Deliberate black surfaces, white text, cyan focus |
| Matte alternatives | Graphite; Slate | Matte; Paper | Amber charcoal, blue-gray, stone/sage, and ivory |

New UI Dark uses `#2B2D30` chrome and `#1E1F22` editor/terminal. Islands Dark uses `#26282C` chrome and `#191A1C` editor/terminal. Classic Dark keeps `#3C3F41` chrome and `#2B2B2B` editor/terminal. Existing theme IDs are preserved: `jetbrains-dark` and `jetbrains-light` now explicitly display as New UI Dark and New UI Light.

Each pair defines all **37 public app tokens** and **22 terminal colors**. Editor and terminal backgrounds match exactly. Normal dark families remain dark throughout; light families remain light throughout.

## Finish the setup

Open the plugin's **GoLand Setup** panel for previews and the portable checklist.

1. Select an app theme in Appearance and the **same name** for its terminal theme. Enable separate light/dark terminal themes and use the slot matching the theme's mode.
2. Set Background Opacity, Active Pane Opacity, and Inactive Pane Opacity to **100%**. Set Window Blur to **Off** and Left Sidebar Appearance to **Default**.
3. Clear terminal Color Overrides in both modes. Blank fields inherit the palette; an empty picker can display black without overriding the theme.
4. Install **Inter** and **JetBrains Mono** on each laptop. Select Inter/Inter Variable for the IDE, JetBrains Mono for editor and terminal.
5. Optionally enable Chat → Match terminal interface.

After updating, reselect the app and terminal themes to refresh saved colors. Start a fresh terminal if old TUI scrollback retains explicit background colors. See [the setup guide](docs/goland-setup.md) and [settings reference](presets/goland-style.json). The reference is a checklist; Orca cannot import it as global settings.

## What matches JetBrains

The palettes use official JetBrains surface colors from [Islands](https://github.com/JetBrains/intellij-community/tree/master/platform/platform-resources/src/themes/islands), [New UI](https://github.com/JetBrains/intellij-community/tree/master/platform/platform-resources/src/themes/expUI), [Darcula](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/darcula.theme.json), and [Classic Light](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/intellijlaf.theme.json). [Source identities and hashes](docs/palette-sources.json) record the inspected definitions. Some text and accent colors are adapted to Orca's enforced contrast thresholds. ANSI colors are terminal adaptations, not imported Go syntax highlighting.

**These are palette adaptations.** Orca's public theme API cannot install Islands rounded pane geometry, Classic toolbars, global icon sets, global fonts, or GoLand `.icls` editor schemes. Its security dialogs deliberately use built-in colors. Fonts and host preferences must be selected separately. The [UI compatibility notes](docs/ui-compatibility.md) explain the scope of each family.

## Navigation

| Shortcut | Action |
|---|---|
| `Mod+Alt+1` | Toggle Project / Explorer |
| `Mod+Alt+9` | Toggle Version Control |
| `Mod+Alt+Shift+F` | Toggle Find in Project |

`Mod` is Command on macOS and Control on Windows/Linux. These helpers are not a full GoLand keymap; remap in Settings → Shortcuts. The plugin has no worker process and requests no capabilities. The local setup preview runs in Orca's sandboxed panel.

## Verify

With Node.js 22 or newer:

```sh
npm test
npm run verify:orca -- /Applications/Orca.app
npm ci
npm run test:browser
```

The dependency-free validator checks contrast, complete pairs, modes, source family anchors, and portable release URLs. Host verification executes the installed Orca color filter and validates its schemas. Browser tests check every palette, the actual host CSP wrapper, responsive widths, and initial theme matching. See [verification details and limits](docs/verification.md).

The repository contains the installable manifests, `themes/`, `setup/`, the `presets/` checklist, source/verification notes in `docs/`, validators in `scripts/`, and palette previews in `previews/`.
