<script>
import { onMount, onDestroy } from "svelte";

const INITIAL_SERVICES = [
  { name: "API Gateway", status: "operational", latency: 24, uptime: 99.98 },
  { name: "Authentication", status: "operational", latency: 18, uptime: 99.99 },
  { name: "Database (Read)", status: "operational", latency: 8, uptime: 99.95 },
  { name: "Database (Write)", status: "degraded", latency: 412, uptime: 99.72 },
  { name: "Object Storage", status: "operational", latency: 62, uptime: 99.96 },
  { name: "Email Service", status: "outage", latency: 0, uptime: 98.1 },
  { name: "CDN", status: "operational", latency: 5, uptime: 99.99 },
  { name: "Search", status: "degraded", latency: 890, uptime: 99.4 },
  { name: "Analytics", status: "operational", latency: 145, uptime: 99.8 },
  { name: "Webhooks", status: "operational", latency: 55, uptime: 99.91 },
];

const INCIDENTS = [
  {
    id: 1,
    date: "2026-03-07 09:14 UTC",
    title: "Email delivery failures",
    status: "investigating",
    services: ["Email Service"],
  },
  {
    id: 2,
    date: "2026-03-07 08:52 UTC",
    title: "Elevated database write latency",
    status: "monitoring",
    services: ["Database (Write)"],
  },
  {
    id: 3,
    date: "2026-03-06 14:30 UTC",
    title: "Search index lag — 15 min",
    status: "resolved",
    services: ["Search"],
  },
  {
    id: 4,
    date: "2026-03-05 22:10 UTC",
    title: "Auth rate-limit misconfiguration",
    status: "resolved",
    services: ["Authentication"],
  },
];

const STATUS_COLORS = {
  operational: "bg-green-500",
  degraded: "bg-yellow-400",
  outage: "bg-red-500",
};
const STATUS_TEXT = {
  operational: "text-green-400",
  degraded: "text-yellow-400",
  outage: "text-red-400",
};
const STATUS_LABEL = { operational: "Operational", degraded: "Degraded", outage: "Outage" };
const INCIDENT_BADGE = {
  resolved: "bg-green-500/10 text-green-400 border-green-500/30",
  investigating: "bg-red-500/10 text-red-400 border-red-500/30",
  monitoring: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
};

let services = [...INITIAL_SERVICES];
let lastUpdated = new Date();
let intervalId;

$: hasOutage = services.some((s) => s.status === "outage");
$: hasDegraded = services.some((s) => s.status === "degraded");
$: pad = (n) => String(n).padStart(2, "0");
$: timeStr = `${pad(lastUpdated.getHours())}:${pad(lastUpdated.getMinutes())}:${pad(lastUpdated.getSeconds())} UTC`;

function uptimeBars(uptime) {
  const bars = 30;
  const badBars = Math.round(((100 - uptime) / 100) * bars);
  return Array.from({ length: bars }, (_, i) => ({
    isBad: i >= bars - badBars,
  }));
}

onMount(() => {
  intervalId = setInterval(() => {
    services = services.map((s) => ({
      ...s,
      latency:
        s.status === "outage" ? 0 : Math.max(1, s.latency + Math.round((Math.random() - 0.5) * 20)),
    }));
    lastUpdated = new Date();
  }, 3000);
});

onDestroy(() => {
  clearInterval(intervalId);
});
</script>

<div class="min-h-screen bg-[#0d1117] p-6 flex justify-center">
  <div class="w-full max-w-[820px] space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-[18px] font-bold text-[#e6edf3]">System Status</h1>
        <p class="text-[12px] text-[#484f58] mt-0.5">Last updated {timeStr}</p>
      </div>
      <a href="#" class="text-[12px] text-[#58a6ff] hover:underline" on:click|preventDefault>Subscribe to updates &rarr;</a>
    </div>

    <!-- Overall Banner -->
    {#if hasOutage}
      <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></span>
        <div>
          <p class="text-[13px] font-bold text-red-400">Partial Outage</p>
          <p class="text-[11px] text-[#8b949e]">Some services are unavailable</p>
        </div>
      </div>
    {:else if hasDegraded}
      <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30">
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0 animate-pulse"></span>
        <div>
          <p class="text-[13px] font-bold text-yellow-400">Degraded Performance</p>
          <p class="text-[11px] text-[#8b949e]">Some services are experiencing issues</p>
        </div>
      </div>
    {:else}
      <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
        <span class="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></span>
        <div>
          <p class="text-[13px] font-bold text-green-400">All Systems Operational</p>
          <p class="text-[11px] text-[#8b949e]">No issues detected</p>
        </div>
      </div>
    {/if}

    <!-- Services -->
    <div class="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      <div class="px-5 py-3 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between">
        <span class="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">Services</span>
        <span class="text-[11px] text-[#484f58]">{services.length} endpoints</span>
      </div>
      <div class="divide-y divide-[#21262d]">
        {#each services as s}
          <div class="flex items-center px-5 py-3 hover:bg-white/[0.02] transition-colors">
            <span class="w-2 h-2 rounded-full flex-shrink-0 mr-3 {STATUS_COLORS[s.status]} {s.status !== 'operational' ? 'animate-pulse' : ''}"></span>
            <span class="flex-1 text-[13px] text-[#e6edf3] font-medium">{s.name}</span>
            <div class="hidden sm:flex items-center gap-3 mr-5">
              <div class="flex gap-px items-end h-6">
                {#each uptimeBars(s.uptime) as bar}
                  <div
                    class="w-1.5 rounded-sm {bar.isBad ? 'bg-red-500/60' : 'bg-green-500/60'}"
                    style="height: {bar.isBad ? '60%' : '100%'};"
                  ></div>
                {/each}
              </div>
              <span class="text-[11px] text-[#8b949e] w-14 text-right">{s.uptime.toFixed(2)}%</span>
            </div>
            <span class="text-[12px] text-[#8b949e] w-16 text-right mr-4 font-mono">
              {s.status === "outage" ? "—" : `${s.latency}ms`}
            </span>
            <span class="text-[11px] font-bold w-24 text-right {STATUS_TEXT[s.status]}">
              {STATUS_LABEL[s.status]}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Incidents -->
    <div class="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      <div class="px-5 py-3 bg-[#21262d] border-b border-[#30363d]">
        <span class="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">Recent Incidents</span>
      </div>
      <div class="divide-y divide-[#21262d]">
        {#each INCIDENTS as inc}
          <div class="px-5 py-3.5">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <p class="text-[13px] font-semibold text-[#e6edf3]">{inc.title}</p>
                <div class="flex flex-wrap gap-1.5">
                  {#each inc.services as svc}
                    <span class="text-[10px] px-1.5 py-0.5 bg-[#21262d] rounded text-[#8b949e] border border-[#30363d]">{svc}</span>
                  {/each}
                </div>
                <p class="text-[11px] text-[#484f58]">{inc.date}</p>
              </div>
              <span class="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize {INCIDENT_BADGE[inc.status]}">
                {inc.status}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
