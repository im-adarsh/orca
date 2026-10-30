# Marketplace packages

The current GoLand theme collection includes twelve matched app/terminal palettes, GoLand Setup and navigation shortcuts. It has no worker and requests no host capabilities.

Developer Commands and Agent Profiles have been removed from the source and generated modern package. Their panel files, generator, shared panel bridge/styles, presets, launcher and dedicated tests are deleted. Historical release records describe earlier versions; they do not describe the current source. Release v1.5.0 updates the published indexes; refresh the source and update the theme package to remove the old panels from an existing installation.

## Package layout

- `orca-plugin.json` and `orca-marketplace.json` retain the 1.4.244-compatible theme collection.
- `plugins/goland-style/` is generated from the same theme/setup source for the newer manifest field names and icon identifiers. Do not edit generated files directly.
- `plugins/jetbrains-icons/` is a separate data-only package, with four icon variants.
- `orca-catalog.json` pins the committed release packages. Historical release hashes remain unchanged.

JetBrains File Icons require Orca 1.4.245+. Excalidraw belongs to Orca’s official catalog; listing its reserved identity in a personal catalog causes Orca to reject the source. The installed host checked was 1.4.244; see [compatibility observations](developer-compatibility.json). Existing developer-kit JSON evidence records historical tests of the removed panels and is retained for provenance.

## Validation and packaging

```sh
npm ci
npm test
npm run verify:orca -- /Applications/Orca.app
npm run test:browser
npm run package:marketplace
```

Before publishing a changed package, bump its version, commit the package files, generate the catalog with `node scripts/build-catalog.cjs <full-package-commit>`, validate it, and commit the catalog separately. Set the intended release ref in the publishing process before creating the release. Local source changes do not alter installed or published immutable versions.
