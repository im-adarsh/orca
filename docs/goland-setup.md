# GoLand-style setup on each laptop

## Install the collection

Add marketplace source `https://github.com/im-adarsh/orca.git` with Git ref `main`, then install **GoLand Style for Orca**. The release is pinned to tag `v1.3.1`. Existing installations keep the same plugin identity; refresh the marketplace and update the plugin.

## Use matching app and terminal modes

Orca selects app and terminal themes independently. Changing the app theme alone does not switch the saved terminal palette.

- Dark slot: Islands Dark, Islands Darcula, New UI Dark, Classic Dark (Darcula), High Contrast, Graphite, or Slate.
- Light slot: Islands Light, New UI Light, Classic Light, Matte, or Paper.

Enable separate light/dark terminal themes. Select the same theme name for the app and for the active terminal slot. After an update, reselect the terminal theme to refresh its saved colors.

## Keep the same surface throughout

Every theme shares its editor/terminal base across app chrome, settings panels, popovers, and sidebars. Controls and selections retain tonal contrast. Host sidebar tint or pane opacity can still alter the rendered result.

## Remove blending and old overrides

Set these in Orca's Appearance and Terminal settings:

| Setting | Value |
|---|---|
| Left Sidebar Appearance | Default |
| Background Opacity | 100% |
| Active Pane Opacity | 100% |
| Inactive Pane Opacity | 100% |
| Window Blur | Off |
| Color Overrides | Clear values in both light and dark modes |

A blank override field inherits the selected theme. Native color input swatches can appear black when the field is empty; do not fill every field with black.

## Fonts and spacing

JetBrains documents Inter as its interface font and JetBrains Mono as its editor font: [official typography guide](https://plugins.jetbrains.com/docs/intellij/typography.html).

Install [Inter](https://github.com/rsms/inter) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) through their official packages. On macOS, install the font files in Font Book for the current user. On Windows, use the font file's Install action; on Linux, use your desktop's font manager or user font directory. Restart Orca if newly installed fonts are missing.

| Orca setting | Suggested starting value |
|---|---|
| IDE Font | Inter Variable or Inter, as named by your installed font |
| Editor Font Family | JetBrains Mono |
| Terminal Font | JetBrains Mono |
| Terminal Font Size | 14 px |
| Font Weight / Bold Font Weight | 400 / 700 |
| Line Height | 1.2 |
| Cursor / Cursor Blink | Bar / On |
| Cursor Opacity | 100% |
| Font Ligatures | Auto, or your preference |
| Editor Minimap / Word Wrap | Off / On |

These are suggested Orca values; CSS pixel sizes do not guarantee identical physical sizing to GoLand's desktop settings.

## Chat and navigation

For structured Chat UI, enable Match terminal interface, use Wide width and 100% contrast. Terminal-based agent chat already uses its terminal surface, although the agent can choose its own text colors.

The plugin supplies Mod+Alt+1 for Project, Mod+Alt+9 for Version Control, and Mod+Alt+Shift+F for Find in Project. Mod means Command on macOS and Control on Windows/Linux. Review conflicts and remap under Settings → Shortcuts.

## What travels with the marketplace

The theme files, navigation commands/shortcuts, and setup panel install together. Fonts must exist on each operating system. Host preferences remain separate. `presets/goland-style.json` is a reusable reference checklist; it is not accepted by Orca as a global-settings import.

Orca's built-in security styling remains on plugin installation and consent dialogs. The inspected 1.4.244 theme API does not expose Go syntax highlighting, global padding, file icon themes, or GoLand `.icls` imports. The separate icon package needs the newer 1.4.245 API; see [developer setup](developer-kit.md).
