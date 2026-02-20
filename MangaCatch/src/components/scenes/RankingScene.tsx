import React from 'react';
import type { RankingEntry } from '../../types/game';

interface RankingSceneProps {
    ranking: RankingEntry[];
}

export const RankingScene: React.FC<RankingSceneProps> = ({ ranking }) => {
    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.9)', paddingTop: '100px' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '50px' }}>TODAY'S TOP 5</h1>
            <div style={{ width: '70%' }}>
                {ranking.length > 0 ? ranking.map((r: any, i: number) => (
                    <div key={`${i}-${r.score}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #444', fontSize: '3rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '60px' }}>{i + 1}.</span>
                            {/* ランキングのキャラデータ(r.id) を表示するにはマスタ引きが必要だが、ここでは簡易表示 */}
                            <img src={`/assets/characters/${r.id}.png`} style={{ height: '80px', margin: '0 30px', objectFit: 'contain' }} />
                        </span>
                        <span>{r.score} pt</span>
                    </div>
                )) : <div style={{ fontSize: '2rem' }}>Loading Ranking...</div>}
            </div>
        </div>
    );
};
