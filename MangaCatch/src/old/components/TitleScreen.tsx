import React from 'react'

interface Props {
    onStart: () => void
}

const TitleScreen: React.FC<Props> = ({ onStart }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #000 100%)'
        }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '2rem' }}>MANGA CATCH</h1>
            <p>Milestone 1: Mouse Ver.</p>
            <button
                onClick={onStart}
                style={{
                    padding: '1rem 3rem',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    marginTop: '2rem'
                }}
            >
                START GAME
            </button>
        </div>
    )
}

export default TitleScreen
