import { useState } from "react";

type Comment = { id: number; user: string; avatar: string; color: string; text: string; time: string; likes: number };

const INITIAL: Comment[] = [
  { id: 1, user: "Sarah Chen", avatar: "SC", color: "#bc8cff", text: "This is exactly what I was looking for! Clean API design.", time: "2h ago", likes: 12 },
  { id: 2, user: "Alex Rivera", avatar: "AR", color: "#58a6ff", text: "Great implementation. One suggestion: add keyboard shortcut support.", time: "45m ago", likes: 7 },
];

function CommentItem({ comment, onLike }: { comment: Comment; onLike: () => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#0d1117] flex-shrink-0"
        style={{ background: comment.color }}
      >
        {comment.avatar}
      </div>
      <div className="flex-1">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[#e6edf3] font-semibold text-sm">{comment.user}</span>
            <span className="text-[#484f58] text-xs">{comment.time}</span>
          </div>
          <p className="text-[#8b949e] text-sm leading-relaxed">{comment.text}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 ml-1">
          <button
            onClick={() => { setLiked((l) => !l); onLike(); }}
            className={`text-xs transition-colors ${liked ? "text-[#ff6b6b]" : "text-[#484f58] hover:text-[#8b949e]"}`}
          >
            {liked ? "♥" : "♡"} {comment.likes + (liked ? 1 : 0)}
          </button>
          <button className="text-xs text-[#484f58] hover:text-[#8b949e] transition-colors">Reply</button>
        </div>
      </div>
    </div>
  );
}

export default function CommentBoxRC() {
  const [comments, setComments] = useState<Comment[]>(INITIAL);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setComments((prev) => [
        ...prev,
        { id: Date.now(), user: "You", avatar: "YO", color: "#7ee787", text: text.trim(), time: "just now", likes: 0 },
      ]);
      setText("");
      setSubmitting(false);
    }, 500);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex justify-center p-6">
      <div className="w-full max-w-lg">
        <h2 className="text-[#e6edf3] font-bold text-lg mb-5">{comments.length} Comments</h2>

        <div className="space-y-4 mb-6">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onLike={() => {}}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[#7ee787] flex items-center justify-center text-xs font-bold text-[#0d1117] flex-shrink-0 mt-0.5">
            YO
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
              placeholder="Add a comment…"
              rows={3}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] placeholder-[#484f58] text-sm resize-none focus:outline-none focus:border-[#58a6ff] transition-colors"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-[#484f58]">⌘↵ to submit</span>
              <button
                onClick={submit}
                disabled={!text.trim() || submitting}
                className="px-4 py-1.5 bg-[#238636] border border-[#2ea043] text-white text-sm rounded-lg font-semibold disabled:opacity-40 hover:bg-[#2ea043] transition-colors"
              >
                {submitting ? "Posting…" : "Comment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
