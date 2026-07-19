// Intentional support repro: popup script throws before mounting UI.
console.error(
  "[sample-blank] Uncaught TypeError: Cannot read properties of undefined (reading 'mount')"
);
console.error(
  "[sample-blank] Refused to execute inline script because it violates the following Content Security Policy directive: \"script-src 'self'\""
);

throw new Error(
  "Service worker registration failed: Extension context invalidated during popup boot (synthetic SAMPLE-EXT-001)"
);
