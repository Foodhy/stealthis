<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  events?: { date: string; title: string; description: string }[]
  radius?: number
  width?: number
  height?: number
}>(), {
  events: () => [
    { date: "Jan 2025", title: "Research", description: "User interviews & competitive analysis" },
    { date: "Mar 2025", title: "Design", description: "Wireframes and high-fidelity prototypes" },
    { date: "Jun 2025", title: "Development", description: "Frontend and backend implementation" },
    { date: "Sep 2025", title: "Testing", description: "QA, performance, and accessibility audits" },
    { date: "Dec 2025", title: "Launch", description: "Public release and monitoring" },
  ],
  radius: 250,
  width: 600,
  height: 380,
})

const containerEl = ref(null)
const visible = ref(false)

const centerX = computed(() => props.width / 2)
const centerY = computed(() => props.height - 80)
const positions = computed(() =>
  props.events.map((_, i) => {
    const angle = Math.PI + (0 - Math.PI) * (i / (props.events.length - 1))
    return { x: centerX.value + props.radius * Math.cos(angle), y: centerY.value + props.radius * Math.sin(angle) }
  })
)
const arcPathD = computed(() => {
  if (positions.value.length < 2) return ""
  const f = positions.value[0]
  const l = positions.value[positions.value.length - 1]
  return `M ${f.x} ${f.y} A ${props.radius} ${props.radius} 0 0 1 ${l.x} ${l.y}`
})

let observer
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { visible.value = true; observer.unobserve(containerEl.value) }
  }, { threshold: 0.2 })
  observer.observe(containerEl.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div style="min-height:100vh;background:#0a0a0a;display:grid;place-items:center;padding:2rem;font-family:system-ui,-apple-system,sans-serif;color:#f1f5f9">
    <div style="display:flex;flex-direction:column;align-items:center;gap:2rem">
      <h2 style="font-size:1.375rem;font-weight:700;text-align:center">Project Timeline</h2>
      <div ref="containerEl" :style="{ position:'relative', width: props.width+'px', height: props.height+'px' }">
        <svg :viewBox="`0 0 ${props.width} ${props.height - 60}`" fill="none" :style="{ position:'absolute', top:0, left:0, width:'100%', height: (props.height-60)+'px', pointerEvents:'none' }">
          <path :d="arcPathD" stroke="rgba(148,163,184,0.2)" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
        </svg>
        <div v-for="(event, i) in props.events" :key="i" :style="{
          position:'absolute', left: positions[i].x+'px', top: positions[i].y+'px',
          transform: `translate(-50%,-50%) ${visible ? 'scale(1)' : 'scale(0.6)'}`,
          opacity: visible ? 1 : 0,
          transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
          display:'flex', flexDirection:'column', alignItems:'center'
        }">
          <div style="width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);border:3px solid #0a0a0a;box-shadow:0 0 0 2px rgba(99,102,241,0.4),0 0 12px rgba(99,102,241,0.2);flex-shrink:0;z-index:2"></div>
          <div style="margin-top:0.75rem;text-align:center;max-width:130px">
            <span style="font-size:0.7rem;color:#6366f1;font-weight:600;letter-spacing:0.04em;text-transform:uppercase">{{ event.date }}</span>
            <strong style="display:block;font-size:0.85rem;color:#e2e8f0;margin-top:0.2rem">{{ event.title }}</strong>
            <p style="font-size:0.75rem;color:#64748b;line-height:1.4;margin-top:0.2rem">{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
