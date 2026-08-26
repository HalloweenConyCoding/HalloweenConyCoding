async page => {
  const errors = [];
  const failed = [];
  await page.emulateMedia({ reducedMotion: "reduce" });
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("requestfailed", req => failed.push(req.url() + " :: " + (req.failure()?.errorText || "unknown")));
  page.on("response", res => { if (res.status() >= 400) failed.push(res.url() + " :: HTTP " + res.status()); });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const result = await page.locator("[data-shiny-text]").evaluateAll(els => els.map(el => ({
    text: el.textContent.trim(),
    visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    animationName: getComputedStyle(el).animationName,
    duration: getComputedStyle(el).animationDuration,
    backgroundPosition: getComputedStyle(el).backgroundPosition,
    backgroundImage: getComputedStyle(el).backgroundImage,
    color: getComputedStyle(el).color,
    textFillColor: getComputedStyle(el).webkitTextFillColor
  })));
  if (result.length !== 2 || !result.every(x => x.visible && x.text && x.animationName === "none" && x.backgroundImage === "none" && x.color !== "rgba(0, 0, 0, 0)" && x.textFillColor !== "rgba(0, 0, 0, 0)") || errors.length || failed.length) {
    throw new Error(JSON.stringify({ result, errors, failed }));
  }
  return { mode: "prefers-reduced-motion: reduce", result, consoleErrors: errors, failedRequests: failed };
}
