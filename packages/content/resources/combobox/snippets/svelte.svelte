<script>
import { onMount, onDestroy } from "svelte";

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
  { value: "astro", label: "Astro" },
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "qwik", label: "Qwik" },
];

const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
];

let selectedFramework = "";

// Combobox 1 state
let query1 = "";
let isOpen1 = false;
let activeIndex1 = -1;
let selectedValue1 = "";
let rootEl1;
let inputEl1;
let listEl1;

// Combobox 2 state
let query2 = "";
let isOpen2 = false;
let activeIndex2 = -1;
let selectedValue2 = "";
let rootEl2;
let inputEl2;
let listEl2;

$: filtered1 = frameworks.filter((o) => o.label.toLowerCase().includes(query1.toLowerCase()));
$: filtered2 = countries.filter((o) => o.label.toLowerCase().includes(query2.toLowerCase()));

function select1(opt) {
  selectedValue1 = opt.value;
  query1 = opt.label;
  selectedFramework = opt.value;
  isOpen1 = false;
  activeIndex1 = -1;
}

function select2(opt) {
  selectedValue2 = opt.value;
  query2 = opt.label;
  isOpen2 = false;
  activeIndex2 = -1;
}

function handleKey1(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!isOpen1) {
      isOpen1 = true;
      activeIndex1 = -1;
    }
    activeIndex1 = activeIndex1 + 1 >= filtered1.length ? 0 : activeIndex1 + 1;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!isOpen1) {
      isOpen1 = true;
      activeIndex1 = -1;
    }
    activeIndex1 = activeIndex1 - 1 < 0 ? filtered1.length - 1 : activeIndex1 - 1;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex1 >= 0 && activeIndex1 < filtered1.length) select1(filtered1[activeIndex1]);
  } else if (e.key === "Escape") {
    isOpen1 = false;
    activeIndex1 = -1;
    inputEl1?.blur();
  }
}

function handleKey2(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!isOpen2) {
      isOpen2 = true;
      activeIndex2 = -1;
    }
    activeIndex2 = activeIndex2 + 1 >= filtered2.length ? 0 : activeIndex2 + 1;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!isOpen2) {
      isOpen2 = true;
      activeIndex2 = -1;
    }
    activeIndex2 = activeIndex2 - 1 < 0 ? filtered2.length - 1 : activeIndex2 - 1;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex2 >= 0 && activeIndex2 < filtered2.length) select2(filtered2[activeIndex2]);
  } else if (e.key === "Escape") {
    isOpen2 = false;
    activeIndex2 = -1;
    inputEl2?.blur();
  }
}

$: if (activeIndex1 >= 0 && listEl1) {
  const item = listEl1.children[activeIndex1];
  item?.scrollIntoView({ block: "nearest" });
}

$: if (activeIndex2 >= 0 && listEl2) {
  const item = listEl2.children[activeIndex2];
  item?.scrollIntoView({ block: "nearest" });
}

function handleClickOutside(e) {
  if (rootEl1 && !rootEl1.contains(e.target)) {
    isOpen1 = false;
    activeIndex1 = -1;
  }
  if (rootEl2 && !rootEl2.contains(e.target)) {
    isOpen2 = false;
    activeIndex2 = -1;
  }
}

onMount(() => {
  document.addEventListener("click", handleClickOutside);
});

onDestroy(() => {
  document.removeEventListener("click", handleClickOutside);
});

function getItemColor(i, activeIdx, selectedVal, optValue) {
  if (i === activeIdx) return "#38bdf8";
  if (selectedVal === optValue) return "#38bdf8";
  return "#94a3b8";
}

function getItemBg(i, activeIdx) {
  return i === activeIdx ? "rgba(56,189,248,0.12)" : "transparent";
}
</script>

