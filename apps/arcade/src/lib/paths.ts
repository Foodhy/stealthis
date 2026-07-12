/** Topic URLs live under /topics/ to avoid Astro reserved paths (404, 500, etc.). */

export function topicPath(topic: string): string {
  return `/topics/${encodeURIComponent(topic)}`;
}

export function lessonPath(topic: string, lesson: string, start?: number): string {
  const base = `/topics/${encodeURIComponent(topic)}/${encodeURIComponent(lesson)}`;
  if (start != null && start > 0) return `${base}?start=${start}`;
  return base;
}

export function challengePath(slug: string): string {
  return `/c/${encodeURIComponent(slug)}`;
}

export function pathRoute(slug: string): string {
  return `/path/${encodeURIComponent(slug)}`;
}
