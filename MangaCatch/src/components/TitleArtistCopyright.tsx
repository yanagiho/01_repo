import React from "react";

/**
 * タイトル画面に表示する「全作家」コピーライト
 * ※Excel（マンガキャッチ！画像-作家名対照リスト_20260116.xlsx）から作家名（重複除外）で作成
 */
const ARTISTS_JP = [
    "陸奥A子",
    "萩岩睦美",
    "文月今日子",
    "山田圭子",
    "北条司",
    "せきやてつじ",
    "畑中純",
    "関谷ひさし",
];

export const TITLE_COPYRIGHT_TEXT = `© ${ARTISTS_JP.join(" / ")}`;

const TitleArtistCopyright: React.FC = () => {
    return (
        <div
            style={{
                position: "absolute",
                left: 18,
                right: 18,
                bottom: 12,
                zIndex: 3,
                fontSize: 32,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.78)",
                textShadow: "0 2px 10px rgba(0,0,0,0.65)",
                userSelect: "none",
                pointerEvents: "none",
                whiteSpace: "pre-wrap",
            }}
        >
            {TITLE_COPYRIGHT_TEXT}
        </div>
    );
};

export default TitleArtistCopyright;