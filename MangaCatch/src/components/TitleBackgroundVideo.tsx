import React, { useEffect, useMemo, useRef, useState } from "react";

function buildCandidates(): string[] {
    return Array.from(
        new Set([
            "/assets/videos/title_bg.mov",
            "/assets/videos/title_bg.mp4",
            "/assets/video/title_bg.mov",
            "/assets/video/title_bg.mp4",
            "./assets/videos/title_bg.mov",
            "./assets/videos/title_bg.mp4",
            "./assets/video/title_bg.mov",
            "./assets/video/title_bg.mp4",
            "assets/videos/title_bg.mov",
            "assets/videos/title_bg.mp4",
            "assets/video/title_bg.mov",
            "assets/video/title_bg.mp4",
        ])
    );
}

// ★黒ではなく、待ち時間に見せる「タイトル専用の背景」
const FALLBACK_BG =
    "radial-gradient(circle at 50% 35%, rgba(40,110,180,0.55) 0%, rgba(0,0,0,0.92) 70%)";

export const TitleBackgroundVideo: React.FC = () => {
    const candidates = useMemo(() => buildCandidates(), []);
    const [idx, setIdx] = useState(0);
    const [ready, setReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const src = candidates[idx];

    useEffect(() => {
        setReady(false);
    }, [src]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const tryPlay = async () => {
            try {
                await v.play();
            } catch {
                // autoplay拒否でもOK（タイトルはクリックで進む）
            }
        };
        tryPlay();
    }, [src]);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
            {/* ★待ち時間の下地：黒ではなくタイトル用グラデ */}
            <div style={{ position: "absolute", inset: 0, background: FALLBACK_BG }} />

            <video
                ref={videoRef}
                key={src}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={() => setReady(true)}
                onCanPlay={() => setReady(true)}
                onPlaying={() => setReady(true)}
                onError={() => {
                    if (idx + 1 < candidates.length) {
                        console.warn("[TitleBackgroundVideo] failed:", src, "-> try next");
                        setIdx(idx + 1);
                    } else {
                        console.warn("[TitleBackgroundVideo] all candidates failed:", candidates);
                    }
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    transform: "scale(1.01)",

                    // 明るさ（暗くしない）
                    filter: "brightness(1.08) contrast(1.02) saturate(1.10)",

                    // readyになるまで映さない（ただし下地が黒ではないので“黒”は出ない）
                    opacity: ready ? 1 : 0,
                    transition: "opacity 260ms ease-out",
                }}
            />

            {/* ★readyまでのマスクも黒ではなくグラデ */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: FALLBACK_BG,
                    opacity: ready ? 0 : 1,
                    transition: "opacity 220ms ease-out",
                    pointerEvents: "none",
                }}
            />

            {/* ロゴ可読性のための薄いベール（黒く感じたらここをさらに薄く） */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                        "radial-gradient(circle at 50% 55%, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.16) 70%)",
                }}
            />
        </div>
    );
};