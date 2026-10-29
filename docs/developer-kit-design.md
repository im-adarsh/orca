# Developer kit design

The marketplace keeps the existing 1.4.244-compatible root theme collection. It adds developer commands and agent-profile panels that follow the same consistent theme tokens. Profiles are reusable instruction files with a CLI launcher; they are not advertised as native imported agent configurations, because REA found that contribution inert in 1.4.244.

The general starter set is an implementation profile, a review profile, and a debugging profile. A panel lets the user select a visible terminal and paste the chosen instructions without submitting them. The command panel provides transparent test/lint/status commands, with explicit target selection and no automatic execution. Both request only workspace context and terminal text capabilities.

A separate data-only JetBrains-style icon package uses licensed upstream file icons and includes dark/light mappings where supported. A newer-format catalog lists it and the official Excalidraw editor at immutable commits. Both require at least 1.4.245, which is newer than the latest available stable host. Their native installation remains version-gated. The old marketplace index remains readable by 1.4.244.

Alternatives considered: adding unsupported icon/editor fields to the legacy root manifest would break the working collection; vendoring and rebranding the official Excalidraw build would complicate updates. Separate gated packages plus a pinned official editor entry preserve provenance and current compatibility.

Verification covers existing themes, exact host panel CSP and bridge messages, explicit terminal targeting, launcher argument forwarding without a shell, SVG safety and mappings, and native installation or a recorded version error. Host changes or unreleased app builds are not silently installed.
