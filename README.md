# Adarsh Orca Marketplace

A marketplace with JetBrains-style file icons, and 39 matched app/terminal palettes for IntelliJ and GoLand users: Islands, New UI, Classic, im-high-contrast, and four matte alternatives. Both light and dark modes are included.

![Light and dark palette comparison](previews/themes.png)

## Install on any laptop

Requires **Orca 1.4.244 or newer**. In **Settings → Plugins → Marketplace sources**, enter:

- **Git URL:** `https://github.com/im-adarsh/orca.git`
- **Git ref:** `main`

Add the source, install **im Theme Collection**, review it, and enable it. The index pins the plugin to immutable release `v1.7.0`. Public downloads use HTTPS, so a GitHub SSH key is unnecessary. This is a personal marketplace published by `im-adarsh`.

Already added the source? Refresh it before updating. The development Git remote remains SSH. Direct installation also works with **Install plugin → Git URL**: `https://github.com/im-adarsh/orca.git#v1.7.0`. For **Local folder**, supply an absolute filesystem path to this checkout, not a Git URL.

If Install says “Could not prepare this plugin for review,” follow [the installation troubleshooting guide](docs/install-troubleshooting.md).

## Marketplace packages

The current source removes **Developer Commands** and **Agent Profiles**, including their launcher, presets, panel sources, and dedicated tooling. The theme collection now contributes only **im Theme Setup** and requests no workspace or terminal permissions. Release **v1.5.4** includes the JetBrains icon update and the explicitly labeled MRs prototype. Refresh your marketplace source and update the theme package to remove them from an older installation.

The newer catalog includes **JetBrains File Icons** (four variants), gated to **Orca 1.4.245+**. Install **Excalidraw** from Orca’s official catalog; personal catalogs cannot list official plugin identities. The current validation uses installed Orca 1.4.245, which supports file-icon themes; previous release evidence used 1.4.244. See [developer setup, compatibility, and verification](docs/developer-kit.md).

## MRs right-side prototype

Install **MRs Panel Prototype** from this marketplace for the right-side tab. It uses a compact repository list, search and filter popovers, sample details, and named session views. The provider-query editor preserves native GitHub search text and GitLab MR parameters, but does not execute them against live providers. Live GitHub/GitLab fetching, persistent filters, and native review sessions are unavailable. See [the verified panel and screenshot](plugins/mrs-panel/README.md). JetBrains File Icons **1.0.1** adds dedicated JSP/JSPX artwork across all four variants.

## Pick a family

| Family | Dark | Light | Character |
|---|---|---|---|
| Islands | im-islands-dark | im-islands-light | Deep neutral shades with blue selections |
| New UI | im-studio-dark | im-studio-light | GoLand's modern charcoal editor and cool light counterpart |
| Classic | im-classic-dark | im-classic-light | Traditional Darcula charcoal or white surfaces with classic blue accents |
| Accessibility | im-high-contrast | — | Deliberate black surfaces, white text, cyan focus |
| Matte alternatives | im-graphite; im-slate | im-matte; im-paper | Amber charcoal, blue-gray, stone/sage, and ivory |
| Warm / neutral | im-ember | im-daylight | Copper on warm charcoal; blue on cool light shades |

Each palette uses related sidebar, editor and raised-panel shades, with one clear accent for selection and focus. Editor and terminal backgrounds match exactly. The redundant Islands Darcula choice is consolidated into `im-classic-dark`; all other existing contribution IDs remain stable. `im-ember` adds warm charcoal with copper selections, and `im-daylight` adds neutral light shades with blue selections.

[Historical 1.3.1 im-islands-dark Settings screenshot](previews/islands-dark-settings.png) · [Historical 1.3.1 im-islands-light Settings screenshot](previews/islands-light-settings.png)

Each pair defines all **37 public app tokens** and **22 terminal colors**. Editor and terminal backgrounds match exactly. Normal dark families remain dark throughout; light families remain light throughout.

## Finish the setup

Open the plugin's **im Theme Setup** panel for previews and the portable checklist.

1. Select an app theme in Appearance and the **same name** for its terminal theme. Enable separate light/dark terminal themes and use the slot matching the theme's mode.
2. Set Background Opacity, Active Pane Opacity, and Inactive Pane Opacity to **100%**. Set Window Blur to **Off** and Left Sidebar Appearance to **Default**.
3. Clear terminal Color Overrides in both modes. Blank fields inherit the palette; an empty picker can display black without overriding the theme.
4. Install **Inter** and **JetBrains Mono** on each laptop. Select Inter/Inter Variable for the IDE, JetBrains Mono for editor and terminal.
5. Optionally enable Chat → Match terminal interface.

