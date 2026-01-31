// src/game/assets.ts

export type AssetEntry = {
  id: string;
  file: string; // absolute URL string
};

export type AssetManifest = {
  covers: AssetEntry[];
  characters: AssetEntry[];
};

function toId(pathFromManifest: string): string {
  const base = (pathFromManifest.split("/").pop() ?? pathFromManifest).trim();
  return base.replace(/\.[^.]+$/, "");
}

/**
 * "covers/xxx.png" or "characters/yyy.png" or "assets/covers/xxx.png" など
 * いろいろ来ても最終的に「絶対URL」に揃える
 */
function toAbsoluteUrl(pathFromManifest: string): string {
  const raw = (pathFromManifest ?? "").trim();
  if (!raw) return "";

  // 先頭の "/" は file:// で事故るので消す
  const noLeadSlash = raw.replace(/^\/+/, "");

  // assets/ が無ければ付ける
  const rel = noLeadSlash.startsWith("assets/") ? noLeadSlash : `assets/${noLeadSlash}`;

  // 現在URL基準の絶対URLにする（devでもbuildでも動きやすい）
  return new URL(rel, window.location.href).toString();
}

function normalizeStringList(input: unknown): string[] {
  if (Array.isArray(input)) return input.filter((v): v is string => typeof v === "string");
  return [];
}

function makeEntries(kind: "covers" | "characters", input: unknown): AssetEntry[] {
  const list = normalizeStringList(input);
  const prefix = kind === "covers" ? "covers/" : "characters/";

  return list.map((p) => {
    const p2 = p.startsWith(prefix) ? p : `${prefix}${p}`;
    return { id: toId(p2), file: toAbsoluteUrl(p2) };
  });
}

/**
 * public/assets/asset_manifest.json を読む
 * 例:
 * { "covers": ["a.png","b.png"], "characters": ["c.png"] }
 * ※ covers/ や characters/ を付けてもOK
 */
export async function loadAssetManifest(): Promise<AssetManifest> {
  const url = new URL("assets/asset_manifest.json", window.location.href).toString();

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn(`[AssetLoader] manifest not found: ${url} (${res.status})`);
      return { covers: [], characters: [] };
    }
    const raw = await res.json();

    return {
      covers: makeEntries("covers", (raw as any).covers),
      characters: makeEntries("characters", (raw as any).characters),
    };
  } catch (e) {
    console.warn("[AssetLoader] failed to load manifest:", e);
    return { covers: [], characters: [] };
  }
}

export const AssetLoader = {
  loadManifest: loadAssetManifest,
  getUrl: toAbsoluteUrl,
};

// 既存互換（他で使ってても壊れにくいように残す）
export function coverUrl(pathFromManifest: string): string {
  const p = pathFromManifest.startsWith("covers/") ? pathFromManifest : `covers/${pathFromManifest}`;
  return toAbsoluteUrl(p);
}

export function characterUrl(pathFromManifest: string): string {
  const p = pathFromManifest.startsWith("characters/") ? pathFromManifest : `characters/${pathFromManifest}`;
  return toAbsoluteUrl(p);
}
