# Publish checklist

Use this after pushing to GitHub to finish open-source setup.

## One-time GitHub settings

- [ ] **Create repo** at https://github.com/new → `heyitschien/chrome-extension-tester-mcp`
- [ ] **Push** local `main` branch (see commands below)
- [ ] **Description** (repo About box):  
  `MCP server to automate, test, and debug Chrome Extensions with AI assistants (Cursor, Claude, VS Code).`
- [ ] **Website**: `https://github.com/heyitschien/chrome-extension-tester-mcp`
- [ ] **Topics**: `mcp`, `model-context-protocol`, `chrome-extension`, `playwright`, `cursor`, `ai`, `devtools`, `browser-automation`, `manifest-v3`
- [ ] **Social preview**: upload `docs/assets/readme-hero.png` or `docs/assets/banner.png` (Settings → General → Social preview)
- [ ] **Enable Discussions** (Settings → General → Features → Discussions)
- [ ] **Pin the repo** on your GitHub profile (profile → Customize pins)

## Push commands

```bash
git remote add origin https://github.com/heyitschien/chrome-extension-tester-mcp.git
git push -u origin main
```

## npm publish (optional)

> The unscoped name `chrome-extension-tester-mcp` on the public npm registry is already used by a **different** project. Publish under a scoped name (e.g. `@heyitschien/chrome-extension-tester-mcp`) or choose a unique unscoped name, then update the README install section.

```bash
npm login
npm run build
# after renaming package.json "name" to an available name:
npm publish --access public
```

## Release

1. GitHub → **Releases** → **Draft a new release**
2. Tag: `v1.0.0`, title: `v1.0.0 — Initial release`
3. Paste the [1.0.0 section from CHANGELOG.md](CHANGELOG.md)

## Share

- Star your own repo (helps discovery algorithms)
- Post in MCP / Cursor / Chrome extension communities with the README quick-start link
