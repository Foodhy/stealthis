const STORAGE_KEY = "stealthis:favorites";

export function getFavorites(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}

export function toggleFavorite(slug: string): boolean {
  const favorites = getFavorites();
  const idx = favorites.indexOf(slug);
  const isNowFavorite = idx === -1;

  if (isNowFavorite) {
    favorites.push(slug);
  } else {
    favorites.splice(idx, 1);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(
    new CustomEvent("stealthis:favorites-changed", { detail: { slug, isFavorite: isNowFavorite } })
  );
  return isNowFavorite;
}

export function exportFavorites(): void {
  const favorites = getFavorites();
  const blob = new Blob(
    [JSON.stringify({ favorites, exportedAt: new Date().toISOString() }, null, 2)],
    {
      type: "application/json",
    }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "stealthis-favorites.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importFavorites(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as { favorites: string[] };
        if (!Array.isArray(data.favorites)) throw new Error("Invalid format");

        const current = getFavorites();
        const merged = [...new Set([...current, ...data.favorites])];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("stealthis:favorites-changed"));
        resolve(data.favorites.length);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}