After updating, reselect the app and terminal themes to refresh saved colors. Start a fresh terminal if old TUI scrollback retains explicit background colors. See [the setup guide](docs/goland-setup.md) and [settings reference](presets/goland-style.json). The reference is a checklist; Orca cannot import it as global settings.

## What matches JetBrains

The palettes adapt official JetBrains editor/console colors from [Islands](https://github.com/JetBrains/intellij-community/tree/master/platform/platform-resources/src/themes/islands), [New UI](https://github.com/JetBrains/intellij-community/tree/master/platform/platform-resources/src/themes/expUI), [Darcula](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/darcula.theme.json), and [im-classic-light](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/intellijlaf.theme.json). [Source identities and hashes](docs/palette-sources.json) record the inspected definitions. App surfaces use related shades for depth, adapted to the Orca theme contract. Some text and accent colors are adapted to Orca's enforced contrast thresholds. ANSI colors are terminal adaptations, not imported Go syntax highlighting.

**These are palette adaptations.** Orca's public theme API cannot install Islands rounded pane geometry, Classic toolbars, global toolbar icon replacement, global fonts, or GoLand `.icls` editor schemes. Its security dialogs deliberately use built-in colors. Fonts and host preferences must be selected separately. The [UI compatibility notes](docs/ui-compatibility.md) explain the scope of each family.

## Navigation

| Shortcut | Action |
|---|---|
| `Mod+Alt+1` | Toggle Project / Explorer |
| `Mod+Alt+9` | Toggle Version Control |
| `Mod+Alt+Shift+F` | Toggle Find in Project |

`Mod` is Command on macOS and Control on Windows/Linux. These helpers are not a full GoLand keymap; remap in Settings → Shortcuts. The theme plugin has no worker process and requests no host capabilities. im Theme Setup runs in Orca's sandboxed frame.

## Verify

With Node.js 22 or newer:

```sh
npm test
npm run verify:orca -- /Applications/Orca.app
npm ci
npm run test:browser
npm run verify:icons
```

The dependency-free validator checks contrast, complete pairs, modes, family base anchors and layered surfaces with readable text, and portable release URLs. Host verification executes the installed Orca color filter and validates its schemas. Browser tests check every palette, the actual host CSP wrapper, responsive widths, and initial theme matching. See [verification details and limits](docs/verification.md).

The repository contains the installable manifests, `themes/`, `setup/`, the `presets/` checklist, source/verification notes in `docs/`, validators in `scripts/`, and palette previews in `previews/`.

## im appearance update (local 1.6.0)

All current app, terminal and file-icon choices use `im-` names. The [duplicate audit](docs/im-duplicate-audit.json) records the consolidated Darcula choice and ten byte-identical icon files removed with all mappings retained. Generated modern bundles remain necessary for the separate host contract.

[im Material File Icons](plugins/im-material-icons/README.md) supplies shared, pinned MIT artwork with distinct dark/light mappings. It requires Orca 1.4.245+. The installed 1.4.245 host supports file-icon contributions. Global toolbar icons are outside that API. These packages are published in release `v1.7.0`.

For local installation, choose **Settings → Plugins → Install plugin → Local folder**, then supply the absolute path to `plugins/goland-style`, `plugins/im-material-icons`, or `plugins/jetbrains-icons`. Install each desired package once. Review and enable it in Orca, then select matching app/terminal names and the appropriate file-icon variant. If an old saved selection was Islands Darcula, select `im-classic-dark`. The current local theme identity matches the existing collection, so it updates that package. Do not install both the root legacy collection and its generated modern bundle as separate collections.

## Global IDE palettes (1.7.0)

The collection now contains **39 matched app/terminal pairs**. The 26 additions cover Dracula, One, Catppuccin, Tokyo Night, Nord, GitHub, Gruvbox, Solarized, Rosé Pine, Night Owl, Ayu, Monokai, Kanagawa, Material Palenight, SynthWave ’84 and Default Plus. All names retain the `im-` prefix. See the [complete family list, installation notes and evidence](docs/popular-themes.md).

REA inspected the pinned shipped theme modules; Superdesign proposed the palette directions. All palettes now have stronger structural shades and hue-tinted selection fills that do not rely on a preview-only stripe. The preview supports grouped search. Source editor backgrounds and mode identities remain intact; text and information-bearing terminal colors are adapted for readability. No syntax highlighting or native pane geometry is installed through these palette contributions.

Use `npm run generate:themes` followed by `npm run package:marketplace` to rebuild offline. The generated modern collection is version **2.3.0**; the legacy manifest is **1.7.0**. Package and original-author notices are included in [THIRD_PARTY_THEMES.md](THIRD_PARTY_THEMES.md) and `licenses/`. The marketplace index pins release `v1.7.0`.
