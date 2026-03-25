import { useState, useRef, useEffect, useCallback } from "react";

/* ── Hover Scale Card ── */
function HoverScale() {
  const ref = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const targetRef = useRef(1);
  const rafRef = useRef(0);

  const tick = useCallback(() => {
    scaleRef.current += (targetRef.current - scaleRef.current) * 0.12;
    if (Math.abs(scaleRef.current - targetRef.current) < 0.001) {
      scaleRef.current = targetRef.current;
    }
    if (ref.current) ref.current.style.transform = `scale(${scaleRef.current})`;
    if (scaleRef.current !== targetRef.current) rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = (t: number) => {
    targetRef.current = t;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div style={cardStyle}>
      <span style={labelStyle}>Hover Scale</span>
      <div
        ref={ref}
        onMouseEnter={() => start(1.15)}
        onMouseLeave={() => start(1)}
        style={{
          width: 100, height: 100, borderRadius: "1rem",
          background: "linear-gradient(135deg, #6d28d9, #a78bfa)",
          display: "grid", placeItems: "center",
          fontSize: "1.75rem", cursor: "pointer", willChange: "transform",
        }}
      >
        ✦
      </div>
      <span style={hintStyle}>Hover over the card</span>
    </div>
  );
}

/* ── Tap Shrink Card ── */
function TapShrink() {
  const ref = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const targetRef = useRef(1);
  const rafRef = useRef(0);

  const tick = useCallback(() => {
    scaleRef.current += (targetRef.current - scaleRef.current) * 0.15;
    if (Math.abs(scaleRef.current - targetRef.current) < 0.001) scaleRef.current = targetRef.current;
    if (ref.current) ref.current.style.transform = `scale(${scaleRef.current})`;
    if (scaleRef.current !== targetRef.current) rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = (t: number) => {
    targetRef.current = t;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div style={cardStyle}>
      <span style={labelStyle}>Tap Shrink</span>
      <div
        ref={ref}
        onPointerDown={() => start(0.85)}
        onPointerUp={() => start(1)}
        onPointerLeave={() => start(1)}
        style={{
          width: 100, height: 100, borderRadius: "1rem",
          background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
          display: "grid", placeItems: "center",
          fontSize: "1.75rem", cursor: "pointer", userSelect: "none", willChange: "transform",
        }}
      >
        ◆
      </div>
      <span style={hintStyle}>Press and hold</span>
    </div>
  );
}

/* ── Drag Constrained Card ── */
function DragConstrained() {
  const areaRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ isDragging: false, offX: 0, offY: 0, originX: 0, originY: 0, lerpX: 0, lerpY: 0, targetX: 0, targetY: 0 });
  const rafRef = useRef(0);

  const returnTick = useCallback(() => {
    const s = stateRef.current;
    s.lerpX += (s.targetX - s.lerpX) * 0.15;
    s.lerpY += (s.targetY - s.lerpY) * 0.15;
    if (Math.abs(s.lerpX - s.targetX) < 0.1 && Math.abs(s.lerpY - s.targetY) < 0.1) {
      s.lerpX = s.targetX; s.lerpY = s.targetY;
    }
    if (elRef.current) elRef.current.style.transform = `translate(calc(-50% + ${s.lerpX}px), calc(-50% + ${s.lerpY}px))`;
    if (s.lerpX !== s.targetX || s.lerpY !== s.targetY) rafRef.current = requestAnimationFrame(returnTick);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging || !areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      const halfW = rect.width / 2 - 28;
      const halfH = rect.height / 2 - 28;
      let nx = e.clientX - s.originX - s.offX;
      let ny = e.clientY - s.originY - s.offY;
      nx = Math.max(-halfW, Math.min(halfW, nx));
      ny = Math.max(-halfH, Math.min(halfH, ny));
      s.lerpX = nx; s.lerpY = ny; s.targetX = nx; s.targetY = ny;
      if (elRef.current) elRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    };
    const onUp = () => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      s.isDragging = false;
      s.targetX = 0; s.targetY = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(returnTick);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [returnTick]);

  const onDown = (e: React.PointerEvent) => {
    const s = stateRef.current;
    s.isDragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (areaRef.current) {
      const rect = areaRef.current.getBoundingClientRect();
      s.originX = rect.left + rect.width / 2;
      s.originY = rect.top + rect.height / 2;
    }
    s.offX = e.clientX - s.originX - s.lerpX;
    s.offY = e.clientY - s.originY - s.lerpY;
    cancelAnimationFrame(rafRef.current);
  };

  return (
    <div style={cardStyle}>
      <span style={labelStyle}>Drag Constrained</span>
      <div ref={areaRef} style={{
        width: "100%", height: 120,
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.1)",
        borderRadius: "0.75rem", position: "relative", overflow: "hidden",
      }}>
        <div
          ref={elRef}
          onPointerDown={onDown}
          style={{
            width: 48, height: 48, borderRadius: "0.75rem",
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            cursor: "grab", willChange: "transform", touchAction: "none",
            display: "grid", placeItems: "center", fontSize: "1.2rem",
          }}
        >
          ⬡
        </div>
      </div>
      <span style={hintStyle}>Drag within the box</span>
    </div>
  );
}

/* ── Focus Glow Card ── */
function FocusGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const opRef = useRef(0);
  const targetRef = useRef(0);
  const rotRef = useRef(0);
  const rafRef = useRef(0);

  const tick = useCallback(() => {
    opRef.current += (targetRef.current - opRef.current) * 0.08;
    rotRef.current += 1.5;
    if (Math.abs(opRef.current - targetRef.current) < 0.005 && targetRef.current === 0) {
      opRef.current = 0;
      if (glowRef.current) glowRef.current.style.opacity = "0";
      return;
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = String(opRef.current);
      glowRef.current.style.background = `conic-gradient(from ${rotRef.current}deg, #ec4899, #8b5cf6, #6366f1, #0ea5e9, #10b981, #ec4899)`;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = (t: number) => {
    targetRef.current = t;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div style={cardStyle}>
      <span style={labelStyle}>Focus Glow</span>
      <div style={{ width: "100%", position: "relative", borderRadius: "0.75rem" }}>
        <div ref={glowRef} style={{
          position: "absolute", inset: -2, borderRadius: "0.875rem",
          opacity: 0, pointerEvents: "none",
          background: "conic-gradient(from 0deg, #ec4899, #8b5cf6, #6366f1, #0ea5e9, #10b981, #ec4899)",
          filter: "blur(8px)", willChange: "opacity",
        }} />
        <input
          type="text"
          placeholder="Click to focus..."
          onFocus={() => start(0.6)}
          onBlur={() => start(0)}
          style={{
            width: "100%", padding: "0.75rem 1rem", fontSize: "0.85rem",
            fontFamily: "inherit",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.75rem", color: "#e4e4e7", outline: "none",
            position: "relative", zIndex: 1,
          }}
        />
      </div>
      <span style={hintStyle}>Focus the input field</span>
    </div>
  );
}

/* ── Shared styles ── */
const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "1rem",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#52525b",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "#3f3f46",
  textAlign: "center",
};

/* ── Main export ── */
export default function GestureAnimations() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e4e4e7",
      }}
    >
      <div style={{ width: "min(560px, 100%)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f4f4f5" }}>
            Gesture Animations
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#52525b", marginTop: "0.25rem" }}>
            Four gesture types with smooth, interruptible animations
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <HoverScale />
          <TapShrink />
          <DragConstrained />
          <FocusGlow />
        </div>
      </div>
    </div>
  );
}
