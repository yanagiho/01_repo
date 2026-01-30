import React, { useEffect, useState, useRef } from 'react';
import { AssetLoader } from '../game/assets';
import type { AssetEntry, AssetManifest } from '../game/assets';

interface PlacedCharacter {
    uid: string; // Unique ID for this instance
    asset: AssetEntry;
    x: number;
    y: number;
    scale: number;
}

const PhotoMode: React.FC = () => {
    const [manifest, setManifest] = useState<AssetManifest | null>(null);
    const [selectedCover, setSelectedCover] = useState<AssetEntry | null>(null);
    const [placedChars, setPlacedChars] = useState<PlacedCharacter[]>([]);

    // Interaction State
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null); // For scaling
    const dragOffset = useRef({ x: 0, y: 0 });
    const stageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        AssetLoader.loadManifest().then(data => {
            setManifest(data);
            if (data.covers.length > 0) {
                setSelectedCover(data.covers[0]);
            }
        });
    }, []);

    const addCharacter = (asset: AssetEntry) => {
        const newChar: PlacedCharacter = {
            uid: Date.now().toString() + Math.random().toString(),
            asset,
            x: 200 + (placedChars.length * 20), // Cascade
            y: 200 + (placedChars.length * 20),
            scale: 1.0
        };
        setPlacedChars([...placedChars, newChar]);
        setActiveId(newChar.uid);
    };

    const handleMouseDown = (e: React.MouseEvent, uid: string, x: number, y: number) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveId(uid);
        setDraggingId(uid);
        dragOffset.current = { x: e.clientX - x, y: e.clientY - y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingId) {
            const newX = e.clientX - dragOffset.current.x;
            const newY = e.clientY - dragOffset.current.y;

            setPlacedChars(chars => chars.map(c =>
                c.uid === draggingId ? { ...c, x: newX, y: newY } : c
            ));
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (activeId) {
            const newScale = parseFloat(e.target.value);
            setPlacedChars(chars => chars.map(c =>
                c.uid === activeId ? { ...c, scale: newScale } : c
            ));
        }
    };

    const takePhoto = () => {
        if (!selectedCover) return;

        // Draw to hidden canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Load images and draw
        // Helper to load image
        const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });

        (async () => {
            try {
                // 1. Bg
                const bgImg = await load(selectedCover.file);
                // Draw BG to fit/fill
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

                // 2. Characters
                // We need to map screen coordinates to canvas coordinates if stage size differs
                // For Kiosk default 1920x1080 stage, 1:1 mapping is easiest.
                // If CSS scales the stage, we need a ratio.
                // Assuming stage is fullscreen 100vw/100vh.
                const stageW = stageRef.current?.clientWidth || 1920;
                const stageH = stageRef.current?.clientHeight || 1080;
                const ratioX = canvas.width / stageW;
                const ratioY = canvas.height / stageH;

                for (const p of placedChars) {
                    const img = await load(p.asset.file); // AssetLoader.getUrl(p.asset.file) already in file prop
                    // Calc position
                    const drawX = p.x * ratioX;
                    const drawY = p.y * ratioY;
                    // If we want to preserve Aspect Ratio of image vs scale
                    // Using img.naturalWidth
                    const w = img.naturalWidth * p.scale * ratioX; // scaled relative to screen ratio
                    const h = img.naturalHeight * p.scale * ratioY;

                    ctx.drawImage(img, drawX, drawY, w, h);
                }

                // 3. Download
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `mangacatch_${Date.now()}.png`;
                link.href = dataUrl;
                link.click();

            } catch (e) {
                console.error("Photo failed", e);
                alert("Photo failed");
            }
        })();
    };

    if (!manifest) return <div>Loading Assets...</div>;

    const activeChar = placedChars.find(c => c.uid === activeId);

    return (
        <div
            className="photo-mode-container"
            style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', background: '#222' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Sidebar Left: Covers */}
            <div style={{ width: '250px', background: '#333', overflowY: 'auto', padding: '10px', zIndex: 10 }}>
                <h3 style={{ color: 'white' }}>Backgrounds</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                    {manifest.covers.map(cover => (
                        <div
                            key={cover.id}
                            onClick={() => setSelectedCover(cover)}
                            style={{
                                border: selectedCover?.id === cover.id ? '2px solid cyan' : '2px solid transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <img src={cover.file} style={{ width: '100%' }} alt={cover.id} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Stage */}
            <div
                ref={stageRef}
                style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#000',
                    backgroundImage: selectedCover ? `url(${selectedCover.file})` : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center'
                }}
            >
                {placedChars.map(char => (
                    <div
                        key={char.uid}
                        onMouseDown={(e) => handleMouseDown(e, char.uid, char.x, char.y)}
                        style={{
                            position: 'absolute',
                            left: char.x,
                            top: char.y,
                            transform: `scale(${char.scale})`,
                            transformOrigin: 'top left',
                            cursor: 'move',
                            border: activeId === char.uid ? '1px dashed cyan' : 'none'
                        }}
                    >
                        <img
                            src={char.asset.file}
                            alt={char.asset.id}
                            draggable={false}
                            style={{ display: 'block', pointerEvents: 'none' }}
                        />
                    </div>
                ))}
            </div>

            {/* Sidebar Right: Characters & Controls */}
            <div style={{ width: '250px', background: '#333', display: 'flex', flexDirection: 'column', padding: '10px', zIndex: 10 }}>
                <div style={{ marginBottom: '20px', background: '#444', padding: '10px', borderRadius: '8px' }}>
                    <button
                        onClick={takePhoto}
                        style={{ width: '100%', padding: '15px', background: 'cyan', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}
                    >
                        📸 SHOOT
                    </button>
                    {activeChar && (
                        <div style={{ marginTop: '10px', color: 'white' }}>
                            <label>Scale: {activeChar.scale.toFixed(1)}</label>
                            <input
                                type="range"
                                min="0.5"
                                max="3.0"
                                step="0.1"
                                value={activeChar.scale}
                                onChange={handleScaleChange}
                                style={{ width: '100%' }}
                            />
                            <button onClick={() => {
                                setPlacedChars(placedChars.filter(c => c.uid !== activeId));
                                setActiveId(null);
                            }} style={{ marginTop: '5px', background: 'red', color: 'white', width: '100%' }}>Delete</button>
                        </div>
                    )}
                </div>

                <h3 style={{ color: 'white' }}>Characters</h3>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        {manifest.characters.map(char => (
                            <div
                                key={char.id}
                                onClick={() => addCharacter(char)}
                                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.1)', padding: '5px' }}
                            >
                                <img src={char.file} style={{ width: '100%', height: '80px', objectFit: 'contain' }} alt={char.id} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoMode;
