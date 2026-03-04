import { useEffect, useMemo, useState } from "react";

type Props = {
    onUserSkip: () => void; // 互換のため残す（未使用）
    onEnded: () => void;
};

function buildCandidates(): string[] {
    return Array.from(
        new Set([
            "/assets/tutorial/tutorial.png",
            "./assets/tutorial/tutorial.png",
            "assets/tutorial/tutorial.png",
            "/assets/tutorial/tutorial.jpg",
            "./assets/tutorial/tutorial.jpg",
            "assets/tutorial/tutorial.jpg",
        ])
    );
}

export const TutorialVideoScene = ({ onEnded }: Props) => {
    const candidates = useMemo(() => buildCandidates(), []);
    const [idx, setIdx] = useState(0);

    const [sec, setSec] = useState(5);

    useEffect(() => {
        setSec(5);
        const t = window.setInterval(() => {
            setSec((s) => {
                const next = s - 1;
                if (next <= 0) {
                    window.clearInterval(t);
                    onEnded();
                    return 0;
                }
                return next;
            });
        }, 1000);
        return () => window.clearInterval(t);
    }, [onEnded]);

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 40,
                display: "grid",
                placeItems: "center",
                background: "#000",
                color: "#fff",
                userSelect: "none",
                // ★タッチで進まない：クリックやタップを受けない
                pointerEvents: "none",
            }}
        >
            <style>{`
        @keyframes pop {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1.00); opacity: 0.95; }
        }
      `}</style>

            <img
                src={candidates[idx]}
                alt="tutorial"
                onError={() => {
                    if (idx + 1 < candidates.length) setIdx(idx + 1);
                }}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    opacity: 0.98,
                }}
                draggable={false}
            />

            {/* カウントダウン（表示のみ） */}
            <div
                style={{
                    position: "absolute",
                    right: 26,
                    bottom: 26,
                    width: 120,
                    height: 120,
                    borderRadius: 999,
                    border: "6px solid rgba(0,238,187,0.85)",
                    background: "rgba(0,0,0,0.35)",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "monospace",
                    fontSize: 54,
                    fontWeight: 900,
                    color: "#00eebb",
                    textShadow: "0 3px 10px rgba(0,0,0,0.85)",
                    animation: "pop 1s ease-in-out infinite",
                }}
            >
                {sec}
            </div>

            {/* ★「tap to skip」等の文字は削除 */}
        </div>
    );
};