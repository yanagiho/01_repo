import React from 'react';
import { LEGAL_NOTICE, TITLE_LOGO_PATH } from '../constants/branding';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      // 修正箇所: 背景色を透明に変更して、後ろの宇宙が見えるようにしました
      backgroundColor: 'transparent', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      {/* タイトルロゴ */}
      <div style={{ marginBottom: '4rem' }}>
        <img 
          src={TITLE_LOGO_PATH} 
          alt="Manga Catch Title" 
          style={{ 
            maxWidth: '80vw', 
            maxHeight: '40vh',
            objectFit: 'contain'
          }}
          onError={(e) => {
            // 画像がない場合のフォールバック
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerText = "Manga Catch (Logo Not Found)";
          }}
        />
      </div>

      {/* スタート案内 */}
      <div 
        onClick={onStart}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          padding: '1rem 3rem',
          border: '2px solid white',
          borderRadius: '50px',
          backgroundColor: 'rgba(255,255,255,0.1)', // ボタンの背景は少し半透明に
          animation: 'pulse 2s infinite'
        }}
      >
        Touch to Start
      </div>

      {/* 権利表記 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        fontSize: '14px',
        width: '100%',
        textAlign: 'center',
        opacity: 0.8,
        whiteSpace: 'pre-wrap'
      }}>
        {LEGAL_NOTICE}
      </div>

      {/* 点滅アニメーション用スタイル */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};