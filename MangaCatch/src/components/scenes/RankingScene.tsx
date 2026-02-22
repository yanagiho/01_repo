import React from 'react';
import type { RankingEntry } from '../../types/game';
import { CHARACTER_MAP, getCharacterImagePath } from '../../constants/master';

const PLACEHOLDER_CHARA = '/assets/ui/placeholder_chara.png';

interface RankingSceneProps {
    ranking: RankingEntry[];
}

export const RankingScene: React.FC<RankingSceneProps> = ({ ranking }) => {
    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.9)', paddingTop: '100px' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '50px' }}>TODAY'S TOP 5</h1>
            <div style={{ width: '70%' }}>
                {ranking.length > 0 ? ranking.slice(0, 5).map((r: RankingEntry, i: number) => {
                    const char = r.bestCharId ? CHARACTER_MAP.get(r.bestCharId) : undefined;
                    const imgSrc = char ? getCharacterImagePath(char) : null;
                    const score = r.total_score ?? 0;

                    return (
                        <div key={`${i}-${score}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #444', fontSize: '3rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ width: '60px' }}>{i + 1}.</span>
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={char?.name ?? ''}
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            if (img.src !== PLACEHOLDER_CHARA) img.src = PLACEHOLDER_CHARA;
                                        }}
                                        style={{ height: '80px', margin: '0 30px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div style={{ width: '80px', height: '80px', margin: '0 30px', background: '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>？</div>
                                )}
                                {char && (
                                    <span style={{ fontSize: '1.5rem', color: '#aaa' }}>{char.name}</span>
                                )}
                            </span>
                            <span>{score} pt</span>
                        </div>
                    );
                }) : <div style={{ fontSize: '2rem' }}>Loading Ranking...</div>}
            </div>
        </div>
    );
};