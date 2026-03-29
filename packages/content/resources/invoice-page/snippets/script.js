(function () {
  var invoiceData = [
    {
      id: "INV-001",
      client: "Acme Corp",
      clientAddr: "Acme Corp\naccounts@acme.com\n456 Business Ave, NY 10001",
      issued: "Mar 1, 2026",
      due: "Mar 15, 2026",
      status: "Paid",
      paymentInfo: "via Bank Transfer on Mar 10, 2026",
      items: [
        { desc: "Web Development", qty: 40, rate: 50 },
        { desc: "UI/UX Design", qty: 10, rate: 45 },
        { desc: "Server Setup", qty: 1, rate: 50 },
      ],
    },
    {
      id: "INV-002",
      client: "Globex Inc",
      clientAddr: "Globex Inc\nbilling@globex.io\n789 Market St, SF 94103",
      issued: "Mar 3, 2026",
      due: "Mar 17, 2026",
      status: "Paid",
      paymentInfo: "via Credit Card on Mar 12, 2026",
      items: [
        { desc: "API Integration", qty: 20, rate: 65 },
        { desc: "Testing & QA", qty: 15, rate: 35 },
        { desc: "Documentation", qty: 5, rate: 30 },
      ],
    },
    {
      id: "INV-003",
      client: "Wayne Enterprises",
      clientAddr: "Wayne Enterprises\nfinance@wayne.com\n1 Gotham Plaza, Gotham 12345",
      issued: "Mar 5, 2026",
      due: "Mar 19, 2026",
      status: "Pending",
      paymentInfo: "Awaiting payment",
      items: [
        { desc: "Consulting", qty: 8, rate: 100 },
        { desc: "Code Review", qty: 4, rate: 30 },
      ],
    },
    {
      id: "INV-004",
      client: "Stark Industries",
      clientAddr: "Stark Industries\nap@stark.ind\n200 Park Avenue, NY 10166",
      issued: "Feb 15, 2026",
      due: "Mar 1, 2026",
      status: "Overdue",
      paymentInfo: "Payment overdue since Mar 1, 2026",
      items: [
        { desc: "Mobile App Development", qty: 16, rate: 70 },
        { desc: "Backend API", qty: 4, rate: 30 },
      ],
    },
    {
      id: "INV-005",
      client: "Umbrella Corp",
      clientAddr: "Umbrella Corp\npayables@umbrella.co\n10 Raccoon Drive, Midwest 55123",
      issued: "Mar 8, 2026",
      due: "Mar 22, 2026",
      status: "Paid",
      paymentInfo: "via PayPal on Mar 15, 2026",
      items: [
        { desc: "Landing Page Design", qty: 1, rate: 350 },
        { desc: "SEO Optimization", qty: 5, rate: 25 },
      ],
    },
    {
      id: "INV-006",
      client: "Initech LLC",
      clientAddr: "Initech LLC\nbilling@initech.com\n4120 Freidrich Lane, Austin TX 78744",
      issued: "Mar 10, 2026",
      due: "Mar 24, 2026",
      status: "Pending",
      paymentInfo: "Awaiting payment",
      items: [
        { desc: "Full-Stack Development", qty: 32, rate: 65 },
        { desc: "Database Design", qty: 8, rate: 35 },
        { desc: "Deployment & DevOps", qty: 4, rate: 45 },
      ],
    },
    {
      id: "INV-007",
      client: "Soylent Corp",
      clientAddr: "Soylent Corp\nfinance@soylent.co\n77 Green St, Portland OR 97201",
      issued: "Mar 12, 2026",
      due: "Mar 26, 2026",
      status: "Cancelled",
      paymentInfo: "Invoice cancelled on Mar 14, 2026",
      items: [{ desc: "Logo Design", qty: 1, rate: 150 }],
    },
    {
      id: "INV-008",
      client: "Massive Dynamic",
      clientAddr: "Massive Dynamic\nar@massivedynamic.com\n1 Science Way, Boston MA 02210",
      issued: "Mar 15, 2026",
      due: "Mar 29, 2026",
      status: "Paid",
      paymentInfo: "via Wire Transfer on Mar 18, 2026",
      items: [
        { desc: "Enterprise Platform Build", qty: 120, rate: 95 },
        { desc: "Security Audit", qty: 20, rate: 85 },
        { desc: "Training Sessions", qty: 8, rate: 55.63 },
      ],
    },
  ];

  var overlay = document.getElementById("modalOverlay");
  var closeBtn = document.getElementById("modalClose");
  var filterTabs = document.getElementById("filterTabs");
  var searchInput = document.getElementById("searchInput");
  var invoiceBody = document.getElementById("invoiceBody");
  var toast = document.getElementById("toast");
  var printBtn = document.getElementById("printBtn");
  var downloadBtn = document.getElementById("downloadBtn");

  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2500);
  }

  function formatCurrency(n) {
    return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Filter by status
  filterTabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".tab");
    if (!btn) return;

    filterTabs.querySelectorAll(".tab").forEach(function (t) {
      t.classList.remove("active");
    });
    btn.classList.add("active");

    var status = btn.dataset.status;
    var rows = invoiceBody.querySelectorAll("tr");

    rows.forEach(function (row) {
      if (status === "all" || row.dataset.status === status) {
        row.classList.remove("hidden");
      } else {
        row.classList.add("hidden");
      }
    });

    applySearch();
  });

  // Search
  function applySearch() {
    var query = searchInput.value.trim().toLowerCase();
    var rows = invoiceBody.querySelectorAll("tr:not(.hidden)");

    rows.forEach(function (row) {
      if (!query) {
        row.style.display = "";
        return;
      }
      var invoiceId = (row.dataset.invoice || "").toLowerCase();
      var client = (row.dataset.client || "").toLowerCase();
      if (invoiceId.indexOf(query) > -1 || client.indexOf(query) > -1) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  searchInput.addEventListener("input", applySearch);

  // Open modal
  invoiceBody.addEventListener("click", function (e) {
    var viewBtn = e.target.closest(".btn-view");
    if (viewBtn) {
      var idx = parseInt(viewBtn.dataset.invoice, 10);
      openModal(idx);
      return;
    }

    var dlBtn = e.target.closest(".btn-download");
    if (dlBtn) {
      showToast("Invoice downloaded");
      return;
    }
  });

  function openModal(idx) {
    var inv = invoiceData[idx];
    if (!inv) return;

    document.getElementById("invNumber").textContent = inv.id;
    document.getElementById("invDates").innerHTML =
      "Issued: " + inv.issued + "<br/>Due: " + inv.due;
    document.getElementById("invBillTo").innerHTML = inv.clientAddr.replace(/\n/g, "<br/>");

    var tbody = document.getElementById("invItemsBody");
    tbody.innerHTML = "";
    var subtotal = 0;
    inv.items.forEach(function (item) {
      var amount = item.qty * item.rate;
      subtotal += amount;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        item.desc +
        "</td>" +
        "<td>" +
        item.qty +
        "</td>" +
        "<td>" +
        formatCurrency(item.rate) +
        "</td>" +
        "<td>" +
        formatCurrency(amount) +
        "</td>";
      tbody.appendChild(tr);
    });

    document.getElementById("invSubtotal").textContent = formatCurrency(subtotal);
    document.getElementById("invTax").textContent = "$0.00";
    document.getElementById("invTotal").textContent = formatCurrency(subtotal);

    var paymentStatus = document.getElementById("invPaymentStatus");
    var paymentMethod = document.getElementById("invPaymentMethod");
    var paymentWrap = paymentStatus.parentElement;

    paymentStatus.textContent = inv.status;
    paymentMethod.textContent = inv.paymentInfo;

    paymentStatus.className = "inv-payment-status";
    paymentWrap.style.background = "";

    if (inv.status === "Paid") {
      paymentStatus.style.color = "#16a34a";
      paymentStatus.style.background = "#dcfce7";
      paymentWrap.style.background = "#f0fdf4";
    } else if (inv.status === "Pending") {
      paymentStatus.style.color = "#d97706";
      paymentStatus.style.background = "#fef3c7";
      paymentWrap.style.background = "#fffbeb";
    } else if (inv.status === "Overdue") {
      paymentStatus.style.color = "#dc2626";
      paymentStatus.style.background = "#fee2e2";
      paymentWrap.style.background = "#fef2f2";
    } else {
      paymentStatus.style.color = "#6b7280";
      paymentStatus.style.background = "#f3f4f6";
      paymentWrap.style.background = "#f9fafb";
    }

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  // Print
  printBtn.addEventListener("click", function () {
    window.print();
  });

  // Download
  downloadBtn.addEventListener("click", function () {
    showToast("Invoice downloaded");
  });
})();
