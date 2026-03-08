import { useState } from "react";

const PROFILES = [
  { name: "Sarah Chen", handle: "@sarahchen", avatar: "SC", color: "#bc8cff", followers: "12.4K" },
  { name: "Alex Rivera", handle: "@arivera", avatar: "AR", color: "#58a6ff", followers: "8.1K" },
  { name: "Jordan Kim", handle: "@jordankim", avatar: "JK", color: "#7ee787", followers: "3.2K" },
];

function ProfileCard({ name, handle, avatar, color, followers }: typeof PROFILES[0]) {
  const [following, setFollowing] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#0d1117] flex-shrink-0"
        style={{ background: color }}
      >
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#e6edf3] font-semibold text-sm truncate">{name}</p>
        <p className="text-[#8b949e] text-xs">{handle} · {followers} followers</p>
      </div>
      <button
        onClick={() => setFollowing((f) => !f)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
          following
            ? hover
              ? "bg-[#f85149]/10 border border-[#f85149]/40 text-[#f85149]"
              : "bg-[#21262d] border border-[#30363d] text-[#e6edf3]"
            : "bg-[#238636] border border-[#2ea043] text-white hover:bg-[#2ea043]"
        }`}
      >
        {following ? (hover ? "Unfollow" : "Following") : "Follow"}
      </button>
    </div>
  );
}

export default function FollowButtonRC() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-3">
        <h2 className="text-[#e6edf3] font-bold text-lg mb-4">Who to follow</h2>
        {PROFILES.map((p) => (
          <ProfileCard key={p.handle} {...p} />
        ))}
      </div>
    </div>
  );
}
