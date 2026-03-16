import { useEffect, useRef, useState } from "react";

type Props = {
    onUserSkip: () => void; // 互換のため残す（使わない）
    onEnded: () => void;
};

export const TutorialVideoScene = ({ onEnded }: Props) => {
    const [failed, setFailed] = useState(false);

    const onEndedRef = useRef(onEnded);
    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    // 動画失敗時のフォールバック：5秒カウントダウン
    const [sec, setSec] = useState(5);
    useEffect(() => {
        if (!failed) return;
        setSec(5);
        const t = window.setInterval(() => {
            setSec((s) => {
                const next = s - 1;
                if (next <= 0) {
                    window.clearInterval(t);
                    onEndedRef.current();
                    return 0;
                }
                return next;
            });
        }, 1000);
        return () => window.clearInterval(t);
    }, [failed]);

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 40,
                background: "#000",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                pointerEvents: "none",
            }}
        >
            {!failed ? (
                <video
                    src="/assets/tutorial/tutorial.mp4"
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => onEndedRef.current()}
                    onError={() => setFailed(true)}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "#000",
                    }}
                />
            ) : (
                <>
                    <style>{`
                        @keyframes pop {
                            0% { transform: scale(0.95); opacity: 0.7; }
                            50% { transform: scale(1.06); opacity: 1; }
                            100% { transform: scale(1.00); opacity: 0.95; }
                        }
                    `}</style>
                    <img
                        src="/assets/tutorial/tutorial.png"
                        alt="tutorial"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                        draggable={false}
                    />
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
                </>
            )}
        </div>
    );
};