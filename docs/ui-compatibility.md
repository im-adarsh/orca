Current local 1.6.0: visible choices use `im-` names and layered surface shades with a clear accent. The Islands Darcula choice is consolidated into `im-classic-dark`. The older uniform-surface description below records version 1.3.1 behavior.

# JetBrains UI compatibility

This marketplace installs supported Orca app/terminal palettes and navigation helpers. Version 1.3.1 deliberately unifies every major surface with its editor/terminal base; it preserves family accents rather than reproducing JetBrains chrome contrast. It does not patch Orca's binary or inject global CSS.

| JetBrains feature | Marketplace support |
|---|---|
| Islands Dark/Light/Darcula palette | Complete public Orca color token sets and matched terminals |
| New UI Dark/Light palette | Complete public Orca color token sets and matched terminals |
| Classic Dark/Light palette | Complete public Orca color token sets and matched terminals |
| High Contrast palette | Complete public Orca color token set and matched terminal |
| Islands rounded islands, 6 px gutters, active pane outlines | Requires an Orca host layout extension or source change |
| Classic three tool-window stripes and toolbar layout | Requires an Orca host layout extension or source change |
| JetBrains file/folder icons | Separate four-variant package, requires 1.4.245+; not installed on 1.4.244 |
| Global toolbar icon replacement | Not provided by the inspected file-icon API |
| Inter and JetBrains Mono | Install/select separately on every laptop |
| GoLand syntax scheme | No `.icls` import through the theme plugin API |
| Global host preference syncing | Checklist supplied; plugin settings are private, not global settings |
| Installation/consent dialogs | Fixed host security colors |

The setup panel's small workspace diagram is illustrative. Its colors come directly from the shipped palettes; its rounded preview container does not demonstrate a change to the real Orca layout.

Official design references:

- [Islands introduction](https://blog.jetbrains.com/platform/2025/12/meet-the-islands-theme-the-new-default-look-for-jetbrains-ides/)
- [New UI default in 2024.2](https://blog.jetbrains.com/blog/2024/07/08/the-new-ui-becomes-the-default-in-2024-2/)
- [JetBrains Classic UI plugin](https://plugins.jetbrains.com/plugin/24468-classic-ui)

A full UI reconstruction would need a separately maintained host implementation and OS-specific layout regression checks. Naming a palette “Islands” does not supply those host capabilities.
