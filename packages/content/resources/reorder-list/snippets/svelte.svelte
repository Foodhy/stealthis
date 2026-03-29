<script>
import { tick } from "svelte";

const initialItems = [
  {
    id: 1,
    emoji: "\u{1F3A8}",
    text: "Design System",
    badge: "UI",
    bg: "rgba(168,85,247,0.2)",
    border: "rgba(168,85,247,0.4)",
  },
  {
    id: 2,
    emoji: "\u2699\uFE0F",
    text: "API Integration",
    badge: "DEV",
    bg: "rgba(59,130,246,0.2)",
    border: "rgba(59,130,246,0.4)",
  },
  {
    id: 3,
    emoji: "\u{1F4CA}",
    text: "Analytics Dashboard",
    badge: "DATA",
    bg: "rgba(16,185,129,0.2)",
    border: "rgba(16,185,129,0.4)",
  },
  {
    id: 4,
    emoji: "\u{1F512}",
    text: "Auth & Permissions",
    badge: "SEC",
    bg: "rgba(245,158,11,0.2)",
    border: "rgba(245,158,11,0.4)",
  },
  {
    id: 5,
    emoji: "\u{1F680}",
    text: "CI/CD Pipeline",
    badge: "OPS",
    bg: "rgba(239,68,68,0.2)",
    border: "rgba(239,68,68,0.4)",
  },
  {
    id: 6,
    emoji: "\u{1F4DD}",
    text: "Documentation",
    badge: "DOCS",
    bg: "rgba(236,72,153,0.2)",
    border: "rgba(236,72,153,0.4)",
  },
];

let items = [...initialItems];
let dragIndex = null;
let listEl;
let startY = 0;
let cloneEl = null;

async function animateFlip(oldRects) {
  await tick();
  if (!listEl) return;
  listEl.querySelectorAll("[data-id]").forEach((el) => {
    const id = Number(el.dataset.id);
    const first = oldRects[id];
    if (!first) return;
    const last = el.getBoundingClientRect();
    const dy = first.top - last.top;
    if (dy === 0) return;
    el.style.transform = `translateY(${dy}px)`;
    el.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = "";
        el.style.transition = "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
        el.addEventListener(
          "transitionend",
          () => {
            el.style.transition = "";
            el.style.transform = "";
          },
          { once: true }
        );
      });
    });
  });
}

function onPointerDown(e, index) {
  e.preventDefault();
  e.target.setPointerCapture(e.pointerId);
  dragIndex = index;
  startY = e.clientY;

  const itemEl = e.target.closest("[data-id]");
  if (itemEl) {
    const rect = itemEl.getBoundingClientRect();
    const clone = document.createElement("div");
    clone.innerHTML = itemEl.outerHTML;
    clone.style.position = "fixed";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.width = rect.width + "px";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "9999";
    clone.style.opacity = "0.92";
    clone.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(109,40,217,0.3)";
    clone.style.borderRadius = "0.75rem";
    clone.style.transform = "scale(1.03)";
    document.body.appendChild(clone);
    cloneEl = clone;
  }

  let trackedIndex = index;

  const onMove = (ev) => {
    if (cloneEl) {
      const dy = ev.clientY - startY;
      cloneEl.style.transform = `translateY(${dy}px) scale(1.03)`;
    }

    if (!listEl) return;
    const els = Array.from(listEl.querySelectorAll("[data-id]"));

    let dragIdx = -1;
    for (let i = 0; i < els.length; i++) {
      if (Number(els[i].dataset.id) === items[trackedIndex]?.id) {
        dragIdx = i;
        break;
      }
    }

    for (let i = 0; i < els.length; i++) {
      if (i === dragIdx) continue;
      const rect = els[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if ((i < dragIdx && ev.clientY < midY) || (i > dragIdx && ev.clientY > midY)) {
        const oldRects = {};
        els.forEach((el) => {
          oldRects[Number(el.dataset.id)] = el.getBoundingClientRect();
        });
        const newItems = [...items];
        const [moved] = newItems.splice(dragIdx, 1);
        newItems.splice(i, 0, moved);
        trackedIndex = i;
        items = newItems;
        animateFlip(oldRects);
        break;
      }
    }
  };

  const onUp = () => {
    dragIndex = null;
    if (cloneEl) {
      cloneEl.remove();
      cloneEl = null;
    }
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}
</script>

<div style="min-height: 100vh; background: #0a0a0a; display: grid; place-items: center; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; color: #e4e4e7;">
  <div style="width: min(440px, 100%); display: flex; flex-direction: column; gap: 1rem;">
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #f4f4f5;">Reorder List</h2>
      <p style="font-size: 0.8rem; color: #52525b; margin-top: 0.25rem;">
        Drag items to reorder — FLIP animation keeps it smooth
      </p>
    </div>

    <ul bind:this={listEl} style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem; position: relative; padding: 0; margin: 0;">
      {#each items as item, i (item.id)}
        <li
          data-id={item.id}
          style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.04); border: 1px {dragIndex === i ? 'dashed' : 'solid'} {dragIndex === i ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.08)'}; border-radius: 0.75rem; user-select: none; will-change: transform; position: relative; z-index: 1; opacity: {dragIndex === i ? 0.3 : 1};"
        >
          <span style="font-size: 0.65rem; font-weight: 700; color: #3f3f46; min-width: 18px; text-align: center; font-variant-numeric: tabular-nums;">
            {i + 1}
          </span>
          <span
            on:pointerdown={(e) => onPointerDown(e, i)}
            style="color: #3f3f46; font-size: 1.1rem; cursor: grab; line-height: 1; touch-action: none; display: grid; place-items: center; width: 24px; height: 24px;"
          >
            &#x283F;
          </span>
          <div style="width: 32px; height: 32px; border-radius: 0.5rem; display: grid; place-items: center; font-size: 0.9rem; flex-shrink: 0; background: {item.bg}; border: 1px solid {item.border};">
            {item.emoji}
          </div>
          <span style="flex: 1; font-size: 0.85rem; font-weight: 500; color: #d4d4d8;">
            {item.text}
          </span>
          <span style="font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #71717a; letter-spacing: 0.04em;">
            {item.badge}
          </span>
        </li>
      {/each}
    </ul>
  </div>
</div>
