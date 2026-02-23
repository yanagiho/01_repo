// MangaCatch/src/components/ScreentoneWipe.tsx
import React, { useEffect, useRef, useState } from "react";

export const ScreentoneWipe: React.FC<{
    trigger: boolean;
    onMiddle: () => void;
    onComplete: () => void;
}> = ({ trigger, onMiddle, onComplete }) => {
    const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");

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
        }, 420);

        const tComplete = window.setTimeout(() => {
            if (!completeCalled.current) {
                completeCalled.current = true;
                onCompleteRef.current();
            }
            setPhase("idle");
        }, 980);

        const tFailSafe = window.setTimeout(() => {
            if (!completeCalled.current) {
                console.warn("[ScreentoneWipe] failsafe complete");
                completeCalled.current = true;
                onCompleteRef.current();
            }
            setPhase("idle");
        }, 2000);

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
        @keyframes flashHard {
          0% { opacity: 0; }
          25% { opacity: 1; }
          55% { opacity: 0.35; }
          100% { opacity: 0; }
        }
        @keyframes zoomShakeIn {
          0% { transform: scale(0.98) translate(0px,0px); filter: blur(0px); }
          40% { transform: scale(1.05) translate(2px,-1px); filter: blur(0.3px); }
          100% { transform: scale(1.10) translate(-2px,1px); filter: blur(0.5px); }
        }
        @keyframes zoomShakeOut {
          0% { transform: scale(1.10) translate(-2px,1px); filter: blur(0.5px); opacity: 1; }
          100% { transform: scale(1.18) translate(2px,-1px); filter: blur(0.7px); opacity: 0; }
        }
        @keyframes scanlines {
          0% { background-position: 0px 0px; }
          100% { background-position: 0px 240px; }
        }
        @keyframes noiseMove {
          0% { transform: translate(0,0); }
          100% { transform: translate(-12px, 8px); }
        }
      `}</style>

            {/* 強い白フラッシュ */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10030,
                    background:
                        "radial-gradient(circle at 50% 45%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 65%)",
                    animation: inPhase ? "flashHard 520ms ease-out" : "none",
                    mixBlendMode: "screen",
                }}
            />

            {/* ドット仮面（密度アップ） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10020,
                    backgroundColor: "rgba(0,0,0,0.93)",
                    backgroundImage:
                        "radial-gradient(circle at 9px 9px, rgba(255,255,255,0.33) 2px, rgba(0,0,0,0) 2.7px)",
                    backgroundSize: "16px 16px",
                    animation: inPhase ? "zoomShakeIn 420ms linear forwards" : "zoomShakeOut 520ms linear forwards",
                }}
            />

            {/* 色バースト（RGBずれ風） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10025,
                    opacity: inPhase ? 0.95 : 0.55,
                    background:
                        "radial-gradient(circle at 48% 55%, rgba(0,238,187,0.35) 0%, rgba(0,0,0,0) 55%)," +
                        "radial-gradient(circle at 52% 52%, rgba(255,60,120,0.22) 0%, rgba(0,0,0,0) 60%)," +
                        "radial-gradient(circle at 50% 50%, rgba(90,140,255,0.20) 0%, rgba(0,0,0,0) 62%)",
                    mixBlendMode: "screen",
                }}
            />

            {/* スキャンライン */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10028,
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.05) 1px, rgba(0,0,0,0) 2px)",
                    backgroundSize: "100% 6px",
                    opacity: 0.35,
                    animation: "scanlines 420ms linear infinite",
                    mixBlendMode: "overlay",
                }}
            />

            {/* ノイズ */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10029,
                    backgroundImage:
                        "url('data:image/svg+xml;charset=utf-8," +
                        encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
              <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter>
              <rect width="120" height="120" filter="url(#n)" opacity="0.28"/>
            </svg>`) +
                        "')",
                    backgroundSize: "200px 200px",
                    opacity: 0.35,
                    animation: "noiseMove 220ms linear infinite",
                    mixBlendMode: "overlay",
                }}
            />
        </>
    );
};