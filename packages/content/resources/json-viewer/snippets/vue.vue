<script setup>
import { ref, computed, reactive } from "vue";

const SAMPLE = {
  user: {
    id: 42,
    name: "Ada Lovelace",
    email: "ada@example.com",
    active: true,
    score: 9.8,
    tags: ["engineer", "pioneer", "mathematician"],
    address: {
      street: "123 Babbage Lane",
      city: "London",
      country: "UK",
      geo: { lat: 51.5074, lng: -0.1278 },
    },
  },
  meta: {
    version: "1.0.0",
    generated: "2026-01-01T00:00:00Z",
    flags: [true, false, null],
  },
};

const search = ref("");
const raw = ref(JSON.stringify(SAMPLE, null, 2));
const error = ref(null);
const showRaw = ref(false);
const openPaths = reactive({});
const copiedPath = ref(null);

const parsed = computed(() => {
  try {
    const v = JSON.parse(raw.value);
    error.value = null;
    return v;
  } catch (e) {
    error.value = e.message;
    return null;
  }
});

function isComplex(v) {
  return typeof v === "object" && v !== null;
}

function typeColor(v) {
  if (v === null) return "#ff7b72";
  if (typeof v === "boolean") return "#79c0ff";
  if (typeof v === "number") return "#79c0ff";
  if (typeof v === "string") return "#a5d6ff";
  return "#e6edf3";
}

