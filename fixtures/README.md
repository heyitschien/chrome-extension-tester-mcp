# Demo fixtures

Synthetic Chrome extensions used for screenshot and console evidence.

| Fixture | Purpose |
| --- | --- |
| [sample-extension-working](./sample-extension-working) | Healthy MV3 popup + service-worker ping |
| [sample-extension-blank-popup](./sample-extension-blank-popup) | Intentional blank popup for support triage SAMPLE-EXT-001 |

## Run with the MCP tools

```text
launch_browser → extensionPath: "fixtures/sample-extension-working"
take_extension_screenshot → filename: "docs/screenshots/popup-working.png"
get_browser_logs
close_browser
```

Or regenerate all packaged evidence:

```bash
npm run capture-evidence
```

These are documentation fixtures — not Chrome Web Store products.
