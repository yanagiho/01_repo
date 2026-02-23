// MangaCatch/src/utils/charImageOverride.ts
const KEY = "mangacatch_char_image_override_v1";

type OverrideMap = Record<string, string>; // id -> "001" など

export function loadOverrideMap(): OverrideMap {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return {};
        const obj = JSON.parse(raw);
        return obj && typeof obj === "object" ? (obj as OverrideMap) : {};
    } catch {
        return {};
    }
}

export function saveOverrideMap(map: OverrideMap) {
    localStorage.setItem(KEY, JSON.stringify(map));
}

export function clearOverrideMap() {
    localStorage.removeItem(KEY);
}

export function getOverrideNo3(id: string): string | null {
    const map = loadOverrideMap();
    const v = map[id];
    if (typeof v !== "string") return null;
    const m = v.match(/^\d{1,3}$/);
    if (!m) return null;
    return v.padStart(3, "0");
}

export function setOverrideNo3(id: string, no3: string | null) {
    const map = loadOverrideMap();
    if (!no3) {
        delete map[id];
    } else {
        map[id] = no3.padStart(3, "0");
    }
    saveOverrideMap(map);
}

export function extractNo3FromIdOrNo(id: string, no?: number): string {
    const m = String(id ?? "").match(/(\d{1,3})$/);
    if (m) return m[1].padStart(3, "0");
    return String(no ?? 0).padStart(3, "0");
}