<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; font-family: Inter, system-ui, sans-serif; color: #f2f6ff; padding: 2rem;">
  <div style="width: 100%; max-width: 640px;">
    <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.375rem;">Combobox</h1>
    <p style="color: #475569; font-size: 0.875rem; margin-bottom: 2rem;">Searchable dropdown select with keyboard navigation.</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
      <!-- Framework combobox -->
      <div bind:this={rootEl1} style="position: relative;">
        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
          Framework
        </label>
        <div style="position: relative;">
          <input
            bind:this={inputEl1}
            type="text"
            role="combobox"
            aria-expanded={isOpen1}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            autocomplete="off"
            bind:value={query1}
            placeholder="Search frameworks..."
            on:focus={() => { isOpen1 = true; activeIndex1 = -1; }}
            on:input={() => { isOpen1 = true; }}
            on:keydown={handleKey1}
            style="width: 100%; padding: 0.625rem 2.25rem 0.625rem 0.875rem; background: #141414; border: 1px solid #2a2a2a; border-radius: 0.625rem; color: #f2f6ff; font-size: 0.875rem; font-family: inherit; outline: none;"
          />
          <span style="position: absolute; right: 0.625rem; top: 50%; transform: translateY(-50%) rotate({isOpen1 ? 180 : 0}deg); color: #4a4a4a; pointer-events: none; transition: transform 0.2s;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
        {#if isOpen1}
          <ul
            bind:this={listEl1}
            role="listbox"
            style="position: absolute; top: calc(100% + 0.375rem); left: 0; right: 0; background: #141414; border: 1px solid #2a2a2a; border-radius: 0.625rem; max-height: 14rem; overflow-y: auto; list-style: none; z-index: 50; padding: 0; margin: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.4);"
          >
            {#if filtered1.length === 0}
              <li style="padding: 0.75rem 0.875rem; font-size: 0.8125rem; color: #4a4a4a; text-align: center;">No results found</li>
            {:else}
              {#each filtered1 as opt, i}
                <li
                  role="option"
                  aria-selected={selectedValue1 === opt.value}
                  on:click={() => select1(opt)}
                  on:mouseenter={() => { activeIndex1 = i; }}
                  style="padding: 0.5rem 0.875rem; font-size: 0.875rem; color: {getItemColor(i, activeIndex1, selectedValue1, opt.value)}; background: {getItemBg(i, activeIndex1)}; cursor: pointer; font-weight: {selectedValue1 === opt.value ? 600 : 400}; transition: background 0.1s, color 0.1s;"
                >
                  {opt.label}
                </li>
              {/each}
            {/if}
          </ul>
        {/if}
      </div>

      <!-- Country combobox -->
      <div bind:this={rootEl2} style="position: relative;">
        <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
          Country
        </label>
        <div style="position: relative;">
          <input
            bind:this={inputEl2}
            type="text"
            role="combobox"
            aria-expanded={isOpen2}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            autocomplete="off"
            bind:value={query2}
            placeholder="Search countries..."
            on:focus={() => { isOpen2 = true; activeIndex2 = -1; }}
            on:input={() => { isOpen2 = true; }}
            on:keydown={handleKey2}
            style="width: 100%; padding: 0.625rem 2.25rem 0.625rem 0.875rem; background: #141414; border: 1px solid #2a2a2a; border-radius: 0.625rem; color: #f2f6ff; font-size: 0.875rem; font-family: inherit; outline: none;"
          />
          <span style="position: absolute; right: 0.625rem; top: 50%; transform: translateY(-50%) rotate({isOpen2 ? 180 : 0}deg); color: #4a4a4a; pointer-events: none; transition: transform 0.2s;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
        {#if isOpen2}
          <ul
            bind:this={listEl2}
            role="listbox"
            style="position: absolute; top: calc(100% + 0.375rem); left: 0; right: 0; background: #141414; border: 1px solid #2a2a2a; border-radius: 0.625rem; max-height: 14rem; overflow-y: auto; list-style: none; z-index: 50; padding: 0; margin: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.4);"
          >
            {#if filtered2.length === 0}
              <li style="padding: 0.75rem 0.875rem; font-size: 0.8125rem; color: #4a4a4a; text-align: center;">No results found</li>
            {:else}
              {#each filtered2 as opt, i}
                <li
                  role="option"
                  aria-selected={selectedValue2 === opt.value}
                  on:click={() => select2(opt)}
                  on:mouseenter={() => { activeIndex2 = i; }}
                  style="padding: 0.5rem 0.875rem; font-size: 0.875rem; color: {getItemColor(i, activeIndex2, selectedValue2, opt.value)}; background: {getItemBg(i, activeIndex2)}; cursor: pointer; font-weight: {selectedValue2 === opt.value ? 600 : 400}; transition: background 0.1s, color 0.1s;"
                >
                  {opt.label}
                </li>
              {/each}
            {/if}
          </ul>
        {/if}
      </div>
    </div>

    {#if selectedFramework}
      <p style="font-size: 0.8125rem; color: #94a3b8;">
        Selected framework: <strong style="color: #38bdf8;">{selectedFramework}</strong>
      </p>
    {/if}
  </div>
</div>
