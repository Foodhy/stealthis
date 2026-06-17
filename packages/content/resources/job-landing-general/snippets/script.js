(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navlinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Data ---------- */
  var categories = [
    { ico: "💻", name: "Engineering", count: "3,420 jobs" },
    { ico: "🎨", name: "Design & UX", count: "1,180 jobs" },
    { ico: "📊", name: "Data & Analytics", count: "960 jobs" },
    { ico: "📣", name: "Marketing", count: "1,540 jobs" },
    { ico: "🩺", name: "Healthcare", count: "2,210 jobs" },
    { ico: "🤝", name: "Customer Success", count: "870 jobs" },
    { ico: "💰", name: "Finance", count: "1,030 jobs" },
    { ico: "🛠️", name: "Operations", count: "1,290 jobs" }
  ];

  var employers = [
    { name: "Northwind Labs", sector: "Climate tech", color: "#2563eb", initials: "NL", open: "24 open roles", tags: [["Remote", "remote"], ["Hiring", "blue"]] },
    { name: "Lumio Health", sector: "Healthcare", color: "#16a34a", initials: "LH", open: "41 open roles", tags: [["On-site", "blue"], ["New", "new"]] },
    { name: "Brightpath Bank", sector: "Fintech", color: "#7c3aed", initials: "BB", open: "18 open roles", tags: [["Hybrid", "blue"], ["Remote", "remote"]] },
    { name: "Cedar & Co.", sector: "Retail", color: "#d97706", initials: "CC", open: "12 open roles", tags: [["On-site", "blue"], ["Hiring", "blue"]] },
    { name: "Vela Studios", sector: "Creative agency", color: "#dc2626", initials: "VS", open: "9 open roles", tags: [["Remote", "remote"], ["New", "new"]] },
    { name: "Orbit Logistics", sector: "Supply chain", color: "#0891b2", initials: "OL", open: "33 open roles", tags: [["Hybrid", "blue"], ["Hiring", "blue"]] }
  ];

  var stats = [
    { num: "12,480", label: "Open roles right now" },
    { num: "2.1M", label: "Active candidates" },
    { num: "8,300+", label: "Hiring companies" },
    { num: "11 days", label: "Avg. time to offer" }
  ];

  var stories = [
    { quote: "I set up alerts on a Sunday and had three interviews lined up by Friday. The salary ranges saved me so much back-and-forth.", name: "Priya Raman", role: "Product Designer · hired at Vela Studios", color: "#2563eb" },
    { quote: "As a hiring manager the screening questions cut my shortlist time in half. We filled two engineering seats in under three weeks.", name: "Marcus Lowe", role: "Eng. Manager · Northwind Labs", color: "#16a34a" },
    { quote: "Switching careers felt impossible until the matches started showing roles that actually valued my transferable skills.", name: "Dani Okafor", role: "Data Analyst · hired at Brightpath", color: "#7c3aed" }
  ];

  /* ---------- Render categories ---------- */
  var catGrid = document.getElementById("catGrid");
  if (catGrid) {
    categories.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "cat-card";
      b.type = "button";
      b.innerHTML =
        '<span class="cat-ico" aria-hidden="true">' + c.ico + "</span>" +
        "<h3>" + c.name + "</h3>" +
        '<span class="cat-count">' + c.count + "</span>";
      b.addEventListener("click", function () {
        toast("Showing " + c.name + " jobs — fictional demo");
        scrollToHero();
      });
      catGrid.appendChild(b);
    });
  }

  /* ---------- Render employers ---------- */
  var empGrid = document.getElementById("empGrid");
  if (empGrid) {
    employers.forEach(function (e) {
      var tags = e.tags.map(function (t) {
        var cls = t[1] === "remote" ? "pill-remote" : t[1] === "new" ? "pill-new" : "pill-blue";
        return '<span class="pill ' + cls + '">' + t[0] + "</span>";
      }).join("");
      var card = document.createElement("article");
      card.className = "emp-card";
      card.innerHTML =
        '<div class="emp-top">' +
          '<span class="emp-logo" style="background:' + e.color + '">' + e.initials + "</span>" +
          "<div><div class=\"emp-name\">" + e.name + "</div><div class=\"emp-sector\">" + e.sector + "</div></div>" +
        "</div>" +
        '<div class="emp-meta">' + tags + "</div>" +
        '<div class="emp-foot"><span class="emp-open">' + e.open + '</span><a class="emp-link" href="#">View jobs →</a></div>';
      card.querySelector(".emp-link").addEventListener("click", function (ev) {
        ev.preventDefault();
        toast("Opening " + e.name + " — fictional demo");
      });
      empGrid.appendChild(card);
    });
  }

  /* ---------- Render stats (count up) ---------- */
  var statsGrid = document.getElementById("statsGrid");
  if (statsGrid) {
    stats.forEach(function (s) {
      var d = document.createElement("div");
      d.className = "stat";
      d.innerHTML = '<div class="stat-num">' + s.num + '</div><div class="stat-label">' + s.label + "</div>";
      statsGrid.appendChild(d);
    });
  }

  /* ---------- Render stories ---------- */
  var storyGrid = document.getElementById("storyGrid");
  if (storyGrid) {
    stories.forEach(function (s) {
      var initials = s.name.split(" ").map(function (n) { return n[0]; }).join("").slice(0, 2);
      var card = document.createElement("article");
      card.className = "story-card";
      card.innerHTML =
        '<div class="story-stars" aria-label="5 out of 5 stars">★★★★★</div>' +
        '<p class="story-quote">“' + s.quote + '”</p>' +
        '<div class="story-person">' +
          '<span class="story-avatar" style="background:' + s.color + '">' + initials + "</span>" +
          '<div><div class="story-name">' + s.name + '</div><div class="story-role">' + s.role + "</div></div>" +
        "</div>";
      storyGrid.appendChild(card);
    });
  }

  /* ---------- Search ---------- */
  var form = document.getElementById("searchForm");
  var qRole = document.getElementById("qRole");
  var qLoc = document.getElementById("qLoc");

  function scrollToHero() {
    var hero = document.querySelector(".hero");
    if (hero) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var role = (qRole.value || "").trim();
      var loc = (qLoc.value || "").trim();
      if (!role && !loc) {
        toast("Type a role or location to search");
        qRole.focus();
        return;
      }
      var msg = "Searching ";
      msg += role ? "“" + role + "”" : "all roles";
      if (loc) msg += " in " + loc;
      toast(msg + " — fictional demo");
    });
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (qRole) qRole.value = chip.getAttribute("data-role") || "";
      if (qLoc) qLoc.value = chip.getAttribute("data-loc") || "";
      scrollToHero();
      if (qRole) qRole.focus();
    });
  });

  /* ---------- Generic toast buttons ---------- */
  document.querySelectorAll("[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast(btn.getAttribute("data-toast"));
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }
})();
