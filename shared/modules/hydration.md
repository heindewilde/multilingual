# Module: hydration

On for server-rendered or statically generated React (Next.js App or Pages Router). A hydration mismatch makes React throw away the server HTML and re-render on the client: the page still works, so nothing looks broken, but crawlers and slow devices get a worse page and errors go unnoticed.

Check in a real browser (Claude in Chrome if available), against the production server:

1. Load the first page, then call `read_console_messages` once to start capture (it cannot start on a browser-internal page such as the new-tab page).
2. Load one page of every type in every locale (home, a listing, a detail page, an article, a static page). On each, wait about 1.5 seconds before moving on, so hydration has run, and confirm React attached: `[...document.querySelectorAll('*')].some(e => Object.keys(e).some(k => k.startsWith('__reactFiber')))` is `true`.
3. **Positive control, last:** run `node ${CLAUDE_PLUGIN_ROOT}/scripts/mismatch-proxy.mjs --target <server url> --find "<text on the home page>" --replace "<different text>"` and load the home page through the proxy in the same session.
4. Read the console filtered for `hydrat|Minified React|#418|#423|#425|did not match`. **Pass** only if the one error found is the control page's (React #418) and no real page produced one. If the control's error is missing too, the capture can't see hydration errors: the check is inconclusive, not passed.

A hydration failure surfaces as an uncaught exception, which the capture keeps across navigations. A plain `console.error("PROBE")` does not prove the same: it is not reliably kept across navigations, so use the control instead.

If the browser extension is unavailable but Chrome or Chromium is installed, the same check works headless: launch it with `--remote-debugging-port` and read `Runtime.exceptionThrown` and `Runtime.consoleAPICalled` over the DevTools protocol (Playwright or Puppeteer, if the project already has one, do this in a few lines), with the same control. If no browser can run at all, say so in the PR as an unchecked item; do not claim the check passed.
