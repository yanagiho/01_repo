import React, { useMemo, useState } from 'react';
import type { CharacterData } from '../constants/master';

const PLACEHOLDER_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="600">
  <rect width="100%" height="100%" fill="#222"/>
  <rect x="12" y="12" width="396" height="576" fill="none" stroke="#666" stroke-width="4" stroke-dasharray="10 10"/>
  <text x="50%" y="50%" fill="#aaa" font-size="18" font-family="monospace"
    text-anchor="middle" dominant-baseline="middle">NO COVER</text>
</svg>
`);
const PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${PLACEHOLDER_SVG}`;

function baseDirsBooks(): string[] {
    const baseUrl = (import.meta as any)?.env?.BASE_URL ?? './';
    const norm = (s: string) => (s.endsWith('/') ? s : s + '/');

    const roots = [
        norm(baseUrl) + 'assets/books/',
        norm(baseUrl) + 'assets/covers/',
        './assets/books/',
        './assets/covers/',
        'assets/books/',
        'assets/covers/',
        '../assets/books/',
        '../assets/covers/',
        '../../assets/books/',
        '../../assets/covers/',
    ];

    return Array.from(new Set(roots));
}

function candidatesForCover(char: CharacterData): string[] {
    const dirs = baseDirsBooks();
    const names = Array.from(new Set([char.workImage]));
    const urls: string[] = [];
    for (const d of dirs) for (const n of names) urls.push(d + n);
    return urls;
}

export const CoverImage: React.FC<{ char: CharacterData; style?: React.CSSProperties }> = ({ char, style }) => {
    const candidates = useMemo(() => candidatesForCover(char), [char]);
    const [idx, setIdx] = useState(0);

    const src = candidates[idx] ?? PLACEHOLDER;

    return (
        <img
            src={src}
            alt={char.work}
            style={{ userSelect: 'none', WebkitUserDrag: 'none', ...style }}
            onError={() => {
                if (idx + 1 < candidates.length) setIdx(idx + 1);
                else console.warn('[CoverImage] not found', { work: char.work, tried: candidates });
            }}
            draggable={false}
        />
    );
};