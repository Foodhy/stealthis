<script setup>
import { ref, computed } from "vue";

const STORES = [
  {
    id: 1,
    name: "Flagship — Union Square",
    address: "170 O'Farrell St",
    city: "San Francisco",
    state: "CA",
    lat: 37.7869,
    lng: -122.4072,
    distance: "0.4 mi",
    distanceNum: 0.4,
    open: true,
    hours: "Mon–Sat 9–9, Sun 11–7",
    phone: "(415) 555-0101",
    rating: 4.8,
  },
  {
    id: 2,
    name: "SoMa Outlet",
    address: "899 Howard St",
    city: "San Francisco",
    state: "CA",
    lat: 37.7793,
    lng: -122.4024,
    distance: "1.2 mi",
    distanceNum: 1.2,
    open: true,
    hours: "Mon–Fri 10–7, Sat–Sun 10–6",
    phone: "(415) 555-0102",
    rating: 4.3,
  },
  {
    id: 3,
    name: "Mission District",
    address: "2401 Mission St",
    city: "San Francisco",
    state: "CA",
    lat: 37.7568,
    lng: -122.4189,
    distance: "2.8 mi",
    distanceNum: 2.8,
    open: false,
    hours: "Tue–Sun 10–7",
    phone: "(415) 555-0103",
    rating: 4.6,
  },
  {
    id: 4,
    name: "Berkeley Marina",
    address: "225 University Ave",
    city: "Berkeley",
    state: "CA",
    lat: 37.8702,
    lng: -122.2679,
    distance: "5.5 mi",
    distanceNum: 5.5,
    open: true,
    hours: "Daily 10–8",
    phone: "(510) 555-0104",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Oakland City Center",
    address: "20th & Broadway",
    city: "Oakland",
    state: "CA",
    lat: 37.8083,
    lng: -122.2712,
    distance: "8.1 mi",
    distanceNum: 8.1,
    open: true,
    hours: "Mon–Sat 10–8, Sun 11–6",
    phone: "(510) 555-0105",
    rating: 4.4,
  },
  {
    id: 6,
    name: "Palo Alto",
    address: "340 University Ave",
    city: "Palo Alto",
    state: "CA",
    lat: 37.4459,
    lng: -122.1613,
    distance: "29 mi",
    distanceNum: 29,
    open: false,
    hours: "Mon–Sat 10–7",
    phone: "(650) 555-0106",
    rating: 4.5,
  },
];

const search = ref("");
const sortBy = ref("distance");
const showOpen = ref(false);
const selectedId = ref(1);

const W = 540,
  H = 380;
const minLat = 37.4,
  maxLat = 37.93;
const minLng = -122.52,
  maxLng = -122.1;

function project(lat, lng) {
  return {
    x: ((lng - minLng) / (maxLng - minLng)) * W,
    y: H - ((lat - minLat) / (maxLat - minLat)) * H,
  };
}

function shortName(name) {
  return name.split("—")[0].trim().split(" ").slice(0, 2).join(" ");
}

const filtered = computed(() =>
  STORES.filter(
    (s) =>
      (!showOpen.value || s.open) &&
      (s.name.toLowerCase().includes(search.value.toLowerCase()) ||
        s.city.toLowerCase().includes(search.value.toLowerCase()) ||
        s.address.toLowerCase().includes(search.value.toLowerCase()))
  ).sort((a, b) =>
    sortBy.value === "distance" ? a.distanceNum - b.distanceNum : b.rating - a.rating
  )
);

const selected = computed(() => STORES.find((s) => s.id === selectedId.value));
const mapStores = computed(() => (filtered.value.length ? filtered.value : STORES));

const roads = [
  "M 50 190 L 540 190",
  "M 200 0 L 200 380",
  "M 100 100 L 400 200",
  "M 50 300 L 350 250",
];
</script>

