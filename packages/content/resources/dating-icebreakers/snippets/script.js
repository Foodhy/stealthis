(function () {
  "use strict";

  /* ---- Data ---- */
  var CATEGORIES = [
    { id: "flirty", label: "Flirty" },
    { id: "deep", label: "Deep" },
    { id: "silly", label: "Silly" },
    { id: "firstdate", label: "First Date" },
    { id: "travel", label: "Travel" },
  ];

  var PROMPTS = [
    { cat: "flirty", label: "Flirty", text: "You get one word to describe your energy today — what is it, and can I steal some?" },
    { cat: "flirty", label: "Flirty", text: "Two truths and a flirt: tell me something true, something wild, and something you'd only say to me." },
    { cat: "flirty", label: "Flirty", text: "If we split a dessert on a first date, are you a one-bite thief or a whole-plate romantic?" },
    { cat: "flirty", label: "Flirty", text: "Rate your texting-back speed on a scale from carrier pigeon to instant. Be honest." },
    { cat: "deep", label: "Deep", text: "What's a small thing that instantly makes you trust someone new?" },
    { cat: "deep", label: "Deep", text: "When was the last time something genuinely surprised you — in a good way?" },
    { cat: "deep", label: "Deep", text: "What does a perfectly ordinary, quietly happy day look like for you?" },
    { cat: "deep", label: "Deep", text: "What's a belief you changed your mind about in the last couple of years?" },
    { cat: "silly", label: "Silly", text: "You're a cereal mascot now. What's your cereal called and what's the slogan?" },
    { cat: "silly", label: "Silly", text: "Defend your most controversial snack pairing like it's a court case." },
    { cat: "silly", label: "Silly", text: "If your last three purchases had to explain your whole personality, how doomed are you?" },
    { cat: "silly", label: "Silly", text: "Assign me a completely made-up superpower based on nothing but this conversation." },
    { cat: "firstdate", label: "First Date", text: "Coffee, cocktails, or a chaotic walk somewhere neither of us planned — pick our first date." },
    { cat: "firstdate", label: "First Date", text: "What's your green flag that people don't notice until date three?" },
    { cat: "firstdate", label: "First Date", text: "If our first date had a soundtrack, give me the opening song." },
    { cat: "firstdate", label: "First Date", text: "What's a first-date question you secretly wish someone would ask you?" },
    { cat: "travel", label: "Travel", text: "One-way ticket, leaves in an hour, money's handled — where are we landing?" },
    { cat: "travel", label: "Travel", text: "Beach that does nothing or city that never stops — which one recharges you?" },
    { cat: "travel", label: "Travel", text: "What's the best meal you've had abroad, and would you fly back just for it?" },
    { cat: "travel", label: "Travel", text: "Window seat philosopher or aisle seat escape artist — who am I flying with?" },
  ];

  /* ---- State ---- */
  var activeCat = "flirty";
  var current = null;
  var favorites = [];

  /* ---- Elements ---- */
  var $ = function (id) { return document.getElementById(id); };
  var catsEl = $("cats");
  var card = $("card");
  var cardCat = $("cardCat");
  var cardText = $("cardText");
  var cardNum = $("cardNum");
  var heartBtn = $("heartBtn");
  var copyBtn = $("copyBtn");
  var sendBtn = $("sendBtn");
  var shuffleBtn = $("shuffleBtn");
  var favToggle = $("favToggle");
  var favNum = $("favNum");
  var favDrawer = $("favDrawer");
  var favClose = $("favClose");
  var favList = $("favList");
  var favEmpty = $("favEmpty");
  var toastEl = $("toast");

  /* ---- Toast helper ---- */
  var toastTimer;
  function toast(msg, love) {
    toastEl.textContent = msg;
    toastEl.classList.toggle("toast--love", !!love);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---- Utils ---- */
  function keyOf(p) { return p.cat + "::" + p.text; }
  function pool() {
    return PROMPTS.filter(function (p) { return p.cat === activeCat; });
  }
  function isFav(p) {
    return favorites.some(function (f) { return keyOf(f) === keyOf(p); });
  }

  /* ---- Render category chips ---- */
  function renderCats() {
    CATEGORIES.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = c.label;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(c.id === activeCat));
      b.addEventListener("click", function () {
        if (activeCat === c.id) return;
        activeCat = c.id;
        Array.prototype.forEach.call(catsEl.children, function (child) {
          child.setAttribute("aria-selected", String(child === b));
        });
        dealNew(true);
      });
      catsEl.appendChild(b);
    });
  }

  /* ---- Render card ---- */
  function renderCard() {
    if (!current) return;
    cardCat.textContent = current.label;
    cardText.textContent = current.text;
    var list = pool();
    var idx = list.indexOf(current) + 1;
    cardNum.textContent =
      String(idx).padStart(2, "0") + " / " + String(list.length).padStart(2, "0");
    var fav = isFav(current);
    heartBtn.setAttribute("aria-pressed", String(fav));
    heartBtn.setAttribute("aria-label", fav ? "Remove from favorites" : "Save to favorites");
  }

  function dealNew(fromCategory) {
    var list = pool();
    var next;
    do {
      next = list[Math.floor(Math.random() * list.length)];
    } while (list.length > 1 && next === current);
    card.classList.add("flip");
    setTimeout(function () {
      current = next;
      renderCard();
      card.classList.remove("flip");
    }, 200);
    if (fromCategory) toast("Dealt a " + current.label + " prompt");
  }

  /* ---- Favorites ---- */
  function renderFavs() {
    favNum.textContent = String(favorites.length);
    favList.innerHTML = "";
    favEmpty.style.display = favorites.length ? "none" : "block";
    favorites.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "fav-item";

      var cat = document.createElement("span");
      cat.className = "fav-item__cat";
      cat.textContent = p.label;

      var txt = document.createElement("span");
      txt.className = "fav-item__text";
      txt.textContent = p.text;

      var rm = document.createElement("button");
      rm.className = "fav-item__rm";
      rm.type = "button";
      rm.setAttribute("aria-label", "Remove this saved prompt");
      rm.textContent = "✕";
      rm.addEventListener("click", function () {
        favorites = favorites.filter(function (f) { return keyOf(f) !== keyOf(p); });
        renderFavs();
        renderCard();
        toast("Removed from saved");
      });

      li.appendChild(cat);
      li.appendChild(txt);
      li.appendChild(rm);
      favList.appendChild(li);
    });
  }

  function toggleFav() {
    if (!current) return;
    if (isFav(current)) {
      favorites = favorites.filter(function (f) { return keyOf(f) !== keyOf(current); });
      toast("Removed from saved");
    } else {
      favorites.unshift({ cat: current.cat, label: current.label, text: current.text });
      toast("Saved to your collection", true);
    }
    heartBtn.classList.remove("pop");
    void heartBtn.offsetWidth;
    heartBtn.classList.add("pop");
    renderCard();
    renderFavs();
  }

  /* ---- Clipboard ---- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast("Copied to clipboard"); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Copied to clipboard"); }
    catch (e) { toast("Press to copy manually"); }
    document.body.removeChild(ta);
  }

  /* ---- Drawer ---- */
  function setDrawer(open) {
    favDrawer.hidden = !open;
    favToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      favDrawer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /* ---- Wire up ---- */
  heartBtn.addEventListener("click", toggleFav);

  copyBtn.addEventListener("click", function () {
    if (current) copyText(current.text);
  });

  sendBtn.addEventListener("click", function () {
    if (current) toast("Sent to the chat ♥", true);
  });

  shuffleBtn.addEventListener("click", function () {
    shuffleBtn.classList.remove("spin");
    void shuffleBtn.offsetWidth;
    shuffleBtn.classList.add("spin");
    dealNew(false);
  });

  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dealNew(false);
    }
  });

  favToggle.addEventListener("click", function () {
    setDrawer(favDrawer.hidden);
  });
  favClose.addEventListener("click", function () { setDrawer(false); });

  /* ---- Init ---- */
  renderCats();
  current = pool()[0];
  renderCard();
  renderFavs();
})();
