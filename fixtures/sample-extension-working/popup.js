document.getElementById("ping")?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "ping" }, (response) => {
    const status = document.getElementById("status");
    if (status) {
      status.textContent = response?.ok ? "Service worker OK" : "No response";
    }
    console.log("[sample-working] ping response", response);
  });
});

console.log("[sample-working] popup loaded");
