import ErrorBoundary from './components/ErrorBoundary'
import GameScreen from './components/GameScreen'

function App() {
  // Requirement: Force GameScreen rendering for debugging/robustness
  return (
    <ErrorBoundary>
      <GameScreen mode="play" onFinish={() => console.log("Finish triggered")} />
    </ErrorBoundary>
  )
}

export default App
