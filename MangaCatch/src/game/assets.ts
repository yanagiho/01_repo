cat > src/game/assets.ts <<'EOF'
export type AssetManifest = {
  covers: string[];
  characters: string[];
  raw: any;
};

function normalizeList(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object")
          return x.path ?? x.file ?? x.src ?? x.url ?? "";
        return "";
      })
      .filter(Boolean);
  }
  if (typeof v === "object") {
    return Object.values(v)
      .map((x: any) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object")
          return x.path ?? x.file ?? x.src ?? x.url ?? "";
        return "";
      })
      .filter(Boolean);
  }
  return [];
}

function toAbsoluteUrl(maybeRelativePath: string): string {
  // expected examples:
  // - "assets/covers/cover_001.png"
  // - "/assets/covers/cover_001.png"
  // - "covers/cover_001.png" (we'll prefix "assets/")
  const p = (maybeRelativePath || "").trim();
  if (!p) return "";

  const cleaned = p.startsWith("/") ? p.slice(1) : p;
  const withAssetsPrefix =
    cleaned.startsWith("assets/") ? cleaned : `assets/${cleaned}`;

  return new URL(withAssetsPrefix, window.location.href).toString();
}

export async function loadAssetManifest(): Promise<AssetManifest> {
  // public/assets/asset_manifest.json を想定
  const manifestUrl = new URL("./assets/asset_manifest.json", window.location.href).toString();

  const res = await fetch(manifestUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load manifest: ${res.status} ${res.statusText} (${manifestUrl})`);
  }
  const raw = await res.json();

  // いろんな形のmanifestに耐える（syncスクリプトの出力差分吸収）
  const covers =
    normalizeList(raw.covers) ||
    normalizeList(raw.cover) ||
    normalizeList(raw.backgrounds) ||
    [];
  const characters =
    normalizeList(raw.characters) ||
    normalizeList(raw.character) ||
    normalizeList(raw.chara) ||
    [];

  // covers/characters が相対パスっぽい場合も吸収
  const normalizePath = (s: string) => {
    const t = s.replace(/^\.?\//, "");
    // "covers/xxx.png" の場合は "assets/covers/xxx.png" に寄せる
    return t.startsWith("assets/") ? t : t;
  };

  return {
    covers: covers.map(normalizePath),
    characters: characters.map(normalizePath),
    raw,
  };
}

export function coverUrl(pathFromManifest: string): string {
  // manifestが "covers/xxx.png" なら assets/ を付ける
  const p = pathFromManifest.startsWith("covers/") ? `assets/${pathFromManifest}` : pathFromManifest;
  return toAbsoluteUrl(p);
}

export function characterUrl(pathFromManifest: string): string {
  const p = pathFromManifest.startsWith("characters/") ? `assets/${pathFromManifest}` : pathFromManifest;
  return toAbsoluteUrl(p);
}
EOF
