import React from 'react';
import type { CharacterData } from '../../constants/master';

interface RecommendSceneProps {
    bestChar: CharacterData | null;
}

export const RecommendScene: React.FC<RecommendSceneProps> = ({ bestChar }) => {
    if (!bestChar) return null;

    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.9)', padding: '100px' }}>
            <img src={`/assets/characters/${bestChar.id}.png`} style={{ width: '400px', marginRight: '80px' }} />
            <div>
                <div style={{ fontSize: '2rem' }}>あなたが一番集めたのは...</div>
                <div style={{ fontSize: '5rem', color: '#00eebb', fontWeight: 'bold' }}>「{bestChar.work}」</div>
                <div style={{ fontSize: '3rem' }}>{bestChar.artist} 先生の作品です</div>
            </div>
        </div>
    );
};
