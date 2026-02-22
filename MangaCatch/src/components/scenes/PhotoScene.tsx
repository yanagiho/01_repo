import React from 'react';
import type { CharacterData } from '../../constants/master';
import { getCharacterImagePath, getCoverImagePath } from '../../constants/master';

const PLACEHOLDER_CHARA = '/assets/ui/placeholder_chara.png';
const PLACEHOLDER_COVER = '/assets/ui/placeholder_cover.png';

interface PhotoSceneProps {
    bestChar: CharacterData | null;
}

export const PhotoScene: React.FC<PhotoSceneProps> = ({ bestChar }) => {
    if (!bestChar) return null;

    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', padding: '60px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <img
                src={getCoverImagePath(bestChar)}
                alt={`${bestChar.work} 書影`}
                onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src !== PLACEHOLDER_COVER) {
                        console.warn(`[MangaCatch] PhotoScene 書影ロード失敗: ${bestChar.workImage} (id=${bestChar.id})`);
                        img.src = PLACEHOLDER_COVER;
                    }
                }}
                style={{ height: '75vh', borderRadius: '15px' }}
            />
            <div style={{ width: '45%', textAlign: 'right' }}>
                <div style={{ fontSize: '6rem', color: '#00eebb' }}>{bestChar.work}</div>
                <div style={{ fontSize: '4rem' }}>{bestChar.artist} 先生</div>
                <img src="/assets/ui/mangacatch_title_logo.png" style={{ width: '300px', marginTop: '40px' }} />
                {/* 開発時デバッグ */}
                {import.meta.env.DEV && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', fontFamily: 'monospace', textAlign: 'left' }}>
                        [DEV] No.{bestChar.no} id={bestChar.id}<br />
                        char: {bestChar.characterImage} | cover: {bestChar.workImage}
                    </div>
                )}
            </div>
        </div>
    );
};
