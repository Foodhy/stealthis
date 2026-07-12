import { join } from "node:path";
import { loadPaths } from "@schema";
import type { PathOutput } from "@schema";

export type { PathWithProgress, UnitNode } from "./paths-unlock";
export {
  buildPathNodes,
  enrichPaths,
  getTopicsInPaths,
  isUnitUnlocked,
  pathProgressPct,
  unitState,
} from "./paths-unlock";

const contentDir = join(process.cwd(), "..", "..", "packages", "content");

export async function loadArcadePaths(): Promise<PathOutput[]> {
  return loadPaths(contentDir);
}

export async function loadPathTopicsMap(): Promise<Map<string, string[]>> {
  const paths = await loadArcadePaths();
  const map = new Map<string, string[]>();
  for (const p of paths) {
    map.set(p.slug, p.units.map((u) => u.topic));
  }
  return map;
}
