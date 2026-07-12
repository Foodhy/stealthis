(function () {
  "use strict";

  // ---------- Data ----------
  var conversations = [
    {
      id: "mia",
      name: "Mia Reyes",
      initials: "MR",
      grad: "linear-gradient(135deg,#ff5e6c,#8b5cf6)",
      online: true,
      status: "Active now",
      unread: 2,
      matched: "Jun 30",
      time: "9:41",
      messages: [
        { from: "them", text: "Okay your dog photo genuinely made my day 🐶", t: "9:12" },
        { from: "them", text: "What's his name??", t: "9:12" },
        { from: "me", text: "Ha! That's Biscuit — professional nap enthusiast 😄", t: "9:20", read: true },
        { from: "them", text: "Biscuit is such a perfect name", t: "9:38" },
        { from: "them", text: "So… coffee this weekend, or are you more of a wine person?", t: "9:41" }
      ]
    },
    {
      id: "leo",
      name: "Leo Marchetti",
      initials: "LM",
      grad: "linear-gradient(135deg,#8b5cf6,#ff8fb1)",
      online: false,
      status: "Active 12m ago",
      unread: 0,
      matched: "Jun 28",
      time: "Yesterday",
      messages: [
        { from: "me", text: "That climbing gym you mentioned — is it beginner friendly?", t: "18:02", read: true },
        { from: "them", text: "Totally! I can show you the ropes 😏", t: "18:20" },
        { from: "me", text: "Was that a pun", t: "18:21", read: true },
        { from: "them", text: "…maybe. Saturday?", t: "18:22" }
      ]
    },
    {
      id: "priya",
      name: "Priya Anand",
      initials: "PA",
      grad: "linear-gradient(135deg,#ff8fb1,#ff5e6c)",
      online: true,
      status: "Active now",
      unread: 1,
      matched: "Jun 27",
      time: "8:03",
      messages: [
        { from: "them", text: "Your bookshelf photo… is that the whole Le Guin collection?", t: "7:50" },
        { from: "me", text: "Guilty. I reread The Dispossessed every winter 📚", t: "7:58", read: true },
        { from: "them", text: "Marry me. (Kidding. Sort of.)", t: "8:03" }
      ]
    },
    {
      id: "sam",
      name: "Sam Okafor",
      initials: "SO",
      grad: "linear-gradient(135deg,#7c3aed,#ff5e6c)",
      online: false,
      status: "Active 2h ago",
      unread: 0,
      matched: "Jun 25",
      time: "Mon",
      messages: [
        { from: "them", text: "Sending you the playlist I promised 🎧", t: "Mon" },
        { from: "me", text: "Track 4 already living in my head rent free", t: "Mon", read: false }
      ]
    },
    {
      id: "noah",
      name: "Noah Bennett",
      initials: "NB",
      grad: "linear-gradient(135deg,#ff5e6c,#ff8fb1)",
      online: false,
      status: "Active 1d ago",
      unread: 0,
      matched: "Jun 22",
      time: "Sun",
      messages: [
        { from: "me", text: "Farmers market Sunday was so much fun 🍓", t: "Sun", read: true },
        { from: "them", text: "The peach guy waved at us like we're regulars now", t: "Sun" }
      ]
    }
  ];

  var replyPool = [
    "Okay that's actually adorable 🥹",
    "Haha you're trouble, I can tell 😄",
    "Wait, say more — I'm intrigued",
    "You had me at that emoji ✨",
    "Coffee it is then. I know the perfect spot ☕",
    "Stop, you're too smooth for a Tuesday 💜",
    "I'm smiling at my phone like a goof rn",
    "Okay pitch me your ideal first date 👀"
  ];

  var emojis = ["😀","😄","😍","🥰","😘","😉","😎","🤩","😂","🥹","🙃","😇",
    "💜","❤️","💕","💘","✨","🔥","🌸","🌹","☕","🍷","🍓","🎧","📚","🐶","😏","👀","🙌","💫"];

  // ---------- Elements ----------
  var phone = document.querySelector(".phone");
  var convosEl = document.getElementById("convos");
  var newMatchesEl = document.getElementById("newMatches");
  var threadEl = document.getElementById("thread");
  var typingEl = document.getElementById("typing");
  var typingAvatar = document.getElementById("typingAvatar");
  var peerName = document.getElementById("peerName");
  var peerStatus = document.getElementById("peerStatus");
  var peerAvatar = document.getElementById("peerAvatar");
  var bannerName = document.getElementById("bannerName");
  var input = document.getElementById("msgInput");
  var sendBtn = document.getElementById("sendBtn");
  var emojiBtn = document.getElementById("emojiBtn");
  var emojiTray = document.getElementById("emojiTray");
  var searchEl = document.getElementById("convoSearch");
  var backBtn = document.getElementById("backBtn");
  var toastEl = document.getElementById("toast");

  var activeId = conversations[0].id;
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getConvo(id) {
    for (var i = 0; i < conversations.length; i++) {
      if (conversations[i].id === id) return conversations[i];
    }
    return conversations[0];
  }

  // ---------- Render new matches strip ----------
  function renderNewMatches() {
    newMatchesEl.innerHTML = "";
    conversations.forEach(function (c) {
      var btn = document.createElement("button");
      btn.className = "newmatch";
      btn.type = "button";
      btn.setAttribute("aria-label", "Open chat with " + c.name);
      btn.innerHTML =
        '<span class="avatar" style="background:' + c.grad + '"' +
        (c.online ? ' data-online="1"' : "") + ">" + esc(c.initials) + "</span>" +
        "<small>" + esc(c.name.split(" ")[0]) + "</small>";
      btn.addEventListener("click", function () { openConversation(c.id); });
      newMatchesEl.appendChild(btn);
    });
  }

  // ---------- Render conversation list ----------
  function renderConvos(filter) {
    filter = (filter || "").toLowerCase();
    convosEl.innerHTML = "";
    conversations.forEach(function (c) {
      if (filter && c.name.toLowerCase().indexOf(filter) === -1) return;
      var last = c.messages[c.messages.length - 1];
      var preview = (last.from === "me" ? "You: " : "") + last.text;

      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.className = "convo" +
        (c.id === activeId ? " is-active" : "") +
        (c.unread > 0 ? " is-unread" : "");
      btn.type = "button";
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", c.id === activeId ? "true" : "false");
      btn.innerHTML =
        '<span class="convo__wrap"><span class="avatar" style="background:' + c.grad + '"' +
        (c.online ? ' data-online="1"' : "") + ">" + esc(c.initials) + "</span></span>" +
        '<span class="convo__body">' +
          '<span class="convo__top">' +
            '<span class="convo__name">' + esc(c.name) + "</span>" +
            '<span class="convo__time">' + esc(c.time) + "</span>" +
          "</span>" +
          '<span class="convo__preview">' + esc(preview) + "</span>" +
        "</span>" +
        '<span class="convo__meta">' +
          (c.unread > 0 ? '<span class="unread-dot">' + c.unread + "</span>" : "") +
        "</span>";
      btn.addEventListener("click", function () { openConversation(c.id); });
      li.appendChild(btn);
      convosEl.appendChild(li);
    });
  }

  // ---------- Render active thread ----------
  function renderThread() {
    var c = getConvo(activeId);
    peerName.textContent = c.name;
    peerAvatar.style.background = c.grad;
    peerAvatar.textContent = c.initials;
    if (c.online) { peerAvatar.setAttribute("data-online", "1"); }
    else { peerAvatar.removeAttribute("data-online"); }
    peerStatus.innerHTML =
      '<span class="dot ' + (c.online ? "dot--on" : "") + '"></span> ' + esc(c.status);
    bannerName.textContent = c.name.split(" ")[0];
    typingAvatar.style.background = c.grad;
    typingAvatar.textContent = c.initials;

    threadEl.innerHTML = '<span class="daysep">Matched ' + esc(c.matched) + "</span>";
    c.messages.forEach(function (m) { threadEl.appendChild(buildMsg(m)); });
    scrollBottom();
  }

  function buildMsg(m) {
    var div = document.createElement("div");
    div.className = "msg " + (m.from === "me" ? "msg--out" : "msg--in");
    var meta = '<span class="msg__meta"><span>' + esc(m.t) + "</span>";
    if (m.from === "me") {
      meta += '<span class="tick ' + (m.read ? "read" : "") + '">' +
        (m.read ? "✓✓" : "✓") + "</span>";
    }
    meta += "</span>";
    div.innerHTML = "<span>" + esc(m.text) + "</span>" + meta;
    return div;
  }

  function scrollBottom() {
    requestAnimationFrame(function () { threadEl.scrollTop = threadEl.scrollHeight; });
  }

  function nowTime() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }

  // ---------- Open a conversation ----------
  function openConversation(id) {
    activeId = id;
    var c = getConvo(id);
    c.unread = 0;
    renderConvos(searchEl.value);
    renderThread();
    phone.classList.add("show-chat");
    input.focus();
  }

  // ---------- Send flow ----------
  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;
    var c = getConvo(activeId);
    var msg = { from: "me", text: text, t: nowTime(), read: false };
    c.messages.push(msg);
    threadEl.appendChild(buildMsg(msg));
    input.value = "";
    autoGrow();
    updateSendState();
    scrollBottom();
    renderConvos(searchEl.value);

    // mark read + reply
    setTimeout(function () {
      msg.read = true;
      renderThread();
    }, 900);

    setTimeout(function () {
      typingEl.hidden = false;
      scrollBottom();
    }, 1300);

    setTimeout(function () {
      typingEl.hidden = true;
      var reply = {
        from: "them",
        text: replyPool[Math.floor(Math.random() * replyPool.length)],
        t: nowTime()
      };
      c.messages.push(reply);
      // only append if still viewing this convo
      if (c.id === activeId) {
        threadEl.appendChild(buildMsg(reply));
        scrollBottom();
      } else {
        c.unread += 1;
      }
      renderConvos(searchEl.value);
    }, 2600);
  }

  function autoGrow() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 90) + "px";
  }

  function updateSendState() {
    sendBtn.disabled = input.value.trim().length === 0;
  }

  // ---------- Emoji tray ----------
  function buildEmojiTray() {
    emojiTray.innerHTML = "";
    emojis.forEach(function (e) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = e;
      b.setAttribute("aria-label", "Insert " + e);
      b.addEventListener("click", function () { insertEmoji(e); });
      emojiTray.appendChild(b);
    });
  }

  function insertEmoji(e) {
    var start = input.selectionStart || input.value.length;
    var end = input.selectionEnd || input.value.length;
    input.value = input.value.slice(0, start) + e + input.value.slice(end);
    var pos = start + e.length;
    input.setSelectionRange(pos, pos);
    input.focus();
    autoGrow();
    updateSendState();
  }

  function toggleTray(force) {
    var open = force !== undefined ? force : emojiTray.hidden;
    emojiTray.hidden = !open;
    emojiTray.setAttribute("aria-hidden", open ? "false" : "true");
    emojiBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  // ---------- Events ----------
  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("input", function () { autoGrow(); updateSendState(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  emojiBtn.addEventListener("click", function () { toggleTray(); });

  document.addEventListener("click", function (e) {
    if (!emojiTray.hidden && !emojiTray.contains(e.target) && e.target !== emojiBtn) {
      toggleTray(false);
    }
  });

  searchEl.addEventListener("input", function () { renderConvos(searchEl.value); });

  backBtn.addEventListener("click", function () {
    phone.classList.remove("show-chat");
  });

  document.querySelectorAll(".chat__actions .icon-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      toast(b.getAttribute("aria-label") + " is not available in the demo");
    });
  });

  // ---------- Init ----------
  renderNewMatches();
  renderConvos("");
  renderThread();
  buildEmojiTray();
  updateSendState();
})();
