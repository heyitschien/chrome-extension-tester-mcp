console.log("[sample-blank] service worker started");

// Synthetic SW noise that support/QA would look for in get_browser_logs
setTimeout(() => {
  console.error(
    "[sample-blank] Service worker registration failed: AbortError: Failed to register a ServiceWorker"
  );
}, 50);
