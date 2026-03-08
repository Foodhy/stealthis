import { useState, useEffect } from "react";

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#8b949e]"
          style={{ animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

type Message = { id: number; user: string; avatar: string; color: string; text: string; own?: boolean };

const MESSAGES: Message[] = [
  { id: 1, user: "Sarah", avatar: "SC", color: "#bc8cff", text: "Hey! Did you get a chance to review the PR?" },
  { id: 2, user: "You", avatar: "YO", color: "#7ee787", text: "Yes, looks great! Just left a few comments.", own: true },
  { id: 3, user: "Sarah", avatar: "SC", color: "#bc8cff", text: "Perfect, I'll address them now" },
];

export default function TypingIndicatorRC() {
  const [typingUser, setTypingUser] = useState<string | null>("Sarah");
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [input, setInput] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      setMessages((m) => [...m, {
        id: Date.now(),
        user: "Sarah",
        avatar: "SC",
        color: "#bc8cff",
        text: "Should be ready in a few minutes!",
      }]);
      setTypingUser(null);
    }, 3000);
    return () => clearTimeout(id);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && input.trim()) {
      setMessages((m) => [...m, { id: Date.now(), user: "You", avatar: "YO", color: "#7ee787", text: input.trim(), own: true }]);
      setInput("");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden flex flex-col h-[480px]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#bc8cff] flex items-center justify-center text-xs font-bold text-[#0d1117]">SC</div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#7ee787] rounded-full border-2 border-[#161b22]" />
          </div>
          <div>
            <p className="text-[#e6edf3] text-sm font-semibold">Sarah Chen</p>
            <p className="text-[#7ee787] text-xs">{typingUser ? "typing…" : "online"}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.own ? "flex-row-reverse" : ""}`}>
              {!msg.own && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0d1117] flex-shrink-0" style={{ background: msg.color }}>
                  {msg.avatar}
                </div>
              )}
              <div
                className={`px-3 py-2 rounded-2xl text-sm max-w-[70%] ${
                  msg.own
                    ? "bg-[#238636] text-white rounded-br-sm"
                    : "bg-[#21262d] text-[#e6edf3] rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {typingUser && (
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-[#bc8cff] flex items-center justify-center text-[10px] font-bold text-[#0d1117]">SC</div>
              <div className="bg-[#21262d] px-4 py-3 rounded-2xl rounded-bl-sm">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-[#30363d]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2 text-[#e6edf3] text-sm placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
      </div>

      <style>{`
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
