import React, { useEffect } from "react";

type Props = {
    onStart: () => void;
};

export const TitleScene: React.FC<Props> = ({ onStart }) => {
    useEffect(() => {
        // 2秒で自動開始（操作不要）
        const t = window.setTimeout(onStart, 2000);

        // クリックやキーでも開始できる（保険）
        const onKey = () => onStart();
        window.addEventListener("keydown", onKey);

        return () => {
            window.clearTimeout(t);
            window.removeEventListener("keydown", onKey);
        };
    }, [onStart]);

    return (
        <div
            onClick={onStart}
            style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: "rgba(0,0,0,0.55)",
                cursor: "pointer",
                userSelect: "none",
            }}
        >
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 54, letterSpacing: 2, opacity: 0.95 }}>
                    MANGA Catch!
                </div>

                <div
                    style={{
                        marginTop: 32,
                        display: "inline-block",
                        padding: "18px 40px",
                        borderRadius: 999,
                        border: "2px solid rgba(255,255,255,0.25)",
                        background: "rgba(0,0,0,0.35)",
                        fontSize: 22,
                        letterSpacing: 1,
                        opacity: 0.9,
                    }}
                >
                    TOUCH TO START
                </div>

                <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
                    （2秒で自動開始します）
                </div>
            </div>
        </div>
    );
};