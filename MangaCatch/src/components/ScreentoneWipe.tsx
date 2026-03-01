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
        }, 520);

        const tComplete = window.setTimeout(() => {
            if (!completeCalled.current) {
                completeCalled.current = true;
                onCompleteRef.current();
            }
            setPhase("idle");
        }, 1180);

        const tFailSafe = window.setTimeout(() => {
            if (!completeCalled.current) {
                console.warn("[ScreentoneWipe] failsafe complete");
                completeCalled.current = true;
                onCompleteRef.current();
            }
            setPhase("idle");
        }, 2400);

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
        @keyframes flashHardA {
          0% { opacity: 0; }
          18% { opacity: 1; }
          55% { opacity: 0.30; }
          100% { opacity: 0; }
        }
        @keyframes flashHardB {
          0% { opacity: 0; }
          35% { opacity: 0.65; }
          70% { opacity: 0.12; }
          100% { opacity: 0; }
        }

        @keyframes maskSpinIn {
          0% { transform: scale(0.98) rotate(-2deg) translate(0px,0px); filter: blur(0px); opacity: 0.0; }
          35% { transform: scale(1.06) rotate(1.2deg) translate(3px,-2px); filter: blur(0.35px); opacity: 1; }
          100% { transform: scale(1.14) rotate(2.2deg) translate(-2px,2px); filter: blur(0.7px); opacity: 1; }
        }
        @keyframes maskSpinOut {
          0% { transform: scale(1.14) rotate(2.2deg) translate(-2px,2px); filter: blur(0.7px); opacity: 1; }
          100% { transform: scale(1.24) rotate(-2.6deg) translate(4px,-2px); filter: blur(1px); opacity: 0; }
        }

        @keyframes scanlinesFast {
          0% { background-position: 0px 0px; }
          100% { background-position: 0px 420px; }
        }

        @keyframes noiseMove {
          0% { transform: translate(0,0); }
          100% { transform: translate(-18px, 12px); }
        }

        @keyframes rgbSplitIn {
          0% { opacity: 0; transform: translate(0,0); }
          40% { opacity: 0.75; transform: translate(2px,-1px); }
          100% { opacity: 0.38; transform: translate(-1px,1px); }
        }
        @keyframes rgbSplitOut {
          0% { opacity: 0.38; transform: translate(-1px,1px); }
          100% { opacity: 0; transform: translate(2px,-2px); }
        }
      `}</style>

            {/* 1) 強い白フラッシュ（中心） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10040,
                    background:
                        "radial-gradient(circle at 50% 45%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 66%)",
                    animation: inPhase ? "flashHardA 620ms ease-out" : "none",
                    mixBlendMode: "screen",
                }}
            />

            {/* 2) 追加フラッシュ（広がり） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10039,
                    background:
                        "radial-gradient(circle at 50% 55%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 78%)",
                    animation: inPhase ? "flashHardB 820ms ease-out" : "none",
                    mixBlendMode: "screen",
                }}
            />

            {/* 3) ドット仮面（回転＋ズーム） */}
            <div
                style={{
                    position: "absolute",
                    inset: -40,
                    pointerEvents: "none",
                    zIndex: 10030,
                    backgroundColor: "rgba(0,0,0,0.94)",
                    backgroundImage:
                        "radial-gradient(circle at 9px 9px, rgba(255,255,255,0.36) 2px, rgba(0,0,0,0) 2.8px)",
                    backgroundSize: "16px 16px",
                    animation: inPhase ? "maskSpinIn 520ms linear forwards" : "maskSpinOut 660ms linear forwards",
                }}
            />

            {/* 4) RGBスプリット（色収差） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10033,
                    opacity: inPhase ? 0.0 : 0.0,
                    animation: inPhase ? "rgbSplitIn 520ms ease-out forwards" : "rgbSplitOut 520ms ease-out forwards",
                    mixBlendMode: "screen",
                    background:
                        "radial-gradient(circle at 48% 50%, rgba(255,70,120,0.22) 0%, rgba(0,0,0,0) 60%)," +
                        "radial-gradient(circle at 52% 52%, rgba(90,140,255,0.20) 0%, rgba(0,0,0,0) 62%)," +
                        "radial-gradient(circle at 50% 55%, rgba(0,238,187,0.28) 0%, rgba(0,0,0,0) 60%)",
                }}
            />

            {/* 5) スキャンライン（強め） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10034,
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.08) 1px, rgba(0,0,0,0) 2px)",
                    backgroundSize: "100% 6px",
                    opacity: 0.45,
                    animation: "scanlinesFast 420ms linear infinite",
                    mixBlendMode: "overlay",
                }}
            />

            {/* 6) ノイズ（強め） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10035,
                    backgroundImage:
                        "url('data:image/svg+xml;charset=utf-8," +
                        encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
              <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter>
              <rect width="140" height="140" filter="url(#n)" opacity="0.38"/>
            </svg>`) +
                        "')",
                    backgroundSize: "240px 240px",
                    opacity: 0.42,
                    animation: "noiseMove 180ms linear infinite",
                    mixBlendMode: "overlay",
                }}
            />

            {/* 7) ビネット（画面端を少し落として“切り替わった感”を強制） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10032,
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
                    opacity: inPhase ? 0.65 : 0.35,
                    mixBlendMode: "multiply",
                }}
            />
        </>
    );
};