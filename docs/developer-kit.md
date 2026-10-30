# Marketplace packages

The current GoLand theme collection includes twelve matched app/terminal palettes, GoLand Setup and navigation shortcuts. It has no worker and requests no host capabilities.

Developer Commands and Agent Profiles have been removed from the source and generated modern package. Their panel files, generator, shared panel bridge/styles, presets, launcher and dedicated tests are deleted. Historical release records describe earlier versions; they do not describe the current source. Release v1.5.0 updates the published indexes; refresh the source and update the theme package to remove the old panels from an existing installation.

## Package layout

- `orca-plugin.json` and `orca-marketplace.json` retain the 1.4.244-compatible theme collection.
- `plugins/goland-style/` is generated from the same theme/setup source for the newer manifest field names and icon identifiers. Do not edit generated files directly.
- `plugins/jetbrains-icons/` is a separate data-only package, with four icon variants.
- `marketplace/upstream-excalidraw.json` records the exact official editor release.
- `orca-catalog.json` pins the committed release packages, including the experimental MRs plugin. Historical release hashes remain unchanged.

JetBrains File Icons and native Excalidraw require Orca 1.4.245+. The installed host checked was 1.4.244; see [compatibility observations](developer-compatibility.json). Existing developer-kit JSON evidence records historical tests of the removed panels and is retained for provenance.

## Native merge request inbox

The separate **MRs** plugin adds one native entry below Tasks/Automations, groups requests by repository and opens local review through the existing Tasks workspace composer. All deliverables belong to `im-adarsh/orca`. See [build, installation and usage](native-mrs.md) and the [approved design](superpowers/specs/2026-10-30-native-merge-request-inbox-design.md). A patched host is required; the MRs catalog description identifies this requirement.

## Validation and packaging

```sh
npm ci
npm test
npm run verify:orca -- /Applications/Orca.app
npm run test:browser
npm run package:marketplace
```

Before publishing a changed package, bump its version, commit the package files, generate the catalog with `node scripts/build-catalog.cjs <full-package-commit>`, validate it, and commit the catalog separately. Set the intended release ref in the publishing process before creating the release. Local source changes do not alter installed or published immutable versions.
