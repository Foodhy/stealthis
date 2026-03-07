import { type FormEvent, useEffect, useMemo, useState } from "react";

type Role = "Engineer" | "Designer" | "Product";
type Status = "active" | "pending" | "inactive";

type Row = {
  id: number;
  name: string;
  role: Role;
  status: Status;
  email: string;
};

const seedRows: Row[] = [
  { id: 1, name: "Lia Stone", role: "Engineer", status: "active", email: "lia@example.com" },
  { id: 2, name: "Milo Park", role: "Designer", status: "pending", email: "milo@example.com" },
  { id: 3, name: "Aya Reed", role: "Product", status: "active", email: "aya@example.com" },
  { id: 4, name: "Noah Cruz", role: "Engineer", status: "inactive", email: "noah@example.com" },
  { id: 5, name: "Zoe Hart", role: "Designer", status: "active", email: "zoe@example.com" },
  { id: 6, name: "Eli Frost", role: "Product", status: "pending", email: "eli@example.com" },
  { id: 7, name: "Ira Blake", role: "Engineer", status: "active", email: "ira@example.com" },
];

const PAGE_SIZE = 5;
const ROLE_OPTIONS: Role[] = ["Engineer", "Designer", "Product"];
const STATUS_OPTIONS: Status[] = ["active", "pending", "inactive"];

export default function CrudTablePattern() {
  const [rows, setRows] = useState<Row[]>(seedRows);
  const [sortKey, setSortKey] = useState<keyof Row>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    role: "Engineer" as Role,
    status: "active" as Status,
    email: "",
  });

  const sorted = useMemo(() => {
    const next = rows.slice();
    next.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (left === right) return 0;
      if (typeof left === "number" && typeof right === "number") {
        return sortDir === "asc" ? left - right : right - left;
      }
      return sortDir === "asc"
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });
    return next;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const onSort = (key: keyof Row) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", role: "Engineer", status: "active", email: "" });
    setError("");
  };

  const sortIndicator = (key: keyof Row) => {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  const statusBadgeClass = (status: Status) => {
    if (status === "active") return "bg-emerald-500/15 text-emerald-300 border-emerald-400/25";
    if (status === "pending") return "bg-amber-500/15 text-amber-300 border-amber-400/25";
    return "bg-slate-500/20 text-slate-300 border-slate-400/25";
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      setError("Please provide a valid email address.");
      return;
    }

    if (editingId === null) {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      setRows((prev) => [{ ...form, id: nextId }, ...prev]);
    } else {
      setRows((prev) => prev.map((row) => (row.id === editingId ? { ...row, ...form } : row)));
    }

    setPage(1);
    resetForm();
  };

  return (
    <section className="min-h-screen bg-[#0d1117] px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-2xl border border-[#30363d] bg-[#161b22] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Pattern</p>
          <h1 className="mt-1 text-lg font-bold text-[#e6edf3]">CRUD Table</h1>
          <p className="mt-1 text-sm text-[#8b949e]">
            Create, edit, delete, sort, and paginate rows in a single table flow.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-[#30363d] bg-[#161b22] p-4"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.3fr_1fr_1fr_auto_auto]">
            <input
              value={form.name}
              placeholder="Full name"
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6b7280] outline-none transition-colors focus:border-[#58a6ff]"
            />
            <input
              value={form.email}
              placeholder="work@email.com"
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#6b7280] outline-none transition-colors focus:border-[#58a6ff]"
            />
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as Role }))}
              className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] outline-none transition-colors focus:border-[#58a6ff]"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as Status }))
              }
              className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] outline-none transition-colors focus:border-[#58a6ff]"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-[#58a6ff]/40 bg-[#58a6ff]/15 px-4 py-2 text-sm font-semibold text-[#c9e6ff] transition-colors hover:bg-[#58a6ff]/25"
            >
              {editingId === null ? "Add row" : "Save"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#30363d] px-4 py-2 text-sm font-semibold text-[#9ca3af] transition-colors hover:bg-[#0d1117] hover:text-[#e6edf3]"
              >
                Cancel
              </button>
            )}
          </div>
          <p className="mt-2 min-h-5 text-xs text-rose-400">{error}</p>
        </form>

        <div className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#21262d] text-[#c9d1d9]">
                <tr>
                  {(
                    [
                      ["id", "ID"],
                      ["name", "Name"],
                      ["role", "Role"],
                      ["status", "Status"],
                      ["email", "Email"],
                    ] as const
                  ).map(([key, label]) => (
                    <th key={key} className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        onClick={() => onSort(key)}
                        className="inline-flex items-center gap-1 text-left transition-colors hover:text-white"
                      >
                        {label}
                        <span className="text-xs text-[#8b949e]">{sortIndicator(key)}</span>
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[#21262d] text-[#e6edf3] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#9ca3af]">{row.id}</td>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-[#c9d1d9]">{row.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#9fb3c8]">{row.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(row.id);
                            setForm({
                              name: row.name,
                              role: row.role,
                              status: row.status,
                              email: row.email,
                            });
                            setError("");
                          }}
                          className="rounded-md border border-[#3d5d8a]/40 bg-[#58a6ff]/10 px-2.5 py-1 text-xs font-semibold text-[#9ed0ff] transition-colors hover:bg-[#58a6ff]/20"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRows((prev) => prev.filter((item) => item.id !== row.id))
                          }
                          className="rounded-md border border-rose-500/35 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#8b949e]">
                      No rows available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#21262d] px-4 py-3 text-sm">
            <p className="text-[#8b949e]">
              Page <span className="text-[#e6edf3]">{safePage}</span> of{" "}
              <span className="text-[#e6edf3]">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-md border border-[#30363d] px-3 py-1.5 text-xs font-semibold text-[#c9d1d9] transition-colors enabled:hover:bg-[#0d1117] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-md border border-[#30363d] px-3 py-1.5 text-xs font-semibold text-[#c9d1d9] transition-colors enabled:hover:bg-[#0d1117] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
