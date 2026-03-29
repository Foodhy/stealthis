<script>
const FEED = [
  {
    id: 1,
    user: { name: "Sarah Chen", handle: "@sarahchen", avatar: "SC", color: "#bc8cff" },
    content:
      "Just shipped a new feature: real-time collaboration with CRDT! The engineering challenge was immense but totally worth it.",
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
      "Spent 3 hours debugging a race condition only to find it was a missing `await`. We've all been there.",
    time: "1h ago",
    likes: 215,
    comments: 41,
    reposts: 67,
    liked: false,
  },
];

let posts = FEED.map((p) => ({ ...p, currentLiked: p.liked, currentLikes: p.likes }));

function toggleLike(id) {
  posts = posts.map((p) => {
    if (p.id !== id) return p;
    const wasLiked = p.currentLiked;
    return {
      ...p,
      currentLiked: !wasLiked,
      currentLikes: wasLiked ? p.currentLikes - 1 : p.currentLikes + 1,
    };
  });
}
</script>

<div class="wrapper">
  <div class="feed">
    <div class="feed-header">
      <h2 class="feed-title">Feed</h2>
      <button class="latest-btn">Latest</button>
    </div>

    {#each posts as post (post.id)}
      <div class="post-card">
        <div class="post-top">
          <div class="avatar" style="background: {post.user.color};">
            {post.user.avatar}
          </div>
          <div class="post-body">
            <div class="post-meta">
              <span class="username">{post.user.name}</span>
              <span class="handle">{post.user.handle}</span>
              <span class="time">{post.time}</span>
            </div>
            <p class="content">{post.content}</p>
          </div>
        </div>
        <div class="actions">
          <button class="action-btn" on:click={() => toggleLike(post.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={post.currentLiked ? '#ff6b6b' : 'none'}
              stroke={post.currentLiked ? '#ff6b6b' : '#8b949e'}
              stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style="color: {post.currentLiked ? '#ff6b6b' : ''}">{post.currentLikes}</span>
          </button>
          <button class="action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{post.comments}</span>
          </button>
          <button class="action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2">
              <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <span>{post.reposts}</span>
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .wrapper {
    min-height: 100vh;
    background: #0d1117;
    display: flex;
    justify-content: center;
    padding: 1.5rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .feed { width: 100%; max-width: 32rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .feed-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
  .feed-title { color: #e6edf3; font-weight: 700; font-size: 1.125rem; }
  .latest-btn { font-size: 0.75rem; color: #58a6ff; background: none; border: none; cursor: pointer; }
  .latest-btn:hover { text-decoration: underline; }
  .post-card { background: #161b22; border: 1px solid #30363d; border-radius: 0.75rem; padding: 1rem; }
  .post-top { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
  .avatar {
    width: 2.25rem; height: 2.25rem; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700; color: #0d1117; flex-shrink: 0;
  }
  .post-body { flex: 1; min-width: 0; }
  .post-meta { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
  .username { color: #e6edf3; font-weight: 600; font-size: 0.875rem; }
  .handle { color: #8b949e; font-size: 0.75rem; }
  .time { color: #484f58; font-size: 0.75rem; margin-left: auto; }
  .content { color: #e6edf3; font-size: 0.875rem; margin-top: 0.375rem; line-height: 1.6; }
  .actions { display: flex; align-items: center; gap: 1.25rem; margin-left: 3rem; }
  .action-btn {
    display: flex; align-items: center; gap: 0.375rem;
    font-size: 0.75rem; color: #8b949e;
    background: none; border: none; cursor: pointer;
  }
  .action-btn:hover { color: #e6edf3; }
</style>
