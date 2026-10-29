# Adarsh Orca Marketplace

A reusable GoLand-style setup for Orca: six complete app/terminal palette pairs, a setup panel, navigation commands, and a laptop settings reference.

![Six matched palettes](previews/themes.png)

## Add the marketplace

In **Settings → Plugins → Marketplace sources**, enter:

- **Git URL:** `ssh://git@github.com/im-adarsh/orca.git`
- **Git ref:** `main`

Click **Add source**, then install and enable **GoLand Style for Orca**. The marketplace pins the plugin release to `v1.2.0`; Orca records its exact commit. The SSH source uses your system Git credentials. This is a personal marketplace published by `im-adarsh`.

For a direct plugin install, use **Install plugin → Git URL** with `ssh://git@github.com/im-adarsh/orca.git#v1.2.0`. Local folder installation is also supported. Orca 1.4.244 or newer is required; renderer behavior was verified on 1.4.244.

## Finish the setup

Open the plugin's **GoLand Setup** panel to preview each palette and see the full settings checklist. The plugin supplies colors, the panel, and navigation shortcuts. Fonts, opacity, sidebar mode, and theme selections are host preferences that need to be set on each laptop.

1. Select an app theme in **Appearance**, then select its matching terminal theme. App and terminal selections are independent in Orca.
2. Enable separate light and dark terminal themes. Use the **dark slot** for JetBrains Dark, Graphite, or Slate; use the **light slot** for JetBrains Light, Matte, or Paper.
3. Set **Background Opacity**, **Active Pane Opacity**, and **Inactive Pane Opacity** to **100%**. Set **Window Blur** to **Off** and **Left Sidebar Appearance** to **Default**.
4. Clear terminal **Color Overrides** in both modes. Blank override fields inherit the selected palette; an empty color picker can show black without overriding the theme.
5. Install **Inter** and **JetBrains Mono** on each laptop, then select Inter/Inter Variable for the IDE and JetBrains Mono for the editor and terminal.
6. Optionally enable **Chat → Match terminal interface** so structured chat follows the terminal's font and colors.

After updating from an older version, reselect both your app theme and its terminal theme to refresh the stored palette. See [the full setup guide](docs/goland-setup.md) and [the portable settings reference](presets/goland-style.json). The reference JSON is a checklist, not a native Orca settings import file.

## Theme choices

| Theme | Appearance | Terminal slot |
|---|---|---|
| JetBrains Dark | Darcula-style charcoal, blue selections, and visible colored terminal text | Dark |
| JetBrains Light | Cool light surfaces and blue accents | Light |
| Matte | Soft stone gray and a restrained sage accent | Light |
| Graphite | Slate charcoal with warm amber accents | Dark |
| Paper | Ivory, parchment, and earthy accents | Light |
| Slate | Cool blue-gray surfaces and steel-blue accents | Dark |

Each theme defines all 37 public app color tokens and all 22 terminal colors. Each app/terminal pair shares the same editor and terminal background. Dark palettes use charcoal surfaces with visible separation; light palettes stay light throughout their major surfaces.

## Navigation shortcuts

The plugin adds three declarative navigation commands. `Mod` uses Command on macOS and Control on Windows/Linux.

| Shortcut | Action |
|---|---|
| `Mod+Alt+1` | Toggle Project / Explorer |
| `Mod+Alt+9` | Toggle Version Control |
| `Mod+Alt+Shift+F` | Toggle Find in Project |

These are GoLand-inspired navigation helpers, not a complete GoLand keymap. Remap conflicts in **Settings → Shortcuts**. The plugin has no worker process and requests no capabilities. The setup panel runs its local preview script in Orca's sandboxed panel frame.

## Accuracy and host limits

JetBrains Dark draws on the official [Darcula UI palette](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/darcula.theme.json). JetBrains Light draws on the official [Light UI palette](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/expUI/expUI_light.theme.json). Some text and accent pairs are adjusted to satisfy Orca's renderer contrast rules. These are GoLand-style adaptations rather than pixel-identical copies. Matte, Graphite, Paper, and Slate are original palettes.

Orca keeps plugin installation and consent dialogs in built-in security colors. This theme API cannot restyle those dialogs, change global spacing or icons, or import GoLand's `.icls` syntax highlighting. The setup panel cannot write global host preferences. Individual terminal applications may set their own text colors.

## Verification

From this checkout, using Node.js 22 or newer:

```sh
npm test
npm run verify:orca -- /Applications/Orca.app
```

The first command requires no dependencies and checks every text pair used by Orca's renderer, focus rings, opaque colors, mode consistency, and app/terminal pairing. The optional second command validates the files against the installed Orca schemas and runs its actual token filtering function; it fails if the inspected host structure changes. See [verification notes](docs/verification.md) for browser checks and their limits.

## Repository contents

- `orca-marketplace.json` — marketplace index
- `orca-plugin.json` — installable collection; stable identity `im-adarsh.jetbrains-themes`
- `themes/` — six app and six terminal palettes
- `setup/index.html` — self-contained setup panel and interactive previews
- `presets/goland-style.json` — settings checklist for each laptop
- `scripts/` — repeatable validators
- `previews/` — comparison images
