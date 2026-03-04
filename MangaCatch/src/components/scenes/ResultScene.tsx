import { useMemo } from "react";
import { getCharacterById } from "../../constants/master";
import { CharacterImage } from "../CharacterImage";

export const ResultScene: React.FC<{ score: number; counts: Record<string, number> }> = ({
    score,
    counts,
}) => {
    const rows = useMemo(() => {
        const list: { id: string; cnt: number }[] = [];
        for (const [id, cnt] of Object.entries(counts)) list.push({ id, cnt });
        list.sort((a, b) => b.cnt - a.cnt);
        const max = Math.max(1, ...list.map((r) => r.cnt));
        return { list: list.slice(0, 10), max };
    }, [counts]);

    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, padding: 34, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 54, color: "#00eebb", fontWeight: 900 }}>RESULT</div>
                <div style={{ fontFamily: "monospace", fontSize: 56, fontWeight: 900 }}>
                    SCORE <span style={{ color: "#00eebb" }}>{score}</span>
                </div>
            </div>

            <div
                style={{
                    marginTop: 22,
                    maxWidth: 1100,
                    background: "rgba(0,0,0,0.35)",
                    borderRadius: 18,
                    padding: 16,
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                {rows.list.map((r, idx) => {
                    const c = getCharacterById(r.id);
                    const w = Math.round((r.cnt / rows.max) * 100);

                    return (
                        <div
                            key={r.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "70px 90px 1fr 110px",
                                gap: 14,
                                alignItems: "center",
                                padding: "12px 10px",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            <div style={{ fontFamily: "monospace", fontSize: 40, fontWeight: 900, color: "#00eebb", textAlign: "center" }}>
                                {idx + 1}
                            </div>

                            <div style={{ width: 90, height: 90, display: "grid", placeItems: "center" }}>
                                {c ? (
                                    <CharacterImage char={c} style={{ width: 86, height: 86, objectFit: "contain" }} />
                                ) : (
                                    <div style={{ opacity: 0.5 }}>-</div>
                                )}
                            </div>

                            <div>
                                <div
                                    style={{
                                        height: 18,
                                        borderRadius: 12,
                                        background: "rgba(255,255,255,0.10)",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${w}%`,
                                            height: "100%",
                                            borderRadius: 12,
                                            background: "rgba(0,238,187,0.88)",
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 34, fontWeight: 900, color: "#00eebb" }}>
                                x{r.cnt}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};