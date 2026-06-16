(function () {
  "use strict";

  // ----- Fictional issue data -----
  const SECTIONS = [
    {
      id: "editorial",
      name: "Editorial",
      articles: [
        {
          id: "ed1",
          title: "Reproducibility is a measurement, not a virtue",
          authors: "Mara T. Lindqvist",
          affil: "Editor-in-Chief, Marlowe Institute Press",
          pages: "401–403",
          doi: "10.48391/jcb.2026.1204.0401",
          oa: true,
          keywords: "reproducibility, FAIR data, editorial policy",
          abstract:
            "Computational biophysics produces results that should, in principle, be perfectly reproducible — yet our 2025 audit found that only 41% of accepted manuscripts shipped runnable inputs. This editorial argues that reproducibility ought to be reported as a quantitative coverage metric (fraction of figures regenerable from deposited artifacts) rather than treated as an aspirational badge.",
        },
      ],
    },
    {
      id: "research",
      name: "Research Articles",
      articles: [
        {
          id: "ra1",
          title:
            "Coarse-grained self-assembly of asymmetric lipid bilayers under lateral tension",
          authors: "C. O. Okonkwo, L. Halvorsen, R. M. Patel",
          affil: "Dept. of Molecular Physics, Brindlewood University; Helix Lab, ETH-adjacent Consortium",
          pages: "432–451",
          doi: "10.48391/jcb.2026.1204.0432",
          oa: true,
          keywords: "MARTINI, membrane mechanics, area-per-lipid, tension",
          abstract:
            "We report 12 µs coarse-grained trajectories of asymmetric POPC/POPE bilayers across lateral tensions of 0–8 mN·m⁻¹. The bending modulus κ scales as κ ≈ 21.4 ± 0.7 kBT at zero tension and softens by 18% near the rupture threshold. A simple continuum fit reproduces the measured area-per-lipid (0.642 nm²) to within 1.3%, suggesting that mesoscale elasticity emerges robustly from the underlying bead topology.",
        },
        {
          id: "ra2",
          title:
            "A message-passing force field for transition-metal active sites with sub-kcal accuracy",
          authors: "S. Yamamoto, D. Reyes-Cardona, A. Bergström, P. Q. Nwosu",
          affil: "Center for Learned Potentials, Aurelia Institute of Technology",
          pages: "452–470",
          doi: "10.48391/jcb.2026.1204.0452",
          oa: false,
          keywords: "machine-learned potentials, DFT, metalloenzymes, MAE",
          abstract:
            "We train an equivariant message-passing network on 1.2 million DFT single points spanning copper- and iron-centered cofactors. On a held-out reaction set the model attains a mean absolute energy error of 0.71 kcal·mol⁻¹ and force error of 38 meV·Å⁻¹, enabling nanosecond reactive dynamics at near-DFT fidelity and a 4,200× speedup over the reference functional.",
        },
        {
          id: "ra3",
          title:
            "Allosteric coupling in a designed PDZ domain mapped by perturbation-response scanning",
          authors: "E. Voronova, T. K. Adeyemi",
          affil: "Structural Dynamics Group, Northfield Polytechnic",
          pages: "471–486",
          doi: "10.48391/jcb.2026.1204.0471",
          oa: true,
          keywords: "allostery, elastic network, PRS, protein design",
          abstract:
            "Using perturbation-response scanning over 3.4 µs of all-atom dynamics, we identify a contiguous allosteric channel linking the ligand-binding groove to a distal helix in a de-novo PDZ variant. Residue F18 acts as the dominant relay (response coefficient 0.83), and its alanine substitution abolishes 71% of measured long-range coupling in silico.",
        },
        {
          id: "ra4",
          title:
            "Hydration shell relaxation governs glass-forming behavior in trehalose-protein matrices",
          authors: "H. Nakamura, B. O. Castellano, F. Lindgren",
          affil: "Soft Matter Division, Kestrel National Laboratory",
          pages: "487–501",
          doi: "10.48391/jcb.2026.1204.0487",
          oa: false,
          keywords: "vitrification, cryopreservation, dielectric relaxation",
          abstract:
            "Combining 8 µs of simulation with a two-state relaxation model, we show that the glass-transition temperature of trehalose-lysozyme matrices is set by the slowest hydration-shell reorientation mode (τ ≈ 142 ns at 245 K). The result rationalizes long-standing discrepancies between calorimetric and dielectric estimates of Tg by 9–14 K.",
        },
      ],
    },
    {
      id: "reviews",
      name: "Reviews",
      articles: [
        {
          id: "rv1",
          title:
            "Free-energy methods at scale: a decade of enhanced sampling, 2016–2026",
          authors: "G. Marchetti, N. P. Osei, J. Whitlock",
          affil: "Theory Consortium, Marlowe Institute",
          pages: "405–428",
          doi: "10.48391/jcb.2026.1204.0405",
          oa: true,
          keywords: "metadynamics, replica exchange, alchemy, convergence",
          abstract:
            "We survey ten years of enhanced-sampling methodology, contrasting collective-variable, tempering, and alchemical families across 60+ benchmark systems. We propose a unified convergence diagnostic — the effective transition count per wall-clock hour — and tabulate it for the major open-source engines, finding a 30× spread that is largely attributable to integrator choice rather than algorithm class.",
        },
        {
          id: "rv2",
          title:
            "Generative models for protein conformational ensembles: promise and pitfalls",
          authors: "A. Solberg, M. R. Iyer",
          affil: "Generative Biophysics Lab, Aurelia Institute of Technology",
          pages: "502–518",
          doi: "10.48391/jcb.2026.1204.0502",
          oa: true,
          keywords: "diffusion models, ensembles, Boltzmann generators",
          abstract:
            "Generative samplers promise Boltzmann-weighted ensembles without long trajectories, but uncritical use risks mode collapse and thermodynamic inconsistency. We review the current model zoo, define three falsifiable validation tests (free-energy closure, observable recovery, and unseen-state extrapolation), and apply them to four published architectures.",
        },
      ],
    },
    {
      id: "letters",
      name: "Letters",
      articles: [
        {
          id: "lt1",
          title:
            "A 200-line drop-in checkpoint format that halves restart overhead",
          authors: "K. Brennan, P. Q. Nwosu",
          affil: "HPC Tooling Group, Brindlewood University",
          pages: "429–431",
          doi: "10.48391/jcb.2026.1204.0429",
          oa: true,
          keywords: "checkpointing, I/O, HPC, tooling",
          abstract:
            "We describe a compact, zero-dependency checkpoint container that interleaves coordinate and integrator state with content-addressed deduplication. Across three production codes it reduced restart wall-time by 49 ± 6% and on-disk footprint by 2.7× with no measurable runtime penalty.",
        },
        {
          id: "lt2",
          title:
            "Comment on 'Anomalous diffusion in crowded cytoplasm' (JCB 12:2, 211)",
          authors: "R. del Bosque",
          affil: "Independent researcher, Lisbon",
          pages: "430–431",
          doi: "10.48391/jcb.2026.1204.0430b",
          oa: false,
          keywords: "anomalous diffusion, crowding, comment",
          abstract:
            "The original analysis fits a single anomalous exponent across two decades of lag time. We show that a two-regime fit reduces the residual by 62% and recovers a Fickian plateau at long times, implying that the reported subdiffusion is a transient rather than an asymptotic property of the crowded medium.",
        },
      ],
    },
  ];

  // ----- DOM helpers -----
  const tocEl = document.getElementById("toc");
  const emptyEl = document.getElementById("emptyState");
  const searchInput = document.getElementById("searchInput");
  const resultCount = document.getElementById("resultCount");
  const toastEl = document.getElementById("toast");

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }

  // ----- Render -----
  function articleNode(a, typeName) {
    const li = document.createElement("article");
    li.className = "article";
    li.dataset.access = a.oa ? "oa" : "closed";
    li.dataset.search = (
      a.title + " " + a.authors + " " + a.keywords + " " + a.affil
    ).toLowerCase();

    const accessBadge = a.oa
      ? '<span class="badge badge--oa" title="Open access, CC BY 4.0">Open access</span>'
      : '<span class="badge badge--closed" title="Subscription / institutional access">Subscription</span>';

    li.innerHTML = `
      <div class="article__top">
        <div>
          <span class="badge badge--type">${esc(typeName)}</span>
          <h4 class="article__title"><a href="#${a.id}">${esc(a.title)}</a></h4>
          <p class="article__authors">${esc(a.authors)}</p>
          <p class="article__affil">${esc(a.affil)}</p>
        </div>
        <div class="article__meta">
          <span class="article__pages">pp. ${esc(a.pages)}</span>
          <span class="article__id">Art. ${esc(a.id.toUpperCase())}</span>
        </div>
      </div>
      <div class="article__actions">
        ${accessBadge}
        <button class="action action--ghost" type="button" aria-expanded="false" aria-controls="abs-${a.id}" data-abs="${a.id}">
          Abstract
        </button>
        <a class="action" href="#" data-pdf="${esc(a.pages)}">PDF</a>
        <span class="action doi" data-doi="${esc(a.doi)}" role="button" tabindex="0" title="Copy DOI">doi:${esc(a.doi)}</span>
      </div>
      <div class="abstract" id="abs-${a.id}" role="region" aria-label="Abstract for ${esc(a.title)}">
        <h4>Abstract</h4>
        <p>${esc(a.abstract)}</p>
        <p class="kw"><b>Keywords:</b> ${esc(a.keywords)}</p>
      </div>
    `;
    return li;
  }

  function render() {
    tocEl.innerHTML = "";
    SECTIONS.forEach((sec) => {
      const section = document.createElement("section");
      section.className = "section";
      section.dataset.section = sec.id;

      const head = document.createElement("div");
      head.className = "section__head";
      head.innerHTML = `
        <h3 class="section__title">${esc(sec.name)}</h3>
        <span class="section__count" data-sec-count>${sec.articles.length} article${sec.articles.length === 1 ? "" : "s"}</span>
      `;
      section.appendChild(head);

      sec.articles.forEach((a) => section.appendChild(articleNode(a, sec.name)));
      tocEl.appendChild(section);
    });
  }

  render();

  // ----- Abstract toggle (event delegation) -----
  tocEl.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-abs]");
    if (toggle) {
      const panel = document.getElementById("abs-" + toggle.dataset.abs);
      const open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Hide abstract" : "Abstract";
      return;
    }

    const pdf = e.target.closest("[data-pdf]");
    if (pdf) {
      e.preventDefault();
      toast("Demo only — would download PDF (pp. " + pdf.dataset.pdf + ")");
      return;
    }

    const doi = e.target.closest("[data-doi]");
    if (doi) {
      copyDoi(doi.dataset.doi);
    }
  });

  tocEl.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.doi) {
      e.preventDefault();
      copyDoi(e.target.dataset.doi);
    }
  });

  function copyDoi(doi) {
    const text = "https://doi.org/" + doi;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast("Copied DOI link to clipboard"),
        () => toast("doi:" + doi)
      );
    } else {
      toast("doi:" + doi);
    }
  }

  // ----- Filtering -----
  let accessFilter = "all";

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    let visibleTotal = 0;

    document.querySelectorAll(".section").forEach((section) => {
      let sectionVisible = 0;
      section.querySelectorAll(".article").forEach((art) => {
        const matchAccess =
          accessFilter === "all" || art.dataset.access === accessFilter;
        const matchSearch = !q || art.dataset.search.indexOf(q) !== -1;
        const show = matchAccess && matchSearch;
        art.hidden = !show;
        if (show) sectionVisible++;
      });
      const counter = section.querySelector("[data-sec-count]");
      counter.textContent =
        sectionVisible + " article" + (sectionVisible === 1 ? "" : "s");
      section.hidden = sectionVisible === 0;
      visibleTotal += sectionVisible;
    });

    resultCount.textContent =
      visibleTotal + " article" + (visibleTotal === 1 ? "" : "s");
    emptyEl.hidden = visibleTotal !== 0;
  }

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      accessFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  let searchTimer = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 120);
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    searchInput.value = "";
    accessFilter = "all";
    document.querySelectorAll(".chip").forEach((c) => {
      const on = c.dataset.filter === "all";
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    applyFilters();
    searchInput.focus();
  });

  // ----- Issue selector -----
  const issueSelect = document.getElementById("issueSelect");
  issueSelect.addEventListener("change", () => {
    const label = issueSelect.options[issueSelect.selectedIndex].text;
    if (issueSelect.value === "12-4") {
      toast("Showing current issue: " + label);
    } else {
      toast("Demo only — archived issue: " + label);
    }
  });

  // ----- Download full issue -----
  document.getElementById("downloadIssue").addEventListener("click", () => {
    toast("Demo only — would download full issue PDF (38.2 MB)");
  });
})();
