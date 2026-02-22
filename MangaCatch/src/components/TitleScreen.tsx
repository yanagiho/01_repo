import React from 'react';

export const TitleScene: React.FC<{ onStart?: () => void }> = ({ onStart }) => {
  return (
    <div
      onClick={onStart}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, letterSpacing: 2, color: '#00eebb' }}>MANGA Catch!</div>
        <div style={{ marginTop: 12, opacity: 0.8 }}>（自動で開始します / クリックでも開始）</div>
      </div>
    </div>
  );
};