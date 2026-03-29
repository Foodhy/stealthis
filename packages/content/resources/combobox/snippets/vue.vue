<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

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

const selectedFramework = ref("");

// Combobox 1
const query1 = ref("");
const isOpen1 = ref(false);
const activeIndex1 = ref(-1);
const selectedValue1 = ref("");
const rootEl1 = ref(null);
const inputEl1 = ref(null);
const listEl1 = ref(null);

// Combobox 2
const query2 = ref("");
const isOpen2 = ref(false);
const activeIndex2 = ref(-1);
const selectedValue2 = ref("");
const rootEl2 = ref(null);
const inputEl2 = ref(null);
const listEl2 = ref(null);

const filtered1 = computed(() =>
  frameworks.filter((o) => o.label.toLowerCase().includes(query1.value.toLowerCase()))
);
const filtered2 = computed(() =>
  countries.filter((o) => o.label.toLowerCase().includes(query2.value.toLowerCase()))
);

function select1(opt) {
  selectedValue1.value = opt.value;
  query1.value = opt.label;
  selectedFramework.value = opt.value;
  isOpen1.value = false;
  activeIndex1.value = -1;
}

function select2(opt) {
  selectedValue2.value = opt.value;
  query2.value = opt.label;
  isOpen2.value = false;
  activeIndex2.value = -1;
}

function handleKey1(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!isOpen1.value) {
      isOpen1.value = true;
      activeIndex1.value = -1;
    }
    activeIndex1.value =
      activeIndex1.value + 1 >= filtered1.value.length ? 0 : activeIndex1.value + 1;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!isOpen1.value) {
      isOpen1.value = true;
      activeIndex1.value = -1;
    }
    activeIndex1.value =
      activeIndex1.value - 1 < 0 ? filtered1.value.length - 1 : activeIndex1.value - 1;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex1.value >= 0 && activeIndex1.value < filtered1.value.length)
      select1(filtered1.value[activeIndex1.value]);
  } else if (e.key === "Escape") {
    isOpen1.value = false;
    activeIndex1.value = -1;
    inputEl1.value?.blur();
  }
}

function handleKey2(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!isOpen2.value) {
      isOpen2.value = true;
      activeIndex2.value = -1;
    }
    activeIndex2.value =
      activeIndex2.value + 1 >= filtered2.value.length ? 0 : activeIndex2.value + 1;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!isOpen2.value) {
      isOpen2.value = true;
      activeIndex2.value = -1;
    }
    activeIndex2.value =
      activeIndex2.value - 1 < 0 ? filtered2.value.length - 1 : activeIndex2.value - 1;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex2.value >= 0 && activeIndex2.value < filtered2.value.length)
      select2(filtered2.value[activeIndex2.value]);
  } else if (e.key === "Escape") {
    isOpen2.value = false;
    activeIndex2.value = -1;
    inputEl2.value?.blur();
  }
}

watch(activeIndex1, (val) => {
  nextTick(() => {
    if (val >= 0 && listEl1.value) {
      const item = listEl1.value.children[val];
      item?.scrollIntoView({ block: "nearest" });
    }
  });
});

watch(activeIndex2, (val) => {
  nextTick(() => {
    if (val >= 0 && listEl2.value) {
      const item = listEl2.value.children[val];
      item?.scrollIntoView({ block: "nearest" });
    }
  });
});

function handleClickOutside(e) {
  if (rootEl1.value && !rootEl1.value.contains(e.target)) {
    isOpen1.value = false;
    activeIndex1.value = -1;
  }
  if (rootEl2.value && !rootEl2.value.contains(e.target)) {
    isOpen2.value = false;
    activeIndex2.value = -1;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));

function getItemColor(i, activeIdx, selectedVal, optValue) {
  if (i === activeIdx) return "#38bdf8";
  if (selectedVal === optValue) return "#38bdf8";
  return "#94a3b8";
}

function getItemBg(i, activeIdx) {
  return i === activeIdx ? "rgba(56,189,248,0.12)" : "transparent";
}
</script>

