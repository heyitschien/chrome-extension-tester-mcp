chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ping") {
    console.log("[sample-working] service worker received ping");
    sendResponse({ ok: true, at: new Date().toISOString() });
  }
  return true;
});

console.log("[sample-working] service worker started");
