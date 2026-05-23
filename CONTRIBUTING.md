# Contributing to Chrome Extension Tester MCP

Thank you for helping make Chrome Extension development with AI better for everyone.

## Ways to contribute

- **Bug reports** — use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml)
- **Feature ideas** — use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml)
- **Pull requests** — fixes, docs, and new MCP tools are welcome
- **Docs** — README improvements, screenshots, and setup guides

## Development setup

```bash
git clone https://github.com/heyitschien/chrome-extension-tester-mcp.git
cd chrome-extension-tester-mcp
npm install
npm run build
```

Run the server locally:

```bash
npm start
# or: node dist/index.js
```

Watch mode while editing:

```bash
npm run watch
```

## Pull request guidelines

1. **One concern per PR** — easier to review and merge.
2. **Describe the why** — what problem does this solve?
3. **Keep scope small** — prefer focused changes over large refactors.
4. **Test manually** — launch the MCP server and exercise changed tools with a sample extension if you touch `src/`.
5. **Match existing style** — TypeScript, ESM imports, `console.error` for server-side logging (stdio transport reserves stdout for MCP).

## Commit messages

Use clear, imperative subjects:

- `fix: handle missing manifest.json with clearer error`
- `docs: add Windsurf MCP setup example`
- `feat: add reload_extension tool`

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be respectful and constructive.

## Questions?

Open a [Discussion](https://github.com/heyitschien/chrome-extension-tester-mcp/discussions) or an issue labeled `question`.
