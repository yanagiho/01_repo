import { useEffect, useRef } from "react";

type Props = {
    onUserSkip: () => void; // 互換のため残す（使わない）
    onEnded: () => void;
};

// @ts-ignore
export const TutorialVideoScene = ({ onUserSkip, onEnded }: Props) => {
    // ★onEnded が毎renderで変わっても問題ないように ref 化
    const onEndedRef = useRef(onEnded);
    useEffect(() => {
        onEndedRef.current = onEnded;
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
                // ★タッチで進まない：入力を受けない
                pointerEvents: "none",
            }}
        >
            <video
                src="./assets/tutorial/tutorial.mp4"
                autoPlay
                muted
                playsInline
                disablePictureInPicture
                onEnded={() => onEndedRef.current()}
                onError={(e) => {
                    console.error("Tutorial video failed to load, falling back to 5s timer.", e);
                    // 万が一動画が読み込めなかった場合のフォールバック
                    setTimeout(() => onEndedRef.current(), 5000);
                }}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    opacity: 0.98,
                }}
            />
        </div>
    );
};