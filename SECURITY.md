# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report them privately:

1. Use [GitHub Security Advisories](https://github.com/heyitschien/chrome-extension-tester-mcp/security/advisories/new) (preferred), or
2. Email the maintainer via GitHub (@heyitschien) with subject `SECURITY: chrome-extension-tester-mcp`.

Include:

- Description of the issue
- Steps to reproduce
- Impact assessment (if known)
- Suggested fix (optional)

We aim to acknowledge reports within **72 hours** and provide a fix or mitigation plan as soon as practical.

## Scope notes

This MCP server:

- Launches a **local** headful Chromium with user-specified extension paths
- Writes screenshots only to paths you (or your AI) provide under `process.cwd()`
- Does not expose a network listener (stdio transport only)

Out of scope: vulnerabilities in Chromium, Playwright, or third-party extensions you load for testing.
