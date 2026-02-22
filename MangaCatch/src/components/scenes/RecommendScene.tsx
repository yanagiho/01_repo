import React from 'react';
import type { CharacterData } from '../../constants/master';
import { getCharacterImagePath, getCoverImagePath } from '../../constants/master';

const PLACEHOLDER_CHARA = '/assets/ui/placeholder_chara.png';

interface RecommendSceneProps {
    bestChar: CharacterData | null;
}

export const RecommendScene: React.FC<RecommendSceneProps> = ({ bestChar }) => {
    if (!bestChar) return null;

    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.9)', padding: '100px' }}>
            <img
                src={getCharacterImagePath(bestChar)}
                alt={`${bestChar.name}（${bestChar.work}）`}
                onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src !== PLACEHOLDER_CHARA) {
                        console.warn(`[MangaCatch] RecommendScene 画像ロード失敗: ${bestChar.characterImage} (id=${bestChar.id})`);
                        img.src = PLACEHOLDER_CHARA;
                    }
                }}
                style={{ width: '400px', marginRight: '80px' }}
            />
            <div>
                <div style={{ fontSize: '2rem' }}>あなたが一番集めたのは...</div>
                <div style={{ fontSize: '5rem', color: '#00eebb', fontWeight: 'bold' }}>「{bestChar.work}」</div>
                <div style={{ fontSize: '3rem' }}>{bestChar.artist} 先生の作品です</div>
                {/* 開発時デバッグ */}
                {import.meta.env.DEV && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', fontFamily: 'monospace' }}>
                        [DEV] No.{bestChar.no} id={bestChar.id}<br />
                        char: {bestChar.characterImage} | cover: {bestChar.workImage}
                    </div>
                )}
            </div>
        </div>
    );
};
