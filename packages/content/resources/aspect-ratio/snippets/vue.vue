<script setup>
const demos = [
  { label: "Widescreen", ratio: 16 / 9, gradient: "linear-gradient(135deg,#1e1b4b,#312e81)" },
  { label: "Classic", ratio: 4 / 3, gradient: "linear-gradient(135deg,#0c4a6e,#164e63)" },
  { label: "Square", ratio: 1, gradient: "linear-gradient(135deg,#14532d,#1a2e05)" },
  {
    label: "Ultra-Wide",
    ratio: 21 / 9,
    gradient: "linear-gradient(135deg,#4c1d95,#701a75)",
    wide: true,
  },
  { label: "Portrait", ratio: 9 / 16, gradient: "linear-gradient(135deg,#78350f,#7c2d12)" },
];
</script>

<template>
  <div style="min-height:100vh;background:#0a0a0a;display:grid;place-items:center;padding:2rem;font-family:system-ui,-apple-system,sans-serif;color:#f1f5f9">
    <div style="width:min(700px,100%);display:flex;flex-direction:column;gap:1rem">
      <h2 style="font-size:1.375rem;font-weight:700">Aspect Ratio Containers</h2>
      <p style="font-size:0.875rem;color:#64748b;margin-bottom:0.5rem">Resize the browser to see them maintain their proportions</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;align-items:start">
        <div v-for="demo in demos" :key="demo.label" :style="{ display:'flex', flexDirection:'column', gap:'0.5rem', gridColumn: demo.wide ? 'span 2' : undefined }">
          <span style="font-size:0.7rem;font-weight:600;color:#94a3b8;letter-spacing:0.06em;font-family:'Fira Code',monospace">{{ demo.label }}</span>
          <div :style="{ position:'relative', width:'100%', aspectRatio: String(demo.ratio), borderRadius:'0.75rem', overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }">
            <div :style="{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.5rem', background: demo.gradient, color:'rgba(255,255,255,0.6)' }">
              <span style="font-size:0.8rem;font-weight:500;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.06em">{{ demo.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
