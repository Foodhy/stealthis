<script setup>
import { ref } from "vue";

const variantStyles = {
  info: {
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.06)",
    border: "rgba(56,189,248,0.12)",
    icon: "\u2139",
  },
  success: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.12)",
    icon: "\u2713",
  },
  warning: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.12)",
    icon: "\u26A0",
  },
  danger: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.12)",
    icon: "\u2717",
  },
};

const messages = ref([
  {
    id: 1,
    variant: "info",
    title: "New Feature Available",
    body: "We just launched dark mode support across all components. Toggle it from the settings panel or use the keyboard shortcut Ctrl+D.",
    dismissible: true,
  },
  {
    id: 2,
    variant: "success",
    title: "Deployment Complete",
    body: "Your application has been successfully deployed to production. All health checks passed and the CDN cache has been purged.",
    dismissible: true,
  },
  {
    id: 3,
    variant: "warning",
    title: "API Rate Limit",
    body: "You have used 85% of your API quota for this billing period. Consider upgrading your plan to avoid service interruptions.",
    dismissible: true,
  },
  {
    id: 4,
    variant: "danger",
    title: "Build Failed",
    body: "The production build failed due to a type error in src/components/Dashboard.tsx. Check the build logs for details.",
    dismissible: true,
  },
  {
    id: 5,
    variant: "info",
    title: "",
    body: "This is a compact info message without a separate title. Dismiss it with the button on the right.",
    dismissible: true,
  },
  {
    id: 6,
    variant: "success",
    title: "",
    body: "This success message cannot be dismissed. It stays visible permanently.",
    dismissible: false,
  },
]);

const dismissing = ref({});
const dismissed = ref({});

function handleDismiss(id) {
  dismissing.value[id] = true;
  setTimeout(() => {
    dismissed.value[id] = true;
  }, 300);
}

function v(msg) {
  return variantStyles[msg.variant];
}
</script>

<template>
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;font-family:Inter,system-ui,sans-serif;color:#f2f6ff;padding:2rem">
    <div style="width:100%;max-width:600px;display:flex;flex-direction:column;gap:0.75rem">
      <h1 style="font-size:1.5rem;font-weight:800;margin-bottom:0.375rem">Message Block</h1>
      <p style="color:#475569;font-size:0.875rem;margin-bottom:1rem">Colored message blocks with dismiss animation.</p>

      <template v-for="msg in messages" :key="msg.id">
        <div
          v-if="!dismissed[msg.id]"
          role="alert"
          :style="{
            background: v(msg).bg,
            border: `1px solid ${v(msg).border}`,
            borderLeft: `4px solid ${v(msg).color}`,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            transition: 'opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease',
            opacity: dismissing[msg.id] ? 0 : 1,
            transform: dismissing[msg.id] ? 'translateX(12px) scale(0.98)' : 'none',
            maxHeight: dismissing[msg.id] ? '0px' : '500px',
          }"
        >
          <div style="display:flex;align-items:flex-start;gap:0.625rem;padding:0.875rem 1rem">
            <span :style="{ fontSize: '1rem', color: v(msg).color, flexShrink: '0', lineHeight: '1.5' }">{{ v(msg).icon }}</span>

            <span v-if="msg.title" style="flex:1;font-size:0.875rem;font-weight:700;color:#f2f6ff;line-height:1.5">{{ msg.title }}</span>
            <div v-else style="flex:1;font-size:0.8125rem;line-height:1.6;color:#94a3b8">{{ msg.body }}</div>

            <button
              v-if="msg.dismissible"
              @click="handleDismiss(msg.id)"
              aria-label="Dismiss"
              style="flex-shrink:0;background:none;border:none;color:#4a4a4a;cursor:pointer;font-size:1.25rem;line-height:1;padding:0.125rem 0.25rem;border-radius:0.25rem;margin-left:auto"
            >&times;</button>
          </div>

          <div
            v-if="msg.title"
            style="padding:0 1rem 0.875rem 2.625rem;font-size:0.8125rem;line-height:1.6;color:#94a3b8"
          >{{ msg.body }}</div>
        </div>
      </template>
    </div>
  </div>
</template>
