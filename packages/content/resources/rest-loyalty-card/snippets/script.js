const STAMPS = 10;
let count = 4; // start with 4 stamps already

const stamps = document.getElementById("stamps");
const card = document.getElementById("card");
const stampCount = document.getElementById("stampCount");
const hint = document.getElementById("hint");
const rewardFoot = document.getElementById("rewardFoot");

function code() {
  const seg = () => Math.floor(1000 + Math.random() * 9000);
  return `CASA-OLIVAR-${seg()}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
}

function render() {
  stamps.innerHTML = Array.from({ length: STAMPS }, (_, i) => {
    const stamped = i < count;
    return `<li class="${stamped ? "is-stamped" : ""}" data-i="${i}">${stamped ? "" : i + 1}</li>`;
  }).join("");
  stampCount.textContent = count;

  if (count >= STAMPS) {
    card.dataset.flipped = "true";
    rewardFoot.textContent = `Code · ${code()}`;
    hint.textContent = "Reward unlocked — tap a button or Reset.";
  } else {
    card.dataset.flipped = "false";
    hint.textContent =
      count === 0
        ? "Tap each stamp to register a visit."
        : `${STAMPS - count} more visit${STAMPS - count === 1 ? "" : "s"} to a free tarta.`;
  }
}

stamps.addEventListener("click", (e) => {
  const li = e.target.closest("[data-i]");
  if (!li) return;
  const i = Number(li.dataset.i);
  if (i === count) {
    count = Math.min(STAMPS, count + 1);
    render();
  } else if (i < count) {
    // Tap an existing stamp to "undo" the most recent (only the latest)
    if (i === count - 1) {
      count -= 1;
      render();
    }
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  count = 0;
  render();
});

document.getElementById("laterBtn").addEventListener("click", () => {
  hint.textContent = "Saved · we'll remind you on your next visit.";
});
document.getElementById("redeemBtn").addEventListener("click", () => {
  hint.textContent = "Redeemed · enjoy the tarta!";
  count = 0;
  render();
});

render();
