import React from 'react';
import type { CharacterData } from '../../constants/master';
import { CharacterImage } from '../CharacterImage';

interface RecommendSceneProps {
    bestChar: CharacterData | null;
}

export const RecommendScene: React.FC<RecommendSceneProps> = ({ bestChar }) => {
    if (!bestChar) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                color: '#fff',
            }}
        >
            <div style={{ fontSize: '2.2rem' }}>あなたが一番集めたのは…</div>

            <CharacterImage
                char={bestChar}
                style={{
                    width: 320,
                    height: 320,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 12px 14px rgba(0,0,0,0.7))',
                }}
            />

            <div style={{ fontSize: '3rem', color: '#00eebb' }}>「{bestChar.work}」</div>
            <div style={{ fontSize: '2rem' }}>{bestChar.artist} 先生の作品です</div>

            {import.meta.env.DEV && (
                <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12, color: '#aaa' }}>
                    [DEV] best id={bestChar.id} / no={bestChar.no}
                </div>
            )}
        </div>
    );
};