function streamInto(el, text, charDelay, onDone) {
  el.innerHTML = "";
  const cursor = document.createElement("span");
  cursor.className = "stream-cursor";
  el.appendChild(cursor);
  let i = 0;

  function tick() {
    if (i >= text.length) {
      cursor.remove();
      onDone?.();
      return;
    }
    cursor.insertAdjacentText("beforebegin", text[i++]);
    setTimeout(tick, charDelay + Math.random() * (charDelay * 0.5));
  }
  tick();
}

const TEXTS = {
  fast: "The model processes your prompt and generates a response token by token, streaming each word as it becomes available — typically at 80–150 tokens per second.",
  med: "Streaming text output creates a sense of speed and responsiveness, even when the actual generation takes several seconds. Users perceive streamed responses as faster.",
  slow: "Slow streaming feels deliberate — like the model is thinking carefully before each word.",
  code: "const response = await fetch('/api/chat', {\n  method: 'POST',\n  body: JSON.stringify({ message: userInput }),\n});\n\nconst reader = response.body.getReader();\nconst decoder = new TextDecoder();\n\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  output += decoder.decode(value);\n}",
};

function start() {
  const fast = document.getElementById("streamFast");
  const med = document.getElementById("streamMed");
  const slow = document.getElementById("streamSlow");
  const code = document.getElementById("streamCode");

  streamInto(fast, TEXTS.fast, 8);
  setTimeout(() => streamInto(med, TEXTS.med, 20), 300);
  setTimeout(() => streamInto(slow, TEXTS.slow, 50), 600);
  setTimeout(() => streamInto(code, TEXTS.code, 10), 900);
}

start();
document.getElementById("replayBtn").addEventListener("click", start);
