import { useEffect, useMemo, useState } from "react";

type Item = {
  id: number;
  title: string;
  status: "active" | "pending" | "archived";
  type: string;
};

const DATA: Item[] = [
  { id: 1, title: "Payment retries", status: "active", type: "workflow" },
  { id: 2, title: "Onboarding copy", status: "pending", type: "content" },
  { id: 3, title: "API docs refresh", status: "active", type: "docs" },
  { id: 4, title: "Quarterly report", status: "archived", type: "analytics" },
  { id: 5, title: "Token rotation", status: "pending", type: "security" },
  { id: 6, title: "Usage dashboard", status: "active", type: "analytics" },
  { id: 7, title: "Support macros", status: "archived", type: "ops" },
];

export default function SearchFilterPattern() {
  const [q, setQ] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const canSyncHistory = typeof window !== "undefined" && !window.location.href.startsWith("about:srcdoc");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get("q") ?? "");
    setStatuses((params.get("status") ?? "").split(",").filter(Boolean));
  }, []);

  useEffect(() => {
    if (!canSyncHistory) return;

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (statuses.length > 0) params.set("status", statuses.join(","));
    const next = params.toString();
    const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    try {
      window.history.replaceState({}, "", url);
    } catch {
      // ignore History API restrictions inside sandboxed srcdoc iframes
    }
  }, [q, statuses, canSyncHistory]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return DATA.filter((item) => {
      const queryMatch =
        query.length === 0 || `${item.title} ${item.type}`.toLowerCase().includes(query);
      const statusMatch = statuses.length === 0 || statuses.includes(item.status);
      return queryMatch && statusMatch;
    });
  }, [q, statuses]);

  const toggleStatus = (status: Item["status"]) => {
    setStatuses((prev) =>
      prev.includes(status) ? prev.filter((value) => value !== status) : [...prev, status]
    );
  };

  return (
    <section style={{ display: "grid", gap: 12, fontFamily: "system-ui, sans-serif" }}>
      <input
        value={q}
        placeholder="Find resources"
        onChange={(event) => setQ(event.target.value)}
      />
      <div style={{ display: "flex", gap: 8 }}>
        {(["active", "pending", "archived"] as const).map((status) => (
          <label key={status} style={{ display: "flex", gap: 4 }}>
            <input
              type="checkbox"
              checked={statuses.includes(status)}
              onChange={() => toggleStatus(status)}
            />
            {status}
          </label>
        ))}
      </div>
      <small>{filtered.length} results</small>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {filtered.map((item) => (
          <li key={item.id} style={{ border: "1px solid #334155", borderRadius: 8, padding: 8 }}>
            <strong>{item.title}</strong>
            <div style={{ color: "#94a3b8" }}>
              {item.type} - {item.status}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
