(function () {
  "use strict";

  var ATTORNEYS = [
    {
      name: "Margaret Halloran",
      title: "Managing Partner",
      seniority: "Partner",
      practices: ["Corporate", "Tax"],
      bars: ["New York", "Connecticut", "U.S. Tax Court"],
      email: "m.halloran@hallreyes.com",
      bio: "Founding partner with 28 years advising closely held companies on mergers, succession and cross-border tax structuring. Lead counsel on more than 60 acquisitions."
    },
    {
      name: "Daniel Reyes",
      title: "Partner",
      seniority: "Partner",
      practices: ["Litigation"],
      bars: ["New York", "New Jersey", "2nd Circuit"],
      email: "d.reyes@hallreyes.com",
      bio: "Trial lawyer focused on complex commercial disputes and appellate work. Has argued before the Second Circuit eleven times and tried matters in state and federal court."
    },
    {
      name: "Priya Nair",
      title: "Partner",
      seniority: "Partner",
      practices: ["Real Estate", "Corporate"],
      bars: ["New York", "Massachusetts"],
      email: "p.nair@hallreyes.com",
      bio: "Heads the real estate group, handling acquisitions, development financing and commercial leasing for institutional clients and family offices across the Northeast."
    },
    {
      name: "Robert Whitfield",
      title: "Of Counsel",
      seniority: "Of Counsel",
      practices: ["Tax", "Corporate"],
      bars: ["New York", "Florida", "U.S. Tax Court"],
      email: "r.whitfield@hallreyes.com",
      bio: "Former IRS senior counsel who advises on partnership taxation, audits and voluntary disclosures. Joined the firm after 19 years in government practice."
    },
    {
      name: "Elena Castellano",
      title: "Senior Associate",
      seniority: "Associate",
      practices: ["Family"],
      bars: ["New York", "New Jersey"],
      email: "e.castellano@hallreyes.com",
      bio: "Concentrates on high-net-worth divorce, prenuptial agreements and custody mediation, with a measured, settlement-first approach that keeps matters out of court."
    },
    {
      name: "James Okonkwo",
      title: "Senior Associate",
      seniority: "Associate",
      practices: ["Litigation", "Corporate"],
      bars: ["New York", "Pennsylvania"],
      email: "j.okonkwo@hallreyes.com",
      bio: "Represents technology and manufacturing clients in contract disputes, trade-secret claims and shareholder litigation. Recognized in the 2025 Rising Stars list."
    },
    {
      name: "Hannah Lieberman",
      title: "Associate",
      seniority: "Associate",
      practices: ["Real Estate"],
      bars: ["New York"],
      email: "h.lieberman@hallreyes.com",
      bio: "Supports the real estate team on due diligence, title review and lease negotiation for retail and multifamily portfolios throughout the tri-state area."
    },
    {
      name: "Marcus Tran",
      title: "Associate",
      seniority: "Associate",
      practices: ["Family", "Litigation"],
      bars: ["New York", "Connecticut"],
      email: "m.tran@hallreyes.com",
      bio: "Handles family-law motions, support enforcement and protective orders. Volunteers weekly at the county legal aid clinic representing pro bono clients."
    }
  ];

  var state = { q: "", practice: "all", seniority: "all" };

  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var countN = document.getElementById("count-n");
  var search = document.getElementById("search");
  var countNoun = document.getElementById("count-noun");

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function matches(a) {
    if (state.practice !== "all" && a.practices.indexOf(state.practice) === -1) return false;
    if (state.seniority !== "all" && a.seniority !== state.seniority) return false;
    if (state.q) {
      var hay = (a.name + " " + a.title + " " + a.practices.join(" ")).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function render() {
    var list = ATTORNEYS.filter(matches);
    grid.innerHTML = "";

    list.forEach(function (a, i) {
      var li = document.createElement("li");
      li.className = "card";

      var partnerCls = a.seniority === "Partner" ? " is-partner" : "";
      var panelId = "bio-" + i;
      var tags = a.practices.map(function (p) {
        return '<span class="tag">' + p + "</span>";
      }).join("");

      li.innerHTML =
        '<button class="card-head" type="button" aria-expanded="false" aria-controls="' + panelId + '">' +
          '<span class="avatar" aria-hidden="true">' + initials(a.name) + "</span>" +
          '<span class="who">' +
            '<span class="name">' + a.name + "</span><br>" +
            '<span class="title' + partnerCls + '">' + a.title + "</span>" +
          "</span>" +
          '<span class="chev" aria-hidden="true">▾</span>' +
        "</button>" +
        '<div class="card-tags">' + tags + "</div>" +
        '<div class="bio" id="' + panelId + '" role="region">' +
          '<div class="bio-inner">' +
            "<p>" + a.bio + "</p>" +
            '<p class="bars"><strong>Bar admissions:</strong> <span>' + a.bars.join(", ") + "</span></p>" +
            '<a class="contact" href="mailto:' + a.email + '">✉ ' + a.email + "</a>" +
          "</div>" +
        "</div>";

      var head = li.querySelector(".card-head");
      head.addEventListener("click", function () {
        var open = li.classList.toggle("is-open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });

      grid.appendChild(li);
    });

    countN.textContent = String(list.length);
    countNoun.textContent = list.length === 1 ? "attorney" : "attorneys";
    empty.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
  }

  function wirePills(group) {
    var key = group.getAttribute("data-filter");
    group.querySelectorAll(".pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".pill").forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        state[key] = btn.getAttribute("data-value");
        render();
      });
    });
  }

  document.querySelectorAll(".pills").forEach(wirePills);

  search.addEventListener("input", function () {
    state.q = search.value.trim().toLowerCase();
    render();
  });

  render();
})();
