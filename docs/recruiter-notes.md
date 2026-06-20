# Recruiter Notes

## What this project demonstrates

This is my proof point for **AI-assisted QA**, **automation thinking**, and **support-minded troubleshooting**. The MCP server lets an AI assistant (or a human using structured tools) test Chrome extensions without the manual reload-click-screenshot loop.

It shows I can build practical tooling, document it for other developers, and think about how automation helps support and QA teams — not just engineers shipping features.

## What to look at first

1. **[README](../README.md) — Recruiter quick scan** — one-minute overview of value and skills.
2. **[Quick Start](../README.md#-quick-start)** — `npx -y chrome-extension-tester-mcp` to run instantly.
3. **[Tools table](../README.md#tools)** — what the server can do (launch, screenshot, click, logs).
4. **[Example agent workflow](../README.md#example-agent-workflow)** — the repeatable test loop.
5. **`examples/cursor-mcp.json`** — ready-made MCP config for Cursor.

## What is intentionally out of scope

- Claims that this is deployed in a production QA organization
- Testing of proprietary or customer extensions (bring your own `dist/` folder)
- Full end-to-end test suite replacement (this is a focused MCP tool, not Playwright Test CI for every repo)
- Private Career OS or employer-confidential workflows

## Interview talking points

- **Support angle:** How visual verification + console logs shorten "can you reproduce this?" cycles for extension issues.
- **MCP choice:** Why a protocol-based tool fits AI-assisted workflows better than one-off scripts.
- **Repeatability:** The launch → screenshot → logs → click → close loop as a template for other browser workflows.
- **Open source:** Published on npm, MIT licensed, CI on GitHub — shows I can ship and maintain dev tools.
- **What I'd add next:** Test recipe templates, better error messages for common MV3 failures, and support-team-friendly docs.
