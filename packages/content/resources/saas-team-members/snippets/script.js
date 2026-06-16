(function () {
  "use strict";

  const SEATS_TOTAL = 12;
  const ROLES = ["Owner", "Admin", "Member", "Viewer"];
  const AVATAR_COLORS = [
    "#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b",
    "#ec4899", "#8b5cf6", "#ef4444", "#10b981",
  ];

  // ---- seed data ----
  let members = [
    { id: 1, name: "Maya Okafor", email: "maya@northwind.co", role: "Owner", status: "active", last: "Active now", you: true },
    { id: 2, name: "Diego Romero", email: "diego@northwind.co", role: "Admin", status: "active", last: "12 min ago" },
    { id: 3, name: "Priya Nair", email: "priya@northwind.co", role: "Member", status: "active", last: "2 hours ago" },
    { id: 4, name: "Liam Sørensen", email: "liam@northwind.co", role: "Member", status: "active", last: "Yesterday" },
    { id: 5, name: "Aisha Bello", email: "aisha@northwind.co", role: "Viewer", status: "active", last: "3 days ago" },
    { id: 6, name: "Tom Becker", email: "tom@contractor.io", role: "Member", status: "invited", last: "Never" },
    { id: 7, name: "Sofia Lindqvist", email: "sofia@northwind.co", role: "Admin", status: "suspended", last: "2 weeks ago" },
  ];

  let pending = [
    { id: 101, email: "wei.zhang@northwind.co", role: "Member", sent: "Sent 2 days ago" },
  ];

  let uid = 200;
  let activeFilter = "all";
  let searchTerm = "";
  let pendingRemoveId = null;

  const PERMS = [
    { role: "Owner", color: "#6366f1", desc: "Full control, billing, and can delete the workspace." },
    { role: "Admin", color: "#0ea5e9", desc: "Manage members, roles, and all project settings." },
    { role: "Member", color: "#16a34a", desc: "Create and edit projects; cannot manage the team." },
    { role: "Viewer", color: "#646b85", desc: "Read-only access to projects and dashboards." },
  ];

  // ---- helpers ----
  const $ = (s) => document.querySelector(s);
  const initials = (name) =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const colorFor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---- toast ----
  const toastWrap = $("#toastWrap");
  function toast(msg, kind = "ok") {
    const icons = { ok: "✓", warn: "!", info: "ℹ", danger: "✕" };
    const el = document.createElement("div");
    el.className = "toast " + kind;
    el.innerHTML = `<span class="t-ico" aria-hidden="true">${icons[kind] || "ℹ"}</span><span>${esc(msg)}</span>`;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("leaving");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3200);
  }

  // ---- seats ----
  function seatsUsed() {
    return members.filter((m) => m.status !== "removed").length + pending.length;
  }
  function renderSeats() {
    const used = seatsUsed();
    const pct = Math.min(100, Math.round((used / SEATS_TOTAL) * 100));
    $("#seatsUsed").textContent = used;
    $("#seatsTotal").textContent = SEATS_TOTAL;
    $("#seatsFill").style.width = pct + "%";
    $("#seatsFill").parentElement.classList.toggle("is-full", used >= SEATS_TOTAL);
  }

  // ---- members table ----
  function visibleMembers() {
    return members.filter((m) => {
      if (m.status === "removed") return false;
      if (activeFilter !== "all" && m.role !== activeFilter) return false;
      if (searchTerm) {
        const hay = (m.name + " " + m.email).toLowerCase();
        if (!hay.includes(searchTerm)) return false;
      }
      return true;
    });
  }

  function statusBadge(status) {
    const map = {
      active: ["active", "Active"],
      invited: ["invited", "Invited"],
      suspended: ["suspended", "Suspended"],
    };
    const [cls, label] = map[status] || ["active", status];
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function roleOptions(selected, isOwner) {
    return ROLES.map((r) => {
      // Only Owner row keeps the Owner option available.
      if (r === "Owner" && !isOwner) return "";
      return `<option value="${r}"${r === selected ? " selected" : ""}>${r}</option>`;
    }).join("");
  }

  function renderMembers() {
    const rows = visibleMembers();
    const tbody = $("#memberRows");
    const empty = $("#emptyState");

    const total = members.filter((m) => m.status !== "removed").length;
    $("#memberCount").textContent =
      `${total} ${total === 1 ? "person" : "people"} in this workspace`;

    if (rows.length === 0) {
      tbody.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    tbody.innerHTML = rows.map((m) => {
      const isOwner = m.role === "Owner";
      const lockRole = isOwner; // owner role can't be changed in this demo
      return `
      <tr data-id="${m.id}">
        <td>
          <div class="person">
            <span class="avatar" style="background:${colorFor(m.id)}" aria-hidden="true">${initials(m.name)}</span>
            <span class="person-meta">
              <span class="person-name">${esc(m.name)}${m.you ? '<span class="you-tag">You</span>' : ""}</span>
              <span class="person-email" title="${esc(m.email)}">${esc(m.email)}</span>
            </span>
          </div>
        </td>
        <td>
          <label class="sr-only" for="role-${m.id}">Role for ${esc(m.name)}</label>
          <select class="role-select" id="role-${m.id}" data-id="${m.id}"${lockRole ? " disabled" : ""}>
            ${roleOptions(m.role, isOwner)}
          </select>
        </td>
        <td>${statusBadge(m.status)}</td>
        <td><span class="last-active">${esc(m.last)}</span></td>
        <td>
          <button class="row-action" data-remove="${m.id}" type="button"
            aria-label="Remove ${esc(m.name)}"${isOwner ? " disabled title='Owner cannot be removed'" : ""}>✕</button>
        </td>
      </tr>`;
    }).join("");
  }

  // ---- pending invites ----
  function renderPending() {
    const list = $("#pendingList");
    $("#pendingCount").textContent = pending.length;
    $("#pendingEmpty").hidden = pending.length > 0;

    list.innerHTML = pending.map((p) => `
      <li class="pending-item" data-pid="${p.id}">
        <span class="pi-ico" aria-hidden="true">✉</span>
        <span class="pi-meta">
          <span class="pi-email" title="${esc(p.email)}">${esc(p.email)}</span>
          <span class="pi-sub">${esc(p.role)} · ${esc(p.sent)}</span>
        </span>
        <span class="pi-actions">
          <button class="link-btn" data-resend="${p.id}" type="button">Resend</button>
          <button class="link-btn danger" data-revoke="${p.id}" type="button">Revoke</button>
        </span>
      </li>`).join("");
  }

  // ---- permissions summary ----
  function renderPerms() {
    $("#permsList").innerHTML = PERMS.map((p) => `
      <li class="perm">
        <span class="perm-dot" style="background:${p.color}"></span>
        <span>
          <span class="perm-name">${p.role}</span>
          <span class="perm-desc">${p.desc}</span>
        </span>
      </li>`).join("");
  }

  function renderAll() {
    renderMembers();
    renderPending();
    renderSeats();
  }

  // ---- events: search & filter ----
  $("#search").addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderMembers();
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeFilter = chip.dataset.role;
      renderMembers();
    });
  });

  $("#clearSearch").addEventListener("click", () => {
    searchTerm = "";
    activeFilter = "all";
    $("#search").value = "";
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    document.querySelector('.chip[data-role="all"]').classList.add("is-active");
    renderMembers();
  });

  // ---- events: table (delegated) ----
  $("#memberRows").addEventListener("change", (e) => {
    const sel = e.target.closest(".role-select");
    if (!sel) return;
    const id = Number(sel.dataset.id);
    const m = members.find((x) => x.id === id);
    if (!m) return;
    m.role = sel.value;
    toast(`${m.name} is now a ${m.role}`, "info");
  });

  $("#memberRows").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn || btn.disabled) return;
    pendingRemoveId = Number(btn.dataset.remove);
    const m = members.find((x) => x.id === pendingRemoveId);
    if (!m) return;
    $("#confirmTitle").textContent = `Remove ${m.name}?`;
    $("#confirmBody").textContent =
      `${m.name} will lose access to Northwind Org immediately. This frees up one seat.`;
    openModal();
  });

  // ---- events: pending (delegated) ----
  $("#pendingList").addEventListener("click", (e) => {
    const resend = e.target.closest("[data-resend]");
    const revoke = e.target.closest("[data-revoke]");
    if (resend) {
      const p = pending.find((x) => x.id === Number(resend.dataset.resend));
      if (p) { p.sent = "Sent just now"; renderPending(); toast(`Invite resent to ${p.email}`, "ok"); }
    } else if (revoke) {
      const id = Number(revoke.dataset.revoke);
      const p = pending.find((x) => x.id === id);
      pending = pending.filter((x) => x.id !== id);
      renderPending(); renderSeats();
      if (p) toast(`Invite to ${p.email} revoked`, "warn");
    }
  });

  // ---- invite form ----
  const inviteForm = $("#inviteForm");
  const emailInput = $("#inviteEmail");
  const emailErr = $("#emailErr");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showEmailError(msg) {
    emailErr.textContent = msg;
    emailErr.hidden = false;
    emailInput.classList.add("invalid");
    emailInput.setAttribute("aria-invalid", "true");
  }
  function clearEmailError() {
    emailErr.hidden = true;
    emailInput.classList.remove("invalid");
    emailInput.removeAttribute("aria-invalid");
  }
  emailInput.addEventListener("input", clearEmailError);

  inviteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const role = $("#inviteRole").value;

    if (!email) return showEmailError("Enter an email address.");
    if (!EMAIL_RE.test(email)) return showEmailError("That doesn't look like a valid email.");

    const dupMember = members.some((m) => m.status !== "removed" && m.email.toLowerCase() === email);
    const dupPending = pending.some((p) => p.email.toLowerCase() === email);
    if (dupMember) return showEmailError("This person is already a member.");
    if (dupPending) return showEmailError("An invite is already pending for this email.");

    if (seatsUsed() >= SEATS_TOTAL) {
      toast("No seats left — upgrade your plan to invite more.", "warn");
      return;
    }

    pending.push({ id: ++uid, email, role, sent: "Sent just now" });
    renderPending();
    renderSeats();
    clearEmailError();
    inviteForm.reset();
    $("#inviteRole").value = "Member";
    toast(`Invitation sent to ${email}`, "ok");
  });

  // ---- modal ----
  const backdrop = $("#confirmBackdrop");
  let lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    $("#confirmOk").focus();
    document.addEventListener("keydown", onModalKey);
  }
  function closeModal() {
    backdrop.hidden = true;
    pendingRemoveId = null;
    document.removeEventListener("keydown", onModalKey);
    if (lastFocus) lastFocus.focus();
  }
  function onModalKey(e) {
    if (e.key === "Escape") closeModal();
  }
  $("#confirmCancel").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  $("#confirmOk").addEventListener("click", () => {
    const m = members.find((x) => x.id === pendingRemoveId);
    if (m) {
      m.status = "removed";
      toast(`${m.name} removed from the workspace`, "danger");
    }
    closeModal();
    renderAll();
  });

  // ---- manage seats / plan ----
  $("#manageSeats").addEventListener("click", () => {
    toast(`Using ${seatsUsed()} of ${SEATS_TOTAL} seats on the Team plan.`, "info");
  });

  // ---- theme toggle ----
  const themeToggle = $("#themeToggle");
  themeToggle.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
    themeToggle.setAttribute("aria-pressed", String(!dark));
  });

  // ---- init ----
  renderPerms();
  renderAll();
})();
