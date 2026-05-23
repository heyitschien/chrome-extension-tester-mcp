#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";

// Initialize the MCP server
const server = new Server(
  {
    name: "chrome-extension-tester",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Global state for active browser context and pages
let activeContext: BrowserContext | null = null;
let activePage: Page | null = null;
const consoleLogs: string[] = [];

// Create a unique temporary user data directory for Chromium session
const tempUserDataDir = path.join(
  os.tmpdir(),
  `chrome-extension-tester-mcp-${Math.random().toString(36).slice(2, 9)}`
);

/**
 * Ensures clean shutdown of Playwright browser resources.
 */
async function cleanupBrowser() {
  if (activeContext) {
    console.error("[INFO] Closing active browser context...");
    try {
      await activeContext.close();
    } catch (e) {
      console.error("[ERROR] Failed to close context:", e);
    }
    activeContext = null;
    activePage = null;
  }
}

// Define the available tools
const TOOLS = [
  {
    name: "launch_browser",
    description: "Launches a headful Chrome browser with a specified unpacked Chrome extension loaded.",
    inputSchema: {
      type: "object",
      properties: {
        extensionPath: {
          type: "string",
          description: "Path to the built extension folder (containing manifest.json). Can be absolute or relative to the workspace directory. If omitted, checks the CHROME_EXTENSION_PATH environment variable."
        },
        url: {
          type: "string",
          description: "The URL to navigate to once launched (e.g. https://google.com). Defaults to a clean about:blank page.",
          default: "about:blank"
        },
        width: {
          type: "number",
          description: "Viewport width.",
          default: 1280
        },
        height: {
          type: "number",
          description: "Viewport height.",
          default: 800
        }
      }
    }
  },
  {
    name: "take_extension_screenshot",
    description: "Takes a screenshot of the active browser view and saves it to your workspace.",
    inputSchema: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "Target file path or name (e.g., docs/screenshots/my-view.png). Resolves relative to your current workspace directory.",
          default: "extension-screenshot.png"
        }
      }
    }
  },
  {
    name: "click_element",
    description: "Clicks a targeted element on the page using a standard CSS selector.",
    inputSchema: {
      type: "object",
      properties: {
        selector: {
          type: "string",
          description: "The CSS selector of the element to click (e.g., button.submit-btn, #menu-item)."
        },
        timeout: {
          type: "number",
          description: "Maximum timeout in milliseconds to wait for the element.",
          default: 5000
        }
      },
      required: ["selector"]
    }
  },
  {
    name: "get_browser_logs",
    description: "Retrieves all captured console logs (both webpage logs and background content script logs) since launch.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "close_browser",
    description: "Closes the current running browser session cleanly.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Handle listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle calling tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "launch_browser": {
        // Resolve extension path
        const rawPath = (args?.extensionPath as string) || process.env.CHROME_EXTENSION_PATH;
        if (!rawPath) {
          throw new Error(
            "Extension path is required. Please supply 'extensionPath' as an argument or set the CHROME_EXTENSION_PATH environment variable."
          );
        }

        const resolvedExtPath = path.resolve(process.cwd(), rawPath);
        if (!fs.existsSync(resolvedExtPath)) {
          throw new Error(`Extension path does not exist at resolved location: ${resolvedExtPath}`);
        }

        const manifestPath = path.join(resolvedExtPath, "manifest.json");
        if (!fs.existsSync(manifestPath)) {
          throw new Error(`Missing 'manifest.json' inside extension folder: ${resolvedExtPath}`);
        }

        const url = (args?.url as string) || "about:blank";
        const width = (args?.width as number) || 1280;
        const height = (args?.height as number) || 800;

        // Clean up any existing instances first
        await cleanupBrowser();

        console.error(`[INFO] Launching browser with extension loaded from: ${resolvedExtPath}`);

        // Ensure user data directory exists
        if (!fs.existsSync(tempUserDataDir)) {
          fs.mkdirSync(tempUserDataDir, { recursive: true });
        }

        // Launch headful persistent context with target extension
        activeContext = await chromium.launchPersistentContext(tempUserDataDir, {
          headless: false,
          args: [
            `--disable-extensions-except=${resolvedExtPath}`,
            `--load-extension=${resolvedExtPath}`,
            "--no-sandbox",
            "--disable-setuid-sandbox"
          ],
          viewport: { width, height }
        });

        // Track console logs
        consoleLogs.length = 0; // Clear old logs
        activeContext.on("page", (page) => {
          page.on("console", (msg) => {
            const entry = `[${msg.type()}] ${msg.text()}`;
            consoleLogs.push(entry);
            console.error(`[BROWSER LOG] ${entry}`);
          });
        });

        // Get or create active page
        const pages = activeContext.pages();
        activePage = pages.length > 0 ? pages[0] : await activeContext.newPage();

        // Listen for console events on primary page
        activePage.on("console", (msg) => {
          const entry = `[${msg.type()}] ${msg.text()}`;
          consoleLogs.push(entry);
          console.error(`[BROWSER LOG] ${entry}`);
        });

        if (url && url !== "about:blank") {
          console.error(`[INFO] Navigating to: ${url}`);
          await activePage.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        }

        return {
          content: [
            {
              type: "text",
              text: `Successfully launched headful Chrome loaded with extension from '${resolvedExtPath}' and navigated to '${url}'.`
            }
          ]
        };
      }

      case "take_extension_screenshot": {
        if (!activePage) {
          throw new Error("No active browser session found. Please run 'launch_browser' first.");
        }

        const filename = (args?.filename as string) || "extension-screenshot.png";
        const savePath = path.resolve(process.cwd(), filename);
        
        // Ensure directories exist
        const saveDir = path.dirname(savePath);
        if (!fs.existsSync(saveDir)) {
          fs.mkdirSync(saveDir, { recursive: true });
        }

        console.error(`[INFO] Saving screenshot to: ${savePath}`);
        await activePage.screenshot({ path: savePath, fullPage: false });

        return {
          content: [
            {
              type: "text",
              text: `Screenshot captured successfully!\nSaved to: [${path.basename(savePath)}](file://${savePath})`
            }
          ]
        };
      }

      case "click_element": {
        if (!activePage) {
          throw new Error("No active browser session found. Please run 'launch_browser' first.");
        }

        const selector = args?.selector as string;
        const timeout = (args?.timeout as number) || 5000;

        if (!selector) {
          throw new Error("Selector argument is required.");
        }

        console.error(`[INFO] Clicking element with selector: ${selector}`);
        await activePage.click(selector, { timeout });

        return {
          content: [
            {
              type: "text",
              text: `Successfully clicked element matching selector '${selector}'.`
            }
          ]
        };
      }

      case "get_browser_logs": {
        return {
          content: [
            {
              type: "text",
              text: consoleLogs.length > 0 
                ? consoleLogs.join("\n") 
                : "No browser console logs captured yet."
            }
          ]
        };
      }

      case "close_browser": {
        await cleanupBrowser();
        return {
          content: [
            {
              type: "text",
              text: "Successfully closed Chrome browser instance."
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`[ERROR] Execution of ${name} failed:`, error);
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error: ${error.message || String(error)}`
        }
      ]
    };
  }
});

// Run server using StdIO transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[INFO] Generic Chrome Extension Tester MCP Server running on StdIO.");
}

run().catch((error) => {
  console.error("[FATAL] Server crashed:", error);
  process.exit(1);
});

// Handle graceful shutdown signals
process.on("SIGINT", async () => {
  await cleanupBrowser();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await cleanupBrowser();
  process.exit(0);
});
