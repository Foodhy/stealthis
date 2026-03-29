<script setup>
import { ref, computed } from "vue";

const UNITS = {
  length: [
    { label: "Meters", toBase: (v) => v, fromBase: (v) => v },
    { label: "Kilometers", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: "Miles", toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 },
    { label: "Feet", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { label: "Inches", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { label: "Centimeters", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
  ],
  weight: [
    { label: "Kilograms", toBase: (v) => v, fromBase: (v) => v },
    { label: "Grams", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: "Pounds", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { label: "Ounces", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { label: "Tons", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  ],
  temperature: [
    { label: "Celsius", toBase: (v) => v, fromBase: (v) => v },
    { label: "Fahrenheit", toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
    { label: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
};

const CATEGORIES = ["length", "weight", "temperature"];

const category = ref("length");
const value = ref("1");
const fromIdx = ref(0);
const toIdx = ref(1);

const units = computed(() => UNITS[category.value]);
const fromUnit = computed(() => units.value[fromIdx.value]);
const toUnit = computed(() => units.value[toIdx.value]);
const numVal = computed(() => parseFloat(value.value || "0"));
const converted = computed(() => toUnit.value.fromBase(fromUnit.value.toBase(numVal.value)));
const display = computed(() =>
  isNaN(converted.value) ? "—" : parseFloat(converted.value.toPrecision(8)).toLocaleString()
);

function setcat(c) {
  category.value = c;
  fromIdx.value = 0;
  toIdx.value = 1;
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
      <h2 class="text-[#e6edf3] font-bold text-lg mb-4">Unit Converter</h2>

      <div class="flex gap-2 mb-5">
        <button
          v-for="c in CATEGORIES"
          :key="c"
          @click="setcat(c)"
          :class="[
            'flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
            category === c
              ? 'bg-[#58a6ff] text-[#0d1117]'
              : 'bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]'
          ]"
        >
          {{ c }}
        </button>
      </div>

      <div class="space-y-3">
        <div class="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
          <select
            :value="fromIdx"
            @change="fromIdx = Number($event.target.value)"
            class="w-full bg-transparent text-[#8b949e] text-xs mb-2 focus:outline-none"
          >
            <option v-for="(u, i) in units" :key="u.label" :value="i">{{ u.label }}</option>
          </select>
          <input
            type="number"
            v-model="value"
            class="w-full bg-transparent text-[#e6edf3] text-3xl font-bold focus:outline-none tabular-nums"
          />
        </div>

        <div class="flex justify-center text-[#484f58]">&darr;</div>

        <div class="bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
          <select
            :value="toIdx"
            @change="toIdx = Number($event.target.value)"
            class="w-full bg-transparent text-[#8b949e] text-xs mb-2 focus:outline-none"
          >
            <option v-for="(u, i) in units" :key="u.label" :value="i">{{ u.label }}</option>
          </select>
          <p class="text-[#7ee787] text-3xl font-bold tabular-nums">
            {{ display }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
