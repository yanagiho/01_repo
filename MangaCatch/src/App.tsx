import React, { useState } from 'react';
import { SceneType } from './types/game';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants/game';

const App: React.FC = () => {
    const [currentScene] = useState<SceneType>('TITLE');

    return (
        <div
            style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                backgroundColor: '#000',
                color: '#fff',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'sans-serif',
            }}
        >
            <h1>MangaCatch - {currentScene}</h1>
            <div style={{ position: 'absolute', bottom: 20 }}>
                [TASK 1 COMPLETED: Project structure initialized]
            </div>
        </div>
    );
};

export default App;
