import React from 'react';
import type { RankingEntry } from '../../types/game';
import { getCharacterById } from '../../constants/master';
import { CoverImage } from '../CoverImage';

export const RankingScene: React.FC<{ ranking: RankingEntry[] }> = ({ ranking }) => {
    const top = ranking.slice(0, 5);

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, padding: 36, color: '#fff' }}>
            <div style={{ fontSize: 44, color: '#00eebb' }}>TODAY TOP 5</div>

            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
                {top.map((r, idx) => {
                    const c = getCharacterById(r.bestCharId);
                    return (
                        <div key={`${idx}-${r.score}`} style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 16, padding: 10 }}>
                            <div style={{ fontFamily: 'monospace', opacity: 0.85 }}>#{idx + 1}</div>
                            {c ? (
                                <CoverImage char={c} style={{ width: '100%', height: 220, objectFit: 'contain', borderRadius: 12, marginTop: 6 }} />
                            ) : (
                                <div style={{ width: '100%', height: 220, borderRadius: 12, background: '#222', marginTop: 6 }} />
                            )}
                            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.2 }}>
                                {c ? c.work : r.bestCharId}
                            </div>
                            <div style={{ marginTop: 6, fontFamily: 'monospace', color: '#00eebb' }}>{r.score} pt</div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 18, opacity: 0.65, fontSize: 14 }}>
                ※この画面も自動でタイトルに戻ります
            </div>
        </div>
    );
};