function typeLabel(v) {
  if (v === null) return "null";
  if (typeof v === "boolean") return String(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return `"${v}"`;
  if (Array.isArray(v)) return `Array(${v.length})`;
  return `{${Object.keys(v).length}}`;
}

function getEntries(v) {
  if (Array.isArray(v)) return v.map((item, i) => ({ key: String(i), value: item, isIndex: true }));
  return Object.entries(v).map(([k, val]) => ({ key: k, value: val, isIndex: false }));
}

function flattenTree(value, depth, path, keyName, parentIsArray) {
  const nodes = [];
  const complex = isComplex(value);
  const pathKey = path || "$root";
  if (!(pathKey in openPaths)) {
    openPaths[pathKey] = depth < 2;
  }
  const isOpen = openPaths[pathKey];

  const q = search.value.toLowerCase();
  const isMatch =
    q &&
    ((keyName && keyName.toLowerCase().includes(q)) ||
      (!complex && String(typeLabel(value)).toLowerCase().includes(q)));

  nodes.push({
    type: "node",
    keyName: parentIsArray ? null : keyName,
    value,
    depth,
    path,
    complex,
    isOpen,
    isMatch,
  });

  if (complex && isOpen) {
    const entries = getEntries(value);
    const isArr = Array.isArray(value);
    for (const entry of entries) {
      const childPath = path ? `${path}.${entry.key}` : entry.key;
      nodes.push(...flattenTree(entry.value, depth + 1, childPath, entry.key, isArr));
    }
    nodes.push({ type: "close", depth, isArray: isArr });
  }

  return nodes;
}

const treeNodes = computed(() => {
  if (parsed.value === null) return [];
  return flattenTree(parsed.value, 0, "", null, false);
});

function toggle(path) {
  const key = path || "$root";
  openPaths[key] = !openPaths[key];
}

function copyPath(path) {
  navigator.clipboard.writeText(path);
  copiedPath.value = path;
  setTimeout(() => {
    copiedPath.value = null;
  }, 1500);
}

function resetJson() {
  raw.value = JSON.stringify(SAMPLE, null, 2);
}
</script>

<template>
  <div style="min-height:100vh;background:#0d1117;padding:1.5rem;display:flex;justify-content:center;font-family:system-ui,-apple-system,sans-serif">
    <div style="width:100%;max-width:720px;display:flex;flex-direction:column;gap:1rem">
      <!-- Toolbar -->
      <div style="display:flex;gap:0.5rem">
        <input
          type="text"
          placeholder="Search keys / values..."
          v-model="search"
          style="flex:1;background:#21262d;border:1px solid #30363d;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:13px;color:#e6edf3;outline:none"
        />
        <button
          @click="resetJson"
          style="padding:0.5rem 0.75rem;background:#21262d;border:1px solid #30363d;border-radius:0.5rem;font-size:12px;color:#8b949e;cursor:pointer"
        >Reset</button>
      </div>

      <!-- Tree -->
      <div style="background:#161b22;border:1px solid #30363d;border-radius:0.75rem;padding:1rem;overflow-x:auto">
        <p v-if="error" style="color:#f87171;font-size:13px;font-family:monospace;margin:0">{{ error }}</p>
        <template v-else>
          <div
            v-for="(node, idx) in treeNodes"
            :key="idx"
            :style="node.type === 'node' && node.isMatch ? 'background:rgba(250,204,21,0.06);border-radius:4px' : ''"
            style="font-size:12.5px;font-family:monospace;line-height:1.8"
          >
            <!-- Close bracket -->
            <template v-if="node.type === 'close'">
              <div style="display:flex;align-items:center">
                <span :style="{ width: node.depth * 16 + 'px', flexShrink: 0 }"></span>
                <span style="width:16px;flex-shrink:0"></span>
                <span style="color:#8b949e">{{ node.isArray ? ']' : '}' }}</span>
              </div>
            </template>

            <!-- Node -->
            <template v-else>
              <div style="display:flex;align-items:flex-start;gap:4px">
                <span :style="{ width: node.depth * 16 + 'px', flexShrink: 0 }"></span>

                <!-- Toggle -->
                <button
                  v-if="node.complex"
                  @click="toggle(node.path)"
                  style="width:16px;flex-shrink:0;background:none;border:none;color:#8b949e;cursor:pointer;padding:0;font-size:12.5px;font-family:monospace;line-height:1.8;text-align:left"
                >{{ node.isOpen ? '\u25BE' : '\u25B8' }}</button>
                <span v-else style="width:16px;flex-shrink:0"></span>

                <!-- Key -->
                <span v-if="node.keyName !== null" style="color:#7ee787;margin-right:2px">{{ node.keyName }}</span>
                <span v-if="node.keyName !== null" style="color:#8b949e">:&nbsp;</span>

                <!-- Value or bracket -->
                <template v-if="!node.complex">
                  <span :style="{ color: typeColor(node.value) }">{{ typeLabel(node.value) }}</span>
                </template>
                <template v-else>
                  <span style="color:#8b949e">
                    {{ Array.isArray(node.value) ? '[' : '{' }}
                    <template v-if="!node.isOpen">
                      <span style="color:#484f58;font-style:italic;margin-left:4px">
                        {{ Array.isArray(node.value) ? node.value.length + ' items' : Object.keys(node.value).length + ' keys' }}
                      </span>
                      <span style="margin-left:4px">{{ Array.isArray(node.value) ? ']' : '}' }}</span>
                    </template>
                  </span>
                </template>

                <!-- Copy path -->
                <button
                  v-if="node.path"
                  @click="copyPath(node.path)"
                  :title="node.path"
                  style="margin-left:4px;background:none;border:none;font-size:10px;color:#484f58;cursor:pointer;padding:0;line-height:1.8;opacity:0.5"
                >{{ copiedPath === node.path ? '\u2713' : '\u2299' }}</button>
              </div>
            </template>
          </div>
        </template>
      </div>

      <!-- Raw editor -->
      <details>
        <summary style="font-size:12px;color:#8b949e;cursor:pointer;user-select:none;list-style:none;display:flex;align-items:center;gap:4px">
          <span style="display:inline-block">&#9656;</span> Edit raw JSON
        </summary>
        <textarea
          v-model="raw"
          spellcheck="false"
          style="margin-top:0.5rem;width:100%;height:12rem;background:#21262d;border:1px solid #30363d;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:12px;color:#e6edf3;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box"
        ></textarea>
      </details>
    </div>
  </div>
</template>
