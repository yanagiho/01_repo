import React, { useEffect, useRef } from 'react'

interface Props {
    onScore?: (delta: number) => void
    shootSignal?: number
    resetSignal?: number
    isPlaying: boolean
}

const GameCanvas: React.FC<Props> = ({ onScore, shootSignal, resetSignal, isPlaying }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Internal Game State
    const gameState = useRef({
        player: { x: 0, y: 0, width: 50, height: 50 },
        bullets: [] as { x: number, y: number, r: number, speed: number, active: boolean }[],
        targets: [] as { x: number, y: number, r: number, active: boolean }[],
        frameCount: 0
    })

    // Helper: Spawn Target
    const spawnTarget = (width: number, height: number) => {
        const state = gameState.current
        const r = 30
        // Simple random position in top half
        const x = Math.random() * (width - 2 * r) + r
        const y = Math.random() * (height / 2 - 2 * r) + r
        state.targets = [{ x, y, r, active: true }]
    }

    // Effect: Init & Game Loop
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) {
            console.error("GameCanvas: Canvas Ref is null")
            return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            console.error("GameCanvas: Failed to get 2D context")
            return
        }

        console.log("GameCanvas: Init Loop", { width: canvas.offsetWidth, height: canvas.offsetHeight })

        // Initial Sizing
        const initSize = () => {
            const dpr = window.devicePixelRatio || 1
            const rect = canvas.getBoundingClientRect()

            canvas.width = rect.width * dpr
            canvas.height = rect.height * dpr

            ctx.scale(dpr, dpr)

            // Reset player pos
            const state = gameState.current
            state.player.x = rect.width / 2
            state.player.y = rect.height - 50

            // Spawn if needed
            if (state.targets.length === 0) spawnTarget(rect.width, rect.height)
        }
        initSize()

        let frameId: number
        let lastTime = performance.now()
        let fps = 0

        const loop = (time: number) => {
            frameId = requestAnimationFrame(loop)

            const delta = time - lastTime
            if (delta >= 1000) {
                fps = gameState.current.frameCount
                gameState.current.frameCount = 0
                lastTime = time
            }
            gameState.current.frameCount++

            // Logical dimensions
            const width = canvas.width / (window.devicePixelRatio || 1)
            const height = canvas.height / (window.devicePixelRatio || 1)

            // Update
            if (isPlaying) {
                const state = gameState.current
                // Bullets
                state.bullets.forEach(b => {
                    if (!b.active) return
                    b.y -= b.speed
                    if (b.y < -10) b.active = false
                })

                // Collision
                const activeTarget = state.targets.find(t => t.active)
                if (activeTarget) {
                    state.bullets.forEach(b => {
                        if (!b.active) return
                        const dx = b.x - activeTarget.x
                        const dy = b.y - activeTarget.y
                        const dist = Math.sqrt(dx * dx + dy * dy)
                        if (dist < activeTarget.r + b.r) {
                            // Hit
                            b.active = false
                            activeTarget.active = false
                            if (onScore) onScore(1)
                            spawnTarget(width, height)
                        }
                    })
                }
            }

            // Draw
            // 1. Background (Active visual)
            ctx.fillStyle = '#111'
            ctx.fillRect(0, 0, width, height)

            // 2. Grid lines
            ctx.strokeStyle = '#333'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
            ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
            ctx.stroke()

            const state = gameState.current

            // Player
            ctx.fillStyle = '#00f'
            ctx.fillRect(
                state.player.x - state.player.width / 2,
                state.player.y - state.player.height / 2,
                state.player.width,
                state.player.height
            )

            // Bullets
            ctx.fillStyle = '#ff0'
            state.bullets.forEach(b => {
                if (!b.active) return
                ctx.beginPath()
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
                ctx.fill()
            })

            // Targets
            ctx.fillStyle = '#f00'
            state.targets.forEach(t => {
                if (!t.active) return
                ctx.beginPath()
                ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2)
                ctx.fill()
            })

            // FPS / Debug
            ctx.fillStyle = '#0f0'
            ctx.font = '12px monospace'
            ctx.textAlign = 'left'
            ctx.fillText(`FPS: ${fps} | Objs: ${state.bullets.length + state.targets.length}`, 10, 20)
        }

        frameId = requestAnimationFrame(loop)

        return () => {
            console.log("GameCanvas: Cleanup")
            cancelAnimationFrame(frameId)
        }
    }, [isPlaying, onScore]) // Dependencies

    // Effect: Shoot Signal
    const lastShootSignal = useRef(shootSignal)
    useEffect(() => {
        if (shootSignal !== undefined && shootSignal !== lastShootSignal.current) {
            lastShootSignal.current = shootSignal
            const state = gameState.current
            state.bullets.push({
                x: state.player.x,
                y: state.player.y - state.player.height / 2,
                r: 5,
                speed: 10,
                active: true
            })
        }
    }, [shootSignal])

    // Effect: Reset Signal
    const lastResetSignal = useRef(resetSignal)
    useEffect(() => {
        if (resetSignal !== undefined && resetSignal !== lastResetSignal.current) {
            lastResetSignal.current = resetSignal
            const state = gameState.current
            state.bullets = []

            const canvas = canvasRef.current
            const width = canvas ? (canvas.width / (window.devicePixelRatio || 1)) : 800
            const height = canvas ? (canvas.height / (window.devicePixelRatio || 1)) : 600

            spawnTarget(width, height)
        }
    }, [resetSignal])

    // Effect: Resize Observer
    useEffect(() => {
        if (!canvasRef.current) return
        const ro = new ResizeObserver(() => {
            const canvas = canvasRef.current
            if (!canvas) return
            const dpr = window.devicePixelRatio || 1
            const rect = canvas.getBoundingClientRect()
            canvas.width = rect.width * dpr
            canvas.height = rect.height * dpr
            const ctx = canvas.getContext('2d')
            if (ctx) ctx.scale(dpr, dpr)

            gameState.current.player.x = rect.width / 2
            gameState.current.player.y = rect.height - 50
        })
        ro.observe(canvasRef.current)
        return () => ro.disconnect()
    }, [])

    return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}

export default GameCanvas
