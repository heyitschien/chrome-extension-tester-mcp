# Support Use Case — Blank Extension Popup

**Tool:** [chrome-extension-tester-mcp](https://github.com/heyitschien/chrome-extension-tester-mcp)  
**Type:** Synthetic support scenario — illustrates technical support / QA workflow

This scenario shows how I would use structured browser automation to investigate a common Chrome extension report. No real customer data.

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
| 3 | Open popup via toolbar icon |
| 4 | Capture screenshot of blank state |
| 5 | Capture console logs from popup and service worker |
| 6 | Compare MV3 manifest permissions vs required host permissions |
| 7 | Retry with other extensions disabled |

---

## MCP workflow (support / QA)

```text
launch_browser     → extensionPath: "dist", headful for visual check
take_extension_screenshot → filename: "docs/screenshots/blank-popup-repro.png"
get_browser_logs     → filter for CSP, MV3 service worker, uncaught exceptions
click_element        → if popup has hidden mount point, verify selector
close_browser        → clean up session
```

**Example agent loop:**

```
1. launch_browser  →  extensionPath: "dist"
2. take_extension_screenshot  →  "docs/screenshots/blank-popup-repro.png"
3. get_browser_logs  →  look for "Refused to load", "Service worker registration failed"
4. close_browser
```

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
**Environment:** Chrome 124, Windows 11, Chrome Web Store install
**Symptom:** Popup renders blank (white screen), no console UI visible to user

### Reproduction
- Loaded unpacked build from release `dist/` — reproduces
- Screenshot: docs/screenshots/blank-popup-repro.png
- Console: [paste relevant CSP / SW errors from get_browser_logs]

### Ruled out
- [ ] User loading wrong folder (confirmed Store install)
- [ ] Conflicting extension (repro in clean profile)

### Suspected layer
- MV3 service worker registration / CSP on popup script

### Customer impact
- Medium — blocks first-use onboarding
- Workaround: none confirmed

### Ask engineering
- Confirm CSP policy in popup bundle for Chrome 124
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
- [docs/recruiter-notes.md](./recruiter-notes.md) — Interview context
- [docs/assets/workflow.svg](./assets/workflow.svg) — MCP workflow diagram
