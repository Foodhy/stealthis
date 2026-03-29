import { useState, useRef, useEffect, useCallback } from "react";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string, label: string) => void;
  placeholder?: string;
  label?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
}: ComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedValue, setSelectedValue] = useState(value ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

  const open = () => {
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const select = (opt: ComboboxOption) => {
    setSelectedValue(opt.value);
    setQuery(opt.label);
    onChange?.(opt.value, opt.label);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) open();
      setActiveIndex((i) => (i + 1 >= filtered.length ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) open();
      setActiveIndex((i) => (i - 1 < 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        select(filtered[activeIndex]);
      }
    } else if (e.key === "Escape") {
      close();
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.5rem",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onFocus={open}
          onChange={(e) => {
            setQuery(e.target.value);
            open();
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            padding: "0.625rem 2.25rem 0.625rem 0.875rem",
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: "0.625rem",
            color: "#f2f6ff",
            fontSize: "0.875rem",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            right: "0.625rem",
            top: "50%",
            transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
            color: "#4a4a4a",
            pointerEvents: "none",
            transition: "transform 0.2s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 0.375rem)",
            left: 0,
            right: 0,
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: "0.625rem",
            maxHeight: "14rem",
            overflowY: "auto",
            listStyle: "none",
            zIndex: 50,
            padding: 0,
            margin: 0,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {filtered.length === 0 ? (
            <li
              style={{
                padding: "0.75rem 0.875rem",
                fontSize: "0.8125rem",
                color: "#4a4a4a",
                textAlign: "center",
              }}
            >
              No results found
            </li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={selectedValue === opt.value}
                onClick={() => select(opt)}
                onMouseEnter={() => setActiveIndex(i)}
                style={{
                  padding: "0.5rem 0.875rem",
                  fontSize: "0.875rem",
                  color:
                    i === activeIndex
                      ? "#38bdf8"
                      : selectedValue === opt.value
                        ? "#38bdf8"
                        : "#94a3b8",
                  background: i === activeIndex ? "rgba(56,189,248,0.12)" : "transparent",
                  cursor: "pointer",
                  fontWeight: selectedValue === opt.value ? 600 : 400,
                  transition: "background 0.1s, color 0.1s",
                }}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/* Demo */
export default function ComboboxDemo() {
  const [selected, setSelected] = useState("");

  const frameworks = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
    { value: "solid", label: "SolidJS" },
    { value: "astro", label: "Astro" },
    { value: "next", label: "Next.js" },
    { value: "nuxt", label: "Nuxt" },
    { value: "remix", label: "Remix" },
    { value: "qwik", label: "Qwik" },
  ];

  const countries = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "jp", label: "Japan" },
    { value: "au", label: "Australia" },
    { value: "br", label: "Brazil" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#f2f6ff",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>Combobox</h1>
        <p style={{ color: "#475569", fontSize: "0.875rem", marginBottom: "2rem" }}>
          Searchable dropdown select with keyboard navigation.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <Combobox
            label="Framework"
            options={frameworks}
            placeholder="Search frameworks..."
            onChange={(v) => setSelected(v)}
          />
          <Combobox label="Country" options={countries} placeholder="Search countries..." />
        </div>

        {selected && (
          <p style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
            Selected framework: <strong style={{ color: "#38bdf8" }}>{selected}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
