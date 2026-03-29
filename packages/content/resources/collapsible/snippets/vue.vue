<script setup>
import { ref } from "vue";

const sections = ref([
  {
    id: 1,
    open: true,
    title: "General Information",
    subtitle: "Basic project details and metadata",
    iconBg: "rgba(59,130,246,0.12)",
    iconColor: "#60a5fa",
    icon: "info",
  },
  {
    id: 2,
    open: false,
    title: "Security",
    subtitle: "Authentication and access control",
    iconBg: "rgba(168,85,247,0.12)",
    iconColor: "#c084fc",
    icon: "shield",
  },
  {
    id: 3,
    open: false,
    title: "Notifications",
    subtitle: "Email and push notification preferences",
    iconBg: "rgba(34,197,94,0.12)",
    iconColor: "#4ade80",
    icon: "mail",
  },
]);

function toggle(id) {
  const s = sections.value.find((s) => s.id === id);
  if (s) s.open = !s.open;
}
</script>

<template>
  <div style="min-height: 100vh; background: #0a0a0a; display: grid; place-items: center; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; color: #f1f5f9;">
    <div style="width: min(560px, 100%); display: flex; flex-direction: column; gap: 1.25rem;">
      <h2 style="font-size: 1.375rem; font-weight: 700;">Settings</h2>

      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div
          v-for="section in sections"
          :key="section.id"
          :style="{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${section.open ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '0.875rem',
            overflow: 'hidden',
            transition: 'border-color 0.2s ease',
          }"
        >
          <!-- Trigger -->
          <button
            @click="toggle(section.id)"
            :aria-expanded="section.open"
            style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; background: transparent; border: none; color: inherit; cursor: pointer; text-align: left;"
          >
            <div style="display: flex; align-items: center; gap: 0.875rem; min-width: 0;">
              <div :style="{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '0.5rem', display: 'grid', placeItems: 'center', background: section.iconBg, color: section.iconColor }">
                <svg v-if="section.icon === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <svg v-else-if="section.icon === 'shield'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <path d="m22 6-10 7L2 6"/>
                </svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <strong style="font-size: 0.9rem; font-weight: 600; color: #e2e8f0;">{{ section.title }}</strong>
                <span v-if="section.subtitle" style="font-size: 0.78rem; color: #64748b;">{{ section.subtitle }}</span>
              </div>
            </div>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              :style="{ flexShrink: 0, color: section.open ? '#6366f1' : '#475569', transform: `rotate(${section.open ? 180 : 0}deg)`, transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), color 0.15s ease' }"
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <!-- Panel -->
          <div
            :aria-hidden="!section.open"
            :style="{ display: 'grid', gridTemplateRows: section.open ? '1fr' : '0fr', transition: 'grid-template-rows 0.35s cubic-bezier(0.34,1.56,0.64,1)' }"
          >
            <div style="overflow: hidden;">
              <div style="padding: 0 1.25rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                <!-- General Information -->
                <div v-if="section.id === 1" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div>
                    <label style="font-size: 0.78rem; font-weight: 500; color: #94a3b8; display: block; margin-bottom: 0.375rem;">Project Name</label>
                    <div style="font-size: 0.85rem; color: #e2e8f0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.5rem 0.75rem;">
                      My Awesome Project
                    </div>
                  </div>
                  <div>
                    <label style="font-size: 0.78rem; font-weight: 500; color: #94a3b8; display: block; margin-bottom: 0.375rem;">Description</label>
                    <div style="font-size: 0.85rem; color: #e2e8f0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.5rem 0.75rem; min-height: 4rem; line-height: 1.5;">
                      A brief description of your project that helps others understand what it does and why it exists.
                    </div>
                  </div>
                </div>

                <!-- Security -->
                <div v-else-if="section.id === 2" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div>
                    <label style="font-size: 0.78rem; font-weight: 500; color: #94a3b8; display: block; margin-bottom: 0.375rem;">Two-Factor Auth</label>
                    <span style="font-size: 0.85rem; color: #94a3b8;">Disabled</span>
                  </div>
                  <div>
                    <label style="font-size: 0.78rem; font-weight: 500; color: #94a3b8; display: block; margin-bottom: 0.375rem;">Session Timeout</label>
                    <div style="font-size: 0.85rem; color: #e2e8f0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.5rem 0.75rem;">
                      30 minutes
                    </div>
                  </div>
                </div>

                <!-- Notifications -->
                <div v-else style="display: flex; flex-direction: column; gap: 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; color: #94a3b8;">Email Notifications</span>
                    <span style="font-size: 0.78rem; color: #4ade80;">Enabled</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; color: #94a3b8;">Push Notifications</span>
                    <span style="font-size: 0.78rem; color: #4ade80;">Enabled</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; color: #94a3b8;">Weekly Digest</span>
                    <span style="font-size: 0.78rem; color: #64748b;">Disabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
