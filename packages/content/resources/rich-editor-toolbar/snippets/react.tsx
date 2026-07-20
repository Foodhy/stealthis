import { useState } from "react";

export function RichEditorToolbar() {
  const [value, setValue] = useState("");
  return (
    <section className="demo">
      <h2>Editor Toolbar</h2>
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => setValue(event.currentTarget.textContent ?? "")}
        style={{ minHeight: 140, outline: "1px solid #39527d", padding: 16 }}
      />{" "}
      <p>{value.length} characters</p>
    </section>
  );
}
