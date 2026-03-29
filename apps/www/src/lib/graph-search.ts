/**
 * Force-directed graph visualization for StealThis resource exploration.
 * Renders resources as colored text nodes on a canvas with category clusters,
 * pan/zoom, search filtering, and click-to-preview.
 */

export interface GraphResource {
  slug: string;
  title: string;
  description: string;
  category: string;
  type: string;
  difficulty: string;
  tags: string[];
  tech: string[];
  targets: string[];
  labRoute: string | null;
  searchText: string;
}

interface GNode {
  id: string;
  label: string;
  x: number;
  y: number;
  ax: number; // anchor X — stable resting position
  ay: number; // anchor Y
  vx: number;
  vy: number;
  size: number;
  isCat: boolean;
  category: string;
  resource: GraphResource | null;
  opacity: number;
  targetOpacity: number;
  matched: boolean;
}

interface GEdge {
  a: number;
  b: number;
}

const CAT_DISPLAY: Record<string, string> = {
  "web-animations": "Web Animations",
  "web-pages": "Web Pages",
  "ui-components": "UI Components",
  patterns: "Patterns",
  components: "Components",
  pages: "Pages",
  prompts: "Prompts",
  skills: "Skills",
  "mcp-servers": "MCP Servers",
  plugins: "Plugins",
  architectures: "Architectures",
  boilerplates: "Boilerplates",
  remotion: "Remotion",
  "database-schemas": "Database Schemas",
  "ultra-high-definition-pages": "UHD Pages",
  "design-styles": "Design Styles",
  music: "Music",
  "3d-models": "3D Models",
  "3d-interactions": "3D Interactions",
};

// Distinct colors per category for visual clustering
const CAT_COLORS: Record<string, [number, number, number]> = {
  "web-animations": [230, 100, 70], // warm red-orange
  "web-pages": [210, 140, 100], // salmon
  "ui-components": [85, 170, 210], // sky blue
  patterns: [200, 120, 90], // terracotta
  components: [100, 185, 150], // green
  pages: [210, 130, 95], // copper
  prompts: [180, 140, 210], // lavender
  skills: [150, 120, 200], // purple
  "mcp-servers": [80, 200, 155], // teal
  plugins: [130, 180, 100], // lime
  architectures: [210, 170, 80], // gold
  boilerplates: [170, 130, 90], // khaki
  remotion: [230, 85, 85], // red
  "database-schemas": [80, 190, 220], // cyan
  "ultra-high-definition-pages": [220, 150, 110], // peach
  "design-styles": [200, 135, 100], // warm
  music: [230, 120, 85], // orange
  "3d-models": [100, 165, 190], // steel blue
  "3d-interactions": [80, 155, 175], // dark teal
};

/** Fuzzy match: chars must appear in order with max gap between consecutive matches */
function fuzzyContains(needle: string, haystack: string): boolean {
  if (needle.length < 2) return haystack.includes(needle);
  let ni = 0;
  let lastMatch = -1;
  const maxGap = 8; // max characters between consecutive matched letters
  for (let hi = 0; hi < haystack.length && ni < needle.length; hi++) {
    if (haystack[hi] === needle[ni]) {
      if (lastMatch >= 0 && hi - lastMatch > maxGap) return false;
      lastMatch = hi;
      ni++;
    }
  }
  return ni === needle.length;
}

// DEFAULT_ZOOM: set to a number (e.g. 0.5) to force a fixed zoom level,
// or set to 0 to auto-calculate based on viewport/graph size
const DEFAULT_ZOOM = 1.789;

function catColor(cat: string, op: number): string {
  const c = CAT_COLORS[cat] ?? [200, 140, 120];
  return `rgba(${c[0]},${c[1]},${c[2]},${op})`;
}