<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; font-family: Inter, system-ui, sans-serif; color: #f2f6ff; padding: 2rem;">
    <div style="width: 100%; max-width: 640px;">
      <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.375rem;">Combobox</h1>
      <p style="color: #475569; font-size: 0.875rem; margin-bottom: 2rem;">Searchable dropdown select with keyboard navigation.</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        <!-- Framework -->
        <div ref="rootEl1" style="position: relative;">
          <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Framework</label>
          <div style="position: relative;">
            <input
              ref="inputEl1"
              type="text"
              role="combobox"
              :aria-expanded="isOpen1"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              autocomplete="off"
              v-model="query1"
              placeholder="Search frameworks..."
              @focus="isOpen1 = true; activeIndex1 = -1"
              @input="isOpen1 = true"
              @keydown="handleKey1"
              style="width: 100%; padding: 0.625rem 2.25rem 0.625rem 0.875rem; background: #141414; border: 1px solid #2a2a2a; border-radius: 0.625rem; color: #f2f6ff; font-size: 0.875rem; font-family: inherit; outline: none;"
            />
            <span :style="{ position: 'absolute', right: '0.625rem', top: '50%', transform: `translateY(-50%) rotate(${isOpen1 ? 180 : 0}deg)`, color: '#4a4a4a', pointerEvents: 'none', transition: 'transform 0.2s' }">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          <ul
            v-if="isOpen1"
            ref="listEl1"
            role="listbox"
            style="position: absolute; top: calc(100% + 0.375rem); left: 0; right: 0; background: #141414; border: 1px solid #2a2a2a; border-radius: 0.625rem; max-height: 14rem; overflow-y: auto; list-style: none; z-index: 50; padding: 0; margin: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.4);"
          >
            <li v-if="filtered1.length === 0" style="padding: 0.75rem 0.875rem; font-size: 0.8125rem; color: #4a4a4a; text-align: center;">No results found</li>
            <li
              v-else
              v-for="(opt, i) in filtered1"
              :key="opt.value"
              role="option"
              :aria-selected="selectedValue1 === opt.value"
              @click="select1(opt)"
              @mouseenter="activeIndex1 = i"
              :style="{ padding: '0.5rem 0.875rem', fontSize: '0.875rem', color: getItemColor(i, activeIndex1, selectedValue1, opt.value), background: getItemBg(i, activeIndex1), cursor: 'pointer', fontWeight: selectedValue1 === opt.value ? 600 : 400, transition: 'background 0.1s, color 0.1s' }"
            >
              {{ opt.label }}
            </li>
          </ul>
        </div>

        <!-- Country -->
        <div ref="rootEl2" style="position: relative;">
          <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Country</label>
          <div style="position: relative;">
            <input
              ref="inputEl2"
              type="text"
              role="combobox"
              :aria-expanded="isOpen2"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              autocomplete="off"
              v-model="query2"
              placeholder="Search countries..."
              @focus="isOpen2 = true; activeIndex2 = -1"
              @input="isOpen2 = true"
              @keydown="handleKey2"
              style="width: 100%; padding: 0.625rem 2.25rem 0.625rem 0.875rem; background: #141414; border: 1px solid #2a2a2a; border-radius: 0.625rem; color: #f2f6ff; font-size: 0.875rem; font-family: inherit; outline: none;"
            />
            <span :style="{ position: 'absolute', right: '0.625rem', top: '50%', transform: `translateY(-50%) rotate(${isOpen2 ? 180 : 0}deg)`, color: '#4a4a4a', pointerEvents: 'none', transition: 'transform 0.2s' }">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          <ul
            v-if="isOpen2"
            ref="listEl2"
            role="listbox"
            style="position: absolute; top: calc(100% + 0.375rem); left: 0; right: 0; background: #141414; border: 1px solid #2a2a2a; border-radius: 0.625rem; max-height: 14rem; overflow-y: auto; list-style: none; z-index: 50; padding: 0; margin: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.4);"
          >
            <li v-if="filtered2.length === 0" style="padding: 0.75rem 0.875rem; font-size: 0.8125rem; color: #4a4a4a; text-align: center;">No results found</li>
            <li
              v-else
              v-for="(opt, i) in filtered2"
              :key="opt.value"
              role="option"
              :aria-selected="selectedValue2 === opt.value"
              @click="select2(opt)"
              @mouseenter="activeIndex2 = i"
              :style="{ padding: '0.5rem 0.875rem', fontSize: '0.875rem', color: getItemColor(i, activeIndex2, selectedValue2, opt.value), background: getItemBg(i, activeIndex2), cursor: 'pointer', fontWeight: selectedValue2 === opt.value ? 600 : 400, transition: 'background 0.1s, color 0.1s' }"
            >
              {{ opt.label }}
            </li>
          </ul>
        </div>
      </div>

      <p v-if="selectedFramework" style="font-size: 0.8125rem; color: #94a3b8;">
        Selected framework: <strong style="color: #38bdf8;">{{ selectedFramework }}</strong>
      </p>
    </div>
  </div>
</template>
