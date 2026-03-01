(function () {
  "use strict";

  // ── Countdown to Summit June 12 2026 ─────────────────────────────
  const TARGET = new Date("2026-06-12T09:00:00-07:00");

  function pad(n) { return String(n).padStart(2, "0"); }

  function updateCountdown() {
    const diff = Math.max(0, TARGET - Date.now());
    document.getElementById("cd-days").textContent  = pad(Math.floor(diff / 86400000));
    document.getElementById("cd-hours").textContent = pad(Math.floor((diff % 86400000) / 3600000));
    document.getElementById("cd-mins").textContent  = pad(Math.floor((diff % 3600000) / 60000));
    document.getElementById("cd-secs").textContent  = pad(Math.floor((diff % 60000) / 1000));
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── Schedule day-tabs ─────────────────────────────────────────────
  const schedules = {
    1: [
      { time: "09:00", title: "Keynote: The Next Wave of Human-Computer Interaction", sub: "Ava Kim · Figma" },
      { time: "10:30", title: "Workshop: Motion Design Systems at Scale", sub: "James Osei · Netflix" },
      { time: "12:00", title: "Lunch &amp; Networking", sub: "Main Hall" },
      { time: "13:30", title: "Panel: The Future of Design Tools", sub: "Marcus Reid · Lena Novak · Sofia Reyes" },
      { time: "15:00", title: "Talk: AI-Augmented Creativity", sub: "Tom Walsh · Vercel" },
      { time: "17:00", title: "Evening Reception — Rooftop", sub: "Sponsored by Figma" },
    ],
    2: [
      { time: "09:30", title: "Opening: Building Products People Love", sub: "Lena Novak · Linear" },
      { time: "11:00", title: "Deep Dive: Design Tokens at Enterprise Scale", sub: "Sofia Reyes · Stripe" },
      { time: "12:30", title: "Lunch &amp; Portfolio Roundtables", sub: "Main Hall" },
      { time: "14:00", title: "Workshop: Rapid Prototyping with AI", sub: "Marcus Reid · Apple" },
      { time: "16:00", title: "Fireside: Shipping Culture at Vercel", sub: "Tom Walsh · Vercel" },
      { time: "19:00", title: "VIP Dinner — The Terrace", sub: "Invite only" },
    ],
    3: [
      { time: "10:00", title: "Closing Keynote: What's Next", sub: "Ava Kim · Figma" },
      { time: "11:30", title: "Lightning Talks: 10 Ideas in 10 Minutes", sub: "Community speakers" },
      { time: "13:00", title: "Lunch", sub: "Main Hall" },
      { time: "14:00", title: "Open Workshops &amp; Demos", sub: "Sponsor booths" },
      { time: "16:00", title: "Closing Party &amp; Awards", sub: "Rooftop Terrace" },
    ],
  };

  function renderSchedule(day) {
    const list = document.getElementById("schedule-list");
    if (!list) return;
    list.innerHTML = schedules[day]
      .map(({ time, title, sub }) =>
        `<div class="schedule-item"><span class="sched-time">${time}</span><div class="sched-content"><h4>${title}</h4><p>${sub}</p></div></div>`
      )
      .join("");
  }

  document.querySelectorAll(".day-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".day-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderSchedule(Number(btn.dataset.day));
    });
  });
})();
