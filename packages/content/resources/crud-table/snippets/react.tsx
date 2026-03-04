import { type FormEvent, useMemo, useState } from "react";

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

const pageSize = 5;

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

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
    <section style={{ fontFamily: "system-ui, sans-serif", color: "#e2e8f0" }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <input
          value={form.name}
          placeholder="Name"
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          value={form.email}
          placeholder="Email"
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as Role }))}
          >
            <option value="Engineer">Engineer</option>
            <option value="Designer">Designer</option>
            <option value="Product">Product</option>
          </select>
          <select
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, status: event.target.value as Status }))
            }
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit">{editingId === null ? "Add" : "Save"}</button>
          {editingId !== null && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
        <small style={{ color: "#f87171", minHeight: 16 }}>{error}</small>
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>
              <button type="button" onClick={() => onSort("id")}>
                ID
              </button>
            </th>
            <th>
              <button type="button" onClick={() => onSort("name")}>
                Name
              </button>
            </th>
            <th>
              <button type="button" onClick={() => onSort("role")}>
                Role
              </button>
            </th>
            <th>
              <button type="button" onClick={() => onSort("status")}>
                Status
              </button>
            </th>
            <th>
              <button type="button" onClick={() => onSort("email")}>
                Email
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.role}</td>
              <td>{row.status}</td>
              <td>{row.email}</td>
              <td>
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
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 12 }}>
        Page {safePage} / {totalPages}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Prev
        </button>
        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Next
        </button>
      </div>
    </section>
  );
}
