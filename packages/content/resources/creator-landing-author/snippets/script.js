(function () {
  "use strict";

  /* ---------- data: the shelf ---------- */
  var BOOKS = [
    {
      title: "The Salt Almanac",
      sub: "a novel",
      year: "2026 · New",
      isNew: true,
      meta: "352 pages · Harbour & Vane Press",
      desc: "A lighthouse keeper inherits her late mother's almanac of tides and discovers, between the dates, the record of a love she was never told about. A luminous study of inheritance, weather, and the things we keep to ourselves.",
      c1: "#3a4a52", c2: "#1f2a30"
    },
    {
      title: "Winter Lantern",
      sub: "a novel",
      year: "2023 · Booker longlist",
      meta: "298 pages · Harbour & Vane Press",
      desc: "Three siblings return to the family inn for one last winter before it is sold. Over a week of snow and old grievances, a buried secret thaws. Vane's most quietly devastating book.",
      c1: "#5b3a4a", c2: "#2e1c26"
    },
    {
      title: "The Quiet Hours",
      sub: "a novel · debut",
      year: "2020 · Debut",
      meta: "276 pages · Harbour & Vane Press",
      desc: "A night-shift nurse and an insomniac fisherman cross paths in the small hours of a coastal town. The word-of-mouth phenomenon that started it all.",
      c1: "#3f5040", c2: "#202b21"
    },
    {
      title: "Field of Small Wonders",
      sub: "stories",
      year: "2021 · Stories",
      meta: "212 pages · Harbour & Vane Press",
      desc: "Twelve short stories about ordinary miracles — a found dog, a returned letter, a kettle that finally clicks off. Vane's only collection, and a perfect doorway into her world.",
      c1: "#5a4a2c", c2: "#2e2614"
    }
  ];

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  /* ---------- build book cards ---------- */
  function coverHtml(b, hero) {
    var newTag = b.isNew ? '<span class="tag-new">New</span>' : "";
    return (
      '<figure class="book' + (hero ? " book--hero" : "") + '" tabindex="0" role="button" aria-label="Quick look: ' + b.title + '">' +
        '<div class="book__cover" style="--c1:' + b.c1 + ";--c2:" + b.c2 + '">' +
          '<span class="book__author">Eleanor Vane</span>' +
          '<span class="book__title">' + b.title.replace(/ /g, "<br>") + "</span>" +
          '<span class="book__rule"></span>' +
          '<span class="book__sub">' + b.sub + "</span>" +
        "</div>" +
        '<figcaption class="book__peek">Quick look</figcaption>' +
      "</figure>" +
      '<div class="bookcard__meta">' + newTag + "<h3>" + b.title + "</h3><p>" + b.meta + "</p></div>"
    );
  }

  var grid = document.getElementById("booksGrid");
  if (grid) {
    BOOKS.forEach(function (b, i) {
      var card = document.createElement("div");
      card.className = "bookcard reveal";
      card.innerHTML = coverHtml(b, false);
      card.querySelector(".book").dataset.book = String(i);
      grid.appendChild(card);
    });
  }

  /* ---------- quick-look modal ---------- */
  var modal = document.getElementById("modal");
  var lastFocus = null;
  function openModal(i) {
    var b = BOOKS[i];
    if (!b) return;
    lastFocus = document.activeElement;
    document.getElementById("modalCover").innerHTML =
      '<div class="book__cover" style="--c1:' + b.c1 + ";--c2:" + b.c2 + '">' +
        '<span class="book__author">Eleanor Vane</span>' +
        '<span class="book__title">' + b.title.replace(/ /g, "<br>") + "</span>" +
        '<span class="book__rule"></span><span class="book__sub">' + b.sub + "</span></div>";
    document.getElementById("modalYear").textContent = b.year;
    document.getElementById("modalTitle").textContent = b.title;
    document.getElementById("modalMeta").textContent = b.meta;
    document.getElementById("modalDesc").textContent = b.desc;
    var buy = document.getElementById("modalBuy");
    buy.onclick = function (e) { e.preventDefault(); toast("Added “" + b.title + "” to your basket (demo)."); };
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal__close").focus();
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  // open from any .book (hero + grid)
  document.addEventListener("click", function (e) {
    var bookEl = e.target.closest(".book");
    if (bookEl && bookEl.dataset.book != null) {
      openModal(parseInt(bookEl.dataset.book, 10));
    }
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    var bookEl = e.target.closest && e.target.closest(".book");
    if (bookEl && (e.key === "Enter" || e.key === " ") && bookEl.dataset.book != null) {
      e.preventDefault();
      openModal(parseInt(bookEl.dataset.book, 10));
    }
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  /* ---------- mobile nav ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.getElementById("navlinks").addEventListener("click", function (e) {
    if (e.target.tagName === "A" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- CTA buttons / RSVP / socials ---------- */
  document.addEventListener("click", function (e) {
    var buy = e.target.closest("[data-buy]");
    if (buy) { e.preventDefault(); toast("Opening checkout for “" + buy.dataset.buy + "” (demo)."); return; }
    var rsvp = e.target.closest("[data-rsvp]");
    if (rsvp) { e.preventDefault(); toast("You're on the list for " + rsvp.dataset.rsvp + " ✦"); return; }
    var social = e.target.closest("[data-social]");
    if (social) { e.preventDefault(); toast("Follow Eleanor on " + social.dataset.social + " (demo)."); }
  });

  /* ---------- newsletter ---------- */
  var form = document.getElementById("newsForm");
  var note = document.getElementById("newsNote");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("email").value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      note.textContent = "Please enter a valid email address.";
      note.classList.remove("ok");
      return;
    }
    note.textContent = "Thank you — a welcome note is on its way to your inbox.";
    note.classList.add("ok");
    form.reset();
    toast("Subscribed to The Letter ✦");
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }
})();
