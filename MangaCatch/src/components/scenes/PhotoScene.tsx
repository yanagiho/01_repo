import React, { useMemo, useState } from "react";
import type { CharacterData } from "../../constants/master";

const pad3 = (n: number) => String(n).padStart(3, "0");

function coverCandidates(char: CharacterData): string[] {
    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? "/";
    const normalize = (s: string) => (s.endsWith("/") ? s : s + "/");
    const bases = [
        normalize(baseUrl) + "assets/books/",
        "./assets/books/",
        "assets/books/",
        "../assets/books/",
        "../../assets/books/",
    ];
    const file = char.workImage ?? `cover_${pad3(char.no)}.png`;
    const names = [file, `cover_${pad3(char.no)}.png`];
    const urls: string[] = [];
    for (const b of bases) for (const n of names) urls.push(b + n);
    return Array.from(new Set(urls));
}

export const PhotoScene: React.FC<{ bestChar: CharacterData; onNext: () => void }> = ({ bestChar, onNext }) => {
    const candidates = useMemo(() => coverCandidates(bestChar), [bestChar]);
    const [idx, setIdx] = useState(0);

    return (
        <div style={{ position: "absolute", inset: 0, display: "flex", padding: 48, color: "#fff", gap: 28 }}>
            <img
                src={candidates[idx]}
                onError={() => setIdx((i) => Math.min(i + 1, candidates.length - 1))}
                style={{ height: "80vh", borderRadius: 16, objectFit: "contain", background: "rgba(0,0,0,0.3)" }}
                alt={bestChar.work}
            />
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 44, color: "#00eebb" }}>{bestChar.work}</div>
                <div style={{ marginTop: 8, fontSize: 28 }}>{bestChar.artist} 先生</div>
                <div style={{ marginTop: 14, opacity: 0.85 }}>{bestChar.name}</div>

                <button
                    onClick={onNext}
                    style={{
                        marginTop: 22,
                        padding: "12px 18px",
                        fontSize: 16,
                        borderRadius: 12,
                        border: "2px solid #00eebb",
                        background: "transparent",
                        color: "#00eebb",
                        cursor: "pointer",
                    }}
                >
                    ランキングへ
                </button>
            </div>
        </div>
    );
};