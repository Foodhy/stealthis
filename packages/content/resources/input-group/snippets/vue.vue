<script setup>
import { ref } from "vue";

const copied = ref(false);
const focusStates = ref([false, false, false, false, false, false]);

function handleCopy() {
  navigator.clipboard.writeText("sk_live_a1b2c3d4e5f6").then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  });
}

function setFocus(index, val) {
  focusStates.value[index] = val;
}

function borderColor(focused) {
  return focused ? "#38bdf8" : "#2a2a2a";
}

function shadow(focused) {
  return focused ? "0 0 0 3px rgba(56,189,248,0.15)" : "none";
}
</script>

<template>
  <div class="input-group-demo">
    <div class="inner">
      <h1 class="title">Input Group</h1>
      <p class="desc">Input with addon elements: icons, text, and buttons.</p>

      <!-- Search -->
      <div>
        <label class="label">Search</label>
        <div class="group" :style="{ borderColor: borderColor(focusStates[0]), boxShadow: shadow(focusStates[0]) }">
          <span class="prepend">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <input class="input" placeholder="Search resources..." @focus="setFocus(0, true)" @blur="setFocus(0, false)" />
        </div>
      </div>

      <!-- Website -->
      <div>
        <label class="label">Website</label>
        <div class="group" :style="{ borderColor: borderColor(focusStates[1]), boxShadow: shadow(focusStates[1]) }">
          <span class="prepend"><span class="text-addon">https://</span></span>
          <input class="input" placeholder="example.com" @focus="setFocus(1, true)" @blur="setFocus(1, false)" />
        </div>
      </div>

      <!-- Price -->
      <div>
        <label class="label">Price</label>
        <div class="group" :style="{ borderColor: borderColor(focusStates[2]), boxShadow: shadow(focusStates[2]) }">
          <span class="prepend"><span class="text-addon">$</span></span>
          <input class="input" placeholder="0.00" type="number" @focus="setFocus(2, true)" @blur="setFocus(2, false)" />
          <span class="append">
            <button type="button" class="addon-btn">Apply</button>
          </span>
        </div>
      </div>

      <!-- Email -->
      <div>
        <label class="label">Email</label>
        <div class="group" :style="{ borderColor: borderColor(focusStates[3]), boxShadow: shadow(focusStates[3]) }">
          <span class="prepend">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5" />
              <path d="M1 5l7 4 7-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <input class="input" placeholder="username" @focus="setFocus(3, true)" @blur="setFocus(3, false)" />
          <span class="append"><span class="text-addon">@company.com</span></span>
        </div>
      </div>

      <!-- API Key -->
      <div>
        <label class="label">API Key</label>
        <div class="group" :style="{ borderColor: borderColor(focusStates[4]), boxShadow: shadow(focusStates[4]) }">
          <input class="input" value="sk_live_a1b2c3d4e5f6" readonly @focus="setFocus(4, true)" @blur="setFocus(4, false)" />
          <span class="append">
            <button type="button" class="addon-btn" @click="handleCopy">
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </span>
        </div>
      </div>

      <!-- Disabled -->
      <div style="opacity: 0.5;">
        <label class="label">Disabled</label>
        <div class="group" style="border-color: #2a2a2a;">
          <span class="prepend"><span class="text-addon">@</span></span>
          <input class="input" placeholder="Not editable" disabled />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-group-demo {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  font-family: Inter, system-ui, sans-serif;
  color: #f2f6ff;
  padding: 2rem;
}
.inner {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.375rem;
}
.desc {
  color: #475569;
  font-size: 0.875rem;
  margin: 0 0 1rem;
}
.label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.375rem;
}
.group {
  display: flex;
  align-items: stretch;
  border-radius: 0.625rem;
  border: 1px solid;
  background: #141414;
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.prepend {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  color: #4a4a4a;
  font-size: 0.8125rem;
  white-space: nowrap;
  flex-shrink: 0;
  border-right: 1px solid #2a2a2a;
  background: rgba(255,255,255,0.02);
}
.append {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  color: #4a4a4a;
  font-size: 0.8125rem;
  white-space: nowrap;
  flex-shrink: 0;
  border-left: 1px solid #2a2a2a;
  background: rgba(255,255,255,0.02);
}
.input {
  flex: 1;
  min-width: 0;
  padding: 0.625rem 0.75rem;
  background: transparent;
  border: none;
  color: #f2f6ff;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
}
.text-addon {
  color: #64748b;
  font-weight: 500;
}
.addon-btn {
  background: rgba(56,189,248,0.1);
  color: #38bdf8;
  border: none;
  padding: 0 0.75rem;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  font-family: inherit;
}
</style>
