# MRs right-sidebar prototype

This local, unpublished panel mounts MRs in the right sidebar. Five varied local requests are grouped by repository. Status, author, assignee, reviewer, repository, and provider filters use removable chips. Named presets work only during the current panel session.

The prototype uses legacy manifest format 1 with `engines.orca >=1.4.244` so stock 1.4.244 and newer Orca can parse it. Format 1 derives the panel execution profile from its contribution. Production theme and icon packages remain on format 2.

The observed panel CSP has `connect-src 'none'`, and the panel host API has no credential or storage access. Live GitHub/GitLab requests, persistent saved filters, and opening a native review session remain blocked by that public API boundary. Do not list this prototype as a production MRs integration in the catalog.

Run the panel verification script from the repository root to check the installed Orca panel wrapper, filter interactions, themes, and narrow widths. It saves [the real rendered iframe screenshot](screenshots/mrs-sidebar-sample.png). A separate stock-app installation and screenshot is still required.
