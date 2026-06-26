# Browser Console Debugging Tricks

A practical cheatsheet for the DevTools console. Most of these work in Chrome and Edge; the
Console Utilities API helpers (`$0`, `$_`, `copy`, `monitor`, `debug`, `inspect`) are only
available when you type them in the console, not in committed source. Firefox supports a subset.

## Tabular and structured output

```js
// Render an array of objects as a sortable table
console.table(users);

// Limit to specific columns
console.table(users, ["id", "name"]);

// An object becomes a table keyed by its properties
console.table({ a: 1, b: 2 });
```

```js
// Inspect a DOM element as a JS object (properties) instead of as HTML
console.dir(document.body);

// console.log(el) shows the HTML tree; console.dir(el) shows the object
```

## Grouping logs

```js
console.group("Request");        // start an expanded group
console.log("url:", url);
console.log("status:", status);
console.groupEnd();              // close it

console.groupCollapsed("Details"); // same, but starts collapsed
console.log("headers", headers);
console.groupEnd();
```

Groups nest, so call `groupEnd()` once per `group`/`groupCollapsed`.

## Styling with %c

```js
// %c applies the next argument as CSS to the text that follows it
console.log("%cLoaded", "color:#0f0;font-weight:bold;");

// Multiple %c segments, one CSS string each
console.log(
  "%cOK %cdone",
  "color:white;background:green;padding:2px 4px;border-radius:3px",
  "color:gray"
);
```

Supported CSS is limited (color, background, font, padding, border, etc.) — no layout.

## Timing

```js
console.time("fetch");          // start a named timer
await fetch("/api");
console.timeLog("fetch");       // log elapsed without stopping
console.timeEnd("fetch");       // log elapsed and stop the timer

console.count("render");        // how many times this line ran
console.countReset("render");   // reset that counter
```

```js
// Mark spans in the Performance panel timeline
console.timeStamp("data ready");
```

## Selection helpers ($0, $_)

```js
$0   // the DOM element currently selected in the Elements panel
$1   // the previously selected element ($2 ... $4 go further back)
$_   // the value of the last evaluated expression

2 + 2;   // -> 4
$_ * 10; // -> 40

$0.style.outline = "2px solid red";   // highlight the inspected node
```

```js
// Query shortcuts (console only)
$("button.primary");    // like document.querySelector
$$("li");               // like document.querySelectorAll, returns a real Array
$x("//a[@href]");       // evaluate an XPath, returns an array of nodes
```

## copy() and inspect()

```js
copy(JSON.stringify(state, null, 2));  // put a value on the system clipboard
copy($0);                               // copy the inspected element's markup
inspect(document.querySelector("#app")); // reveal a node/function in Elements/Sources
```

## Breaking on function calls

```js
monitor(myFunc);     // log every call to myFunc with its arguments
unmonitor(myFunc);   // stop logging

debug(myFunc);       // set a breakpoint that fires whenever myFunc is called
undebug(myFunc);     // remove that breakpoint

monitorEvents(window, "resize");    // log events on a target
unmonitorEvents(window, "resize");

getEventListeners($0);  // list listeners attached to an element
```

## Live expressions

In Chrome/Edge, click the eye icon at the top of the Console to pin a **live expression** — an
expression that re-evaluates continuously and shows its current value above the log stream.

```js
// Useful live expressions to pin:
document.activeElement          // what currently has focus
performance.memory?.usedJSHeapSize
window.scrollY
document.querySelectorAll(".row").length
```

Live expressions never write to the log, so they're great for values that change every frame.

## Common workflows

**1. Inspect an API response as a table**

```js
const res = await fetch("/api/users").then(r => r.json());
console.table(res, ["id", "name", "email"]);
copy(res);   // grab the full payload for a bug report
```

**2. Time and count a hot render path**

```js
function render(item) {
  console.count("render");
  console.time("render-" + item.id);
  // ...work...
  console.timeEnd("render-" + item.id);
}
// later, see the total:
console.countReset("render");
```

**3. Trace why a function fires**

```js
debug(updateCart);     // pause in Sources every time it's called
// reproduce the bug in the page, inspect the call stack, then:
undebug(updateCart);
```

**4. Grab and tweak the element you're looking at**

```js
// Select a node in the Elements panel, then in the Console:
$0.classList.add("debug-highlight");
copy($0.outerHTML);     // paste the markup elsewhere
getEventListeners($0);  // see what's bound to it
```

## Gotchas / tips

- `$0`, `$_`, `$`, `$$`, `copy`, `monitor`, `debug`, `inspect`, and `getEventListeners` are part
  of the **Console Utilities API** — they exist only in the console and will throw
  `ReferenceError` if left in shipped code.
- `$` and `$$` are only aliases when the page does **not** define its own `$` (e.g. jQuery); if a
  library owns `$`, the console aliases are shadowed.
- `console.table` truncates very large arrays and only tabulates own enumerable properties.
- `console.dir(el)` vs `console.log(el)`: use `dir` to see the JS object/properties, `log` for the
  interactive HTML tree.
- Timer names must match exactly between `time`/`timeLog`/`timeEnd`; a mismatch logs a warning and
  is silently ignored.
- `performance.memory` is Chrome-only and may be `undefined`, so guard with `?.`.
- Strip `console.*` calls from production with a bundler plugin or `drop_console` — leftover logs
  leak data and slow hot loops.
