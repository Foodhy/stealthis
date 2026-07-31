#!/usr/bin/env bun
/**
 * Frees the dev ports before starting the dev servers.
 *
 * Stale `astro dev` / `vite` / `wrangler` processes from a previous run keep
 * their ports (4321+) open, which makes every new server drift to a random
 * port ("Port 4321 is in use, trying another one..."). Since cross-app URLs
 * (SITE_URLS, lab preview iframes) are hardcoded to the fixed ports, that
 * drift breaks previews and inter-app links. Killing the listeners first
 * guarantees each app boots on its assigned port.
 */
import { execSync } from "node:child_process";

// 4321-4339 covers all apps (incl. vite's +1 fallback range); 8787 is wrangler.
const PORTS = [...Array.from({ length: 19 }, (_, i) => 4321 + i), 8787];

const isWin = process.platform === "win32";
const pids = new Set();

if (isWin) {
  let out = "";
  try {
    // no -p filter: it must catch both TCP (IPv4) and TCPv6 listeners
    out = execSync("netstat -ano", { encoding: "utf8" });
  } catch {
    /* netstat missing — nothing to clean */
  }
  for (const line of out.split(/\r?\n/)) {
    const m = line.trim().match(/^TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)$/);
    if (m && PORTS.includes(Number(m[1]))) pids.add(m[2]);
  }
} else {
  for (const port of PORTS) {
    try {
      const out = execSync(`lsof -ti tcp:${port} -s tcp:listen`, { encoding: "utf8" });
      for (const pid of out.split(/\s+/).filter(Boolean)) pids.add(pid);
    } catch {
      /* no listener on this port */
    }
  }
}

pids.delete(String(process.pid));

if (pids.size === 0) {
  console.log("[dev] ports are free, nothing to clean");
  process.exit(0);
}

for (const pid of pids) {
  try {
    if (isWin) execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" });
    else process.kill(Number(pid), "SIGKILL");
    console.log(`[dev] killed stale dev server (pid ${pid})`);
  } catch {
    console.warn(`[dev] could not kill pid ${pid} (already gone?)`);
  }
}
