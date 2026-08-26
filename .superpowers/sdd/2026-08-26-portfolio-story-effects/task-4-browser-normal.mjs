async page => {
  const errors = [];
  const failed = [];
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("requestfailed", req => failed.push(req.url() + " :: " + (req.failure()?.errorText || "unknown")));
  page.on("response", res => { if (res.status() >= 400) failed.push(res.url() + " :: HTTP " + res.status()); });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const cssSource = await page.evaluate(async () => fetch("library/text/shiny_text/shiny_text.css").then(response => response.text()));
  const result = await page.locator("[data-shiny-text]").evaluateAll(els => els.map(el => ({
    text: el.textContent.trim(),
    visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    duration: getComputedStyle(el).animationDuration,
    animationName: getComputedStyle(el).animationName,
    backgroundClip: getComputedStyle(el).backgroundClip,
    backgroundImage: getComputedStyle(el).backgroundImage,
    direction: el.dataset.shinyDirection,
    initialized: el.dataset.shinyTextInitialized
  })));
  const leftToRightSweep = /@keyframes\s+shinyTextSweep\s*\{[\s\S]*?from\s*\{\s*background-position:\s*150%\s+center;\s*\}[\s\S]*?to\s*\{\s*background-position:\s*-50%\s+center;/.test(cssSource);
  const rightToLeftSweep = /@keyframes\s+shinyTextSweepReverse\s*\{[\s\S]*?from\s*\{\s*background-position:\s*-50%\s+center;\s*\}[\s\S]*?to\s*\{\s*background-position:\s*150%\s+center;/.test(cssSource);
  const forcedColorsFallback = /@media\s*\(forced-colors:\s*active\)[\s\S]*?background-image:\s*none;[\s\S]*?color:\s*CanvasText;[\s\S]*?-webkit-text-fill-color:\s*CanvasText;/.test(cssSource);
  if (result.length !== 2 || !result.every(x => x.visible && x.initialized === "true") || result[0].duration !== "6.4s" || result[1].duration !== "3.2s" || result.some(x => x.direction !== "left" || x.backgroundClip !== "text" || x.animationName !== "shinyTextSweep") || !leftToRightSweep || !rightToLeftSweep || !forcedColorsFallback || errors.length || failed.length) {
    throw new Error(JSON.stringify({ result, leftToRightSweep, rightToLeftSweep, forcedColorsFallback, errors, failed }));
  }
  return { mode: "normal", result, cssChecks: { leftToRightSweep, rightToLeftSweep, forcedColorsFallback }, consoleErrors: errors, failedRequests: failed };
}
