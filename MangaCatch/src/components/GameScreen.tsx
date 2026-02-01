import React, { useEffect, useState, useCallback } from 'react'
import GameCanvas from '../game/GameCanvas'

interface Props {
    mode: 'countdown' | 'play'
    onFinish: () => void
}

const GameScreen: React.FC<Props> = ({ onFinish }) => {
    const [score, setScore] = useState(0)
    const [shootSignal, setShootSignal] = useState(0)
    const [resetSignal, setResetSignal] = useState(0)
    const [isPlaying] = useState(true) // Default true for MVP

    // Handle Keyboard Input
    useEffect(() => {
        console.log("GameScreen mounted")
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'r' || e.key === 'R') {
                handleReset()
            }
            if (e.code === 'Space') {
                handleShoot()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    console.log("GameScreen render")

    const handleShoot = () => {
        console.log("GameScreen: handleShoot")
        setShootSignal(prev => prev + 1)
    }

    const handleReset = () => {
        console.log("GameScreen: handleReset")
        setResetSignal(prev => prev + 1)
        setScore(0)
    }

    // Callback from Canvas
    const handleScoreUpdate = useCallback((delta: number) => {
        if (delta === 0) setScore(0)
        else setScore(prev => prev + delta)
    }, [])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#222' }}>
            {/* Debug Info Overlay */}
            <div style={{
                position: 'absolute', top: 0, right: 0,
                background: 'rgba(0,0,0,0.8)', color: '#0f0',
                padding: '10px', fontSize: '12px', fontFamily: 'monospace',
                pointerEvents: 'none', zIndex: 100
            }}>
                <p>Status: Mounted</p>
                <p>Score: {score}</p>
                <p>ShootSig: {shootSignal}</p>
                <p>ResetSig: {resetSignal}</p>
                <p>IsPlaying: {String(isPlaying)}</p>
            </div>

            {/* Canvas Container: Fixed Center 800x600 for robustness */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '800px', height: '600px',
                background: '#000',
                border: '2px solid #555'
            }}>
                <GameCanvas
                    onScore={handleScoreUpdate}
                    shootSignal={shootSignal}
                    resetSignal={resetSignal}
                    isPlaying={isPlaying}
                />
            </div>

            {/* Score Display */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', fontSize: '32px', fontWeight: 'bold', zIndex: 10 }}>
                SCORE: {score}
            </div>

            {/* Control UI */}
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 10 }}>
                <button
                    onClick={handleShoot}
                    style={{
                        padding: '20px 40px', fontSize: '24px', background: 'red', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer'
                    }}
                >
                    SHOOT
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        padding: '10px 20px', fontSize: '16px', background: '#333', color: '#fff',
                        border: 'none', borderRadius: '8px', cursor: 'pointer'
                    }}
                >
                    R (Reset)
                </button>
                <button
                    onClick={onFinish}
                    style={{
                        padding: '10px 20px', fontSize: '16px', background: '#333', color: '#fff',
                        border: 'none', borderRadius: '8px', cursor: 'pointer'
                    }}
                >
                    Back
                </button>
            </div>
        </div>
    )
}

export default GameScreen
