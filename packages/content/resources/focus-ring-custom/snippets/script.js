// Show "mouse" vs "keyboard" mode indicator
let usingKeyboard = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") usingKeyboard = true;
});

document.addEventListener("mousedown", () => {
  usingKeyboard = false;
});
