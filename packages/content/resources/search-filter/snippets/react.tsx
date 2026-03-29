import { useEffect, useMemo, useState } from "react";

type Item = {
  id: number;
  title: string;
  status: "active" | "pending" | "archived";
  type: string;
};

const STATUS_OPTIONS: Item["status"][] = ["active", "pending", "archived"];

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
  const [statuses, setStatuses] = useState<Item["status"][]>([]);

  const canSyncHistory =
    typeof window !== "undefined" && !window.location.href.startsWith("about:srcdoc");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") ?? "";
    const parsedStatuses = (params.get("status") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter((value): value is Item["status"] => STATUS_OPTIONS.includes(value as Item["status"]));

    setQ(initialQuery);
    setStatuses(parsedStatuses);
  }, []);

  useEffect(() => {
    if (!canSyncHistory) return;

    const params = new URLSearchParams();
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    if (statuses.length > 0) params.set("status", statuses.join(","));

    const next = params.toString();
    const nextUrl = next ? `${window.location.pathname}?${next}` : window.location.pathname;

    try {
      window.history.replaceState({}, "", nextUrl);
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

  const clearFilters = () => {
    setQ("");
    setStatuses([]);
  };

  return (
    <section className="min-h-screen bg-[#0d1117] px-4 py-6 text-[#e6edf3]">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-2xl border border-[#30363d] bg-[#161b22] p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#8b949e]">Pattern</p>
            <h1 className="mt-1 text-lg font-bold">Search + Filter</h1>
            <p className="mt-1 text-sm text-[#8b949e]">
              Filter items by text query and status facets.
            </p>
          </div>

          <label className="grid gap-1.5 text-xs font-semibold text-[#8b949e]">
            Search
            <input
              value={q}
              placeholder="Find resources"
              onChange={(event) => setQ(event.target.value)}
              className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm font-normal text-[#e6edf3] placeholder-[#6b7280] outline-none transition-colors focus:border-[#58a6ff]"
            />
          </label>

          <fieldset className="rounded-lg border border-[#30363d] p-3">
            <legend className="px-1 text-xs font-semibold text-[#8b949e]">Status</legend>
            <div className="mt-1 grid gap-2">
              {STATUS_OPTIONS.map((status) => {
                const selected = statuses.includes(status);
                return (
                  <label
                    key={status}
                    className={`flex cursor-pointer items-center justify-between rounded-md border px-2.5 py-2 text-sm capitalize transition-colors ${
                      selected
                        ? "border-sky-400/40 bg-sky-500/10 text-sky-200"
                        : "border-[#30363d] bg-[#0d1117] text-[#c9d1d9] hover:border-[#58a6ff]/45"
                    }`}
                  >
                    <span>{status}</span>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleStatus(status)}
                      className="h-3.5 w-3.5 accent-sky-400"
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={clearFilters}
            className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs font-semibold text-[#c9d1d9] transition-colors hover:bg-[#1a2230]"
          >
            Clear filters
          </button>

          <p className="text-xs text-[#6e7681]">
            URL sync works outside `srcdoc`:{" "}
            <code className="text-[#9fb3c8]">?q=&status=active</code>
          </p>
        </aside>

        <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-4">
          <header className="mb-3 flex items-end justify-between gap-4 border-b border-[#21262d] pb-3">
            <div>
              <h2 className="text-base font-bold">Results</h2>
              <p className="text-xs text-[#8b949e]">
                Query: <span className="text-[#c9d1d9]">{q.trim() || "none"}</span>
              </p>
            </div>
            <p className="text-xs font-semibold text-[#8b949e]">{filtered.length} results</p>
          </header>

          <ul className="grid gap-2">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-[#30363d] bg-[#0d1117]/50 px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-[#e6edf3]">{item.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-[#8b949e]">
                  <span className="rounded-full border border-[#30363d] px-2 py-0.5 capitalize text-[#9fb3c8]">
                    {item.type}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-semibold capitalize ${
                      item.status === "active"
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                        : item.status === "pending"
                          ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                          : "border-slate-400/30 bg-slate-500/10 text-slate-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-xl border border-dashed border-[#30363d] bg-[#0d1117]/45 px-4 py-6 text-center text-sm text-[#8b949e]">
                No resources match this filter set.
              </li>
            )}
          </ul>
        </section>
      </div>
    </section>
  );
}
