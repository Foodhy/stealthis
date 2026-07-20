import { useEffect, useState } from "react";

export function ScrollStickyStack() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () =>
      setProgress(
        Math.min(
          100,
          Math.round((scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) * 100)
        )
      );
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section className="demo">
      <h2>Sticky-stack Sections</h2>
      <div className="progress">
        <i style={{ width: `${progress}%` }} />
      </div>
      <div style={{ minHeight: 420, paddingTop: 120 }}>
        <article className="card">Scroll-linked content · {progress}%</article>
      </div>
    </section>
  );
}
