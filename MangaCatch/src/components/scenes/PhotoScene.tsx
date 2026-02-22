import React, { useMemo } from 'react';
import type { CharacterData } from '../../constants/master';
import { CoverImage } from '../CoverImage';

export const PhotoScene: React.FC<{ bestChar: CharacterData | null; score: number }> = ({ bestChar, score }) => {
    const nowText = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
    }, []);

    if (!bestChar) return null;

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', gap: 28, padding: 48, color: '#fff' }}>
            <div style={{ width: '38%', minWidth: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CoverImage
                    char={bestChar}
                    style={{
                        width: '100%',
                        maxHeight: '82vh',
                        objectFit: 'contain',
                        borderRadius: 16,
                        background: 'rgba(0,0,0,0.25)',
                        boxShadow: '0 14px 30px rgba(0,0,0,0.55)',
                    }}
                />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ fontFamily: 'monospace', opacity: 0.85 }}>{nowText}</div>

                <div style={{ marginTop: 10, fontSize: 56, color: '#00eebb', lineHeight: 1.05 }}>{bestChar.work}</div>
                <div style={{ marginTop: 6, fontSize: 22, opacity: 0.9 }}>{bestChar.workEn}</div>

                <div style={{ marginTop: 12, fontSize: 28 }}>
                    {bestChar.artist} <span style={{ opacity: 0.75 }}>({bestChar.artistEn})</span>
                </div>

                <div style={{ marginTop: 18, fontSize: 34 }}>
                    SCORE: <span style={{ color: '#00eebb' }}>{score}</span>
                </div>

                <div style={{ marginTop: 20, opacity: 0.65, fontSize: 14 }}>
                    ※この画面は自動で次へ進みます
                </div>
            </div>
        </div>
    );
};