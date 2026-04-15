import React, { useState, useEffect, useRef, useCallback } from 'react';

const WORD_POOL = [
  'GALAXY', 'NEBULA', 'QUANTUM', 'PHOENIX', 'AURORA', 'COSMOS',
  'VERTEX', 'PRISM', 'CIPHER', 'VORTEX', 'ZENITH', 'PLASMA',
  'NOVA', 'PHOTON', 'ECLIPSE', 'PULSAR', 'QUASAR', 'MATRIX',
  'COMET', 'RADIANT', 'AXIOM', 'DELTA', 'VECTOR', 'FUSION',
];

const SHOW_SECONDS = 6;
const WORD_COUNT = 9;

const PHASE = {
  INTRO: 'intro',
  SWITCH: 'switch',
  SHOWING: 'showing',
  HIDING: 'hiding',
  RECALL: 'recall',
  RESULT: 'result',
  FINAL: 'final',
};

function pickWords() {
  const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, WORD_COUNT);
}

function calcScore(correct, total) {
  return Math.round((correct / total) * 1000);
}

export default function MemoryTest({ players, onComplete, onBack }) {
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [words, setWords] = useState([]);
  const [flipped, setFlipped] = useState([]); // which cards are face-down
  const [timeLeft, setTimeLeft] = useState(SHOW_SECONDS);
  const [inputs, setInputs] = useState(Array(WORD_COUNT).fill(''));
  const [results, setResults] = useState({}); // { pid: { correct, score } }
  const [lastResult, setLastResult] = useState(null);

  const timerRef = useRef(null);
  const currentPlayer = players[currentPlayerIdx];

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  useEffect(() => () => clearTimer(), []);

  const startShowing = useCallback(() => {
    const newWords = pickWords();
    setWords(newWords);
    setFlipped(Array(WORD_COUNT).fill(false));
    setInputs(Array(WORD_COUNT).fill(''));
    setTimeLeft(SHOW_SECONDS);
    setPhase(PHASE.SHOWING);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Flip all cards
          setPhase(PHASE.HIDING);
          setTimeout(() => {
            setFlipped(Array(WORD_COUNT).fill(true));
            setTimeout(() => setPhase(PHASE.RECALL), 700);
          }, 100);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const handleSubmit = () => {
    clearTimer();
    const answered = inputs.map(i => i.trim().toUpperCase()).filter(Boolean);
    const correct = answered.filter(a => words.includes(a)).length;
    const score = calcScore(correct, WORD_COUNT);

    const pid = currentPlayer.id;
    const resultEntry = { correct, total: WORD_COUNT, score };
    setLastResult(resultEntry);
    setResults(prev => ({ ...prev, [pid]: resultEntry }));
    setPhase(PHASE.RESULT);
  };

  const handleNext = () => {
    if (currentPlayerIdx < players.length - 1) {
      setCurrentPlayerIdx(i => i + 1);
      setPhase(PHASE.SWITCH);
    } else {
      setPhase(PHASE.FINAL);
    }
  };

  const handleFinish = () => {
    const gameScores = {};
    Object.entries(results).forEach(([pid, r]) => { gameScores[pid] = r.score; });
    onComplete(gameScores);
  };

  // ── INTRO ──
  if (phase === PHASE.INTRO) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 540, textAlign: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 32, display: 'block', margin: '0 auto 32px' }}>← Back</button>
          <div style={{ fontSize: '4rem', marginBottom: 20, filter: 'drop-shadow(0 0 20px #00d4ff)' }}>🧠</div>
          <h1 className="h1 text-cyan glow-cyan" style={{ marginBottom: 16 }}>Memory Test</h1>
          <p className="text-dim" style={{ maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.7 }}>
            You'll see <strong style={{ color: '#00d4ff' }}>{WORD_COUNT} words</strong> for {SHOW_SECONDS} seconds.
            Then they'll disappear — type as many as you can recall!
          </p>
          <div className="card" style={{ marginBottom: 32, padding: '20px 24px' }}>
            <div className="flex col gap12">
              {[
                ['👁️', `Memorize ${WORD_COUNT} words in ${SHOW_SECONDS} seconds`],
                ['🙈', 'Cards flip over — recall from memory'],
                ['⌨️', 'Type each word you remember'],
                ['🏆', 'Score: (recalled/9) × 1000 points'],
              ].map(([icon, text]) => (
                <div key={text} className="flex gap12" style={{ alignItems: 'center', textAlign: 'left' }}>
                  <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>{icon}</span>
                  <span className="text-dim" style={{ fontSize: '0.88rem' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => setPhase(PHASE.SWITCH)}>
            Start Memorizing!
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYER SWITCH ──
  if (phase === PHASE.SWITCH) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="animate-popIn">
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>{currentPlayer.avatar}</div>
          <h2 className="h2" style={{ color: currentPlayer.color, marginBottom: 12 }}>
            {currentPlayer.name}'s Turn
          </h2>
          <p className="text-dim" style={{ marginBottom: 32 }}>Get ready to memorize!</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={startShowing}
            style={{ background: `linear-gradient(135deg, ${currentPlayer.color}, ${currentPlayer.color}88)` }}
          >
            Show the Cards!
          </button>
        </div>
      </div>
    );
  }

  // ── SHOWING ──
  if (phase === PHASE.SHOWING || phase === PHASE.HIDING) {
    const pct = (timeLeft / SHOW_SECONDS) * 100;
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 660 }}>
          {/* Header */}
          <div className="flex between" style={{ marginBottom: 20, alignItems: 'center' }}>
            <div className="flex gap12" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem' }}>{currentPlayer.avatar}</span>
              <span style={{ fontFamily: 'var(--font-d)', color: currentPlayer.color, fontSize: '0.85rem' }}>
                {currentPlayer.name}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-d)', fontSize: '2.2rem', fontWeight: 900,
                color: timeLeft <= 2 ? '#ff3366' : '#00d4ff',
                textShadow: `0 0 20px ${timeLeft <= 2 ? '#ff3366' : '#00d4ff'}`,
                lineHeight: 1,
              }}>
                {timeLeft}s
              </div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>remaining</div>
            </div>
          </div>

          <div className="progress-wrap" style={{ marginBottom: 28 }}>
            <div className="progress-bar" style={{
              width: `${pct}%`,
              background: timeLeft <= 2
                ? 'linear-gradient(90deg, #ff3366, #ff6699)'
                : 'linear-gradient(90deg, #00d4ff, #a855f7)',
            }} />
          </div>

          <p className="text-center text-dim" style={{ marginBottom: 20, fontSize: '0.85rem' }}>
            Memorize these words!
          </p>

          {/* Word grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}>
            {words.map((word, i) => (
              <WordCard
                key={`${word}-${i}`}
                word={word}
                isFlipped={flipped[i]}
                delay={i * 40}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RECALL ──
  if (phase === PHASE.RECALL) {
    const answered = inputs.filter(i => i.trim()).length;
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 660 }}>
          <div className="flex between" style={{ marginBottom: 20, alignItems: 'center' }}>
            <div>
              <h2 className="h2 text-cyan glow-cyan">Recall Time!</h2>
              <p className="text-dim" style={{ marginTop: 4, fontSize: '0.85rem' }}>
                {currentPlayer.avatar} {currentPlayer.name} — type the words you remember
              </p>
            </div>
            <span className="badge badge-cyan">{answered}/{WORD_COUNT}</span>
          </div>

          {/* Blank cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14, marginBottom: 28,
          }}>
            {inputs.map((val, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <input
                  className="input"
                  value={val}
                  onChange={e => {
                    const next = [...inputs];
                    next[i] = e.target.value.toUpperCase();
                    setInputs(next);
                  }}
                  placeholder={`Word ${i + 1}`}
                  maxLength={12}
                  style={{
                    textAlign: 'center',
                    fontFamily: 'var(--font-d)',
                    fontSize: '0.9rem',
                    letterSpacing: '0.08em',
                    padding: '16px 10px',
                    borderColor: val ? '#00d4ff55' : 'var(--border)',
                  }}
                />
                {val && (
                  <button
                    onClick={() => { const n = [...inputs]; n[i] = ''; setInputs(n); }}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--muted)',
                      cursor: 'pointer', fontSize: '0.8rem',
                    }}
                  >✕</button>
                )}
              </div>
            ))}
          </div>

          <button
            className="btn btn-success btn-lg w100"
            onClick={handleSubmit}
          >
            Submit Answers ✓
          </button>
          <p className="text-center text-muted mt16" style={{ fontSize: '0.78rem', marginTop: 12 }}>
            Leave blank if you don't remember — partial credit is given!
          </p>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (phase === PHASE.RESULT && lastResult) {
    const { correct, total, score } = lastResult;
    const pct = Math.round((correct / total) * 100);
    const color = correct >= 7 ? '#00ff88' : correct >= 5 ? '#00d4ff' : correct >= 3 ? '#ffd700' : '#ff3366';
    const label = correct >= 7 ? 'AMAZING!' : correct >= 5 ? 'GREAT!' : correct >= 3 ? 'GOOD' : 'KEEP PRACTICING';
    const answeredWords = inputs.map(i => i.trim().toUpperCase()).filter(Boolean);

    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 580, textAlign: 'center' }}>
          <div className="animate-popIn" style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{correct >= 7 ? '🌟' : correct >= 5 ? '👍' : correct >= 3 ? '😊' : '💪'}</div>
            <h1 className="h1" style={{ color, textShadow: `0 0 20px ${color}`, marginBottom: 8 }}>
              {correct} / {total}
            </h1>
            <div className="badge" style={{
              background: `${color}22`, color, border: `1px solid ${color}44`,
              fontSize: '0.9rem', padding: '6px 18px', margin: '0 auto 20px',
              display: 'inline-flex',
            }}>
              {label}
            </div>
            <p className="text-dim" style={{ marginBottom: 24 }}>
              You recalled <strong style={{ color }}>{pct}%</strong> of the words!
            </p>
          </div>

          <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
            <div className="flex between" style={{ marginBottom: 14, alignItems: 'center' }}>
              <span className="h3 text-cyan">Word Breakdown</span>
              <span className="badge badge-cyan">+{score} pts</span>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
            }}>
              {words.map((word, i) => {
                const wasGuessed = answeredWords.includes(word);
                return (
                  <div key={i} style={{
                    background: wasGuessed ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,102,0.08)',
                    border: `1px solid ${wasGuessed ? '#00ff8844' : '#ff336633'}`,
                    borderRadius: 10, padding: '10px 8px',
                    fontFamily: 'var(--font-d)', fontSize: '0.75rem',
                    color: wasGuessed ? '#00ff88' : '#ff3366',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <span>{wasGuessed ? '✓' : '✗'}</span>
                    <span>{word}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleNext}>
            {currentPlayerIdx < players.length - 1 ? 'Next Player →' : 'See Final Results'}
          </button>
        </div>
      </div>
    );
  }

  // ── FINAL ──
  if (phase === PHASE.FINAL) {
    const sorted = [...players].sort((a, b) => (results[b.id]?.score || 0) - (results[a.id]?.score || 0));
    const winner = sorted[0];
    const isTie = players.length > 1 && results[sorted[0].id]?.score === results[sorted[1]?.id]?.score;

    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="animate-popIn" style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>{isTie ? '🤝' : '🏆'}</div>
            <h1 className="h1 text-yellow glow-yellow">
              {isTie ? "It's a Tie!" : players.length === 1 ? 'Test Complete!' : `${winner.name} Wins!`}
            </h1>
          </div>

          <div className="flex col gap14" style={{ marginBottom: 32 }}>
            {sorted.map((p, i) => {
              const r = results[p.id] || { correct: 0, total: WORD_COUNT, score: 0 };
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
                        <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: 2 }}>
                          Recalled {r.correct}/{r.total} words
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'var(--font-d)', fontSize: '1.8rem', fontWeight: 900,
                        color: p.color, textShadow: `0 0 16px ${p.color}`,
                      }}>
                        +{r.score}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>points</div>
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div className="progress-wrap" style={{ marginTop: 14, height: 4 }}>
                    <div className="progress-bar" style={{
                      width: `${(r.correct / r.total) * 100}%`,
                      background: p.id === 'p1'
                        ? 'linear-gradient(90deg, #00d4ff, #00ff88)'
                        : 'linear-gradient(90deg, #a855f7, #ff3366)',
                    }} />
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

function WordCard({ word, isFlipped, delay }) {
  return (
    <div style={{
      height: 80,
      perspective: 600,
      animationDelay: `${delay}ms`,
    }}>
      <div style={{
        width: '100%', height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}>
          <span style={{
            fontFamily: 'var(--font-d)', fontSize: '0.9rem', fontWeight: 700,
            color: '#00d4ff', letterSpacing: '0.08em',
          }}>
            {word}
          </span>
        </div>
        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(168,85,247,0.06)',
          border: '1px solid rgba(168,85,247,0.2)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}>
          <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>?</span>
        </div>
      </div>
    </div>
  );
}
