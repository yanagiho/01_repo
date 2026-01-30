import React, { useEffect, useRef } from 'react'

interface Props {
    mode: 'countdown' | 'play'
    onFinish: () => void
}

const GameScreen: React.FC<Props> = ({ mode, onFinish }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        // Placeholder for Game Loop
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Resize
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        // Loop
        let frameId: number
        const loop = () => {
            // Clear
            ctx.fillStyle = '#111'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw Text
            ctx.fillStyle = '#fff'
            ctx.font = '30px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(mode === 'countdown' ? "COUNTDOWN..." : "PLAYING...", canvas.width / 2, canvas.height / 2)

            frameId = requestAnimationFrame(loop)
        }
        loop()

        // Mock finish
        if (mode === 'play') {
            const timeout = setTimeout(onFinish, 5000) // 5 sec mock game
            return () => clearTimeout(timeout)
        } else if (mode === 'countdown') {
            const timeout = setTimeout(onFinish, 2000) // 2 sec count
            return () => clearTimeout(timeout)
        }

        return () => cancelAnimationFrame(frameId)
    }, [mode, onFinish])

    return <canvas ref={canvasRef} style={{ display: 'block' }} />
}

export default GameScreen