<template>
  <div class="page">
    <div class="container">
      <!-- Search bar -->
      <div class="search-bar">
        <input
          type="text"
          placeholder="Search by city, name, or address…"
          v-model="search"
          class="search-input"
        />
        <div class="filter-buttons">
          <button
            v-for="s in ['distance', 'rating']"
            :key="s"
            :class="['filter-btn', sortBy === s ? 'active' : '']"
            @click="sortBy = s"
          >{{ s }}</button>
          <button
            :class="['filter-btn', showOpen ? 'open-active' : '']"
            @click="showOpen = !showOpen"
          >Open now</button>
        </div>
      </div>

      <!-- Main layout -->
      <div class="main">
        <!-- List -->
        <div class="store-list">
          <div
            v-for="store in filtered"
            :key="store.id"
            :class="['store-card', selectedId === store.id ? 'selected' : '']"
            @click="selectedId = store.id"
          >
            <div class="store-header">
              <p :class="['store-name', selectedId === store.id ? 'name-selected' : '']">{{ store.name }}</p>
              <span :class="['badge', store.open ? 'badge-open' : 'badge-closed']">
                {{ store.open ? "Open" : "Closed" }}
              </span>
            </div>
            <p class="store-address">{{ store.address }}, {{ store.city }}</p>
            <div class="store-meta">
              <span class="meta-distance">{{ store.distance }}</span>
              <span class="meta-rating">★ {{ store.rating }}</span>
            </div>
          </div>
          <div v-if="filtered.length === 0" class="no-results">No stores found</div>
        </div>

        <!-- Map -->
        <div class="map-col">
          <div class="map-container">
            <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;">
              <defs>
                <pattern id="mapgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#21262d" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapgrid)"/>
              <path
                d="M 350 50 L 400 80 L 420 160 L 400 240 L 360 280 L 380 340 L 450 380 L 540 380 L 540 0 L 380 0 Z"
                fill="#1c2128" stroke="#30363d" stroke-width="1" opacity="0.7"
              />
              <text x="460" y="190" fill="#484f58" font-size="10" font-family="monospace">San Francisco Bay</text>
              <path
                v-for="(d, i) in roads"
                :key="'road-' + i"
                :d="d"
                fill="none"
                stroke="#21262d"
                :stroke-width="i < 2 ? 3 : 1.5"
              />
              <g
                v-for="s in mapStores"
                :key="'pin-' + s.id"
                style="cursor: pointer"
                @click="selectedId = s.id"
              >
                <circle
                  v-if="selectedId === s.id"
                  :cx="project(s.lat, s.lng).x"
                  :cy="project(s.lat, s.lng).y"
                  r="18"
                  fill="#58a6ff"
                  opacity="0.15"
                >
                  <animate attributeName="r" from="14" to="22" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.2" to="0" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <circle
                  :cx="project(s.lat, s.lng).x"
                  :cy="project(s.lat, s.lng).y"
                  :r="selectedId === s.id ? 8 : 6"
                  :fill="selectedId === s.id ? '#58a6ff' : s.open ? '#7ee787' : '#f85149'"
                  :stroke="selectedId === s.id ? '#79b8ff' : '#0d1117'"
                  stroke-width="2"
                />
                <text
                  :x="project(s.lat, s.lng).x + 10"
                  :y="project(s.lat, s.lng).y + 4"
                  :fill="selectedId === s.id ? '#e6edf3' : '#8b949e'"
                  :font-size="selectedId === s.id ? 11 : 9"
                  :font-weight="selectedId === s.id ? 'bold' : 'normal'"
                  font-family="sans-serif"
                >{{ shortName(s.name) }}</text>
              </g>
              <g transform="translate(28, 28)">
                <circle r="14" fill="#161b22" stroke="#30363d" stroke-width="1"/>
                <text text-anchor="middle" y="-5" fill="#8b949e" font-size="10" font-family="monospace">N</text>
                <line y1="-10" y2="-2" stroke="#58a6ff" stroke-width="1.5"/>
              </g>
            </svg>
          </div>

          <div v-if="selected" class="detail-strip">
            <div class="detail-info">
              <p class="detail-name">{{ selected.name }}</p>
              <p class="detail-meta">{{ selected.hours }} · {{ selected.phone }}</p>
            </div>
            <button class="directions-btn">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #0d1117;
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 0.75rem;
  padding: 0.625rem 0.75rem;
  font-size: 13px;
  color: #e6edf3;
  outline: none;
  transition: border-color 0.15s;
}

.search-input::placeholder { color: #484f58; }
.search-input:focus { border-color: #58a6ff; }

.filter-buttons {
  display: flex;
  gap: 0.375rem;
}

.filter-btn {
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid #30363d;
  color: #8b949e;
  background: transparent;
  cursor: pointer;
  text-transform: capitalize;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.filter-btn:hover { color: #e6edf3; }

.filter-btn.active {
  background: rgba(88, 166, 255, 0.1);
  border-color: rgba(88, 166, 255, 0.3);
  color: #58a6ff;
}

.filter-btn.open-active {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.main {
  display: flex;
  gap: 0.75rem;
  height: 440px;
}

.store-list {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  overflow-y: auto;
}

.store-card {
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  border: 1px solid #30363d;
  background: #161b22;
  transition: border-color 0.15s;
}

.store-card:hover { border-color: rgba(139, 148, 158, 0.4); }

.store-card.selected {
  background: rgba(88, 166, 255, 0.08);
  border-color: rgba(88, 166, 255, 0.3);
}

.store-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.store-name {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  color: #e6edf3;
  margin: 0;
}

.store-name.name-selected { color: #58a6ff; }

.badge {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
}

.badge-open {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.badge-closed {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.store-address {
  font-size: 11px;
  color: #8b949e;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.meta-distance { font-size: 10px; color: #484f58; }
.meta-rating { font-size: 10px; color: #e3b341; }

.no-results {
  padding: 2rem 0;
  text-align: center;
  font-size: 12px;
  color: #484f58;
}

.map-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-container {
  flex: 1;
  min-height: 0;
  background: #0d1117;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #30363d;
}

.detail-strip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-name {
  font-size: 12px;
  font-weight: 600;
  color: #e6edf3;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-meta {
  font-size: 10px;
  color: #8b949e;
  margin: 0;
}

.directions-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: #58a6ff;
  border: none;
  border-radius: 0.5rem;
  font-size: 11px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: background 0.15s;
}

.directions-btn:hover { background: #79b8ff; }

@media (max-width: 640px) {
  .main { flex-direction: column; height: auto; }
  .store-list { width: 100%; max-height: 200px; }
}
</style>
