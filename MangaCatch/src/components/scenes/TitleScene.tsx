// MangaCatch/src/components/scenes/TitleScene.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = { onStart: () => void };

function buildLogoCandidates(): string[] {
    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? "./";
    const norm = (s: string) => (s.endsWith("/") ? s : s + "/");

    const names = [
        "assets/ui/mangacatch_title_logo.png",
        "assets/ui/title_logo.png",
        "assets/title_logo.png",
        "assets/mangacatch_title_logo.png",
        "assets/ui/mangacatch_logo.png",
    ];
    const bases = [norm(baseUrl), "./", "", "../", "../../"];

    const out: string[] = [];
    for (const b of bases) for (const n of names) out.push(b + n);
    return Array.from(new Set(out));
}

export const TitleScene: React.FC<Props> = ({ onStart }) => {
    const startedRef = useRef(false);

    const startOnce = () => {
        if (startedRef.current) return;
        startedRef.current = true;
        console.log("[TitleScene] START");
        onStart();
    };

    const logoCandidates = useMemo(() => buildLogoCandidates(), []);
    const [logoIdx, setLogoIdx] = useState(0);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") startOnce();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div
            onPointerDown={startOnce}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                userSelect: "none",
                cursor: "pointer",
            }}
        >
            <div style={{ textAlign: "center", width: "min(900px, 92vw)" }}>
                <div style={{ display: "grid", placeItems: "center" }}>
                    <img
                        src={logoCandidates[logoIdx]}
                        alt="MANGA Catch!"
                        onError={() => {
                            if (logoIdx + 1 < logoCandidates.length) setLogoIdx(logoIdx + 1);
                            else console.warn("[TitleScene] Logo not found", logoCandidates);
                        }}
                        style={{
                            width: "min(640px, 84vw)",
                            height: "auto",
                            opacity: 0.95,
                            filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.55))",
                        }}
                        draggable={false}
                    />
                </div>

                <div
                    style={{
                        marginTop: 46,
                        display: "inline-block",
                        padding: "18px 44px",
                        borderRadius: 999,
                        border: "2px solid rgba(255,255,255,0.22)",
                        background: "rgba(0,0,0,0.35)",
                        fontSize: 22,
                        letterSpacing: 1,
                        opacity: 0.9,
                    }}
                >
                    TOUCH TO START
                </div>

                <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
                    ※クリック（将来はセンサー入力）しない限り進みません
                </div>
            </div>
        </div>
    );
};