(function () {
  "use strict";

  var BADGE_LABEL = {
    announcement: "Announcement",
    event: "Event",
    intro: "Member intro",
    marketplace: "Marketplace"
  };

  var AVATAR_CLASSES = ["av-plant", "av-amber", "av-river", "av-clay"];

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }

  var posts = [
    {
      id: "p1", type: "announcement", author: "Loomhouse Hosts", avatar: "av-amber",
      sub: "Community team · 2h ago",
      body: "The Loom-floor printers are back online and the new fibre line is live — speeds doubled. Thanks for your patience while we re-wired the mezzanine.",
      likes: 34, liked: false, comments: 7
    },
    {
      id: "p2", type: "event", author: "Marisol Vega", avatar: "av-plant",
      sub: "Ceramics studio · 4h ago",
      body: "Hosting a slow-coffee + sketch morning this Friday in the roof garden. Bring a notebook, leave the laptop. All skill levels welcome ✏️",
      event: { when: "Fri · Jun 20 · 9:00–10:30am · Roof Garden", going: false, count: 12 },
      likes: 18, liked: true, comments: 4
    },
    {
      id: "p3", type: "intro", author: "Dev Okoro", avatar: "av-river",
      sub: "New member · 6h ago",
      body: "Hey Loomhouse! 👋 I'm Dev, building a small climate-data startup. Desk 14 on the Loom floor. Always up to trade product feedback for a flat white.",
      likes: 27, liked: false, comments: 11
    },
    {
      id: "p4", type: "marketplace", author: "Priya Anand", avatar: "av-clay",
      sub: "You · 8h ago",
      body: "Selling a barely-used standing desk converter — height-adjustable, fits a 27\" monitor. Upgraded to a full sit-stand, so this needs a new home.",
      market: { price: "$85" },
      likes: 9, liked: false, comments: 3
    },
    {
      id: "p5", type: "event", author: "Tobias Frei", avatar: "av-amber",
      sub: "Founders circle · yesterday",
      body: "Monthly Founders Lunch is open for sign-ups. Lightning intros, one shared problem each, and the Mill kitchen handles the food. Cap is 20 seats.",
      event: { when: "Wed · Jun 25 · 12:30–2:00pm · Kiln Room", going: false, count: 16 },
      likes: 22, liked: false, comments: 6
    },
    {
      id: "p6", type: "announcement", author: "Loomhouse Hosts", avatar: "av-amber",
      sub: "Community team · yesterday",
      body: "Reminder: phone booths are for calls, not focus naps 😴. We added two new acoustic pods by the river-side windows — first come, first served.",
      likes: 41, liked: true, comments: 9
    },
    {
      id: "p7", type: "intro", author: "Lena Brandt", avatar: "av-plant",
      sub: "New member · 2 days ago",
      body: "Hi all — Lena here, freelance motion designer. I gave a talk on After Effects rigging last year and I'm happy to do an informal session if there's interest!",
      likes: 31, liked: false, comments: 8
    }
  ];

  var members = [
    { name: "Marisol Vega", role: "Ceramics studio", avatar: "av-plant", in: true },
    { name: "Dev Okoro", role: "Climate-data founder", avatar: "av-river", in: true },
    { name: "Tobias Frei", role: "Founders circle host", avatar: "av-amber", in: true },
    { name: "Lena Brandt", role: "Motion designer", avatar: "av-plant", in: false },
    { name: "Amara Sow", role: "Brand strategist", avatar: "av-clay", in: true },
    { name: "Jonas Reidt", role: "iOS engineer", avatar: "av-river", in: false },
    { name: "Priya Anand", role: "Product designer", avatar: "av-clay", in: true },
    { name: "Noah Källström", role: "Illustrator", avatar: "av-amber", in: true }
  ];

  var feedEl = document.getElementById("feed");
  var emptyEl = document.getElementById("emptyState");
  var tpl = document.getElementById("postTpl");
  var activeFilter = "all";
  var query = "";

  /* ---- toast ---- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---- render feed ---- */
  function matches(post) {
    if (activeFilter !== "all" && post.type !== activeFilter) return false;
    if (!query) return true;
    var hay = (post.author + " " + post.body).toLowerCase();
    return hay.indexOf(query) !== -1;
  }

  function buildPost(post) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = post.id;

    var av = node.querySelector(".avatar");
    av.classList.add(post.avatar);
    av.textContent = initials(post.author);

    node.querySelector(".post-author").textContent = post.author;
    node.querySelector(".post-sub").textContent = post.sub;

    var badge = node.querySelector(".badge");
    badge.textContent = BADGE_LABEL[post.type];
    badge.classList.add(post.type);

    node.querySelector(".post-body").textContent = post.body;

    if (post.event) {
      var box = node.querySelector(".event-box");
      box.hidden = false;
      box.querySelector(".event-when").textContent = post.event.when;
      var rsvp = box.querySelector(".rsvp-btn");
      var rc = box.querySelector(".rsvp-count");
      function paintRsvp() {
        rsvp.textContent = post.event.going ? "✓ Going" : "RSVP";
        rsvp.classList.toggle("is-going", post.event.going);
        rsvp.setAttribute("aria-pressed", String(post.event.going));
        rc.textContent = post.event.count + " going";
      }
      paintRsvp();
      rsvp.addEventListener("click", function () {
        post.event.going = !post.event.going;
        post.event.count += post.event.going ? 1 : -1;
        paintRsvp();
        toast(post.event.going ? "You're going — see you there!" : "RSVP removed");
      });
    }

    if (post.market) {
      var mbox = node.querySelector(".market-box");
      mbox.hidden = false;
      mbox.querySelector(".price").textContent = post.market.price;
      mbox.querySelector("button").addEventListener("click", function () {
        toast("Message sent to " + post.author.split(" ")[0]);
      });
    }

    var like = node.querySelector(".like-btn");
    var likeCount = node.querySelector(".like-count");
    var heart = node.querySelector(".heart");
    function paintLike() {
      like.setAttribute("aria-pressed", String(post.liked));
      heart.textContent = post.liked ? "♥" : "♡";
      likeCount.textContent = post.likes;
    }
    paintLike();
    like.addEventListener("click", function () {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      paintLike();
    });

    node.querySelector(".comment-count").textContent = post.comments;
    node.querySelector(".comment-btn").addEventListener("click", function () {
      toast("Comments are illustrative in this demo");
    });
    node.querySelector(".share-btn").addEventListener("click", function () {
      toast("Link copied to clipboard");
    });

    return node;
  }

  function render() {
    var list = posts.filter(matches);
    feedEl.innerHTML = "";
    list.forEach(function (p) { feedEl.appendChild(buildPost(p)); });
    emptyEl.hidden = list.length !== 0;
  }

  /* ---- filters ---- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("is-on"); });
      btn.classList.add("is-on");
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  document.getElementById("search").addEventListener("input", function (e) {
    query = e.target.value.trim().toLowerCase();
    render();
  });

  /* ---- directory ---- */
  var dirList = document.getElementById("dirList");
  var dirCount = document.getElementById("dirCount");
  function renderDir(filterStr) {
    var f = (filterStr || "").trim().toLowerCase();
    dirList.innerHTML = "";
    var shown = 0;
    members.forEach(function (m) {
      if (f && (m.name + " " + m.role).toLowerCase().indexOf(f) === -1) return;
      shown++;
      var li = document.createElement("li");
      li.className = "dir-item";
      li.tabIndex = 0;
      li.innerHTML =
        '<span class="avatar ' + m.avatar + '">' + initials(m.name) + "</span>" +
        '<span class="dir-info"><span class="dir-name">' + m.name + "</span>" +
        '<span class="dir-role">' + m.role + "</span></span>" +
        '<span class="dir-status ' + (m.in ? "in" : "out") + '" title="' +
        (m.in ? "Checked in" : "Away") + '"></span>';
      function open() { toast((m.in ? "" : "Away · ") + m.name + " — " + m.role); }
      li.addEventListener("click", open);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      dirList.appendChild(li);
    });
    dirCount.textContent = shown;
  }
  document.getElementById("dirSearch").addEventListener("input", function (e) {
    renderDir(e.target.value);
  });

  /* ---- composer ---- */
  var composer = document.getElementById("composerInline");
  var composeBody = document.getElementById("composeBody");
  var charCount = document.getElementById("charCount");
  var composeType = "announcement";
  var MAX = 280;

  document.getElementById("composeOpen").addEventListener("click", function () {
    composer.hidden = false;
    composeBody.focus();
    composer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  document.getElementById("composeClose").addEventListener("click", function () {
    composer.hidden = true;
  });

  var typeChips = Array.prototype.slice.call(composer.querySelectorAll(".type-chip"));
  typeChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      typeChips.forEach(function (c) { c.classList.remove("is-on"); });
      chip.classList.add("is-on");
      composeType = chip.dataset.type;
    });
  });

  composeBody.addEventListener("input", function () {
    var len = composeBody.value.length;
    charCount.textContent = len + " / " + MAX;
    charCount.classList.toggle("over", len > MAX);
  });

  document.getElementById("composePost").addEventListener("click", function () {
    var text = composeBody.value.trim();
    if (!text) { toast("Write something first ✏️"); composeBody.focus(); return; }
    if (text.length > MAX) { toast("Post is too long"); return; }

    var newPost = {
      id: "p" + Date.now(),
      type: composeType,
      author: "Priya Anand",
      avatar: "av-clay",
      sub: "You · just now",
      body: text,
      likes: 0, liked: false, comments: 0
    };
    if (composeType === "event") {
      newPost.event = { when: "Date TBD · The Mill", going: false, count: 0 };
    }
    if (composeType === "marketplace") {
      newPost.market = { price: "Make offer" };
    }
    posts.unshift(newPost);

    composeBody.value = "";
    charCount.textContent = "0 / " + MAX;
    charCount.classList.remove("over");
    composer.hidden = true;
    if (activeFilter !== "all" && activeFilter !== composeType) {
      filterBtns.forEach(function (b) {
        b.classList.toggle("is-on", b.dataset.filter === "all");
      });
      activeFilter = "all";
    }
    query = "";
    document.getElementById("search").value = "";
    render();
    feedEl.firstElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Posted to the community feed");
  });

  document.getElementById("houseBtn").addEventListener("click", function () {
    toast("House guide opens in the member handbook");
  });

  /* ---- init ---- */
  render();
  renderDir("");
})();
