# MRs right-sidebar prototype

This is a local, unpublished `contributes.panels` package. Orca mounts its `MRs` tab in the right sidebar. The three visible requests are labelled sample content, grouped under two example repositories. No provider data is loaded and no action is offered for the sample rows.

The prototype uses legacy manifest format 1 with `engines.orca >=1.4.244` so stock 1.4.244 and newer Orca can parse it. Format 1 derives the panel execution profile from its contribution. Production theme and icon packages remain on format 2.

The observed panel CSP has `connect-src 'none'`, and the panel host API has no credential or storage access. Live GitHub/GitLab requests, persistent saved filters, and opening a native review session remain blocked by that public API boundary. Do not list this prototype as a production MRs integration in the catalog.

Run `node plugins/mrs-panel/scripts/verify-panel.cjs` from the repository root to check the installed Orca panel wrapper and narrow widths. This is a browser sandbox check; a screenshot of the panel rendered inside the stock app is still required.
