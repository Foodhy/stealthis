import { type CSSProperties } from "react";

interface TweetCardProps {
  username: string;
  handle: string;
  text: string;
  avatar?: string;
  verified?: boolean;
  likes?: number;
  retweets?: number;
  replies?: number;
  timestamp?: string;
}

export function TweetCard({
  username,
  handle,
  text,
  avatar,
  verified = false,
  likes = 0,
  retweets = 0,
  replies = 0,
  timestamp = "3:42 PM \u00b7 Mar 25, 2026",
}: TweetCardProps) {
  const cardStyle: CSSProperties = {
    width: "min(480px, calc(100vw - 2rem))",
    padding: "1.5rem",
    borderRadius: "1rem",
    background: "#16181c",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "0.875rem",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const metricStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: "0.8125rem",
    color: "#71767b",
    cursor: "pointer",
    transition: "color 0.2s ease",
    background: "none",
    border: "none",
    padding: 0,
  };

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <img
          src={avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${handle}`}
          alt={`${username} avatar`}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            objectFit: "cover",
            background: "#2f3336",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#e7e9ea",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              lineHeight: 1.3,
            }}
          >
            {username}
            {verified && (
              <svg viewBox="0 0 24 24" width={16} height={16}>
                <path
                  fill="#1d9bf0"
                  d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81C14.67 2.88 13.43 2 12 2s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81C9.33 21.12 10.57 22 12 22s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91C21.12 14.67 22 13.43 22 12zm-11.07 4.83-3.54-3.54 1.41-1.41 2.13 2.12 4.24-4.24 1.41 1.41-5.65 5.66z"
                />
              </svg>
            )}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "#71767b", lineHeight: 1.3 }}>
            @{handle}
          </div>
        </div>
        {/* X Logo */}
        <svg viewBox="0 0 24 24" width={20} height={20} style={{ opacity: 0.6, flexShrink: 0 }}>
          <path
            fill="#71767b"
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      </div>

      {/* Tweet text */}
      <p
        style={{
          fontSize: "0.9375rem",
          lineHeight: 1.55,
          color: "#e7e9ea",
          margin: 0,
          wordWrap: "break-word",
        }}
      >
        {text}
      </p>

      {/* Timestamp */}
      <div style={{ fontSize: "0.8125rem", color: "#71767b" }}>{timestamp}</div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Metrics */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <button type="button" style={metricStyle} aria-label="Like">
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path
              fill="currentColor"
              d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.89 4.3-2.46 5.81l-5.84 5.56a2.64 2.64 0 0 1-3.62-.02l-5.88-5.6A8.12 8.12 0 0 1 1.751 10zm8.005-6a5.997 5.997 0 0 0-5.996 6c0 1.68.7 3.27 1.93 4.44l5.88 5.6c.24.22.6.22.84-.02l5.84-5.56a6.13 6.13 0 0 0 1.87-4.41C20.14 6.46 17.72 4 14.75 4H9.756z"
            />
          </svg>
          <span>{formatNumber(likes)}</span>
        </button>
        <button type="button" style={metricStyle} aria-label="Retweet">
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path
              fill="currentColor"
              d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"
            />
          </svg>
          <span>{formatNumber(retweets)}</span>
        </button>
        <button type="button" style={metricStyle} aria-label="Reply">
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path
              fill="currentColor"
              d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.89 4.3-2.46 5.81l-5.84 5.56a2.64 2.64 0 0 1-3.62-.02l-5.88-5.6A8.12 8.12 0 0 1 1.751 10zm8.005-6a5.997 5.997 0 0 0-5.996 6c0 1.68.7 3.27 1.93 4.44l5.88 5.6c.24.22.6.22.84-.02l5.84-5.56a6.13 6.13 0 0 0 1.87-4.41C20.14 6.46 17.72 4 14.75 4H9.756z"
            />
          </svg>
          <span>{formatNumber(replies)}</span>
        </button>
      </div>
    </div>
  );
}

// Demo usage
export default function TweetCardDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
      }}
    >
      <TweetCard
        username="Sarah Chen"
        handle="sarahchen_dev"
        text="Just shipped the new dark mode for our component library. The glassmorphism cards look absolutely stunning against the dark backgrounds. #webdev #ui #css"
        verified
        likes={2847}
        retweets={482}
        replies={156}
        timestamp="3:42 PM &middot; Mar 25, 2026"
      />
    </div>
  );
}
