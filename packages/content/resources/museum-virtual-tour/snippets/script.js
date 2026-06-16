// Meridian Museum — Virtual Tour / Gallery Walk
(function () {
  "use strict";

  // ---------- Demo data (fictional) ----------
  const ROOMS = [
    {
      wing: "East Wing",
      name: "Gallery I — Origins",
      desc: "Early figuration and the birth of line. Works on loan from the Aldworth bequest.",
      track: "Track 01 · Origins",
      dur: "03:12",
      wall: "linear-gradient(180deg,#f0ebe0,#e3dccc)",
      art: [
        {
          grad: "linear-gradient(135deg,#c9783f,#7a3b2e 70%)",
          title: "Dusk over Carrow Fen",
          artist: "Eluned Marris",
          year: "1887",
          medium: "Oil on linen",
          dims: "92 × 71 cm",
          cat: "MM.1887.041",
          status: "On View",
          note: "A late-summer marshland rendered in burnt sienna, exemplary of Marris's tonal massing of the horizon line.",
        },
        {
          grad: "linear-gradient(160deg,#3f5b6b,#1f2c33 75%)",
          title: "The Cartographer",
          artist: "Henri Vasseau",
          year: "1901",
          medium: "Oil on panel",
          dims: "61 × 48 cm",
          cat: "MM.1901.117",
          status: "On View",
          note: "A solitary figure bent over charts; Vasseau's restrained palette anticipates his later interior series.",
        },
      ],
    },
    {
      wing: "East Wing",
      name: "Gallery II — Light & Atmosphere",
      desc: "Impressionist studies of weather, water and the changing hour.",
      track: "Track 02 · Light & Atmosphere",
      dur: "04:05",
      wall: "linear-gradient(180deg,#f4f0e6,#e8e1d0)",
      art: [
        {
          wide: true,
          grad: "linear-gradient(90deg,#a7c4d6,#dfe7d6 50%,#f3e6c8)",
          title: "Estuary, Morning",
          artist: "Greta Lindqvist",
          year: "1894",
          medium: "Oil on canvas",
          dims: "120 × 74 cm",
          cat: "MM.1894.203",
          status: "On View",
          note: "Broken brushwork dissolves the shoreline into shimmering air — a touchstone of the museum's collection.",
        },
        {
          grad: "linear-gradient(150deg,#e0b66a,#b06a3a 80%)",
          title: "Lanterns, Rue Sainte-Foy",
          artist: "Henri Vasseau",
          year: "1908",
          medium: "Pastel on paper",
          dims: "54 × 41 cm",
          cat: "MM.1908.066",
          status: "On Loan",
          note: "Loaned by the Devereaux Foundation. A nocturne of gaslight smeared across wet cobblestones.",
        },
      ],
    },
    {
      wing: "Central Court",
      name: "Gallery III — Abstraction",
      desc: "The dismantling of the figure: geometry, colour field and pure form.",
      track: "Track 03 · Abstraction",
      dur: "02:48",
      wall: "linear-gradient(180deg,#efeae0,#d8d0c0)",
      art: [
        {
          grad: "conic-gradient(from 40deg,#b4493a,#a98140,#3f7d56,#3f5b6b,#b4493a)",
          title: "Composition in Four Keys",
          artist: "Saul Brenner",
          year: "1949",
          medium: "Acrylic on board",
          dims: "100 × 100 cm",
          cat: "MM.1949.312",
          status: "On View",
          note: "Brenner's interlocking quadrants test the optical limits of complementary colour.",
        },
        {
          grad: "linear-gradient(115deg,#1c1b19 0 45%,#a98140 45% 55%,#f6f4ef 55%)",
          title: "Threshold",
          artist: "Ito Nakagawa",
          year: "1962",
          medium: "Lacquer on wood",
          dims: "180 × 90 cm",
          cat: "MM.1962.008",
          status: "On View",
          note: "A single brass seam divides darkness from paper-white void — minimalism at its most austere.",
        },
      ],
    },
    {
      wing: "West Wing",
      name: "Gallery IV — Portraiture",
      desc: "The human face across three centuries, from oil to silver gelatin.",
      track: "Track 04 · Portraiture",
      dur: "03:40",
      wall: "linear-gradient(180deg,#efe9df,#ddd4c4)",
      art: [
        {
          grad: "radial-gradient(120% 90% at 50% 30%,#d9c4a6,#6b4f37 75%)",
          title: "Lady in the Conservatory",
          artist: "Eluned Marris",
          year: "1879",
          medium: "Oil on canvas",
          dims: "110 × 84 cm",
          cat: "MM.1879.019",
          status: "On View",
          note: "Believed to depict the artist's patron, Mrs. Aldworth, amid her prized orchids.",
        },
        {
          grad: "linear-gradient(180deg,#9a958c,#3a3733)",
          title: "Self-Portrait with Pipe",
          artist: "Tomas Реč (after)",
          year: "1931",
          medium: "Silver gelatin print",
          dims: "30 × 24 cm",
          cat: "MM.1931.155",
          status: "On Loan",
          note: "A contemplative study in grey; the only photographic work in the historic galleries.",
        },
      ],
    },
    {
      wing: "West Wing",
      name: "Gallery V — Contemporary",
      desc: "Living artists and recent acquisitions. Rotating installation.",
      track: "Track 05 · Contemporary",
      dur: "05:01",
      wall: "linear-gradient(180deg,#f2efe8,#e2dccf)",
      art: [
        {
          wide: true,
          grad: "linear-gradient(60deg,#3f7d56,#a98140 55%,#b4493a)",
          title: "Fault Lines (Triptych)",
          artist: "Mara Solano",
          year: "2021",
          medium: "Mixed media on canvas",
          dims: "210 × 120 cm",
          cat: "MM.2021.477",
          status: "On View",
          note: "Solano's seismic abstractions map invisible pressures beneath the everyday surface.",
        },
        {
          grad: "repeating-linear-gradient(45deg,#1c1b19 0 14px,#2a2825 14px 28px)",
          title: "Quiet Machine",
          artist: "Devon Achebe",
          year: "2023",
          medium: "Powder-coated steel",
          dims: "150 × 60 × 60 cm",
          cat: "MM.2023.014",
          status: "On View",
          note: "A standing sculpture whose ribbed surface seems to hum with stored potential.",
        },
      ],
    },
  ];

  // ---------- Refs ----------
  const $ = (s, r = document) => r.querySelector(s);
  const roomsEl = $("#rooms");
  const filmstrip = $("#filmstrip");
  const stopCounter = $("#stopCounter");
  const capWing = $("#capWing");
  const capTitle = $("#capTitle");
  const capDesc = $("#capDesc");
  const audioTrack = $("#audioTrack");
  const audioTime = $("#audioTime");
  const audioBtn = $("#audioBtn");
  const audioIcon = $("#audioIcon");
  const autoBtn = $("#autoBtn");
  const toastHost = $("#toastHost");

  let current = 0;
  let autoTimer = null;
  let audioPlaying = false;

  // ---------- Toast helper ----------
  function toast(msg, key) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = key ? `<span class="toast__k">${key}</span> ${msg}` : msg;
    toastHost.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  // ---------- Build rooms ----------
  ROOMS.forEach((room, ri) => {
    const r = document.createElement("section");
    r.className = "room";
    r.style.background = room.wall;
    r.dataset.index = ri;

    const wall = document.createElement("div");
    wall.className = "wall";

    room.art.forEach((a, ai) => {
      const art = document.createElement("button");
      art.type = "button";
      art.className = "art" + (a.wide ? " art--wide" : "");
      art.setAttribute("aria-label", `${a.title} by ${a.artist}, ${a.year}. Open details.`);
      art.innerHTML = `
        <span class="hotspot" aria-hidden="true">+</span>
        <span class="art__mat">
          <span class="art__canvas" style="background:${a.grad}"></span>
        </span>
        <span class="art__plate">
          <span class="art__plate-title">${a.title}</span>
          <span class="art__plate-meta">${a.artist}, ${a.year}</span>
        </span>`;
      art.addEventListener("click", () => openArt(ri, ai));
      wall.appendChild(art);
    });

    r.appendChild(wall);
    roomsEl.appendChild(r);

    // filmstrip thumb
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "thumb";
    thumb.dataset.index = ri;
    thumb.innerHTML = `
      <span class="thumb__img" style="background:${room.art[0].grad}"></span>
      <span class="thumb__n">Stop ${String(ri + 1).padStart(2, "0")}</span>
      <span class="thumb__name">${room.name.replace(/^Gallery [IVX]+ — /, "")}</span>`;
    thumb.addEventListener("click", () => goto(ri, true));
    filmstrip.appendChild(thumb);
  });

  const roomNodes = Array.from(roomsEl.children);
  const thumbNodes = Array.from(filmstrip.children);

  // ---------- Navigation ----------
  function render() {
    const room = ROOMS[current];
    roomNodes.forEach((n, i) => n.classList.toggle("is-active", i === current));
    thumbNodes.forEach((n, i) => n.classList.toggle("is-active", i === current));
    stopCounter.textContent = `Room ${current + 1} of ${ROOMS.length}`;
    capWing.textContent = room.wing;
    capTitle.textContent = room.name;
    capDesc.textContent = room.desc;
    audioTrack.textContent = room.track;
    audioTime.textContent = (audioPlaying ? "00:14" : "00:00") + " / " + room.dur;
    // keep active thumb in view
    thumbNodes[current].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }

  function goto(i, announce) {
    current = (i + ROOMS.length) % ROOMS.length;
    render();
    if (announce) toast(ROOMS[current].name, "Now in");
  }

  $("#nextBtn").addEventListener("click", () => goto(current + 1, true));
  $("#prevBtn").addEventListener("click", () => goto(current - 1, true));

  // ---------- Auto-walk ----------
  autoBtn.addEventListener("click", () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
      autoBtn.setAttribute("aria-pressed", "false");
      toast("Auto-walk paused", "Guide");
    } else {
      autoBtn.setAttribute("aria-pressed", "true");
      toast("Walking you through the galleries…", "Guide");
      autoTimer = setInterval(() => goto(current + 1, false), 4200);
    }
  });

  // ---------- Audio guide ----------
  audioBtn.addEventListener("click", () => {
    audioPlaying = !audioPlaying;
    audioBtn.setAttribute("aria-pressed", String(audioPlaying));
    audioIcon.textContent = audioPlaying ? "❚❚" : "▶";
    toast(ROOMS[current].track, audioPlaying ? "Playing" : "Paused");
    render();
  });

  // ---------- Popover ----------
  const layer = $("#popoverLayer");
  const pop = $("#popover");
  let lastFocus = null;

  function openArt(ri, ai) {
    const a = ROOMS[ri].art[ai];
    lastFocus = document.activeElement;
    $("#popFrame").style.background = a.grad;
    const badge = $("#popBadge");
    badge.textContent = a.status;
    badge.classList.toggle("is-loan", a.status === "On Loan");
    $("#popTitle").textContent = a.title;
    $("#popArtist").textContent = `${a.artist} · ${a.year}`;
    $("#popFacts").innerHTML = `
      <dt>Medium</dt><dd>${a.medium}</dd>
      <dt>Dimensions</dt><dd>${a.dims}</dd>
      <dt>Gallery</dt><dd>${ROOMS[ri].name}</dd>`;
    $("#popNote").textContent = a.note;
    $("#popCat").textContent = `Accession no. ${a.cat}`;
    layer.hidden = false;
    $("#popClose").focus();
  }

  function closePop() {
    layer.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  $("#popClose").addEventListener("click", closePop);
  layer.addEventListener("click", (e) => {
    if (e.target === layer) closePop();
  });

  // ---------- Keyboard ----------
  document.addEventListener("keydown", (e) => {
    if (!layer.hidden) {
      if (e.key === "Escape") closePop();
      return;
    }
    if (e.key === "ArrowRight") goto(current + 1, true);
    else if (e.key === "ArrowLeft") goto(current - 1, true);
  });

  // ---------- Init ----------
  render();
  toast("Welcome to the Meridian Museum", "◈");
})();
