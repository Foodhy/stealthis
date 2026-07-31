/* MakerBoard — DIY Community Forum (demo, vanilla JS) */
(() => {
  "use strict";

  /* ---------- data ---------- */
  const AV_CLASSES = ["av-teal", "av-plum", "av-rust", "av-navy", "av-moss", "av-slate"];

  const threads = [
    {
      id: "t1",
      cat: "electronics",
      title: "ESP32 keeps brown-out resetting when the servo moves",
      excerpt:
        "Powering an SG-90 clone and an ESP32 DevKit from the same USB rail. Every time the servo sweeps, the board resets with a brownout warning. Scope shows the 5V rail dipping to 3.9V.",
      tags: ["esp32", "servo", "power"],
      author: { name: "VoltVera", rep: "gold" },
      votes: 42,
      time: "2h ago",
      answers: [
        {
          author: { name: "OhmBrew", rep: "gold" },
          votes: 31,
          accepted: true,
          time: "1h ago",
          text: "Classic shared-rail sag. Give the servo its own 5V supply (a 2A buck from your bench PSU works) and tie the grounds together. Also drop a 470–1000 µF electrolytic across the servo's supply pins to soak up the stall spikes.",
        },
        {
          author: { name: "GearboxGus", rep: "silver" },
          votes: 12,
          accepted: false,
          time: "1h ago",
          text: "Seconding the separate rail — and check your USB cable. Thin charging cables can add >0.5 Ω round trip, which is enough to brown out at servo stall current.",
        },
        {
          author: { name: "SolderSprout", rep: "bronze" },
          votes: 4,
          accepted: false,
          time: "40m ago",
          text: "If you only need small sweeps, slew-limit the servo in firmware so it never demands a full-speed jump. Helped on my pan-tilt build.",
        },
      ],
    },
    {
      id: "t2",
      cat: "3d-printing",
      title: "First layer perfect, everything above is spaghetti — PETG",
      excerpt:
        "Fictionmade Kestrel-2 printer, 0.4 nozzle, PETG at 235°C. First layer lays down beautifully, then around layer 3 everything detaches and turns into a bird's nest. Bed at 80°C, glass plate.",
      tags: ["petg", "adhesion", "kestrel-2"],
      author: { name: "LayerLena", rep: "silver" },
      votes: 28,
      time: "5h ago",
      answers: [
        {
          author: { name: "NozzleNora", rep: "gold" },
          votes: 22,
          accepted: true,
          time: "4h ago",
          text: "PETG on bare glass grips hard then lets go as it cools between layers. Wipe the plate with unscented glue stick as a release-and-grip layer, slow layer 2–4 to 60% speed, and kill the part-cooling fan for the first 5 layers.",
        },
        {
          author: { name: "BenchBianca", rep: "bronze" },
          votes: 7,
          accepted: false,
          time: "3h ago",
          text: "Also check Z-offset drift — if layer 1 is *too* squished, layer 2 ploughs through it and lifts the part. Re-run mesh leveling after the bed hits temp.",
        },
      ],
    },
    {
      id: "t3",
      cat: "woodwork",
      title: "Best joint for a heavy workbench top without a domino jointer?",
      excerpt:
        "Building a 1.8 m bench from laminated beech. I have a router, circular saw, and hand tools — no domino or biscuit jointer. What joint keeps the top flat and serviceable for the leg assembly?",
      tags: ["joinery", "workbench", "beech"],
      author: { name: "MalletMara", rep: "bronze" },
      votes: 19,
      time: "9h ago",
      answers: [
        {
          author: { name: "TenonTheo", rep: "gold" },
          votes: 15,
          accepted: false,
          time: "7h ago",
          text: "Drawbored mortise and tenon, cut with your router and a simple jig. It's the classic bench joint for a reason — it stays tight for decades and can be knocked apart if you ever move.",
        },
        {
          author: { name: "GrainGreta", rep: "silver" },
          votes: 9,
          accepted: false,
          time: "5h ago",
          text: "If the router jig feels intimidating, half-lap plus bench bolts gets you 90% of the strength and is very forgiving. Countersink the bolt heads and you can retension yearly.",
        },
      ],
    },
    {
      id: "t4",
      cat: "repairs",
      title: "Vintage 'Tornado T-800' stand mixer hums but won't spin",
      excerpt:
        "Inherited mixer, maybe 1978. Motor hums loudly when switched on but the beater never turns. Smells faintly warm after 10 seconds. I've cleaned the gearbox — grease was original and fossilized.",
      tags: ["appliance", "motor", "restoration"],
      author: { name: "FixItFiona", rep: "silver" },
      votes: 35,
      time: "1d ago",
      answers: [
        {
          author: { name: "ArmatureArt", rep: "gold" },
          votes: 27,
          accepted: true,
          time: "22h ago",
          text: "Hum + no rotation + warm smell on a motor that age is almost always a seized start mechanism or dried bearing, not windings. Unplug it, try turning the shaft by hand — if it's stiff, re-oil the sleeve bearings with SAE-20 non-detergent and re-grease the gearbox with food-safe grease. Ten-minute fix, most of the time.",
        },
        {
          author: { name: "CoilCora", rep: "bronze" },
          votes: 6,
          accepted: false,
          time: "20h ago",
          text: "Check the brushes too while it's open — 1970s brushes are often worn to the spring. Measure them; anything under ~6 mm should be replaced.",
        },
      ],
    },
    {
      id: "t5",
      cat: "show-tell",
      title: "Finished: solar-powered garden weather station in a birdhouse",
      excerpt:
        "Nine months of weekends. ESP32-C3, BME688, a 2W panel on the roof, and everything living inside a cedar birdhouse so the neighbours don't ask questions. Full write-up and wiring diagram inside.",
      tags: ["solar", "esp32-c3", "weather"],
      author: { name: "CedarCleo", rep: "gold" },
      votes: 87,
      time: "1d ago",
      answers: [
        {
          author: { name: "PanelPete", rep: "silver" },
          votes: 11,
          accepted: false,
          time: "23h ago",
          text: "This is gorgeous. How are you handling condensation inside the enclosure through winter? I lost a BME to moisture last year.",
        },
        {
          author: { name: "CedarCleo", rep: "gold" },
          votes: 9,
          accepted: false,
          time: "21h ago",
          text: "Conformal coating on the board plus a Gore-style vent plug in the floor. Humidity inside tracks outside within ~5% and nothing has corroded yet.",
        },
      ],
    },
    {
      id: "t6",
      cat: "electronics",
      title: "How do I read schematics with net labels instead of drawn wires?",
      excerpt:
        "Trying to repair a fictional SynthKit SK-12. The service schematic uses net labels everywhere and I keep losing track of what connects to what. Any systematic way to trace these?",
      tags: ["schematics", "beginner"],
      author: { name: "PatchPia", rep: "bronze" },
      votes: 11,
      time: "2d ago",
      answers: [],
    },
    {
      id: "t7",
      cat: "3d-printing",
      title: "Print-in-place hinges fuse together — tolerance advice for 0.4 nozzle?",
      excerpt:
        "Designed a print-in-place toolbox latch in CAD with 0.15 mm clearance. Every print fuses solid. Is 0.15 too optimistic for a 0.4 mm nozzle, or is this an elephant-foot problem?",
      tags: ["cad", "tolerances", "pla"],
      author: { name: "HingeHank", rep: "silver" },
      votes: 16,
      time: "2d ago",
      answers: [],
    },
    {
      id: "t8",
      cat: "repairs",
      title: "Replacing a fraying power cord on a 1990s soldering station — strain relief?",
      excerpt:
        "Cord on my old Heatwright HW-40 is cracking at the entry point. Replacement cable is easy, but the original moulded strain relief won't fit the new cord. What do people use here?",
      tags: ["soldering", "cable", "safety"],
      author: { name: "TinTina", rep: "bronze" },
      votes: 8,
      time: "3d ago",
      answers: [],
    },
  ];

  /* ---------- state ---------- */
  const state = {
    cat: "all",
    sort: "latest",
    openId: null,
    votes: {}, // id -> 1 | -1
  };

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);

  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  function avClass(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return AV_CLASSES[h % AV_CLASSES.length];
  }

  function initials(name) {
    const caps = name.replace(/[^A-Z]/g, "");
    return (caps.slice(0, 2) || name.slice(0, 2)).toUpperCase();
  }

  function repDots(rep) {
    const map = { gold: ["gold", "silver", "bronze"], silver: ["silver", "bronze"], bronze: ["bronze"] };
    const dots = (map[rep] || []).map((d) => `<i class="dot ${d}"></i>`).join("");
    return `<span class="rep-dots" aria-label="${esc(rep)} reputation" title="${esc(rep)} reputation">${dots}</span>`;
  }

  function authorChip(a) {
    return `<span class="author-chip"><span class="avatar ${avClass(a.name)}" aria-hidden="true">${initials(a.name)}</span>${esc(a.name)} ${repDots(a.rep)}</span>`;
  }

  function displayVotes(t) {
    return t.votes + (state.votes[t.id] || 0);
  }

  /* ---------- rendering ---------- */
  const listEl = $("#thread-list");
  const emptyEl = $("#feed-empty");
  const countEl = $("#feed-count");

  function visibleThreads() {
    let out = threads.filter((t) => state.cat === "all" || t.cat === state.cat);
    if (state.sort === "top") {
      out = [...out].sort((a, b) => displayVotes(b) - displayVotes(a));
    } else if (state.sort === "unanswered") {
      out = out.filter((t) => t.answers.length === 0);
    }
    return out;
  }

  function threadHTML(t) {
    const solved = t.answers.some((a) => a.accepted);
    const open = state.openId === t.id;
    const myVote = state.votes[t.id] || 0;
    const pillCls = solved ? "answers-pill has-accepted" : "answers-pill";
    const pillTxt = solved ? `✓ ${t.answers.length} ANS` : `${t.answers.length} ANS`;
    return `
    <article class="thread ${solved ? "solved" : ""} ${open ? "open-thread" : ""}" data-id="${t.id}">
      <div class="thread-main" role="button" tabindex="0" aria-expanded="${open}"
           aria-label="Thread: ${esc(t.title)}. ${t.answers.length} answers. Press Enter to ${open ? "collapse" : "expand"}.">
        <div class="votes">
          <button class="vote-btn ${myVote === 1 ? "voted-up" : ""}" data-vote="up" type="button" aria-label="Upvote">▲</button>
          <span class="vote-count mono" data-count>${displayVotes(t)}</span>
          <button class="vote-btn ${myVote === -1 ? "voted-down" : ""}" data-vote="down" type="button" aria-label="Downvote">▼</button>
        </div>
        <div class="thread-body">
          <h3>${solved ? '<span class="solved-check" title="Has accepted answer">✔</span>' : ""}${esc(t.title)}</h3>
          <p class="thread-excerpt">${esc(t.excerpt)}</p>
          <div class="thread-meta">
            ${t.tags.map((tag) => `<span class="tag">#${esc(tag)}</span>`).join("")}
            <span class="${pillCls}">${pillTxt}</span>
            <span class="thread-time">${esc(t.time)}</span>
            ${authorChip(t.author)}
          </div>
        </div>
      </div>
      ${open ? expandHTML(t) : ""}
    </article>`;
  }

  function expandHTML(t) {
    const answers = t.answers.length
      ? t.answers.map((a, i) => answerHTML(t, a, i)).join("")
      : `<p class="thread-excerpt" style="margin-bottom:0.4rem">No answers yet — grab your multimeter and be the first.</p>`;
    return `
    <div class="thread-expand">
      <h4 class="expand-title">${t.answers.length} Answer${t.answers.length === 1 ? "" : "s"}</h4>
      ${answers}
      <div class="reply-box">
        <label for="reply-${t.id}">Your answer</label>
        <textarea id="reply-${t.id}" maxlength="600" placeholder="Share what worked on your bench…"></textarea>
        <div class="reply-foot">
          <span class="char-count mono" data-charcount>0 / 600</span>
          <button class="btn btn-orange" type="button" data-reply>Post answer</button>
        </div>
      </div>
    </div>`;
  }

  function answerHTML(t, a, i) {
    const key = `${t.id}-a${i}`;
    const myVote = state.votes[key] || 0;
    return `
    <div class="answer ${a.accepted ? "accepted" : ""}" data-akey="${key}">
      <div class="votes">
        <button class="vote-btn ${myVote === 1 ? "voted-up" : ""}" data-vote="up" type="button" aria-label="Upvote answer">▲</button>
        <span class="vote-count mono" data-count>${a.votes + myVote}</span>
        <button class="vote-btn ${myVote === -1 ? "voted-down" : ""}" data-vote="down" type="button" aria-label="Downvote answer">▼</button>
      </div>
      <div>
        <p class="answer-text">${esc(a.text)}</p>
        <div class="answer-foot">
          ${a.accepted ? '<span class="accepted-badge">✔ ACCEPTED</span>' : ""}
          ${authorChip(a.author)}
          <span class="answer-time">${esc(a.time)}</span>
        </div>
      </div>
    </div>`;
  }

  function render() {
    const vis = visibleThreads();
    listEl.innerHTML = vis.map(threadHTML).join("");
    emptyEl.hidden = vis.length > 0;
    countEl.textContent = `${vis.length} thread${vis.length === 1 ? "" : "s"}`;
  }

  /* ---------- voting ---------- */
  function applyVote(key, dir, countEl2) {
    const prev = state.votes[key] || 0;
    const next = dir === "up" ? (prev === 1 ? 0 : 1) : prev === -1 ? 0 : -1;
    state.votes[key] = next;
    if (next === 0) toast("VOTE RETRACTED");
    else toast(next === 1 ? "UPVOTED +1" : "DOWNVOTED -1");
    return next - prev;
  }

  /* ---------- feed events (delegated) ---------- */
  listEl.addEventListener("click", (e) => {
    const voteBtn = e.target.closest("[data-vote]");
    if (voteBtn) {
      e.stopPropagation();
      const answerEl = voteBtn.closest("[data-akey]");
      const threadEl = voteBtn.closest(".thread");
      const key = answerEl ? answerEl.dataset.akey : threadEl.dataset.id;
      const delta = applyVote(key, voteBtn.dataset.vote);
      const scope = answerEl || threadEl.querySelector(".thread-main");
      const cnt = scope.querySelector("[data-count]");
      cnt.textContent = parseInt(cnt.textContent, 10) + delta;
      cnt.classList.remove("bump");
      void cnt.offsetWidth;
      cnt.classList.add("bump");
      // update button states without full rerender
      const votes = voteBtn.closest(".votes");
      const v = state.votes[key] || 0;
      votes.querySelector('[data-vote="up"]').classList.toggle("voted-up", v === 1);
      votes.querySelector('[data-vote="down"]').classList.toggle("voted-down", v === -1);
      return;
    }

    const replyBtn = e.target.closest("[data-reply]");
    if (replyBtn) {
      const threadEl = replyBtn.closest(".thread");
      const t = threads.find((x) => x.id === threadEl.dataset.id);
      const ta = threadEl.querySelector("textarea");
      const text = ta.value.trim();
      if (text.length < 10) {
        toast("ANSWER TOO SHORT — MIN 10 CHARS");
        ta.focus();
        return;
      }
      t.answers.push({
        author: { name: "WrenchWitch", rep: "gold" },
        votes: 0,
        accepted: false,
        time: "just now",
        text,
      });
      render();
      toast("ANSWER POSTED ✔");
      return;
    }

    const main = e.target.closest(".thread-main");
    if (main) {
      const id = main.closest(".thread").dataset.id;
      state.openId = state.openId === id ? null : id;
      render();
    }
  });

  listEl.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("thread-main")) {
      e.preventDefault();
      const id = e.target.closest(".thread").dataset.id;
      state.openId = state.openId === id ? null : id;
      render();
    }
  });

  listEl.addEventListener("input", (e) => {
    if (e.target.tagName === "TEXTAREA") {
      const box = e.target.closest(".reply-box");
      const cc = box.querySelector("[data-charcount]");
      const len = e.target.value.length;
      cc.textContent = `${len} / 600`;
      cc.classList.toggle("over", len >= 580);
    }
  });

  /* ---------- categories ---------- */
  $("#cat-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".cat");
    if (!btn) return;
    document.querySelectorAll(".cat").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.cat = btn.dataset.cat;
    state.openId = null;
    render();
  });

  /* ---------- sort tabs ---------- */
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      state.sort = tab.dataset.sort;
      state.openId = null;
      render();
    });
  });

  /* ---------- ask modal ---------- */
  const backdrop = $("#modal-backdrop");
  const askForm = $("#ask-form");

  function openModal() {
    backdrop.hidden = false;
    $("#q-title").focus();
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
    askForm.reset();
    ["title", "body", "tags"].forEach((k) => setErr(k, false));
  }
  function setErr(key, on) {
    const err = $(`#err-${key}`);
    if (err) {
      err.hidden = !on;
      err.closest(".field").classList.toggle("invalid", on);
    }
  }

  $("#ask-btn").addEventListener("click", openModal);
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal-cancel").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !backdrop.hidden) closeModal();
    if (e.key === "/" && backdrop.hidden && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      $("#search-input").focus();
    }
  });

  askForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#q-title").value.trim();
    const body = $("#q-body").value.trim();
    const rawTags = $("#q-tags").value.split(",").map((s) => s.trim()).filter(Boolean);

    const badTitle = title.length < 12;
    const badBody = body.length < 30;
    const badTags = rawTags.length > 4 || rawTags.some((t) => t.length > 18);
    setErr("title", badTitle);
    setErr("body", badBody);
    setErr("tags", badTags);
    if (badTitle || badBody || badTags) {
      toast("CHECK THE FORM — SOMETHING'S MISSING");
      return;
    }

    threads.unshift({
      id: "t" + Date.now(),
      cat: $("#q-cat").value,
      title,
      excerpt: body,
      tags: rawTags.length ? rawTags.slice(0, 4) : ["question"],
      author: { name: "WrenchWitch", rep: "gold" },
      votes: 1,
      time: "just now",
      answers: [],
    });
    closeModal();
    state.cat = "all";
    state.sort = "latest";
    document.querySelectorAll(".cat").forEach((b) => b.classList.toggle("active", b.dataset.cat === "all"));
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t.dataset.sort === "latest";
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
    });
    render();
    toast("QUESTION POSTED — GOOD LUCK ✔");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- search (filters titles/tags live) ---------- */
  $("#search-input").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll(".thread").forEach((el) => {
      const t = threads.find((x) => x.id === el.dataset.id);
      const hay = (t.title + " " + t.tags.join(" ") + " " + t.author.name).toLowerCase();
      el.style.display = !q || hay.includes(q) ? "" : "none";
    });
  });

  render();
})();
