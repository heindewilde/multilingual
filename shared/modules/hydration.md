# Module: hydration

On for server-rendered or statically generated React (Next.js App or Pages Router). A hydration mismatch makes React throw away the server HTML and re-render on the client: the page still works, so nothing looks broken, but crawlers and slow devices get a worse page and errors go unnoticed.

Check in a real browser (Claude in Chrome if available), against the production build:
1. Call `read_console_messages` once to start capture, load the first page, run `console.error("PROBE")` with the JavaScript tool, and confirm the probe is read back.
2. Load one page of every type in the new locale (home, a listing, a detail page, an article, a static page).
3. Read the console filtered for `hydrat|Minified React|#418|#423|#425|did not match`. Any match fails the check.

If the browser extension is unavailable but Chrome or Chromium is installed, the same check works headless: launch it with `--remote-debugging-port`, and read `Runtime.consoleAPICalled` and `Runtime.exceptionThrown` over the DevTools protocol (Playwright or Puppeteer, if the project already has one, do this in a few lines). Still log a probe first. If no browser can run at all, say so in the PR as an unchecked item; do not claim the check passed.
