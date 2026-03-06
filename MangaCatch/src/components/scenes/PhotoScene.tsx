import { useMemo, useState } from "react";
import { CharacterImage } from "../CharacterImage";
import { CoverImage } from "../CoverImage";
import type { CharacterData } from "../../constants/master";

function buildCameraCandidates(): string[] {
    return Array.from(
        new Set([
            "/assets/ui/camera.png",
            "/assets/ui/Camera.png",
            "/assets/ui/camera_icon.png",
            "./assets/ui/camera.png",
            "assets/ui/camera.png",
        ])
    );
}

function buildLogoCandidates(): string[] {
    return Array.from(
        new Set([
            "/assets/ui/mangacatch_title_logo.png",
            "/assets/ui/title_logo.png",
            "/assets/title_logo.png",
            "./assets/ui/mangacatch_title_logo.png",
            "./assets/ui/title_logo.png",
            "./assets/title_logo.png",
            "assets/ui/mangacatch_title_logo.png",
            "assets/ui/title_logo.png",
            "assets/title_logo.png",
        ])
    );
}

export const PhotoScene = ({ bestChar, score }: { bestChar: CharacterData | null; score: number }) => {
    const CoverImageComp = CoverImage;
    const CharacterImageComp = CharacterImage;

    const nowText = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
    }, []);

    const camCandidates = useMemo(() => buildCameraCandidates(), []);
    const logoCandidates = useMemo(() => buildLogoCandidates(), []);

    const [camIdx, setCamIdx] = useState(0);
    const [logoIdx, setLogoIdx] = useState(0);
    const [camBroken, setCamBroken] = useState(false);

    if (!bestChar) return null;

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "grid", placeItems: "center", color: "#fff" }}>
            <div
                style={{
                    width: "min(1280px, 96vw)",
                    height: "min(720px, 90vh)",
                    borderRadius: 22,
                    background: "rgba(0,0,0,0.40)",
                    border: "2px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 22px 40px rgba(0,0,0,0.55)",
                    padding: 18,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* 左上 */}
                <div style={{ position: "absolute", top: 18, left: 18, zIndex: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    {!camBroken && (
                        <img
                            src={camCandidates[camIdx]}
                            alt="camera"
                            onError={() => {
                                if (camIdx + 1 < camCandidates.length) setCamIdx(camIdx + 1);
                                else setCamBroken(true);
                            }}
                            style={{ width: 56, height: 56, objectFit: "contain", opacity: 0.95 }}
                            draggable={false}
                        />
                    )}
                    {camBroken && (
                        <div style={{ width: 56, height: 56, display: "grid", placeItems: "center", fontSize: 44, opacity: 0.9 }}>
                            📷
                        </div>
                    )}

                    <div style={{ lineHeight: 1.05 }}>
                        <div style={{ fontSize: 38, fontWeight: 900 }}>写真を撮ってね</div>
                        <div style={{ fontSize: 22, opacity: 0.9, fontWeight: 800 }}>Take a photo!</div>
                    </div>
                </div>

                {/* 上中央 */}
                <div
                    style={{
                        position: "absolute",
                        top: 18,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 20,
                        textAlign: "center",
                        textShadow: "0 3px 12px rgba(0,0,0,0.85)",
                    }}
                >
                    <div style={{ fontFamily: "monospace", fontSize: 62, fontWeight: 900, color: "#00eebb" }}>
                        SCORE {score}
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 900, opacity: 0.92 }}>
                        {nowText}
                    </div>
                </div>

                {/* レイアウト */}
                <div
                    style={{
                        position: "absolute",
                        left: 18,
                        right: 18,
                        top: 110,
                        bottom: 86,
                        display: "grid",
                        gridTemplateColumns: "360px 1fr 360px",
                        gap: 18,
                        alignItems: "center",
                    }}
                >
                    {CoverImageComp ? (
                        <CoverImageComp
                            char={bestChar}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: 16,
                                background: "rgba(0,0,0,0.22)",
                            }}
                        />
                    ) : null}

                    <div style={{ width: "100%", height: "100%" }} />

                    <div style={{ display: "grid", placeItems: "center", overflow: "visible", transform: "translateY(-120px)" }}>
                        {CharacterImageComp ? (
                            <CharacterImageComp
                                char={bestChar}
                                style={{
                                    width: 460,
                                    height: 460,
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.65))",
                                    display: "block",
                                }}
                            />
                        ) : null}
                    </div>
                </div>

                {/* ロゴ */}
                <img
                    src={logoCandidates[logoIdx]}
                    alt="MANGA Catch!"
                    onError={() => {
                        if (logoIdx + 1 < logoCandidates.length) setLogoIdx(logoIdx + 1);
                    }}
                    style={{
                        position: "absolute",
                        right: 18,
                        bottom: 14,
                        width: 320,
                        opacity: 0.92,
                        zIndex: 10,
                        filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.55))",
                        pointerEvents: "none",
                    }}
                    draggable={false}
                />

                {/* SpringBreath/SpringBless のコピーライトは表示しない */}
            </div>
        </div>
    );
};