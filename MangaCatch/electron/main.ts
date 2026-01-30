// src/game/AssetManager.ts
export type AnyManifest = Record<string, any>;

function normalizeList(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    // ["cover_001.png", ...]
    if (v.every((x) => typeof x === "string")) return v as string[];
    // [{dst:"cover_001.png"}, {file:"..."}, ...]
    return v
      .map((x) => x?.dst ?? x?.file ?? x?.name ?? x?.path ?? x?.to ?? x?.out)
      .filter((x) => typeof x === "string");
  }
  return [];
}

export class AssetManager {
  private manifest: AnyManifest | null = null;
  private imgCache = new Map<string, HTMLImageElement>();

  async loadManifest(url = "/assets/asset_manifest.json"): Promise<void> {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Manifest load failed: ${res.status} ${res.statusText}`);
    this.manifest = await res.json();
  }

  listCovers(): string[] {
    const m = this.manifest ?? {};
    // 想定：{ covers: [...] } or { cover: [...] } など揺れに耐える
    return [
      ...normalizeList(m.covers),
      ...normalizeList(m.cover),
      ...normalizeList(m.bookCovers),
      ...normalizeList(m.backgrounds),
    ];
  }

  listCharacters(): string[] {
    const m = this.manifest ?? {};
    return [
      ...normalizeList(m.characters),
      ...normalizeList(m.character),
      ...normalizeList(m.charas),
      ...normalizeList(m.sprites),
    ];
  }

  coverUrl(file: string): string {
    if (file.startsWith("/")) return file;
    if (file.includes("/")) return `/${file.replace(/^\/+/, "")}`;
    return `/assets/covers/${file}`;
  }

  characterUrl(file: string): string {
    if (file.startsWith("/")) return file;
    if (file.includes("/")) return `/${file.replace(/^\/+/, "")}`;
    return `/assets/characters/${file}`;
  }

  randomCoverUrl(): string | null {
    const list = this.listCovers();
    if (!list.length) return null;
    const pick = list[Math.floor(Math.random() * list.length)];
    return this.coverUrl(pick);
  }

  randomCharacterUrl(): string | null {
    const list = this.listCharacters();
    if (!list.length) return null;
    const pick = list[Math.floor(Math.random() * list.length)];
    return this.characterUrl(pick);
  }

  async loadImage(url: string): Promise<HTMLImageElement> {
    const cached = this.imgCache.get(url);
    if (cached) return cached;

    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = url;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Image load failed: ${url}`));
    });

    this.imgCache.set(url, img);
    return img;
  }
}
