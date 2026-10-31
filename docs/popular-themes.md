# Popular IDE palette collection

Version 1.7.0 contains 39 matched app/terminal pairs: 13 existing choices plus 26 adaptations across 16 established IDE-theme families. All displayed names use `im-`. This is a representative collection, not a claim to include every popular theme or an install-count ranking. Near-identical soft/hard/brightness presets were intentionally omitted.

| Family | Added choices |
|---|---|
| Dracula | `im-dracula` |
| One | `im-one-dark-pro`, `im-one-light` |
| Catppuccin | `im-catppuccin-mocha`, `im-catppuccin-latte` |
| Tokyo Night | `im-tokyo-night` |
| Nord | `im-nord` |
| GitHub | `im-github-dark`, `im-github-light` |
| Gruvbox | `im-gruvbox-dark`, `im-gruvbox-light` |
| Solarized | `im-solarized-dark`, `im-solarized-light` |
| Rosé Pine | `im-rose-pine`, `im-rose-pine-dawn` |
| Night Owl | `im-night-owl`, `im-night-owl-light` |
| Ayu | `im-ayu-dark`, `im-ayu-light` |
| Monokai | `im-monokai` |
| Kanagawa | `im-kanagawa-wave`, `im-kanagawa-lotus` |
| Material Palenight | `im-material-theme-palenight` |
| SynthWave 84 | `im-synthwave-84` |
| Default Plus | `im-dark-plus`, `im-light-plus` |

## Design and reconstruction evidence

REA 6.8.0 statically parsed all 26 selected shipped modules from the integrity-verified `@shikijs/themes@4.5.0` npm package without executing them. There were 0 parse failures. It did not analyze 107 other inventoried files and does not establish native IDE rendering. The portable complete Evidence is retained as `docs/rea/global-themes-evidence.json.gz`; the summary and immutable Evidence ID are in [source provenance](popular-theme-sources.json).

[Superdesign’s palette board](https://superdesign.dev/teams/0c240145-1aa6-49cc-bdae-c4fd918fc26f/projects/bd13ddbe-a7d2-433c-a254-5bb024280911?node=draft-variant-1a25da02-533d-4225-a235-27bc9e015639) proposed the 26 structural shade/accent directions. The generator rejects malformed colors and adapts the proposals to Orca readability and surface constraints. One malformed generated hex was corrected to a valid white raised surface; the correction is recorded in `presets/global-theme-design.json`. Source editor backgrounds are preserved. Shades, selections, focus colors, text and ANSI colors are intentional adaptations, not pixel-identical imports.

The prior review findings are addressed across all 39 palettes: stronger sidebar/editor separation, hue-tinted selections that do not depend on the removed preview stripe, and information-bearing ANSI colors tuned for 4.5:1 raw contrast. ANSI black/white semantics are retained; Orca also provides its own contrast correction. Some upstream themes omit ANSI colors; every fallback is listed in [adaptations](popular-theme-adaptations.json).

Package and original author notices are retained in [THIRD_PARTY_THEMES.md](../THIRD_PARTY_THEMES.md) and `licenses/`. One Dark Pro and One Light have separate original author notices. No original product logos or proprietary theme assets are bundled.

## Preview and installation

Open `setup/index.html` for grouped/searchable palette previews. Searching filters the choices while preserving the current palette; no-match searches give explicit feedback. Choose the same app and terminal name in Orca, then select `im-material-dark` or `im-material-light` independently. The existing shared icon packages work with all 39 palettes.

For Orca 1.4.245+, install the local folder `plugins/goland-style`. That generated package includes its licenses and provenance. The root manifest is the compatibility build for 1.4.244. Install one of those theme packages, not both. Published indexes pin release `v1.7.0`; PR #1 contains the reviewed implementation.

These contributions affect app/terminal palettes and supported file icons. They do not replace global toolbar icons, install native Islands geometry, or import editor syntax schemes. Final checks exercise installed parsers, the actual renderer filter and the sandboxed setup panel; they do not claim visual native-profile installation.

## Rebuild and verify

```sh
npm run generate:themes
npm run package:marketplace
npm test
npm run verify:orca -- /Applications/Orca.app
npm run verify:icons
npm run test:browser
```

Generation is offline and deterministic. Invalid external design colors are rejected before any generated artifact is written. Tests exercise all 39 pairs, source identity, licenses, selection/focus readability, grouped search, empty results and native host filtering.
