import { useMemo, useRef, useState } from "react";
import * as TitleBgModule from "../TitleBackgroundVideo";

type Props = { onStart: () => void };

/**
 * タイトル画面に表示する「全作家」コピーライト
 * （Excelの作家名から重複除外で作成）
 */
const ALL_ARTISTS_COPYRIGHT =
    "© 陸奥A子 / 萩岩睦美 / 文月今日子 / 山田圭子 / 北条司 / せきやてつじ / 畑中純 / 関谷ひさし";

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

export const TitleScene = ({ onStart }: Props) => {
    const TitleBackgroundVideoComp =
        (TitleBgModule as any).TitleBackgroundVideo ?? (TitleBgModule as any).default;

    const startedRef = useRef(false);
    const startOnce = () => {
        if (startedRef.current) return;
        startedRef.current = true;
        onStart();
    };

    const logoCandidates = useMemo(() => buildLogoCandidates(), []);
    const [logoIdx, setLogoIdx] = useState(0);

    return (
        <div
            onPointerDown={() => startOnce()}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                userSelect: "none",
                cursor: "pointer",
                overflow: "hidden",
            }}
        >
            <style>{`
        @keyframes blinkStart {
          0% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
          100% { opacity: 0.25; transform: translateY(0); }
        }
      `}</style>

            {/* 背景動画 */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                {TitleBackgroundVideoComp ? <TitleBackgroundVideoComp /> : null}
            </div>

            {/* ロゴ＋START */}
            <div style={{ textAlign: "center", width: "min(900px, 92vw)", zIndex: 2 }}>
                <div style={{ display: "grid", placeItems: "center" }}>
                    <img
                        src={logoCandidates[logoIdx]}
                        alt="MANGA Catch!"
                        onError={() => {
                            if (logoIdx + 1 < logoCandidates.length) setLogoIdx(logoIdx + 1);
                        }}
                        style={{
                            width: "min(680px, 88vw)",
                            height: "auto",
                            opacity: 0.98,
                            filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.55))",
                        }}
                        draggable={false}
                    />
                </div>

                <div
                    style={{
                        marginTop: 34,
                        display: "inline-block",
                        padding: "20px 64px",
                        borderRadius: 999,
                        border: "2px solid rgba(255,255,255,0.28)",
                        background: "rgba(0,0,0,0.28)",
                        fontSize: 36,
                        fontWeight: 900,
                        letterSpacing: 3,
                        animation: "blinkStart 1.1s ease-in-out infinite",
                        boxShadow: "0 0 22px rgba(0,238,187,0.18)",
                    }}
                >
                    START
                </div>
            </div>

            {/* ★全作家コピーライト（タイトルのみ） */}
            <div
                style={{
                    position: "absolute",
                    left: 18,
                    right: 18,
                    bottom: 12,
                    zIndex: 3,
                    fontSize: 32,
                    lineHeight: 1.35,
                    color: "rgba(255,255,255,0.78)",
                    textShadow: "0 2px 10px rgba(0,0,0,0.65)",
                    userSelect: "none",
                    pointerEvents: "none",
                    whiteSpace: "pre-wrap",
                    textAlign: "center",
                }}
            >
                {ALL_ARTISTS_COPYRIGHT}
            </div>
        </div>
    );
};