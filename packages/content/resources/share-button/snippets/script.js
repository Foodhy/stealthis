const shareToggle = document.getElementById("share-toggle");
const shareMenu = document.getElementById("share-menu");
const closeShare = document.getElementById("close-share");
const copyLinkBtn = document.getElementById("copy-link");

const shareData = {
  title: "Check this out!",
  text: "I found this amazing component on Stealthis.",
  url: window.location.href,
};

async function handleShare() {
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("Error sharing:", err);
      toggleMenu();
    }
  } else {
    toggleMenu();
  }
}

function toggleMenu() {
  shareMenu.classList.toggle("active");
}

shareToggle.addEventListener("click", handleShare);
closeShare.addEventListener("click", toggleMenu);

// Social Links Implementation
document.querySelectorAll(".share-opt").forEach((opt) => {
  const platform = opt.dataset.platform;
  if (!platform) return;

  opt.addEventListener("click", (e) => {
    e.preventDefault();
    let url = "";
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedText = encodeURIComponent(shareData.text);

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    window.open(url, "_blank", "width=600,height=400");
    toggleMenu();
  });
});

copyLinkBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(shareData.url).then(() => {
    const originalText = copyLinkBtn.textContent;
    copyLinkBtn.textContent = "Link Copied!";
    setTimeout(() => {
      copyLinkBtn.textContent = originalText;
      toggleMenu();
    }, 1500);
  });
});

// Close menu when clicking outside
window.addEventListener("click", (e) => {
  if (!shareMenu.contains(e.target) && !shareToggle.contains(e.target)) {
    shareMenu.classList.remove("active");
  }
});
