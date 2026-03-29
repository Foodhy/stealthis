import { useState } from "react";

const FEED = [
  {
    id: 1,
    user: { name: "Sarah Chen", handle: "@sarahchen", avatar: "SC", color: "#bc8cff" },
    content:
      "Just shipped a new feature: real-time collaboration with CRDT! The engineering challenge was immense but totally worth it. 🚀",
    time: "2m ago",
    likes: 47,
    comments: 12,
    reposts: 8,
    liked: false,
  },
  {
    id: 2,
    user: { name: "Alex Rivera", handle: "@arivera", avatar: "AR", color: "#58a6ff" },
    content:
      "Hot take: The best documentation is code that doesn't need documentation. Write self-documenting code first, comments second.",
    time: "18m ago",
    likes: 128,
    comments: 34,
    reposts: 22,
    liked: true,
  },
  {
    id: 3,
    user: { name: "Jordan Kim", handle: "@jordankim", avatar: "JK", color: "#7ee787" },
    content:
      "Spent 3 hours debugging a race condition only to find it was a missing `await`. We've all been there. 😅",
    time: "1h ago",
    likes: 215,
    comments: 41,
    reposts: 67,
    liked: false,
  },
];

type Post = (typeof FEED)[0];

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);

  function toggleLike() {
    setLiked((l) => !l);
    setLikes((c) => (liked ? c - 1 : c + 1));
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-[#0d1117] flex-shrink-0"
          style={{ background: post.user.color }}
        >
          {post.user.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[#e6edf3] font-semibold text-sm">{post.user.name}</span>
            <span className="text-[#8b949e] text-xs">{post.user.handle}</span>
            <span className="text-[#484f58] text-xs ml-auto">{post.time}</span>
          </div>
          <p className="text-[#e6edf3] text-sm mt-1.5 leading-relaxed">{post.content}</p>
        </div>
      </div>
      <div className="flex items-center gap-5 ml-12">
        {[
          {
            icon: (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={liked ? "#ff6b6b" : "none"}
                stroke={liked ? "#ff6b6b" : "#8b949e"}
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            ),
            count: likes,
            active: liked,
            onClick: toggleLike,
            activeColor: "#ff6b6b",
          },
          {
            icon: (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b949e"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ),
            count: post.comments,
            active: false,
            onClick: () => {},
            activeColor: "#58a6ff",
          },
          {
            icon: (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b949e"
                strokeWidth="2"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            ),
            count: post.reposts,
            active: false,
            onClick: () => {},
            activeColor: "#7ee787",
          },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            {action.icon}
            <span style={{ color: action.active ? action.activeColor : undefined }}>
              {action.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SocialFeedRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex justify-center p-6">
      <div className="w-full max-w-lg space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[#e6edf3] font-bold text-lg">Feed</h2>
          <button className="text-xs text-[#58a6ff] hover:underline">Latest</button>
        </div>
        {FEED.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