export class ForceGraph {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private nodes: GNode[] = [];
  private edges: GEdge[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;

  // Transform
  private panX = 0;
  private panY = 0;
  private scale = DEFAULT_ZOOM > 0 ? DEFAULT_ZOOM : 1;

  // Simulation
  private alpha = 1.0;
  private running = false;
  private animId = 0;
  private anchorsLocked = false;

  // Center repulsion zone — the "I want to steal" overlay pushes nodes away
  // Defined in world-space coordinates (half-width, half-height from center 0,0)
  private centerRepelHW = 280; // half-width of the repulsion box
  private centerRepelHH = 80; // half-height of the repulsion box

  // Interaction
  private dragging = false;
  private dragX0 = 0;
  private dragY0 = 0;
  private panX0 = 0;
  private panY0 = 0;
  private hovered: GNode | null = null;
  private selected: GNode | null = null;
  private query = "";

  // Debug
  debug = false;

  // Callbacks
  onNodeClick: ((r: GraphResource) => void) | null = null;
  onMatchChange: ((count: number, matches: GraphResource[]) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, debug = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.debug = debug;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.bind();
  }

  private resize() {
    const p = this.canvas.parentElement!;
    this.w = p.clientWidth;
    this.h = p.clientHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    // Update center repulsion zone to match overlay size
    this.centerRepelHW = Math.min(280, this.w * 0.28);
    this.centerRepelHH = 80;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setData(resources: GraphResource[]) {
    this.nodes = [];
    this.edges = [];
    this.anchorsLocked = false;

    const byCat = new Map<string, GraphResource[]>();
    for (const r of resources) {
      if (!byCat.has(r.category)) byCat.set(r.category, []);
      byCat.get(r.category)!.push(r);
    }

    const cats = [...byCat.keys()];
    const catIdx = new Map<string, number>();
    const R = Math.min(this.w, this.h) * 0.35;

    // Category hub nodes
    cats.forEach((cat, i) => {
      const a = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(a) * R;
      const cy = Math.sin(a) * R;
      catIdx.set(cat, this.nodes.length);
      this.nodes.push({
        id: `cat:${cat}`,
        label: CAT_DISPLAY[cat] || cat,
        x: cx,
        y: cy,
        ax: cx,
        ay: cy,
        vx: 0,
        vy: 0,
        size: 16 + Math.min(byCat.get(cat)!.length * 0.4, 10),
        isCat: true,
        category: cat,
        resource: null,
        opacity: 0.85,
        targetOpacity: 0.85,
        matched: true,
      });
    });

    // Resource nodes
    for (const [cat, items] of byCat) {
      const ci = catIdx.get(cat)!;
      const cn = this.nodes[ci];
      items.forEach((r, i) => {
        const a = (i / items.length) * Math.PI * 2 + Math.random() * 0.4;
        const d = 60 + Math.random() * 120;
        const nx = cn.ax + Math.cos(a) * d;
        const ny = cn.ay + Math.sin(a) * d;
        const ni = this.nodes.length;
        this.nodes.push({
          id: r.slug,
          label: r.title,
          x: nx,
          y: ny,
          ax: nx,
          ay: ny,
          vx: 0,
          vy: 0,
          size: 8 + Math.random() * 3,
          isCat: false,
          category: cat,
          resource: r,
          opacity: 0.55,
          targetOpacity: 0.55,
          matched: true,
        });
        this.edges.push({ a: ci, b: ni });
      });
    }

    // Cross-category edges via shared tags
    const tagMap = new Map<string, number[]>();
    this.nodes.forEach((n, idx) => {
      if (n.resource) {
        for (const t of n.resource.tags.slice(0, 4)) {
          if (!tagMap.has(t)) tagMap.set(t, []);
          const arr = tagMap.get(t)!;
          if (arr.length < 6) arr.push(idx);
        }
      }
    });
    for (const indices of tagMap.values()) {
      if (indices.length >= 2 && indices.length <= 6) {
        for (let i = 0; i < indices.length - 1; i++) {
          if (this.nodes[indices[i]].category !== this.nodes[indices[i + 1]].category) {
            this.edges.push({ a: indices[i], b: indices[i + 1] });
          }
        }
      }
    }

    this.alpha = 1.0;
    this.start();
  }

  private start() {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  private loop() {
    if (this.alpha < 0.001) {
      this.running = false;
      this.render();
      return;
    }

    // Lock anchors once the initial layout stabilizes, then fit view
    if (!this.anchorsLocked && this.alpha < 0.1) {
      this.anchorsLocked = true;
      for (const nd of this.nodes) {
        nd.ax = nd.x;
        nd.ay = nd.y;
      }
      this.fitView();
    }

    this.simulate();
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private simulate() {
    const nodes = this.nodes;
    const n = nodes.length;
    const a = this.alpha;

    // Repulsion (with distance cutoff)
    for (let i = 0; i < n; i++) {
      const ni = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const nj = nodes[j];
        const dx = nj.x - ni.x;
        const dy = nj.y - ni.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 90000) continue;
        const d = Math.sqrt(d2) || 1;
        const f = (a * 180) / (d2 + 100);
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        ni.vx -= fx;
        ni.vy -= fy;
        nj.vx += fx;
        nj.vy += fy;
      }
    }

    // Edge attraction
    for (const e of this.edges) {
      const na = nodes[e.a],
        nb = nodes[e.b];
      const dx = nb.x - na.x;
      const dy = nb.y - na.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const target = na.isCat || nb.isCat ? 130 : 90;
      const f = (d - target) * 0.002 * a;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      if (!na.isCat) {
        na.vx += fx;
        na.vy += fy;
      }
      if (!nb.isCat) {
        nb.vx -= fx;
        nb.vy -= fy;
      }
    }

    // Anchor spring — pull nodes back toward their resting position
    for (const nd of nodes) {
      nd.vx += (nd.ax - nd.x) * 0.004;
      nd.vy += (nd.ay - nd.y) * 0.004;
    }

    // Center repulsion zone — overlay follows screen center, convert to world space
    // Screen center = (w/2, h/2) → world = (-panX/scale, -panY/scale)
    const cx = -this.panX / this.scale;
    const cy = -this.panY / this.scale;
    const hw = this.centerRepelHW / this.scale;
    const hh = this.centerRepelHH / this.scale;
    const margin = 20 / this.scale;
    for (const nd of nodes) {
      const rx = Math.abs(nd.x - cx) - (hw + margin);
      const ry = Math.abs(nd.y - cy) - (hh + margin);

      if (rx < 0 && ry < 0) {
        const pushX = hw + margin - Math.abs(nd.x - cx);
        const pushY = hh + margin - Math.abs(nd.y - cy);

        if (pushX < pushY) {
          nd.vx += (nd.x > cx ? 1 : -1) * pushX * 0.08;
        } else {
          nd.vy += (nd.y > cy ? 1 : -1) * pushY * 0.08;
        }
      }
    }

    // Velocity + damping
    for (const nd of nodes) {
      nd.vx *= 0.82;
      nd.vy *= 0.82;
      nd.x += nd.vx;
      nd.y += nd.vy;
      nd.opacity += (nd.targetOpacity - nd.opacity) * 0.12;
    }

    this.alpha *= 0.995;
  }

  private render() {
    const { ctx, w, h, nodes, edges, panX, panY, scale } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2 + panX, h / 2 + panY);
    ctx.scale(scale, scale);

    // Edges — use category color, thicker and more visible
    ctx.lineWidth = 1;
    for (const e of edges) {
      const na = nodes[e.a],
        nb = nodes[e.b];
      const op = Math.min(na.opacity, nb.opacity) * 0.15;
      if (op < 0.005) continue;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = catColor(na.category, op);
      ctx.stroke();
    }

    // Nodes — draw faded first, then matched on top
    const sorted = [...nodes].sort((a, b) => {
      if (a.matched !== b.matched) return a.matched ? 1 : -1;
      if (a.isCat !== b.isCat) return a.isCat ? 1 : -1;
      return 0;
    });

    for (const nd of sorted) {
      if (nd.opacity < 0.015) continue;
      const sz = nd.size * (nd.matched && this.query ? 1.15 : 1);
      ctx.font = `${nd.isCat ? "bold " : ""}${sz}px Inter,system-ui,sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (nd === this.hovered || nd === this.selected) {
        ctx.fillStyle = `rgba(255,255,255,${Math.min(nd.opacity + 0.3, 1)})`;
      } else {
        ctx.fillStyle = catColor(nd.category, nd.isCat ? nd.opacity : nd.opacity * 0.85);
      }
      ctx.fillText(nd.label, nd.x, nd.y);
    }

    ctx.restore();

    // Debug overlay
    if (this.debug) {
      ctx.save();
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(0,255,100,0.8)";
      const lines = [
        `zoom: ${this.scale.toFixed(3)}`,
        `pan: ${this.panX.toFixed(0)}, ${this.panY.toFixed(0)}`,
        `alpha: ${this.alpha.toFixed(4)}`,
        `nodes: ${this.nodes.length}`,
        `edges: ${this.edges.length}`,
        `anchored: ${this.anchorsLocked}`,
      ];
      lines.forEach((line, i) => {
        ctx.fillText(line, w - 160, 10 + i * 16);
      });
      ctx.restore();
    }
  }

  setSearch(q: string, fuzzy = false) {
    this.query = q.toLowerCase().trim();
    const matches: GraphResource[] = [];

    if (!this.query) {
      for (const nd of this.nodes) {
        nd.matched = true;
        nd.targetOpacity = nd.isCat ? 0.85 : 0.55;
      }
      this.onMatchChange?.(0, []);
      this.reheat(0.03);
      return;
    }

    for (const nd of this.nodes) {
      if (nd.resource) {
        const haystack = nd.resource.searchText.toLowerCase();
        if (haystack.includes(this.query)) {
          nd.matched = true;
        } else if (fuzzy) {
          nd.matched = fuzzyContains(this.query, haystack);
        } else {
          nd.matched = false;
        }
        nd.targetOpacity = nd.matched ? 1.0 : 0.06;
        if (nd.matched) matches.push(nd.resource);
      }
    }

    const matchedCats = new Set(matches.map((r) => r.category));
    for (const nd of this.nodes) {
      if (nd.isCat) {
        const catLabel = (CAT_DISPLAY[nd.category] || nd.category).toLowerCase();
        nd.matched = matchedCats.has(nd.category) || catLabel.includes(this.query);
        nd.targetOpacity = nd.matched ? 0.95 : 0.06;
      }
    }

    this.onMatchChange?.(matches.length, matches);
    this.reheat(0.03);
  }

  /** Get all resources for building a grid view */
  getAllResources(): GraphResource[] {
    return this.nodes.filter((n) => n.resource).map((n) => n.resource!);
  }

  /** Zoom in/out by a factor */
  zoomBy(factor: number) {
    this.scale = Math.max(0.15, Math.min(6, this.scale * factor));
    this.reheat(0.02);
  }

  /** Fit pan/zoom so all nodes are visible */
  private fitView() {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const nd of this.nodes) {
      if (nd.x < minX) minX = nd.x;
      if (nd.x > maxX) maxX = nd.x;
      if (nd.y < minY) minY = nd.y;
      if (nd.y > maxY) maxY = nd.y;
    }

    const graphW = maxX - minX || 1;
    const graphH = maxY - minY || 1;
    const pad = 60;

    if (DEFAULT_ZOOM > 0) {
      this.scale = DEFAULT_ZOOM;
    } else {
      this.scale = Math.min((this.w - pad * 2) / graphW, (this.h - pad * 2) / graphH);
    }

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    this.panX = -midX * this.scale;
    this.panY = -midY * this.scale;
  }

  /** Reset pan, zoom, and snap nodes back to anchor positions */
  resetView() {
    for (const nd of this.nodes) {
      nd.x = nd.ax;
      nd.y = nd.ay;
      nd.vx = 0;
      nd.vy = 0;
    }
    this.fitView();
    this.reheat(0.1);
  }

  private reheat(min = 0.03) {
    if (this.alpha < min) {
      this.alpha = min;
      this.start();
    }
  }

  // ── Event binding ──────────────────────────────────────────────
  private bind() {
    const ro = new ResizeObserver(() => {
      this.resize();
      if (!this.running) this.render();
    });
    ro.observe(this.canvas.parentElement!);

    this.canvas.addEventListener("mousedown", (e) => {
      this.dragging = true;
      this.dragX0 = e.clientX;
      this.dragY0 = e.clientY;
      this.panX0 = this.panX;
      this.panY0 = this.panY;
      this.canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (this.dragging) {
        this.panX = this.panX0 + (e.clientX - this.dragX0);
        this.panY = this.panY0 + (e.clientY - this.dragY0);
        if (!this.running) this.render();
      } else {
        this.updateHover(e.clientX, e.clientY);
      }
    });

    window.addEventListener("mouseup", () => {
      this.dragging = false;
      this.canvas.style.cursor = this.hovered ? "pointer" : "grab";
    });

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const f = e.deltaY > 0 ? 0.92 : 1.08;
        this.scale = Math.max(0.15, Math.min(6, this.scale * f));
        if (!this.running) this.render();
      },
      { passive: false }
    );

    this.canvas.addEventListener("click", (e) => {
      if (Math.abs(e.clientX - this.dragX0) > 4 || Math.abs(e.clientY - this.dragY0) > 4) return;
      const nd = this.nodeAt(e.clientX, e.clientY);
      if (nd?.resource) {
        this.selected = nd;
        this.onNodeClick?.(nd.resource);
        if (!this.running) this.render();
      }
    });

    // Touch
    let lastDist = 0;
    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          this.dragging = true;
          this.dragX0 = e.touches[0].clientX;
          this.dragY0 = e.touches[0].clientY;
          this.panX0 = this.panX;
          this.panY0 = this.panY;
        } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          lastDist = Math.sqrt(dx * dx + dy * dy);
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && this.dragging) {
          this.panX = this.panX0 + (e.touches[0].clientX - this.dragX0);
          this.panY = this.panY0 + (e.touches[0].clientY - this.dragY0);
          if (!this.running) this.render();
        } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (lastDist > 0) {
            this.scale = Math.max(0.15, Math.min(6, this.scale * (d / lastDist)));
            if (!this.running) this.render();
          }
          lastDist = d;
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchend",
      () => {
        this.dragging = false;
        lastDist = 0;
      },
      { passive: true }
    );
  }

  private nodeAt(cx: number, cy: number): GNode | null {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (cx - rect.left - this.w / 2 - this.panX) / this.scale;
    const my = (cy - rect.top - this.h / 2 - this.panY) / this.scale;
    let best: GNode | null = null;
    let bestD = Infinity;

    for (const nd of this.nodes) {
      if (nd.opacity < 0.08) continue;
      const dx = nd.x - mx;
      const dy = nd.y - my;
      const d = Math.sqrt(dx * dx + dy * dy);
      const r = nd.size * 2.5;
      if (d < r && d < bestD) {
        best = nd;
        bestD = d;
      }
    }
    return best;
  }

  private updateHover(cx: number, cy: number) {
    const nd = this.nodeAt(cx, cy);
    if (nd !== this.hovered) {
      this.hovered = nd;
      this.canvas.style.cursor = nd ? "pointer" : "grab";
      if (!this.running) this.render();
    }
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    this.running = false;
  }
}
