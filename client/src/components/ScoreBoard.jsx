import React from 'react';

const GAME_LABELS = {
  reaction: '⚡ Reaction Time',
  memory: '🧠 Memory Test',
  stroop: '🎨 Stroop Test',
};

export default function ScoreBoard({ players, scores, history, onBack }) {
  const ranked = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  const winner = ranked[0];
  const isTie = players.length > 1 && scores[ranked[0].id] === scores[ranked[1].id];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>

        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 28 }}>
          ← Back to Games
        </button>

        {/* Title */}
        <div className="text-center" style={{ marginBottom: 36 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>
            {isTie ? '🤝' : '🏆'}
          </div>
          <h1 className="h1 glow-yellow text-yellow">
            {isTie ? "It's a Tie!" : players.length === 1 ? 'Your Score' : `${winner.name} Wins!`}
          </h1>
          {!isTie && players.length > 1 && (
            <p className="text-dim" style={{ marginTop: 8 }}>Congratulations, champion!</p>
          )}
        </div>

        {/* Player rankings */}
        <div className="flex col gap16" style={{ marginBottom: 32 }}>
          {ranked.map((p, i) => (
            <div
              key={p.id}
              className="card animate-fadeUp"
              style={{
                animationDelay: `${i * 80}ms`,
                border: `1px solid ${p.color}44`,
                background: i === 0 && !isTie
                  ? `linear-gradient(135deg, rgba(${p.id === 'p1' ? '0,212,255' : '168,85,247'},0.12), rgba(${p.id === 'p1' ? '0,212,255' : '168,85,247'},0.04))`
                  : 'var(--glass)',
                padding: '22px 26px',
              }}
            >
              <div className="flex between" style={{ alignItems: 'center' }}>
                <div className="flex gap16" style={{ alignItems: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${p.color}22`, border: `2px solid ${p.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', position: 'relative',
                  }}>
                    {p.avatar}
                    {i === 0 && !isTie && (
                      <span style={{
                        position: 'absolute', top: -10, right: -10,
                        fontSize: '1rem',
                      }}>👑</span>
                    )}
                  </div>
                  <div>
                    <div className="h3" style={{ color: p.color }}>{p.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: 2 }}>
                      #{i + 1} Place
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-d)', fontSize: '2rem', fontWeight: 900,
                    color: p.color, textShadow: `0 0 20px ${p.color}`,
                  }}>
                    {scores[p.id] || 0}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>total points</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* History breakdown */}
        {history.length > 0 && (
          <div className="card" style={{ padding: '22px 26px' }}>
            <h3 className="h3 text-cyan" style={{ marginBottom: 18 }}>Game History</h3>
            <div className="flex col gap12">
              {history.map((h, i) => (
                <div key={i} style={{
                  background: 'var(--glass2)',
                  borderRadius: 12, padding: '14px 18px',
                  border: '1px solid var(--border)',
                }}>
                  <div className="flex between" style={{ marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontSize: '0.8rem', color: 'var(--dim)' }}>
                      {GAME_LABELS[h.game] || h.game}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Round {i + 1}
                    </span>
                  </div>
                  <div className="flex gap24">
                    {players.map(p => (
                      <div key={p.id} className="flex gap8" style={{ alignItems: 'center' }}>
                        <span style={{ fontSize: '1rem' }}>{p.avatar}</span>
                        <span style={{ color: p.color, fontFamily: 'var(--font-d)', fontSize: '0.9rem', fontWeight: 700 }}>
                          +{h.scores[p.id] || 0}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt32">
          <button className="btn btn-primary btn-lg" onClick={onBack}>
            Play More Games 🎮
          </button>
        </div>
      </div>
    </div>
  );
}
