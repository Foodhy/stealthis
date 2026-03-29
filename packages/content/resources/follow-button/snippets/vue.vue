<script setup>
import { ref, reactive } from "vue";

const PROFILES = [
  { name: "Sarah Chen", handle: "@sarahchen", avatar: "SC", color: "#bc8cff", followers: "12.4K" },
  { name: "Alex Rivera", handle: "@arivera", avatar: "AR", color: "#58a6ff", followers: "8.1K" },
  { name: "Jordan Kim", handle: "@jordankim", avatar: "JK", color: "#7ee787", followers: "3.2K" },
];

const followingState = reactive({});
const hoverState = reactive({});

function toggleFollow(handle) {
  followingState[handle] = !followingState[handle];
}

function btnClass(handle) {
  const following = followingState[handle];
  const hover = hoverState[handle];
  if (following) {
    return hover ? "btn btn-unfollow" : "btn btn-following";
  }
  return "btn btn-follow";
}

function btnLabel(handle) {
  const following = followingState[handle];
  const hover = hoverState[handle];
  if (following) return hover ? "Unfollow" : "Following";
  return "Follow";
}
</script>

<template>
  <div class="follow-wrapper">
    <div class="follow-panel">
      <h2 class="follow-title">Who to follow</h2>
      <div v-for="p in PROFILES" :key="p.handle" class="profile-card">
        <div class="avatar" :style="{ background: p.color }">{{ p.avatar }}</div>
        <div class="info">
          <p class="name">{{ p.name }}</p>
          <p class="handle">{{ p.handle }} · {{ p.followers }} followers</p>
        </div>
        <button
          :class="btnClass(p.handle)"
          @click="toggleFollow(p.handle)"
          @mouseenter="hoverState[p.handle] = true"
          @mouseleave="hoverState[p.handle] = false"
        >
          {{ btnLabel(p.handle) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.follow-wrapper {
  min-height: 100vh;
  background: #0d1117;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.follow-panel { width: 100%; max-width: 24rem; display: flex; flex-direction: column; gap: 0.75rem; }
.follow-title { color: #e6edf3; font-weight: 700; font-size: 1.125rem; margin-bottom: 1rem; }
.profile-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #0d1117;
  flex-shrink: 0;
}
.info { flex: 1; min-width: 0; }
.name { color: #e6edf3; font-weight: 600; font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.handle { color: #8b949e; font-size: 0.75rem; }
.btn {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
  cursor: pointer;
}
.btn-follow {
  background: #238636;
  border: 1px solid #2ea043;
  color: white;
}
.btn-follow:hover { background: #2ea043; }
.btn-following {
  background: #21262d;
  border: 1px solid #30363d;
  color: #e6edf3;
}
.btn-unfollow {
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.4);
  color: #f85149;
}
</style>
