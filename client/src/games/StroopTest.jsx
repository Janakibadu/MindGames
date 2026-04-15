import React, { useState, useEffect, useRef, useCallback } from 'react';

const COLORS = [
  { name: 'RED',    hex: '#ff3366' },
  { name: 'BLUE',   hex: '#00d4ff' },
  { name: 'GREEN',  hex: '#00ff88' },
  { name: 'YELLOW', hex: '#ffd700' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#ff8c00' },
];

const ROUNDS = 10;
const TIME_PER_ROUND = 4000; // ms

const PHASE = {
  INTRO: 'intro',
  SWITCH: 'switch',
  PLAYING: 'playing',
  RESULT: 'result',
  FINAL: 'final',
};

function makePuzzle() {
  const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  let displayColor;
  do { displayColor = COLORS[Math.floor(Math.random() * COLORS.length)]; }
  while (displayColor.name === wordColor.name);

  // Build 4 options: always include displayColor + 3 random others
  const others = COLORS.filter(c => c.name !== displayColor.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [displayColor, ...others].sort(() => Math.random() - 0.5);

  return { wordColor, displayColor, options };
}

export default function StroopTest({ players, onComplete, onBack }) {
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [roundResults, setRoundResults] = useState([]); // { correct, ms }
  const [playerScores, setPlayerScores] = useState({}); // { pid: totalScore }
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [answered, setAnswered] = useState(false);

  const timerRef = useRef(null);
  const startRef = useRef(null);
  const currentPlayer = players[currentPlayerIdx];

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };
  useEffect(() => () => clearTimer(), []);

  const nextPuzzle = useCallback((roundNum) => {
    const p = makePuzzle();
    setPuzzle(p);
    setAnswered(false);
    setFeedback(null);
    setTimeLeft(TIME_PER_ROUND);
    startRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 100) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 50;
      });
    }, 50);

    // Auto-advance on timeout
    const timeoutId = setTimeout(() => {
      clearInterval(timerRef.current);
      setAnswered(true);
      setFeedback('timeout');
      setRoundResults(prev => [...prev, { correct: false, ms: TIME_PER_ROUND }]);
      setTimeout(() => advanceRound(roundNum), 900);
    }, TIME_PER_ROUND);

    // Store timeout id in ref for cleanup
    timerRef.current = { interval: timerRef.current, timeout: timeoutId };
  }, []);

  const clearAll = () => {
    if (timerRef.current?.interval) clearInterval(timerRef.current.interval);
    if (timerRef.current?.timeout) clearTimeout(timerRef.current.timeout);
    if (typeof timerRef.current === 'number') clearInterval(timerRef.current);
  };

  const advanceRound = useCallback((currentRound) => {
    const next = currentRound + 1;
    if (next >= ROUNDS) {
      setPhase(PHASE.RESULT);
    } else {
      setRound(next);
      nextPuzzle(next);
    }
  }, [nextPuzzle]);

  const handleAnswer = useCallback((colorName) => {
    if (answered) return;
    clearAll();

    const ms = Date.now() - startRef.current;
    const isCorrect = colorName === puzzle.displayColor.name;

    setAnswered(true);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setRoundResults(prev => [...prev, { correct: isCorrect, ms }]);

    setTimeout(() => advanceRound(round), 700);
  }, [answered, puzzle, round, advanceRound]);

  const startGame = () => {
    setRound(0);
    setRoundResults([]);
    nextPuzzle(0);
    setPhase(PHASE.PLAYING);
  };

  const calcScore = (results) => {
    return results.reduce((total, r) => {
      if (!r.correct) return total;
      const speedBonus = Math.max(0, Math.round((TIME_PER_ROUND - r.ms) / TIME_PER_ROUND * 50));
      return total + 100 + speedBonus;
    }, 0);
  };

  const handleResultDone = () => {
    const score = calcScore(roundResults);
    const pid = currentPlayer.id;
    setPlayerScores(prev => ({ ...prev, [pid]: score }));

    if (currentPlayerIdx < players.length - 1) {
      setCurrentPlayerIdx(i => i + 1);
      setPhase(PHASE.SWITCH);
    } else {
      // Need to set score for current player then go to final
      setPlayerScores(prev => {
        const updated = { ...prev, [pid]: score };
        return updated;
      });
      setPhase(PHASE.FINAL);
    }
  };

  const handleFinish = () => {
    const gameScores = {};
    players.forEach(p => { gameScores[p.id] = playerScores[p.id] || 0; });
    // For the last player who finished, ensure their score is included
    if (currentPlayerIdx === players.length - 1) {
      gameScores[currentPlayer.id] = calcScore(roundResults);
    }
    onComplete(gameScores);
  };

  // ── INTRO ──
  if (phase === PHASE.INTRO) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 32, display: 'block', margin: '0 auto 32px' }}>← Back</button>
          <div style={{ fontSize: '4rem', marginBottom: 20, filter: 'drop-shadow(0 0 20px #a855f7)' }}>🎨</div>
          <h1 className="h1 text-purple glow-purple" style={{ marginBottom: 16 }}>Stroop Test</h1>

          {/* Demo */}
          <div className="card" style={{ marginBottom: 28, padding: '24px' }}>
            <p className="label text-center" style={{ marginBottom: 16 }}>Example</p>
            <div style={{
              fontFamily: 'var(--font-d)', fontSize: 'clamp(2rem, 8vw, 3rem)',
              fontWeight: 900, color: '#00d4ff',
              textShadow: '0 0 20px #00d4ff',
              marginBottom: 12,
            }}>
              RED
            </div>
            <p className="text-dim" style={{ fontSize: '0.88rem' }}>
              The word says <strong style={{ color: '#ff3366' }}>RED</strong> but it's displayed in{' '}
              <strong style={{ color: '#00d4ff' }}>BLUE</strong>.
            </p>
            <p className="text-dim" style={{ marginTop: 8, fontSize: '0.88rem' }}>
              → Click <strong style={{ color: '#00d4ff' }}>BLUE</strong> (the display color, not the word)!
            </p>
          </div>

          <div className="card" style={{ marginBottom: 32, padding: '20px 24px' }}>
            <div className="flex col gap12">
              {[
                ['🔟', `${ROUNDS} rounds — 4 seconds each`],
                ['⚡', 'Faster correct answers = more points'],
                ['❌', 'Wrong answers lose points'],
                ['🧠', 'Focus on the COLOR, ignore the word!'],
              ].map(([icon, text]) => (
                <div key={text} className="flex gap12" style={{ alignItems: 'center', textAlign: 'left' }}>
                  <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>{icon}</span>
                  <span className="text-dim" style={{ fontSize: '0.88rem' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={() => setPhase(PHASE.SWITCH)}>
            I'm Ready!
          </button>
        </div>
      </div>
    );
  }

  // ── SWITCH ──
  if (phase === PHASE.SWITCH) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="animate-popIn">
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>{currentPlayer.avatar}</div>
          <h2 className="h2" style={{ color: currentPlayer.color, marginBottom: 12 }}>
            {currentPlayer.name}'s Turn
          </h2>
          <p className="text-dim" style={{ marginBottom: 32 }}>Click the display color, not the word!</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={startGame}
            style={{ background: `linear-gradient(135deg, ${currentPlayer.color}, ${currentPlayer.color}88)` }}
          >
            Start Stroop Test!
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  if (phase === PHASE.PLAYING && puzzle) {
    const progress = (timeLeft / TIME_PER_ROUND) * 100;
    const isUrgent = timeLeft < 1500;
    const correct = roundResults.filter(r => r.correct).length;

    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 560 }}>
          {/* Header */}
          <div className="flex between" style={{ marginBottom: 16, alignItems: 'center' }}>
            <div className="flex gap8" style={{ alignItems: 'center' }}>
              <span>{currentPlayer.avatar}</span>
              <span style={{ fontFamily: 'var(--font-d)', color: currentPlayer.color, fontSize: '0.8rem' }}>
                {currentPlayer.name}
              </span>
            </div>
            <div className="flex gap16" style={{ alignItems: 'center' }}>
              <span className="badge badge-green">✓ {correct}</span>
              <span style={{
                fontFamily: 'var(--font-d)', fontSize: '0.85rem',
                color: 'var(--dim)',
              }}>
                {round + 1}/{ROUNDS}
              </span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="progress-wrap" style={{ marginBottom: 36, height: 8 }}>
            <div className="progress-bar" style={{
              width: `${progress}%`,
              background: isUrgent
                ? 'linear-gradient(90deg, #ff3366, #ff6699)'
                : 'linear-gradient(90deg, #a855f7, #00d4ff)',
              transition: 'width 0.05s linear',
              boxShadow: isUrgent
                ? '0 0 12px rgba(255,51,102,0.7)'
                : '0 0 10px rgba(168,85,247,0.5)',
            }} />
          </div>

          {/* Round dots */}
          <div className="flex center gap8" style={{ marginBottom: 36 }}>
            {Array.from({ length: ROUNDS }).map((_, i) => {
              const r = roundResults[i];
              return (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: r ? (r.correct ? '#00ff88' : '#ff3366') : i === round ? 'white' : 'rgba(255,255,255,0.2)',
                  boxShadow: i === round ? '0 0 8px white' : r?.correct ? '0 0 8px #00ff88' : '',
                  transition: 'all 0.3s ease',
                }} />
              );
            })}
          </div>

          {/* The word */}
          <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
            <div style={{
              fontFamily: 'var(--font-d)',
              fontSize: 'clamp(3rem, 12vw, 7rem)',
              fontWeight: 900,
              color: puzzle.displayColor.hex,
              textShadow: `0 0 30px ${puzzle.displayColor.hex}, 0 0 60px ${puzzle.displayColor.hex}55`,
              letterSpacing: '0.04em',
              userSelect: 'none',
              transition: 'all 0.15s ease',
              opacity: feedback ? 0.4 : 1,
            }}>
              {puzzle.wordColor.name}
            </div>

            {/* Feedback overlay */}
            {feedback && (
              <div className="animate-popIn" style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '3rem',
              }}>
                {feedback === 'correct' ? '✅' : feedback === 'wrong' ? '❌' : '⏰'}
              </div>
            )}

            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 12, userSelect: 'none' }}>
              Click the color this word is displayed in
            </p>
          </div>

          {/* Color buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14,
          }}>
            {puzzle.options.map(opt => (
              <ColorButton
                key={opt.name}
                color={opt}
                onClick={() => handleAnswer(opt.name)}
                disabled={answered}
                isCorrect={answered && opt.name === puzzle.displayColor.name}
                isWrong={answered && feedback === 'wrong' && opt.name !== puzzle.displayColor.name}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (phase === PHASE.RESULT) {
    const correct = roundResults.filter(r => r.correct).length;
    const score = calcScore(roundResults);
    const avgTime = Math.round(roundResults.filter(r => r.correct).reduce((s, r) => s + r.ms, 0) / Math.max(correct, 1));
    const accuracy = Math.round((correct / ROUNDS) * 100);

    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          <div className="animate-popIn" style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>
              {correct >= 9 ? '🌟' : correct >= 7 ? '🎯' : correct >= 5 ? '👍' : '💪'}
            </div>
            <h1 className="h1 text-purple glow-purple" style={{ marginBottom: 12 }}>
              {correct}/{ROUNDS} Correct
            </h1>
            <div className="flex center gap16" style={{ flexWrap: 'wrap', marginBottom: 24 }}>
              <div className="badge badge-purple">{accuracy}% Accuracy</div>
              <div className="badge badge-cyan">{avgTime}ms avg</div>
              <div className="badge badge-green">+{score} pts</div>
            </div>
          </div>

          {/* Round replay */}
          <div className="card" style={{ marginBottom: 28, padding: '20px 24px' }}>
            <h3 className="h3 text-dim" style={{ marginBottom: 14 }}>Round Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {roundResults.map((r, i) => (
                <div key={i} style={{
                  background: r.correct ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,102,0.1)',
                  border: `1px solid ${r.correct ? '#00ff8833' : '#ff336633'}`,
                  borderRadius: 10, padding: '10px 6px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.9rem' }}>{r.correct ? '✓' : '✗'}</div>
                  <div style={{
                    fontFamily: 'var(--font-d)', fontSize: '0.65rem',
                    color: r.correct ? '#00ff88' : '#ff3366', marginTop: 4,
                  }}>
                    {r.correct ? `${r.ms}ms` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleResultDone}>
            {currentPlayerIdx < players.length - 1 ? 'Next Player →' : 'See Final Results'}
          </button>
        </div>
      </div>
    );
  }

  // ── FINAL ──
  if (phase === PHASE.FINAL) {
    // compute final scores including last player
    const finalScores = { ...playerScores };
    const lastPid = currentPlayer.id;
    if (!finalScores[lastPid]) {
      finalScores[lastPid] = calcScore(roundResults);
    }

    const sorted = [...players].sort((a, b) => (finalScores[b.id] || 0) - (finalScores[a.id] || 0));
    const winner = sorted[0];
    const isTie = players.length > 1 && finalScores[sorted[0].id] === finalScores[sorted[1]?.id];

    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="animate-popIn" style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>{isTie ? '🤝' : '🏆'}</div>
            <h1 className="h1 text-yellow glow-yellow">
              {isTie ? "It's a Tie!" : players.length === 1 ? 'Test Complete!' : `${winner.name} Wins!`}
            </h1>
          </div>

          <div className="flex col gap16" style={{ marginBottom: 32 }}>
            {sorted.map((p, i) => {
              const s = finalScores[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="card animate-fadeUp"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    border: `1px solid ${p.color}44`,
                    padding: '20px 24px',
                  }}
                >
                  <div className="flex between" style={{ alignItems: 'center' }}>
                    <div className="flex gap12" style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>{p.avatar}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontFamily: 'var(--font-d)', color: p.color, fontWeight: 700 }}>{p.name}</div>
                        {i === 0 && !isTie && players.length > 1 && (
                          <div className="badge badge-green" style={{ marginTop: 4, display: 'inline-flex' }}>Winner!</div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'var(--font-d)', fontSize: '2rem', fontWeight: 900,
                        color: p.color, textShadow: `0 0 16px ${p.color}`,
                      }}>+{s}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>points</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleFinish}>
            Collect Points & Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function ColorButton({ color, onClick, disabled, isCorrect, isWrong }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '18px 12px',
        borderRadius: 14, cursor: disabled ? 'default' : 'pointer',
        background: isCorrect
          ? 'rgba(0,255,136,0.2)'
          : isWrong
          ? 'rgba(255,51,102,0.15)'
          : `${color.hex}18`,
        border: isCorrect
          ? '2px solid #00ff88'
          : isWrong
          ? '2px solid #ff336622'
          : `2px solid ${color.hex}44`,
        boxShadow: isCorrect ? '0 0 20px rgba(0,255,136,0.4)' : '',
        transition: 'all 0.15s ease',
        transform: isCorrect ? 'scale(1.04)' : '',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = `0 0 20px ${color.hex}44`;
          e.currentTarget.style.borderColor = color.hex;
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !isCorrect) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
          e.currentTarget.style.borderColor = `${color.hex}44`;
        }
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: color.hex,
        boxShadow: `0 0 10px ${color.hex}88`,
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: 'var(--font-d)', fontSize: '0.8rem', fontWeight: 700,
        color: isCorrect ? '#00ff88' : color.hex,
        letterSpacing: '0.06em',
      }}>
        {color.name}
      </span>
      {isCorrect && <span style={{ fontSize: '0.9rem' }}>✓</span>}
    </button>
  );
}
