# im Material File Icons

Select `im-material-dark` with a dark app theme or `im-material-light` with a light app theme. Each supplies 267 mappings covering default files/folders, exact filenames and extensions; shared artwork is stored once. The variants differ where the pinned upstream manifest specifies light-mode artwork.

Requires Orca 1.4.245 or newer. App, terminal and file-icon pickers are independent. This plugin uses the supported file-icon API; global toolbar icons and special folder-name mappings are outside that contract.

The [preview](preview.html) loads bundled SVGs only. [Provenance](provenance.json) pins Material Icon Theme 5.40.0, the tarball identity and every unmodified SVG hash. [LICENSE.txt](LICENSE.txt) retains the MIT copyright and redistribution terms. No source application's branding or app icon is included.

Run `node scripts/verify-im-icons.cjs` from the repository root to check installed-host manifest/artifact parsing, SVG hashes, XML safety, visible browser pixels and responsive previews. Native installation is a separate step.
