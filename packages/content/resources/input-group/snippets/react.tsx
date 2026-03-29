import { useState } from "react";

interface InputGroupProps {
  prepend?: React.ReactNode;
  append?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  label?: string;
  disabled?: boolean;
}

export function InputGroup({
  prepend,
  append,
  inputProps = {},
  label,
  disabled = false,
}: InputGroupProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = focused ? "#38bdf8" : "#2a2a2a";
  const shadow = focused ? "0 0 0 3px rgba(56,189,248,0.15)" : "none";

  return (
    <div style={{ opacity: disabled ? 0.5 : 1 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.375rem",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderRadius: "0.625rem",
          border: `1px solid ${borderColor}`,
          background: "#141414",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: shadow,
          overflow: "hidden",
        }}
      >
        {prepend && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 0.75rem",
              color: "#4a4a4a",
              fontSize: "0.8125rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
              borderRight: "1px solid #2a2a2a",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {prepend}
          </span>
        )}
        <input
          {...inputProps}
          disabled={disabled}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "0.625rem 0.75rem",
            background: "transparent",
            border: "none",
            color: "#f2f6ff",
            fontSize: "0.875rem",
            fontFamily: "inherit",
            outline: "none",
            ...(inputProps.style ?? {}),
          }}
        />
        {append && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 0.75rem",
              color: "#4a4a4a",
              fontSize: "0.8125rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
              borderLeft: "1px solid #2a2a2a",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {append}
          </span>
        )}
      </div>
    </div>
  );
}

/* Demo */
export default function InputGroupDemo() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("sk_live_a1b2c3d4e5f6").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M1 5l7 4 7-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

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
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.375rem" }}>
          Input Group
        </h1>
        <p style={{ color: "#475569", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Input with addon elements: icons, text, and buttons.
        </p>

        <InputGroup
          label="Search"
          prepend={<SearchIcon />}
          inputProps={{ placeholder: "Search resources..." }}
        />

        <InputGroup
          label="Website"
          prepend={<span style={{ color: "#64748b", fontWeight: 500 }}>https://</span>}
          inputProps={{ placeholder: "example.com" }}
        />

        <InputGroup
          label="Price"
          prepend={<span style={{ color: "#64748b", fontWeight: 500 }}>$</span>}
          append={
            <button
              type="button"
              style={{
                background: "rgba(56,189,248,0.1)",
                color: "#38bdf8",
                border: "none",
                padding: "0 0.75rem",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Apply
            </button>
          }
          inputProps={{ placeholder: "0.00", type: "number" }}
        />

        <InputGroup
          label="Email"
          prepend={<MailIcon />}
          append={<span style={{ color: "#64748b", fontWeight: 500 }}>@company.com</span>}
          inputProps={{ placeholder: "username" }}
        />

        <InputGroup
          label="API Key"
          append={
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "rgba(56,189,248,0.1)",
                color: "#38bdf8",
                border: "none",
                padding: "0 0.75rem",
                fontWeight: 600,
                fontSize: "0.8125rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          }
          inputProps={{ value: "sk_live_a1b2c3d4e5f6", readOnly: true }}
        />

        <InputGroup
          label="Disabled"
          prepend={<span style={{ color: "#64748b" }}>@</span>}
          inputProps={{ placeholder: "Not editable" }}
          disabled
        />
      </div>
    </div>
  );
}
