(() => {
  const skeleton = document.getElementById("skeleton");
  const content = document.getElementById("content");
  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const items = document.getElementById("items");

  const payload = {
    title: "Team Activity",
    subtitle: "Fetched in 1.4s from the mocked API",
    cards: [
      { title: "Deploy finished", body: "Production release completed successfully." },
      { title: "New signups", body: "26 new accounts created in the last hour." },
      { title: "Incident resolved", body: "Payment gateway warning closed." },
    ],
  };

  setTimeout(() => {
    title.textContent = payload.title;
    subtitle.textContent = payload.subtitle;

    items.innerHTML = "";
    for (const card of payload.cards) {
      const article = document.createElement("article");
      article.className = "content-card";
      article.innerHTML = `<h3>${card.title}</h3><p>${card.body}</p>`;
      items.appendChild(article);
    }

    skeleton.hidden = true;
    content.hidden = false;
  }, 1400);
})();
