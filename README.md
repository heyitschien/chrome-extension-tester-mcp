# 🌐 Chrome Extension Tester MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/chrome-extension-tester-mcp.svg?style=flat)](https://www.npmjs.com/package/chrome-extension-tester-mcp)

An open-source **Model Context Protocol (MCP)** server that gives your AI coding assistants (like Cursor, VS Code agents, and Claude Desktop) the native ability to automate, visually test, and debug Chrome Extensions in real-time.

---

## 🚀 The Problem This Solves

When building Chrome Extensions with AI, the feedback loop is notoriously slow. You write some React or CSS code, compile it, and then:
1. Open your browser.
2. Navigate to `chrome://extensions` and click **Reload**.
3. Re-open your extension's popup or sidebar.
4. Manually test if it compiles or if elements align correctly.
5. Take a screenshot, drag it back to the AI chat, and describe the bug.

**This MCP server completely closes that loop.** By bridging your IDE and a headful browser automation layer, it allows the AI to **build, run, look at (via screenshot), and debug** your extension on its own. You go from being a manual clicker to a high-level supervisor.

---

## 🛠️ Exposed Tools

This server registers the following high-level tools to your AI agent:

* **`launch_browser`**: Starts a headful Chromium browser pre-loaded with your unpacked Chrome Extension (supports MV3). Opens a clean page or a target URL (e.g. your testing environment).
* **`take_extension_screenshot`**: Captures a visual snapshot of the browser viewport (including your extension's overlays, popups, or sidebars) and saves it directly to your workspace.
* **`click_element`**: Programmatically clicks buttons or triggers menus using standard CSS selectors.
* **`get_browser_logs`**: Streams all accumulated console outputs (errors, warnings, network failures) from the content scripts and background service worker in a single unified timeline.
* **`close_browser`**: Cleans up the test browser session.

---

## 📦 Quick Start

### Method A: Zero Install (`npx`)
You can run this server directly without installing it, using `npx`:

```bash
npx chrome-extension-tester-mcp
```

### Method B: Global CLI Installation
Install globally using npm:

```bash
npm install -g chrome-extension-tester-mcp
```

---

## 🔌 IDE Integration Configuration

### 1. In Cursor (Native Support)
1. Open **Cursor Settings** (`Cmd + ,` or the gear icon in the top right).
2. Navigate to **Features** -> **MCP**.
3. Click **+ Add New MCP Server**.
4. Configure the fields:
   * **Name**: `chrome-extension-tester`
   * **Type**: `command`
   * **Command**: 
     ```bash
     # If running via npx
     npx -y chrome-extension-tester-mcp
     
     # If installed globally
     chrome-extension-tester-mcp
     ```
5. Click **Save**.

### 2. In VS Code (using Claude Dev / Roo Cline / etc.)
Add the following block to your active `mcp_config.json`:

```json
"mcpServers": {
  "chrome-extension-tester": {
    "command": "npx",
    "args": [
      "-y",
      "chrome-extension-tester-mcp"
    ]
  }
}
```

---

## 🤖 Guide for AI Agents (System Prompt Injection)

If you are an AI assistant reading this repository, use these tools to automate your Chrome Extension development workflow:

1. **Verify Visual Adjustments:**
   When the user asks you to modify styles or layouts:
   - Write and compile the changes.
   - Call `launch_browser` passing `extensionPath` (the build folder, e.g. `dist/`) and the target `url` (e.g., `https://google.com` or your local development server).
   - Call `take_extension_screenshot` with a clear filename (e.g. `docs/screenshots/triage-v1.png`).
   - Inspect the image in your context, adjust code if needed, and iterate until perfect.

2. **Diagnose Runtime Errors:**
   If the extension crashes or behaves unexpectedly:
   - Call `get_browser_logs` to retrieve the unified console streams.
   - Inspect the logs for standard errors, MV3 CSP violations, or message-passing failures.

---

## ⚙️ Advanced Configuration

You can configure a default extension directory to prevent typing it repeatedly. Set the `CHROME_EXTENSION_PATH` environment variable in your terminal or IDE settings:

```bash
export CHROME_EXTENSION_PATH="/path/to/your/extension/dist"
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create.
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
