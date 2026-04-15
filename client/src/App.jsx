import React, { useState, useMemo } from 'react';
import PlayerSetup from './components/PlayerSetup';
import GameMenu from './components/GameMenu';
import ScoreBoard from './components/ScoreBoard';
import ReactionTime from './games/ReactionTime';
import MemoryTest from './games/MemoryTest';
import StroopTest from './games/StroopTest';

const S = { SETUP: 'setup', MENU: 'menu', REACTION: 'reaction', MEMORY: 'memory', STROOP: 'stroop', SCORES: 'scores' };

const StarBackground = () => {
  const stars = useMemo(() =>
    Array.from({ length: 160 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.2 + 0.4,
      dur: (Math.random() * 4 + 2).toFixed(1),
      delay: (Math.random() * 6).toFixed(1),
    })), []);

  return (
    <div className="stars-bg">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            '--d': `${s.dur}s`, '--delay': `${s.delay}s`,
          }}
        />
      ))}
      {/* Nebula blobs */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        borderRadius: '50%', top: '-15%', left: '-10%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', bottom: '-10%', right: '-8%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState(S.SETUP);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [history, setHistory] = useState([]);

  const handleSetup = (playerData) => {
    setPlayers(playerData);
    const init = {};
    playerData.forEach(p => { init[p.id] = 0; });
    setScores(init);
    setHistory([]);
    setScreen(S.MENU);
  };

  const handleGameDone = (game, gameScores) => {
    setScores(prev => {
      const next = { ...prev };
      Object.entries(gameScores).forEach(([id, pts]) => { next[id] = (next[id] || 0) + pts; });
      return next;
    });
    setHistory(prev => [...prev, { game, scores: gameScores, ts: Date.now() }]);
    setScreen(S.MENU);
  };

  const nav = (s) => setScreen(s);

  const gameProps = (game) => ({
    players,
    onComplete: (gs) => handleGameDone(game, gs),
    onBack: () => nav(S.MENU),
  });

  return (
    <>
      <StarBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {screen === S.SETUP    && <PlayerSetup onComplete={handleSetup} />}
        {screen === S.MENU     && <GameMenu players={players} scores={scores} onPlay={nav} onScores={() => nav(S.SCORES)} onReset={() => nav(S.SETUP)} screens={S} />}
        {screen === S.REACTION && <ReactionTime {...gameProps(S.REACTION)} />}
        {screen === S.MEMORY   && <MemoryTest   {...gameProps(S.MEMORY)} />}
        {screen === S.STROOP   && <StroopTest   {...gameProps(S.STROOP)} />}
        {screen === S.SCORES   && <ScoreBoard players={players} scores={scores} history={history} onBack={() => nav(S.MENU)} />}
      </div>
    </>
  );
}
