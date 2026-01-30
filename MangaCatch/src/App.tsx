import { useState } from 'react'

// Game Scenes
import TitleScreen from './components/TitleScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'
import RankingScreen from './components/RankingScreen'
import PhotoMode from './components/PhotoMode'

// Types
export type GameState = 'BOOT' | 'TITLE' | 'TUTORIAL' | 'COUNTDOWN' | 'PLAY' | 'RESULT' | 'RANKING' | 'PHOTO'

function App() {
  // Default to PHOTO for testing per request
  const [gameState, setGameState] = useState<GameState>('PHOTO')

  // Simple Router
  const renderScreen = () => {
    switch (gameState) {
      case 'TITLE':
        return <TitleScreen onStart={() => setGameState('TUTORIAL')} />
      case 'TUTORIAL':
        return <div onClick={() => setGameState('COUNTDOWN')} style={{ textAlign: 'center', paddingTop: '20vh' }}><h1>TUTORIAL</h1><p>Click to Continue</p></div>
      case 'COUNTDOWN':
        return <GameScreen mode="countdown" onFinish={() => setGameState('RESULT')} />
      case 'PLAY':
        return <GameScreen mode="play" onFinish={() => setGameState('RESULT')} />
      case 'RESULT':
        return <ResultScreen onNext={() => setGameState('RANKING')} />
      case 'RANKING':
        return <RankingScreen onTitle={() => setGameState('TITLE')} />
      case 'PHOTO':
        return <PhotoMode />
      default:
        return <div>Loading...</div>
    }
  }

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  )
}

export default App
