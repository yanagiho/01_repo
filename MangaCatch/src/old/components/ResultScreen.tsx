import React from 'react'

interface Props {
    onNext: () => void
}

const ResultScreen: React.FC<Props> = ({ onNext }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)'
        }}>
            <h1>RESULT</h1>
            <p>Score: 12345</p>
            <button onClick={onNext}>NEXT</button>
        </div>
    )
}

export default ResultScreen
