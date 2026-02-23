import React, { useEffect, useRef, useState } from "react";

export const ScreentoneWipe: React.FC<{
    trigger: boolean;
    onMiddle: () => void;
    onComplete: () => void;
}> = ({ trigger, onMiddle, onComplete }) => {
    const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");

    // コールバックのidentity変化でタイマーが消えないよう ref に保持
    const onMiddleRef = useRef(onMiddle);
    const onCompleteRef = useRef(onComplete);
    useEffect(() => void (onMiddleRef.current = onMiddle), [onMiddle]);
    useEffect(() => void (onCompleteRef.current = onComplete), [onComplete]);

    const middleCalled = useRef(false);
    const completeCalled = useRef(false);

    useEffect(() => {
        if (!trigger) {
            setPhase("idle");
            middleCalled.current = false;
            completeCalled.current = false;
            return;
        }

        setPhase("in");
        middleCalled.current = false;
        completeCalled.current = false;

        const tMiddle = window.setTimeout(() => {
            if (!middleCalled.current) {
                middleCalled.current = true;
                onMiddleRef.current();
            }
            setPhase("out");
        }, 320);

        const tComplete = window.setTimeout(() => {
            if (!completeCalled.current) {
                completeCalled.current = true;
                onCompleteRef.current();
            }
            setPhase("idle");
        }, 760);

        // 最終保険
        const tFailSafe = window.setTimeout(() => {
            if (!completeCalled.current) {
                console.warn("[ScreentoneWipe] failsafe complete");
                completeCalled.current = true;
                onCompleteRef.current();
            }
            setPhase("idle");
        }, 1500);

        return () => {
            window.clearTimeout(tMiddle);
            window.clearTimeout(tComplete);
            window.clearTimeout(tFailSafe);
        };
    }, [trigger]);

    if (phase === "idle") return null;

    const inPhase = phase === "in";

    return (
        <>
            <style>{`
        @keyframes flashIn { 
          0% { opacity: 0; transform: scale(1); }
          30% { opacity: 0.95; transform: scale(1.03); }
          100% { opacity: 0; transform: scale(1.08); }
        }
        @keyframes dotZoomIn {
          0% { opacity: 0; transform: scale(0.98); filter: blur(0px); }
          100% { opacity: 1; transform: scale(1.06); filter: blur(0.2px); }
        }
        @keyframes dotZoomOut {
          0% { opacity: 1; transform: scale(1.06); filter: blur(0.2px); }
          100% { opacity: 0; transform: scale(1.12); filter: blur(0.4px); }
        }
      `}</style>

            {/* 白フラッシュ（派手さの核） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10000,
                    background:
                        "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.0) 60%)",
                    animation: inPhase ? "flashIn 420ms ease-out" : "none",
                    mixBlendMode: "screen",
                }}
            />

            {/* ドットワイプ本体 */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 9999,
                    backgroundColor: "rgba(0,0,0,0.92)",
                    backgroundImage:
                        "radial-gradient(circle at 10px 10px, rgba(255,255,255,0.30) 2px, rgba(0,0,0,0) 2.6px)",
                    backgroundSize: "18px 18px",
                    animation: inPhase ? "dotZoomIn 320ms linear forwards" : "dotZoomOut 360ms linear forwards",
                }}
            />

            {/* カラーバースト（視認性アップ） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10001,
                    opacity: inPhase ? 0.75 : 0.35,
                    background:
                        "radial-gradient(circle at 50% 55%, rgba(0,238,187,0.35) 0%, rgba(0,0,0,0) 55%)",
                    mixBlendMode: "screen",
                }}
            />
        </>
    );
};