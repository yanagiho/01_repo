import React from 'react';
import type { CharacterData } from '../../constants/master';
import { getCoverImagePath, getAttachmentPath } from '../../constants/master';

const PLACEHOLDER_COVER = '/assets/ui/placeholder_cover.png';

interface PhotoSceneProps {
    bestChar: CharacterData | null;
}

export const PhotoScene: React.FC<PhotoSceneProps> = ({ bestChar }) => {
    if (!bestChar) return null;

    const attachmentUrl = getAttachmentPath(bestChar);

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                padding: '60px',
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))',
                alignItems: 'flex-end',
                justifyContent: 'space-between'
            }}
        >
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

                {/* 添付PDF（作品閲覧）: 必ず bestChar から引くのでズレない */}
                {attachmentUrl && (
                    <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            // Electron/ブラウザ両対応。既定動作でもOKだが、明示しておく。
                            e.preventDefault();
                            window.open(attachmentUrl, '_blank', 'noopener,noreferrer');
                        }}
                        style={{
                            display: 'inline-block',
                            marginTop: '28px',
                            padding: '14px 20px',
                            fontSize: '1.4rem',
                            borderRadius: '12px',
                            border: '2px solid #00eebb',
                            color: '#00eebb',
                            textDecoration: 'none'
                        }}
                    >
                        作品PDFを開く
                    </a>
                )}

                <img
                    src="/assets/ui/mangacatch_title_logo.png"
                    style={{ width: '300px', marginTop: '40px' }}
                    alt="MangaCatch"
                />

                {/* 開発時デバッグ */}
                {import.meta.env.DEV && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', fontFamily: 'monospace', textAlign: 'left' }}>
                        [DEV] No.{bestChar.no} id={bestChar.id}<br />
                        cover: {bestChar.workImage}<br />
                        attach: {bestChar.attachmentFile ?? '(fallback: attach_XXX.pdf)'}
                    </div>
                )}
            </div>
        </div>
    );
};