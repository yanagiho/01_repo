import React, { useState } from 'react';
import type { CharacterData } from '../constants/master';
import { getCharacterImagePath } from '../constants/master';

interface CharacterImageProps {
    char: CharacterData;
    style?: React.CSSProperties;
    className?: string;
}

/**
 * キャラクター画像を表示するコンポーネント。
 * 画像が読み込めない場合はフォールバックとしてキャラ名を表示する。
 */
export const CharacterImage: React.FC<CharacterImageProps> = ({ char, style, className }) => {
    const [error, setError] = useState(false);
    const src = getCharacterImagePath(char);

    if (error) {
        // 画像が存在しない場合のフォールバック表示
        return (
            <div
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    border: '2px dashed rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontSize: 14,
                    textAlign: 'center',
                    padding: 8,
                    ...style,
                }}
            >
                {char.name}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={char.name}
            className={className}
            style={style}
            onError={() => setError(true)}
        />
    );
};