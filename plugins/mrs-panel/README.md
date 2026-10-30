# MRs right-sidebar prototype

This sample-only marketplace panel mounts MRs in the right sidebar. Five varied local requests are grouped by repository. Status, author, assignee, reviewer, repository, and provider filters use removable chips. Named presets work only during the current panel session.

The prototype uses legacy manifest format 1 with `engines.orca >=1.4.244` so stock 1.4.244 and newer Orca can parse it. Format 1 derives the panel execution profile from its contribution. The generated `../mrs-panel-modern` package uses format 2 for Orca 1.4.245+. Its panel HTML is identical. The legacy package is also published as the root of tag `mrs-panel-v0.1.0` for older marketplace clients.

The observed panel CSP has `connect-src 'none'`, and the panel host API has no credential or storage access. Live GitHub/GitLab requests, persistent saved filters, and opening a native review session remain blocked by that public API boundary. It is listed explicitly as a prototype, not as a live MRs integration.

Run the panel verification script from the repository root to check the installed Orca panel wrapper, filter interactions, themes, and narrow widths. It saves [the real rendered iframe screenshot](screenshots/mrs-sidebar-sample.png). A separate stock Orca 1.4.244 check installed and approved the package in a disposable profile, opened the real right-side tab, verified status/combined filtering and session preset reapplication, and captured [the actual app screenshot](screenshots/stock-orca-right-sidebar.png). See `stock-orca-verification.json`.
