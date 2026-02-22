import React, { useMemo, useState } from "react";

function buildVideoCandidates(): string[] {
    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? "./";
    const norm = (s: string) => (s.endsWith("/") ? s : s + "/");

    const bases = [norm(baseUrl), "./", "", "../"];
    const names = [
        "assets/tutorial.mp4",
        "assets/tutorial_video.mp4",
        "assets/videos/tutorial.mp4",
        "assets/video/tutorial.mp4",
        "assets/ui/tutorial.mp4",
    ];

    const out: string[] = [];
    for (const b of bases) for (const n of names) out.push(b + n);
    return Array.from(new Set(out));
}

export const TutorialVideoScene: React.FC<{ onEnded: () => void }> = ({ onEnded }) => {
    const candidates = useMemo(() => buildVideoCandidates(), []);
    const [idx, setIdx] = useState(0);
    const [gaveUp, setGaveUp] = useState(false);

    const src = candidates[idx];

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <video
                key={src}
                src={src}
                autoPlay
                muted
                playsInline
                onEnded={onEnded}
                onError={() => {
                    if (idx + 1 < candidates.length) setIdx(idx + 1);
                    else {
                        console.warn("[TutorialVideo] no video found, skip in 3s", { tried: candidates });
                        setGaveUp(true);
                        setTimeout(onEnded, 3000);
                    }
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }}
            />
            {gaveUp && (
                <div style={{ position: "absolute", bottom: 20, left: 20, color: "#fff", opacity: 0.8, fontFamily: "monospace" }}>
                    tutorial video not found → skipping...
                </div>
            )}
        </div>
    );
};
