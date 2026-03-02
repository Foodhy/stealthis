import { existsSync } from "node:fs";
import path from "node:path";

type PreviewAsset = {
  ext: string;
  mime: string;
  absolutePath: string;
  publicPath: string;
};

const CONTENT_DIR = path.resolve(process.cwd(), "../../packages/content");

const PREVIEW_CANDIDATES: Array<{ ext: string; mime: string }> = [
  { ext: "webp", mime: "image/webp" },
  { ext: "png", mime: "image/png" },
  { ext: "jpg", mime: "image/jpeg" },
  { ext: "jpeg", mime: "image/jpeg" },
  { ext: "avif", mime: "image/avif" },
];

export const normalizePreviewPath = (preview?: string) => {
  if (!preview) return undefined;
  const trimmed = preview.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

export const findResourcePreview = (slug: string): PreviewAsset | null => {
  for (const candidate of PREVIEW_CANDIDATES) {
    const absolutePath = path.join(CONTENT_DIR, `resources/${slug}/preview.${candidate.ext}`);
    if (existsSync(absolutePath)) {
      return {
        ext: candidate.ext,
        mime: candidate.mime,
        absolutePath,
        publicPath: `/resource-preview/${slug}.${candidate.ext}`,
      };
    }
  }

  return null;
};
