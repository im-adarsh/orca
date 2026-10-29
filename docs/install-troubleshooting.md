# Marketplace installation troubleshooting

## Recommended source

Use Git URL `https://github.com/im-adarsh/orca.git` and Git ref `main`. Refresh the source before installing **GoLand Style for Orca**. Orca must be **1.4.244 or newer**. The collection's plugin identity is still `im-adarsh.jetbrains-themes`.

Version 1.2.0 embedded an SSH plugin URL. A laptop could fetch the marketplace index over HTTPS and then fail while fetching its separately configured plugin over SSH. Version 1.3.0 uses HTTPS for both recommended public downloads; no GitHub SSH key is required. This addresses a portability risk, not a confirmed diagnosis of every generic review error.

## “Could not prepare this plugin for review”

That message wraps several different errors. Check these in order:

1. Confirm the Orca version under About. An older host rejects the manifest with `plugin requires Orca >=1.4.244 (this is <hostVersion>)`.
2. Refresh the marketplace and confirm the listing is version 1.3.1 or newer. Remove/re-add the source with HTTPS if it still points at a cached older index.
3. Check that the laptop's system Git can fetch the release:

   ```sh
   git ls-remote https://github.com/im-adarsh/orca.git refs/tags/v1.3.1
   ```

   A proxy, corporate network, missing Git installation, or blocked GitHub access can prevent the fetch.
4. Try direct installation with `https://github.com/im-adarsh/orca.git#v1.3.1`. In Local folder mode, enter a full local directory containing `orca-plugin.json`.
5. If it persists, capture the underlying error from Orca's developer console, if available. The warning begins `[plugins] marketplace action failed:`. Include the operating system and Orca version when reporting it. The generic UI text alone does not identify the cause.

The tested macOS Orca 1.4.244 build successfully fetched and prepared the previous published release in a clean temporary profile. Other operating systems and the affected laptop require their own verification.
