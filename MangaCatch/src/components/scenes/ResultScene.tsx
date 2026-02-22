import React from 'react';

export const ResultScene: React.FC<{ score: number }> = ({ score }) => {
    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 44, color: '#00eebb' }}>FINISH!</div>
                <div style={{ marginTop: 10, fontSize: 28 }}>SCORE: {score}</div>
            </div>
        </div>
    );
};