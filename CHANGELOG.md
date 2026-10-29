# Changelog

## 1.3.1

- Unify major app, settings, popover, sidebar, editor and terminal surfaces for every palette using its existing editor/terminal base. Islands Dark now uses the preferred inner-panel #191A1C throughout.
- Retain contrast on controls, active selections, focus rings and semantic colors.
- Enforce exact surface equality for every registered theme and verify rendered surfaces rather than permitting a range of mismatched fills.
- Document the host sidebar tint and inactive-pane opacity overrides that can change the result.

## 1.3.0

- Add distinct Islands Dark/Light/Darcula, Classic Dark/Light, and High Contrast palettes with matched terminals.
- Restore modern New UI Dark surface values and give New UI themes explicit labels while preserving installed IDs.
- Use HTTPS for public marketplace plugin downloads, removing the requirement for a GitHub SSH key on every laptop.
- Expand the setup panel, source provenance, responsive previews, and renderer checks to twelve pairs.
- Document installation diagnosis and distinguish palette support from host layout/icon limitations.


## 1.2.0

- Add a pinned Orca marketplace index and GoLand Setup panel with six interactive palette previews.
- Fix rejected color pairs that caused Dark/Light palettes to fall back to built-in colors.
- Adapt JetBrains Dark toward Darcula charcoal and blue accents; brighten Graphite and Slate editor surfaces.
- Add all 15 renderer text-contrast checks, focus-ring checks, mode/surface consistency, and installed-host validation.
- Add a reusable laptop settings reference and three portable navigation shortcuts.
- Document 100% opacity, Default sidebar appearance, light/dark terminal pairing, and clearing old overrides.
- Keep the existing plugin and theme IDs stable.

## 1.1.0

- Add four independent app and terminal palette pairs: Matte, Graphite, Paper, and Slate.
- Preserve the original JetBrains Dark and JetBrains Light palette files.
- Rename the display name to Orca Theme Collection while keeping the plugin identity and existing theme IDs stable.
- Add a comparison preview sheet and Git installation instructions.
- Check ten foreground/background text pairs in each new app palette against a 4.5:1 minimum contrast target.

## 1.0.0

- Add JetBrains Dark and JetBrains Light app and terminal palettes.
- Document GoLand font setup with Inter and JetBrains Mono.
