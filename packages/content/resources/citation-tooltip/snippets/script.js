const CITATIONS = {
  1: {
    title: "Attention Is All You Need",
    domain: "arxiv.org",
    excerpt:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
    url: "#",
  },
  2: {
    title: "Scaling Laws for Neural Language Models",
    domain: "arxiv.org",
    excerpt:
      "We study empirical scaling laws for language model performance on the cross-entropy loss. The loss scales as a power-law with model size, dataset size, and the amount of compute used for training.",
    url: "#",
  },
  3: {
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    domain: "arxiv.org",
    excerpt:
      "We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG), combining parametric and non-parametric memory for language generation.",
    url: "#",
  },
  4: {
    title: "RAG vs Fine-Tuning: Enterprise Evaluation",
    domain: "research.google.com",
    excerpt:
      "In enterprise deployments, RAG consistently outperforms fine-tuning for tasks requiring frequently updated domain knowledge, while maintaining lower operational costs.",
    url: "#",
  },
  5: {
    title: "Constitutional AI: Harmlessness from AI Feedback",
    domain: "anthropic.com",
    excerpt:
      "We propose a method for training a harmless AI assistant without any human labels identifying harmful outputs, using a set of principles to guide revisions during supervised learning and RL.",
    url: "#",
  },
};

const tooltip = document.getElementById("citTooltip");
let activeCit = null;

function showTooltip(el, id) {
  const data = CITATIONS[id];
  if (!data) return;

  document.getElementById("citNum").textContent = `[${id}]`;
  document.getElementById("citDomain").textContent = data.domain;
  document.getElementById("citTitle").textContent = data.title;
  document.getElementById("citExcerpt").textContent = data.excerpt;
  document.getElementById("citLink").href = data.url;

  tooltip.hidden = false;

  // Position: prefer above, fallback below
  const rect = el.getBoundingClientRect();
  const tw = 300;
  const th = tooltip.offsetHeight || 160;
  let left = rect.left + rect.width / 2 - tw / 2;
  let top = rect.top - th - 8;

  if (top < 8) top = rect.bottom + 8;
  if (left < 8) left = 8;
  if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8;

  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
}

function hideTooltip() {
  tooltip.hidden = true;
  if (activeCit) {
    activeCit.classList.remove("active");
    activeCit = null;
  }
}

document.querySelectorAll(".citation").forEach((cit) => {
  const id = parseInt(cit.dataset.id);

  cit.addEventListener("mouseenter", () => {
    if (activeCit) activeCit.classList.remove("active");
    activeCit = cit;
    cit.classList.add("active");
    showTooltip(cit, id);
  });

  cit.addEventListener("focus", () => {
    if (activeCit) activeCit.classList.remove("active");
    activeCit = cit;
    cit.classList.add("active");
    showTooltip(cit, id);
  });

  cit.addEventListener("mouseleave", () => {
    setTimeout(() => {
      if (!tooltip.matches(":hover")) hideTooltip();
    }, 100);
  });

  cit.addEventListener("blur", () => {
    setTimeout(() => {
      if (!tooltip.contains(document.activeElement)) hideTooltip();
    }, 100);
  });
});

tooltip.addEventListener("mouseleave", hideTooltip);

document.addEventListener("click", (e) => {
  if (!e.target.closest(".citation") && !e.target.closest(".cit-tooltip")) hideTooltip();
});
