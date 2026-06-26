# Network Tab Debugging Cheatsheet

The DevTools **Network** panel records every request a page makes. This cheatsheet covers the
moves you use daily: filtering traffic, throttling the connection, copying requests as cURL or
`fetch()`, reading headers and the timing waterfall, and replaying or blocking individual calls.
Examples target Chrome / Edge DevTools, with Firefox notes where it differs.

## Open it

```text
Cmd+Option+I  (macOS)  → click "Network"
Ctrl+Shift+I  (Windows/Linux) → click "Network"
Cmd+Option+J / Ctrl+Shift+J → opens the Console; switch to Network tab
```

Tip: leave the panel open and reload (`Cmd+R` / `Ctrl+R`) so requests are captured from the start.

## Filtering requests

Use the **Filter** box and the type tabs (All, Fetch/XHR, JS, CSS, Img, Doc, WS, Font, Media).

```text
Plain text         status          → matches URL, substring match
-png               status          → negation: hide anything containing "png"
/api/users         status          → URL substring
```

Filter-box operators (combine with space; all must match):

```text
status-code:404            only 404 responses
status-code:-200           everything except 200
method:POST                only POST requests
domain:api.example.com     only that host (supports * wildcard)
mime-type:application/json  by response MIME type
larger-than:100k           responses bigger than 100 KB (also 1M, 500)
has-response-header:Set-Cookie
scheme:https
resource-type:fetch        fetch | xhr | script | stylesheet | image | document | websocket
is:running                 in-flight requests
is:from-cache              served from cache
priority:high
-domain:fonts.googleapis.com   exclude a domain
```

Useful toggles in the toolbar:

```text
Preserve log     keep requests across page navigations / reloads
Disable cache    bypass cache while DevTools is open
Invert           show everything the filter does NOT match
```

## Throttling (simulate slow connections)

Use the throttling dropdown (defaults: "No throttling", "Fast 4G", "Slow 4G", "3G", "Offline").

```text
Network panel → throttling dropdown → pick a preset, or "Offline"
```

Add a custom profile:

```text
Throttling dropdown → "Add…" → set Download / Upload (kbps) + Latency (ms) → name it
```

Apply throttling everywhere (not just the Network panel) and emulate CPU slowdown:

```text
Cmd+Shift+P / Ctrl+Shift+P → "Show Performance" → CPU dropdown (4x / 6x slowdown)
```

Remember to set it back to **No throttling** when done — it persists between reloads.

## Copy as cURL / fetch / PowerShell

Right-click any request → **Copy** submenu:

```text
Copy → Copy as cURL            (bash)
Copy → Copy as cURL (bash)     macOS/Linux variant
Copy → Copy as cURL (cmd)      Windows
Copy → Copy as PowerShell
Copy → Copy as fetch           browser fetch() with headers + body
Copy → Copy as Node.js fetch   for running in Node
Copy → Copy all as HAR         export the whole session
Copy → Copy response           the response body only
```

Example pasted from "Copy as cURL":

```bash
curl 'https://api.example.com/v1/users?page=2' \
  -H 'accept: application/json' \
  -H 'authorization: Bearer eyJhbGci...' \
  --compressed
```

Example pasted from "Copy as fetch":

```js
fetch("https://api.example.com/v1/users?page=2", {
  headers: {
    accept: "application/json",
    authorization: "Bearer eyJhbGci...",
  },
  method: "GET",
});
```

## Inspecting headers, timing & the waterfall

Click a request to open its detail tabs:

```text
Headers   → General (URL, method, status), Request & Response headers, query params
Payload   → form data / request body (JSON shown parsed)
Preview   → rendered/pretty view of the response
Response  → raw response body
Initiator → what triggered the request (call stack / chain)
Timing    → phase breakdown (see below)
Cookies   → request + response cookies
```

The **Timing** tab breaks one request into phases:

```text
Queueing            waiting for a connection slot / higher-priority requests
Stalled             time before the request could be sent
DNS Lookup          resolving the hostname
Initial connection  TCP handshake
SSL                 TLS negotiation
Request sent        uploading the request
Waiting (TTFB)      server processing — time to first byte
Content Download     receiving the response body
```

Reading the **waterfall** column (right side of the request list):

```text
Long Waiting (TTFB)     → slow backend / DB
Long Content Download    → big payload or slow link (check Size column)
Long Queueing/Stalled    → connection contention or too many parallel requests
Gaps between bars        → requests are serialized; look for blocking dependencies
```

Add the **Size** and **Time** columns (right-click the column header) to spot heavy/slow calls fast.

## Replaying a request

```text
Right-click request → "Replay XHR"     re-send a fetch/XHR exactly as captured
```

To tweak before replaying, use **Override**/edit-and-resend:

```text
Right-click request → "Edit and resend"   (Chrome 130+)  edit URL/method/headers/body, send
```

In **Firefox** the same feature is:

```text
Right-click request → "Resend"  or  "Edit and Resend"
```

Or copy as `fetch` and run it in the **Console** to modify and re-fire:

```js
// paste a "Copy as fetch" snippet, edit headers/body, then:
await fetch("https://api.example.com/v1/users", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "test" }),
}).then((r) => r.json());
```

## Blocking requests

Block a URL or whole pattern to test fallbacks and failure handling.

```text
Right-click request → "Block request URL"      blocks that exact URL
Right-click request → "Block request domain"   blocks the whole host
```

Manage and add patterns in the **Network request blocking** panel:

```text
Cmd+Shift+P / Ctrl+Shift+P → "Show Network request blocking"
→ "Add pattern…"  e.g.  *://*.example.com/analytics/*   or   *.js
→ tick "Enable network request blocking"
```

Blocked requests appear red with status `(blocked:devtools)`.

## Common workflows

**1. Reproduce a failing API call in the terminal**

```text
1. Filter: status-code:500 method:POST
2. Click the request → check Payload + Response for the error
3. Right-click → Copy → Copy as cURL
4. Paste in terminal, tweak headers/body, re-run until you isolate the cause
```

**2. Find why the page is slow**

```text
1. Disable cache + reload with the panel open
2. Sort by the Time column (or scan the waterfall)
3. Open the slowest request → Timing tab
4. Long Waiting (TTFB) → backend; long Content Download → trim/compress the payload
```

**3. Test offline / flaky-connection behavior**

```text
1. Throttling dropdown → "Slow 4G" (or "Offline")
2. Reload and walk through the flow
3. Confirm spinners, retries, and error states behave
4. Reset to "No throttling"
```

**4. Verify the app survives a dead third-party script**

```text
1. Right-click the third-party request → "Block request domain"
2. Reload → confirm the page still renders and no JS errors cascade
3. Remove the block pattern when finished
```

## Gotchas / tips

- **Preserve log** is off by default — redirect/login flows wipe the list on navigation. Turn it on.
- **Disable cache** only works *while DevTools is open*; closing it restores normal caching.
- Throttling and request blocking **persist across reloads** — reset them or you'll chase ghosts.
- "Copy as cURL" includes your **auth tokens and cookies**; treat pasted commands as secrets.
- "Copy as cURL (cmd)" vs "(bash)" matters on Windows — quoting differs; pick the right shell.
- TTFB shown in DevTools includes network latency, not just server time — throttle off for true numbers.
- WebSocket frames live under the **WS** filter → click the connection → **Messages** tab.
- Export a **HAR** file (Copy all as HAR) to share a full capture with teammates or attach to a bug.
- Firefox/Safari label things differently (e.g. "Resend" vs "Edit and resend") but the concepts map 1:1.
