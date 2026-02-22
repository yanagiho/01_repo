import React from 'react';
import type { CharacterData } from '../../constants/master';

export const RecommendScene: React.FC<{ bestChar: CharacterData | null }> = ({ bestChar }) => {
    if (!bestChar) return null;

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, opacity: 0.9 }}>あなたが一番集めたのは…</div>
                <div style={{ marginTop: 12, fontSize: 36, color: '#00eebb' }}>「{bestChar.work}」</div>
                <div style={{ marginTop: 8, fontSize: 22 }}>
                    {bestChar.artist} 先生 <span style={{ opacity: 0.75 }}>({bestChar.artistEn})</span>
                </div>
            </div>
        </div>
    );
};