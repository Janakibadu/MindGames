import React, { useState, useEffect, useRef, useCallback } from 'react';

const ROUNDS = 3;
const PHASE = {
  INTRO: 'intro',
  PLAYER_SWITCH: 'switch',
  WAITING: 'waiting',
  READY: 'ready',
  EARLY: 'early',
  RESULT: 'result',
  FINAL: 'final',
};

function scoreFromMs(ms) {
  if (ms < 150) return 1000;
  if (ms < 250) return 900;
  if (ms < 350) return 800;
  if (ms < 450) return 700;
  if (ms < 600) return 550;
  if (ms < 800) return 400;
  return 250;
}

function ratingFromMs(ms) {
  if (ms < 150) return { label: 'SUPERHUMAN', color: '#ffd700' };
  if (ms < 250) return { label: 'LIGHTNING', color: '#00ff88' };
  if (ms < 350) return { label: 'EXCELLENT', color: '#00d4ff' };
  if (ms < 450) return { label: 'GOOD', color: '#a855f7' };
  if (ms < 600) return { label: 'AVERAGE', color: '#ff8c00' };
  return { label: 'SLOW', color: '#ff3366' };
}

export default function ReactionTime({ players, onComplete, onBack }) {
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [round, setRound] = useState(1);
  const [times, setTimes] = useState({}); // { p1: [ms,...], p2: [...] }
  const [lastTime, setLastTime] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const timeoutRef = useRef(null);
  const startRef = useRef(null);

  const currentPlayer = players[currentPlayerIdx];

  const clearT = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };

  const startRound = useCallback(() => {
    setPhase(PHASE.WAITING);
    setLastTime(null);
    const delay = 2000 + Math.random() * 4000;
    timeoutRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setPhase(PHASE.READY);
    }, delay);
  }, []);

  useEffect(() => () => clearT(), []);

  const handleClick = useCallback(() => {
    if (phase === PHASE.INTRO) return;

    if (phase === PHASE.WAITING) {
      clearT();
      setPhase(PHASE.EARLY);
      return;
    }

    if (phase === PHASE.READY) {
      const ms = Date.now() - startRef.current;
      setLastTime(ms);

      setTimes(prev => {
        const pid = currentPlayer.id;
        const arr = [...(prev[pid] || []), ms];
        return { ...prev, [pid]: arr };
      });

      setPhase(PHASE.RESULT);
    }
  }, [phase, currentPlayer]);

  const handleNext = () => {
    if (round < ROUNDS) {
      setRound(r => r + 1);
      startRound();
    } else {
      // This player is done
      if (currentPlayerIdx < players.length - 1) {
        setCurrentPlayerIdx(i => i + 1);
        setRound(1);
        setPhase(PHASE.PLAYER_SWITCH);
      } else {
        setPhase(PHASE.FINAL);
      }
    }
  };

  const handleRetry = () => {
    setRound(r => r);
    startRound();
  };

  const handleFinish = () => {
    // Compute scores: avg of best 2 times per player
    const gameScores = {};
    players.forEach(p => {
      const arr = (times[p.id] || []).sort((a, b) => a - b);
      const best = arr.slice(0, 2);
      const avg = best.length ? best.reduce((s, v) => s + v, 0) / best.length : 9999;
      gameScores[p.id] = scoreFromMs(avg);
    });
    onComplete(gameScores);
  };

  const bestTime = (pid) => {
    const arr = times[pid] || [];
    return arr.length ? Math.min(...arr) : null;
  };

  const avgTime = (pid) => {
    const arr = times[pid] || [];
    if (!arr.length) return null;
    return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  };

  // ── Render ──────────────────────────────────────
  if (phase === PHASE.INTRO) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 540, textAlign: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 32, display: 'block', margin: '0 auto 32px' }}>← Back</button>
          <div style={{ fontSize: '4rem', marginBottom: 20, filter: 'drop-shadow(0 0 20px #00ff88)' }}>⚡</div>
          <h1 className="h1 text-green glow-green" style={{ marginBottom: 16 }}>Reaction Time</h1>
          <p className="text-dim" style={{ maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.7 }}>
            The screen will turn <strong style={{ color: '#00ff88' }}>green</strong>. Click or press <kbd style={{
              background: 'var(--glass2)', border: '1px solid var(--border2)',
              padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace',
            }}>SPACE</kbd> as fast as you can!
          </p>
          <div className="card" style={{ marginBottom: 32, padding: '20px 24px' }}>
            <div className="flex col gap12">
              {[
                ['📏', `${ROUNDS} rounds per player`],
                ['⚠️', 'Don\'t click before the screen turns green'],
                ['🏆', 'Score based on your average best time'],
              ].map(([icon, text]) => (
                <div key={text} className="flex gap12" style={{ alignItems: 'center', textAlign: 'left' }}>
                  <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>{icon}</span>
                  <span className="text-dim" style={{ fontSize: '0.88rem' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-success btn-lg" onClick={() => { setPhase(PHASE.PLAYER_SWITCH); }}>
            Ready! Let's Go
          </button>
        </div>
      </div>
    );
  }

  if (phase === PHASE.PLAYER_SWITCH) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="animate-popIn">
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>{currentPlayer.avatar}</div>
          <h2 className="h2" style={{ color: currentPlayer.color, marginBottom: 12 }}>
            {currentPlayer.name}'s Turn
          </h2>
          <p className="text-dim" style={{ marginBottom: 32 }}>Get ready for {ROUNDS} rounds</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={startRound}
            style={{ background: `linear-gradient(135deg, ${currentPlayer.color}, ${currentPlayer.color}88)` }}
          >
            Start Round 1
          </button>
        </div>
      </div>
    );
  }

  if (phase === PHASE.WAITING || phase === PHASE.READY || phase === PHASE.EARLY) {
    const isReady = phase === PHASE.READY;
    const isEarly = phase === PHASE.EARLY;

    const bgColor = isEarly ? '#ff3366' : isReady ? '#00ff88' : '#050510';
    const glowColor = isEarly ? 'rgba(255,51,102,0.6)' : isReady ? 'rgba(0,255,136,0.6)' : 'transparent';

    return (
      <div
        onClick={handleClick}
        onKeyDown={e => { if (e.code === 'Space') { e.preventDefault(); handleClick(); } }}
        tabIndex={0}
        style={{
          position: 'fixed', inset: 0, zIndex: 10,
          background: bgColor,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'crosshair',
          transition: isReady ? 'background 0.05s ease' : 'background 0.3s ease',
          boxShadow: isReady ? `inset 0 0 100px ${glowColor}` : isEarly ? `inset 0 0 100px ${glowColor}` : 'none',
          outline: 'none',
          userSelect: 'none',
        }}
        autoFocus
      >
        {/* Round indicator */}
        <div style={{
          position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i < round - 1 ? '#00ff88' : i === round - 1 ? 'white' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Player badge */}
        <div style={{
          position: 'absolute', top: 24, right: 24,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
          border: `1px solid ${currentPlayer.color}44`,
          borderRadius: 10, padding: '6px 14px',
          color: currentPlayer.color, fontFamily: 'var(--font-d)', fontSize: '0.75rem',
        }}>
          {currentPlayer.avatar} {currentPlayer.name}
        </div>

        {phase === PHASE.WAITING && (
          <div style={{ textAlign: 'center' }}>
            <div className="animate-flash" style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--font-d)', fontWeight: 900,
              letterSpacing: '0.05em',
            }}>
              WAIT...
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: 16, fontSize: '0.9rem' }}>
              Don't click yet!
            </p>
          </div>
        )}

        {phase === PHASE.READY && (
          <div className="animate-popIn" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(2.5rem, 10vw, 7rem)',
              color: '#050510', fontFamily: 'var(--font-d)', fontWeight: 900,
              letterSpacing: '0.05em',
              textShadow: '0 0 40px rgba(0,0,0,0.3)',
            }}>
              NOW!
            </div>
            <p style={{ color: 'rgba(0,0,0,0.6)', marginTop: 12, fontSize: '1rem', fontWeight: 600 }}>
              CLICK or SPACE
            </p>
          </div>
        )}

        {phase === PHASE.EARLY && (
          <div className="animate-shake" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              color: 'white', fontFamily: 'var(--font-d)', fontWeight: 900,
              letterSpacing: '0.05em',
            }}>
              TOO EARLY! 😅
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 16, fontSize: '0.9rem' }}>
              Click to try again
            </p>
          </div>
        )}

        {phase === PHASE.EARLY && (
          <button
            className="btn"
            onClick={e => { e.stopPropagation(); handleRetry(); }}
            style={{
              position: 'absolute', bottom: 40,
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', fontFamily: 'var(--font-d)',
            }}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (phase === PHASE.RESULT) {
    const rating = ratingFromMs(lastTime);
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="animate-popIn">
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
          <div style={{
            fontFamily: 'var(--font-d)', fontSize: 'clamp(3rem, 10vw, 6rem)',
            fontWeight: 900, color: rating.color,
            textShadow: `0 0 30px ${rating.color}`,
            marginBottom: 8,
          }}>
            {lastTime}ms
          </div>
          <div className="badge" style={{
            background: `${rating.color}22`, color: rating.color,
            border: `1px solid ${rating.color}44`,
            fontSize: '0.9rem', padding: '6px 18px',
            margin: '0 auto 28px', display: 'inline-flex',
          }}>
            {rating.label}
          </div>

          <div className="card" style={{ maxWidth: 340, margin: '0 auto 28px', padding: '18px 24px' }}>
            <div className="flex col gap10">
              <div className="flex between">
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Round</span>
                <span style={{ fontFamily: 'var(--font-d)', color: 'var(--dim)' }}>{round} / {ROUNDS}</span>
              </div>
              <div className="flex between">
                <span className="text-muted" style={{ fontSize: '0.82rem' }}>Best so far</span>
                <span style={{ fontFamily: 'var(--font-d)', color: '#00ff88' }}>
                  {bestTime(currentPlayer.id)}ms
                </span>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleNext}>
            {round < ROUNDS ? `Next Round (${round + 1}/${ROUNDS})` : currentPlayerIdx < players.length - 1 ? `Next Player →` : 'See Final Results'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === PHASE.FINAL) {
    const sorted = [...players].sort((a, b) => {
      const avgA = avgTime(a.id) || 9999;
      const avgB = avgTime(b.id) || 9999;
      return avgA - avgB;
    });
    const winner = sorted[0];
    const isTie = players.length > 1 && avgTime(sorted[0].id) === avgTime(sorted[1]?.id);

    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="animate-popIn" style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>
              {isTie ? '🤝' : '🏆'}
            </div>
            <h1 className="h1 text-yellow glow-yellow">
              {isTie ? "Dead Heat!" : players.length === 1 ? 'Round Complete!' : `${winner.name} Wins!`}
            </h1>
          </div>

          <div className="flex col gap16" style={{ marginBottom: 32 }}>
            {sorted.map((p, i) => {
              const arr = (times[p.id] || []).sort((a, b) => a - b);
              const best = Math.min(...arr) || 0;
              const avg = avgTime(p.id) || 0;
              const rating = ratingFromMs(best);
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
                  <div className="flex between" style={{ alignItems: 'center', marginBottom: 14 }}>
                    <div className="flex gap12" style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: '1.8rem' }}>{p.avatar}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-d)', color: p.color, fontWeight: 700 }}>{p.name}</div>
                        <div className="badge" style={{
                          background: `${rating.color}22`, color: rating.color,
                          border: `1px solid ${rating.color}33`,
                          marginTop: 4, display: 'inline-flex',
                        }}>{rating.label}</div>
                      </div>
                    </div>
                    {i === 0 && !isTie && players.length > 1 && <span style={{ fontSize: '1.5rem' }}>👑</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {arr.map((t, j) => (
                      <div key={j} style={{
                        background: 'var(--glass2)', borderRadius: 10, padding: '10px',
                        border: j === 0 ? '1px solid #00ff8844' : '1px solid var(--border)',
                      }}>
                        <div className="text-muted" style={{ fontSize: '0.68rem', marginBottom: 4 }}>Round {j + 1}</div>
                        <div style={{
                          fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 700,
                          color: j === 0 ? '#00ff88' : 'var(--dim)',
                        }}>{t}ms</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap24 mt16" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Best</div>
                      <div style={{ fontFamily: 'var(--font-d)', color: '#00ff88', fontWeight: 700 }}>{best}ms</div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Average</div>
                      <div style={{ fontFamily: 'var(--font-d)', color: 'var(--dim)', fontWeight: 700 }}>{avg}ms</div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Score</div>
                      <div style={{ fontFamily: 'var(--font-d)', color: p.color, fontWeight: 700 }}>
                        +{scoreFromMs(best)} pts
                      </div>
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
