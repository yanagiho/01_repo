// MangaCatch/src/components/scenes/AssetCheckScene.tsx
import React, { useMemo, useState } from "react";
import { CHARACTER_MASTER, type CharacterData } from "../../constants/master";
import { CoverImage } from "../CoverImage";
import { CharacterImage } from "../CharacterImage";
import {
    clearOverrideMap,
    extractNo3FromIdOrNo,
    getOverrideNo3,
    setOverrideNo3,
} from "../../utils/charImageOverride";

function buildOptions(max: number) {
    const out: string[] = [];
    for (let i = 1; i <= max; i++) out.push(String(i).padStart(3, "0"));
    return out;
}

export const AssetCheckScene: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const options = useMemo(() => buildOptions(30), []);
    const [refresh, setRefresh] = useState(0);

    const rows = useMemo(() => {
        return CHARACTER_MASTER.filter((c) => (c as any).enabled !== false);
    }, []);

    const forceRefresh = () => setRefresh((v) => v + 1);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, color: "#fff", padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 26, color: "#00eebb" }}>ASSET CHECK</div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => {
                            clearOverrideMap();
                            forceRefresh();
                        }}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "rgba(0,0,0,0.35)",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        すべてリセット
                    </button>
                    <button
                        onClick={onBack}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid rgba(0,238,187,0.5)",
                            background: "rgba(0,238,187,0.15)",
                            color: "#00eebb",
                            cursor: "pointer",
                            fontWeight: 700,
                        }}
                    >
                        戻る
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
                ここで「書影は合ってるのにキャラだけ違う」ものを、chara番号の上書きで補正できます（保存されます）。
            </div>

            <div style={{ marginTop: 14, maxHeight: "calc(100vh - 120px)", overflow: "auto", paddingRight: 8 }}>
                {rows.map((c: CharacterData) => {
                    const id = (c as any).id as string;
                    const baseNo3 = extractNo3FromIdOrNo(id, (c as any).no);
                    const override = getOverrideNo3(id);
                    const effective = override ?? baseNo3;

                    return (
                        <div
                            key={id + ":" + refresh}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "70px 1fr 260px 260px 220px",
                                gap: 12,
                                alignItems: "center",
                                padding: "12px 10px",
                                borderRadius: 14,
                                background: "rgba(0,0,0,0.35)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                marginBottom: 10,
                            }}
                        >
                            <div style={{ fontFamily: "monospace", color: "#00eebb", fontSize: 18 }}>
                                {String((c as any).no).padStart(2, "0")}
                            </div>

                            <div>
                                <div style={{ fontSize: 16 }}>
                                    {(c as any).work} / {(c as any).artist}
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.75 }}>
                                    id:{id} / base:{baseNo3} / using:{effective}
                                </div>
                            </div>

                            <div style={{ display: "grid", placeItems: "center" }}>
                                <CoverImage
                                    char={c}
                                    style={{
                                        width: 180,
                                        height: 240,
                                        objectFit: "contain",
                                        borderRadius: 12,
                                        background: "rgba(0,0,0,0.25)",
                                    }}
                                />
                                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>cover_{baseNo3}</div>
                            </div>

                            <div style={{ display: "grid", placeItems: "center" }}>
                                <CharacterImage
                                    char={c}
                                    style={{
                                        width: 200,
                                        height: 200,
                                        objectFit: "contain",
                                        filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.6))",
                                    }}
                                />
                                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>chara_{effective}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>キャラ画像番号の上書き</div>
                                <select
                                    value={effective}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        // base と同じなら override を消す（ズレ修正が必要なものだけ保存）
                                        if (v === baseNo3) setOverrideNo3(id, null);
                                        else setOverrideNo3(id, v);
                                        forceRefresh();
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "10px 10px",
                                        borderRadius: 10,
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        background: "rgba(0,0,0,0.35)",
                                        color: "#fff",
                                        fontSize: 16,
                                    }}
                                >
                                    {options.map((o) => (
                                        <option key={o} value={o}>
                                            chara_{o}
                                        </option>
                                    ))}
                                </select>

                                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
                                    ※一致させたいキャラが表示される番号を選んでください
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};