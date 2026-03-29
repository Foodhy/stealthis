<script>
const posts = [
  {
    avatar: "AK",
    avatarColor: "#38bdf8",
    title: "Alex Kim",
    time: "2 hours ago",
    content:
      "Just shipped the new dashboard redesign. The dark mode looks incredible with the glass morphism cards.",
    actions: ["Reply", "Like", "Share"],
    replies: [
      {
        avatar: "SR",
        avatarColor: "#22c55e",
        title: "Sara Rivera",
        time: "1 hour ago",
        content: "Looks amazing! Did you use the new backdrop-filter approach for the cards?",
        actions: ["Reply", "Like"],
        replies: [
          {
            avatar: "AK",
            avatarColor: "#38bdf8",
            title: "Alex Kim",
            time: "45 min ago",
            content:
              "Yes! backdrop-filter with saturate(1.6) gives a really nice effect on dark backgrounds.",
            actions: ["Reply", "Like"],
          },
        ],
      },
    ],
  },
  {
    avatar: "JD",
    avatarColor: "#a855f7",
    title: "Jordan Doe",
    time: "5 hours ago",
    content:
      "Anyone have experience with the new View Transitions API? Trying to implement cross-page animations.",
    actions: ["Reply", "Like", "Share"],
    replies: [
      {
        avatar: "MP",
        avatarColor: "#f59e0b",
        title: "Morgan Park",
        time: "3 hours ago",
        content:
          "Check out the Astro docs section on View Transitions -- great examples for MPA setups.",
        actions: ["Reply", "Like"],
        replies: [],
      },
    ],
  },
  {
    avatar: "TN",
    avatarColor: "#ef4444",
    title: "Taylor Nguyen",
    time: "1 day ago",
    content:
      "Published a new blog post on CSS container queries and how they change responsive design patterns. Link in bio.",
    actions: ["Reply", "Like", "Share"],
    replies: [],
  },
];
</script>

<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;font-family:Inter,system-ui,sans-serif;color:#f2f6ff;padding:2rem">
  <div style="width:100%;max-width:600px;display:flex;flex-direction:column;gap:1.25rem">
    <h1 style="font-size:1.5rem;font-weight:800;margin-bottom:0.375rem">Media Object</h1>
    <p style="color:#475569;font-size:0.875rem;margin-bottom:0.5rem">Avatar + content layout with nested replies.</p>

    {#each posts as post}
      <div style="display:flex;gap:0.875rem;padding:1rem;background:#141414;border:1px solid #1e1e1e;border-radius:0.75rem">
        <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:#0a0a0a;background:{post.avatarColor};flex-shrink:0;user-select:none">{post.avatar}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:baseline;gap:0.5rem;margin-bottom:0.25rem">
            <span style="font-size:0.875rem;font-weight:600;color:#f2f6ff">{post.title}</span>
            <span style="font-size:0.75rem;color:#4a4a4a">{post.time}</span>
          </div>
          <p style="font-size:0.8125rem;line-height:1.6;color:#94a3b8;margin:0">{post.content}</p>
          {#if post.actions.length}
            <div style="display:flex;gap:0.75rem;margin-top:0.5rem">
              {#each post.actions as a}
                <button style="background:none;border:none;font-size:0.75rem;font-weight:500;color:#4a4a4a;cursor:pointer;padding:0;font-family:inherit">{a}</button>
              {/each}
            </div>
          {/if}

          {#each post.replies as reply}
            <div style="display:flex;gap:0.875rem;padding:1rem;background:rgba(255,255,255,0.02);border:1px solid #1a1a1a;border-left:2px solid #2a2a2a;border-radius:0 0.75rem 0.75rem 0;margin-top:0.875rem">
              <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.6875rem;font-weight:700;color:#0a0a0a;background:{reply.avatarColor};flex-shrink:0;user-select:none">{reply.avatar}</div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:baseline;gap:0.5rem;margin-bottom:0.25rem">
                  <span style="font-size:0.875rem;font-weight:600;color:#f2f6ff">{reply.title}</span>
                  <span style="font-size:0.75rem;color:#4a4a4a">{reply.time}</span>
                </div>
                <p style="font-size:0.8125rem;line-height:1.6;color:#94a3b8;margin:0">{reply.content}</p>
                {#if reply.actions.length}
                  <div style="display:flex;gap:0.75rem;margin-top:0.5rem">
                    {#each reply.actions as a}
                      <button style="background:none;border:none;font-size:0.75rem;font-weight:500;color:#4a4a4a;cursor:pointer;padding:0;font-family:inherit">{a}</button>
                    {/each}
                  </div>
                {/if}

                {#if reply.replies}
                  {#each reply.replies as sub}
                    <div style="display:flex;gap:0.875rem;padding:1rem;background:rgba(255,255,255,0.02);border:1px solid #1a1a1a;border-left:2px solid #2a2a2a;border-radius:0 0.75rem 0.75rem 0;margin-top:0.875rem">
                      <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.6875rem;font-weight:700;color:#0a0a0a;background:{sub.avatarColor};flex-shrink:0;user-select:none">{sub.avatar}</div>
                      <div style="flex:1;min-width:0">
                        <div style="display:flex;align-items:baseline;gap:0.5rem;margin-bottom:0.25rem">
                          <span style="font-size:0.875rem;font-weight:600;color:#f2f6ff">{sub.title}</span>
                          <span style="font-size:0.75rem;color:#4a4a4a">{sub.time}</span>
                        </div>
                        <p style="font-size:0.8125rem;line-height:1.6;color:#94a3b8;margin:0">{sub.content}</p>
                        {#if sub.actions && sub.actions.length}
                          <div style="display:flex;gap:0.75rem;margin-top:0.5rem">
                            {#each sub.actions as a}
                              <button style="background:none;border:none;font-size:0.75rem;font-weight:500;color:#4a4a4a;cursor:pointer;padding:0;font-family:inherit">{a}</button>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
