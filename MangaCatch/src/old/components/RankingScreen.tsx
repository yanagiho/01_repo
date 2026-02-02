import React from 'react'

interface Props {
    onTitle: () => void
}

const RankingScreen: React.FC<Props> = ({ onTitle }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#000'
        }}>
            <h1>RANKING</h1>
            <ul>
                <li>1. 10000 pts</li>
                <li>2. 5000 pts</li>
                <li>3. 1000 pts</li>
            </ul>
            <button onClick={onTitle}>TITLE</button>
        </div>
    )
}

export default RankingScreen
