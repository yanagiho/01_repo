import React from 'react';

interface TutorialSceneProps {
    onSkip: () => void;
}

export const TutorialScene: React.FC<TutorialSceneProps> = ({ onSkip }) => {
    return (
        <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '50px' }}>TUTORIAL (READY?)</div>
            <div onClick={onSkip} style={{ padding: '20px 60px', background: 'red', borderRadius: '50px', fontSize: '2.5rem', cursor: 'pointer' }}>SKIP ≫</div>
        </div>
    );
};
