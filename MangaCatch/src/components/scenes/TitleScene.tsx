import React from 'react';

interface TitleSceneProps {
    onStart: () => void;
}

export const TitleScene: React.FC<TitleSceneProps> = ({ onStart }) => {
    return (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <img src="/assets/ui/mangacatch_title_logo.png" style={{ width: '600px', marginBottom: '80px' }} />
            <div onClick={onStart} style={{ fontSize: '3rem', padding: '30px 80px', border: '4px solid white', borderRadius: '100px', cursor: 'pointer' }}>TOUCH TO START</div>
        </div>
    );
};
