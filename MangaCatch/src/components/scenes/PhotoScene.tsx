import React from 'react';
import type { CharacterData } from '../../constants/master';

interface PhotoSceneProps {
    bestChar: CharacterData | null;
}

export const PhotoScene: React.FC<PhotoSceneProps> = ({ bestChar }) => {
    if (!bestChar) return null;

    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', padding: '60px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {bestChar.workImage && <img src={`/assets/covers/${bestChar.workImage}`} style={{ height: '75vh', borderRadius: '15px' }} />}
            <div style={{ width: '45%', textAlign: 'right' }}>
                <div style={{ fontSize: '6rem', color: '#00eebb' }}>{bestChar.work}</div>
                <div style={{ fontSize: '4rem' }}>{bestChar.artist} 先生</div>
                <img src="/assets/ui/mangacatch_title_logo.png" style={{ width: '300px', marginTop: '40px' }} />
            </div>
        </div>
    );
};
