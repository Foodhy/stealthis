import { useState } from "react";

export function FormDraftAutosave() {
  const [value, setValue] = useState("");
  return (
    <form className="demo" onSubmit={(event) => event.preventDefault()}>
      <h2>Form Draft Autosave</h2>
      <label>
        {value.length ? "Ready" : "Enter a value"}
        <input value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
      <button type="submit">Continue</button>
    </form>
  );
}
