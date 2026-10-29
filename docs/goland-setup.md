# GoLand appearance setup

Use the JetBrains Dark or Light app theme and its matching terminal theme, then set the fonts separately in Orca.

## Fonts

JetBrains documents **Inter, 13 pt** as its IDE interface font and **JetBrains Mono** as its editor font. See the [official typography guide](https://plugins.jetbrains.com/docs/intellij/typography.html). Orca uses CSS pixels, so size numbers do not guarantee the same physical appearance as Java desktop font settings.

1. Install [Inter](https://github.com/rsms/inter) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) on your computer if needed. Restart Orca if newly installed fonts are missing from its font suggestions.
2. In **Settings → Appearance → IDE Font**, enter `Inter`.
3. Search Settings for **Editor Font Family** and enter `JetBrains Mono`. This controls file editors and diff views.
4. In **Settings → Terminal**, choose `JetBrains Mono` as the font family.
5. For a starting terminal profile, use **Font Size: 14**, **Font Weight: 400**, **Bold Font Weight: 700**, and **Line Height: 1.2**. These are this project's recommended Orca settings, not a claim about GoLand's defaults. Adjust size and line height to match your GoLand installation.
6. Set **Font Ligatures** to your preference. Choose **Off** for separate characters or **On** to use JetBrains Mono's ligatures.

Fonts are machine settings. Orca's theme plugin schema accepts color tokens only; it cannot install fonts or select them for the user.

## Color scheme

Select **JetBrains Dark** or **JetBrains Light** in Appearance, and the matching palette in Terminal. The plugin maps JetBrains' UI palette into Orca's supported app and ANSI terminal color roles.

An editor color scheme also specifies syntax colors for keywords, strings, comments, numbers, and language-specific symbols. Orca's current plugin theme API does not expose those syntax rules or import GoLand `.icls` schemes. Selecting this plugin does not reproduce GoLand's Go syntax highlighting. Terminal ANSI colors also do not control semantic syntax colors chosen by individual terminal applications.

The app palette and font family can resemble GoLand closely within these supported settings. Exact GoLand syntax highlighting requires editor theme support in Orca itself.
