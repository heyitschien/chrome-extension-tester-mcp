# Evidence captures

Console logs and metadata from `npm run capture-evidence`.

These files are produced by the same Playwright approach the MCP server uses for `launch_browser` / `take_extension_screenshot` / `get_browser_logs`.

| File | Contents |
| --- | --- |
| [working-console.txt](./working-console.txt) | Healthy popup + service-worker ping |
| [blank-popup-console.txt](./blank-popup-console.txt) | Blank-popup repro errors (CSP / mount / SW) |
| [capture-summary.json](./capture-summary.json) | Timestamp + artifact list from last run |

Screenshots live in [`../screenshots/`](../screenshots/).
