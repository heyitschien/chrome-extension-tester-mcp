# Support Use Case — Blank Extension Popup

**Tool:** [chrome-extension-tester-mcp](https://github.com/heyitschien/chrome-extension-tester-mcp)  
**Type:** Synthetic support scenario — illustrates technical support / QA workflow  
**Evidence:** Real screenshots + console captures from the MCP tool loop (see below)

This scenario shows how structured browser automation investigates a common Chrome extension report. No real customer data.

---

## Customer symptom

> "I installed your Chrome extension from the Chrome Web Store. When I click the icon, the popup is completely blank — white screen, no buttons. It worked in your demo video. I'm on Windows 11, Chrome 124."

---

## First response goals

1. Acknowledge frustration — user expected immediate value after install
2. Restate symptom: blank popup after install, Chrome 124, Windows 11
3. Ask: fresh install or update? Other extensions disabled? Any error badge on the icon?
4. Set expectation: we'll reproduce with logs before escalating to engineering

---

## Reproduction steps

| Step | Action |
| --- | --- |
| 1 | Confirm extension version and install source (Store vs unpacked dev build) |
| 2 | Launch clean Chromium profile with extension loaded |
| 3 | Open popup via toolbar icon / `chrome-extension://…/popup.html` |
| 4 | Capture screenshot of blank state |
| 5 | Capture console logs from popup and service worker |
| 6 | Compare MV3 manifest permissions vs required host permissions |
| 7 | Retry with other extensions disabled |

---

## MCP workflow (support / QA)

```text
launch_browser     → extensionPath: "fixtures/sample-extension-blank-popup"
take_extension_screenshot → filename: "docs/screenshots/blank-popup-repro.png"
get_browser_logs     → filter for CSP, MV3 service worker, uncaught exceptions
close_browser        → clean up session
```

Replay the same loop locally without an IDE:

```bash
npm run capture-evidence
```

---

## Captured evidence (real run)

### Healthy baseline (working fixture)

<p align="center">
  <img src="./screenshots/popup-working.png" alt="Working sample extension popup with Service worker OK status" width="320" />
</p>

Console excerpt ([full log](./evidence/working-console.txt)):

```text
[log] [sample-working] popup loaded
[log] [sample-working] ping response {ok: true, at: …}
```

### Blank popup repro (support fixture)

<p align="center">
  <img src="./screenshots/blank-popup-repro.png" alt="Blank white extension popup reproduction" width="320" />
</p>

Console excerpt ([full log](./evidence/blank-popup-console.txt)):

```text
[error] [sample-blank] Uncaught TypeError: Cannot read properties of undefined (reading 'mount')
[error] [sample-blank] Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self'"
[pageerror] Service worker registration failed: Extension context invalidated during popup boot (synthetic SAMPLE-EXT-001)
```

Browser session after launch ([working-browser-loaded.png](./screenshots/working-browser-loaded.png)):

<p align="center">
  <img src="./screenshots/working-browser-loaded.png" alt="Chromium launched with extension context on example.com" width="720" />
</p>

---

## Likely causes

| Layer | Cause | Support action |
| --- | --- | --- |
| **Build / packaging** | Wrong folder loaded (source vs `dist/`) | Confirm install instructions; verify `manifest.json` in package |
| **CSP** | Content Security Policy blocks inline script | Logs show CSP violation — escalate with log snippet |
| **MV3 service worker** | SW failed to register; popup has no data | Check `get_browser_logs` for registration errors |
| **Permissions** | Missing `host_permissions` for API the popup calls | Compare manifest to docs; guide user if config issue |
| **Cache / stale install** | Old version cached after update | Guide remove + reinstall; verify version in `chrome://extensions` |
| **Environment** | Corporate policy blocks extension APIs | Document policy limitation; escalate if widespread |

---

## Customer-facing status update (draft)

> Thanks for the details. A blank popup usually means the extension UI did not finish loading — often a permissions or install-path issue rather than your account.
>
> I've reproduced this in a clean browser session and captured logs. Next step: please confirm the version number on `chrome://extensions` and whether you installed from the Chrome Web Store or a developer zip. I'll follow up within one business day with either a fix path or an escalation to our engineering team.

---

## Internal escalation note (draft)

```markdown
## Escalation — blank popup after install

**Reporter:** Synthetic SAMPLE-EXT-001
**Environment:** Chrome / Chromium via MCP capture, synthetic fixture
**Symptom:** Popup renders blank (white screen), no console UI visible to user

### Reproduction
- Loaded unpacked fixture: fixtures/sample-extension-blank-popup
- Screenshot: docs/screenshots/blank-popup-repro.png
- Console: docs/evidence/blank-popup-console.txt
  - TypeError on mount
  - CSP script-src 'self' refusal
  - Service worker registration failure (synthetic)

### Ruled out
- [x] Conflicting extension (clean Playwright profile)
- [x] Missing screenshot/log evidence (captured below)

### Suspected layer
- Popup boot / CSP / service worker registration

### Customer impact
- Medium — blocks first-use onboarding
- Workaround: none confirmed

### Ask engineering
- Confirm CSP policy in popup bundle
- Verify service worker entry in manifest v3
```

---

## Support / QA relevance

| Target role | What this use case proves |
| --- | --- |
| **Technical Support** | Symptom → repro → logs → layer isolation → escalation note |
| **QA** | Repeatable screenshot + log capture instead of ad-hoc click-through |
| **AI workflow operations** | MCP tools as structured support instrumentation |
| **Developer support** | Extension-specific failure modes (CSP, MV3, packaging) |
| **Product Support** | Calm customer update while investigation runs |
| **Implementation / Onboarding** | First-install experience debugging — setup path validation |

---

## Related files

- [README](../README.md) — Quick Start and tool reference
- [docs/screenshots/README.md](./screenshots/README.md) — Screenshot gallery
- [docs/evidence/](./evidence/) — Console captures + capture summary
- [fixtures/](../fixtures/) — Working and blank-popup demo extensions
- [docs/recruiter-notes.md](./recruiter-notes.md) — Interview context
- [docs/assets/workflow.svg](./assets/workflow.svg) — MCP workflow diagram
