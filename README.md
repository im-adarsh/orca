# JetBrains Dark and Light for Orca

Two color themes for the [Orca](https://github.com/stablyai/orca) app, each with a matching terminal palette. This is a declarative Orca plugin; it runs no code and requests no capabilities.

## Install

1. In Orca, open **Settings → Plugins** and turn on the experimental plugin system.
2. Choose **Install plugin → Local folder** and enter the absolute path to this checkout (the folder containing `orca-plugin.json`).
3. Review and enable **JetBrains Dark and Light for Orca**.
4. Select **JetBrains Dark** or **JetBrains Light** in the appearance theme picker, then choose its matching theme under **Settings → Terminal**.

Orca 1.4.244 or newer is required because the plugin uses app and terminal theme contributions available in that build.

## GoLand fonts and code colors

Follow the [GoLand appearance setup](docs/goland-setup.md) to use **Inter** for the interface and **JetBrains Mono** for the editor and terminal. Fonts are selected in Orca settings separately from the theme plugin.

## Accuracy and scope

The colors come from JetBrains' own [Dark UI theme](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/expUI/expUI_dark.theme.json), [Light UI theme](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/expUI/expUI_light.theme.json), [Dark editor scheme](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/expUI/expUI_darkScheme.xml), and [Light editor scheme](https://github.com/JetBrains/intellij-community/blob/master/platform/platform-resources/src/themes/expUI/expUI_lightScheme.xml). The main surfaces, text, accents, selection, and ANSI colors use values from those files.

Orca exposes a fixed set of color tokens, so this reproduces the JetBrains palettes within Orca's existing interface. It cannot change Orca's layout, icons, typography, or every control color to make the app pixel identical to a JetBrains IDE. The terminal's 16 ANSI colors map JetBrains' named palette hues to terminal roles; JetBrains' editor scheme is not itself a terminal ANSI theme.

## Files

- `orca-plugin.json` — plugin manifest and theme registrations
- `themes/jetbrains-dark.json`, `themes/jetbrains-light.json` — full app palettes
- `themes/jetbrains-dark-terminal.json`, `themes/jetbrains-light-terminal.json` — terminal palettes

The theme API is currently experimental in Orca, so its schema may change in later versions.
