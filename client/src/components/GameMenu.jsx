import React from 'react';

const GAMES = [
  {
    key: 'reaction',
    icon: '⚡',
    title: 'Reaction Time',
    desc: 'The screen will flash green — tap as fast as you can!',
    color: '#00ff88',
    accent: '0,255,136',
    badge: 'Speed',
    tips: ['Stay focused', 'Don\'t click too early', 'Best of 3 rounds'],
  },
  {
    key: 'memory',
    icon: '🧠',
    title: 'Memory Test',
    desc: 'Memorize the word cards, then recall as many as you can.',
    color: '#00d4ff',
    accent: '0,212,255',
    badge: 'Memory',
    tips: ['Study the words', 'Use mnemonics', '9 words to memorize'],
  },
  {
    key: 'stroop',
    icon: '🎨',
    title: 'Stroop Test',
    desc: 'Click the COLOR the word is displayed in — not what it says!',
    color: '#a855f7',
    accent: '168,85,247',
    badge: 'Cognition',
    tips: ['Ignore the word meaning', 'Trust your eyes', '10 quick rounds'],
  },
];

export default function GameMenu({ players, scores, onPlay, onScores, onReset, screens }) {
  return (
    <div className="page">
      <div className="container">

        {/* Top bar */}
        <div className="flex between" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="h1 glow-cyan text-cyan">MindGames</h1>
            <p className="text-dim" style={{ marginTop: 4 }}>Choose a challenge to begin</p>
          </div>
          <div className="flex gap8">
            <button className="btn btn-ghost btn-sm" onClick={onScores}>📊 Scores</button>
            <button className="btn btn-ghost btn-sm" onClick={onReset}>⚙️ Setup</button>
          </div>
        </div>

        {/* Player scores */}
        <div className="flex gap16" style={{ marginBottom: 32, flexWrap: 'wrap' }}>
          {players.map(p => (
            <div
              key={p.id}
              className="card flex gap12"
              style={{
                flex: 1, minWidth: 180, padding: '18px 22px',
                border: `1px solid ${p.color}33`,
                background: `rgba(${p.id === 'p1' ? '0,212,255' : '168,85,247'},0.05)`,
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>{p.avatar}</span>
              <div>
                <div className="label" style={{ color: p.color }}>{p.name}</div>
                <div style={{
                  fontFamily: 'var(--font-d)', fontSize: '1.6rem', fontWeight: 900,
                  color: p.color,
                  textShadow: `0 0 16px ${p.color}`,
                  marginTop: 2,
                }}>
                  {scores[p.id] || 0}
                  <span style={{ fontSize: '0.7rem', marginLeft: 6, fontWeight: 400, color: 'var(--dim)' }}>pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {GAMES.map((g, i) => (
            <GameCard
              key={g.key}
              game={g}
              delay={i * 80}
              onClick={() => onPlay(g.key)}
            />
          ))}
        </div>

        <p className="text-center text-muted" style={{ marginTop: 32, fontSize: '0.78rem' }}>
          Scores are cumulative across all games · {players.length === 2 ? '2-Player mode active' : 'Solo mode'}
        </p>
      </div>
    </div>
  );
}

function GameCard({ game, delay, onClick }) {
  const { icon, title, desc, color, accent, badge, tips } = game;

  return (
    <div
      className="card animate-fadeUp"
      style={{
        animationDelay: `${delay}ms`,
        cursor: 'pointer',
        border: `1px solid rgba(${accent},0.2)`,
        transition: 'all 0.3s ease',
        padding: '28px 24px',
        display: 'flex', flexDirection: 'column', gap: 16,
        position: 'relative', overflow: 'hidden',
      }}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(${accent},0.2)`;
        e.currentTarget.style.background = `rgba(${accent},0.07)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = `rgba(${accent},0.2)`;
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.background = 'var(--glass)';
      }}
    >
      {/* Glow accent top-right */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 120, height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${accent},0.15), transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="flex between" style={{ alignItems: 'flex-start' }}>
        <span style={{ fontSize: '2.6rem', filter: `drop-shadow(0 0 10px ${color})` }}>{icon}</span>
        <span className="badge" style={{
          background: `rgba(${accent},0.1)`, color,
          border: `1px solid rgba(${accent},0.3)`,
        }}>{badge}</span>
      </div>

      <div>
        <h2 className="h2" style={{ color, marginBottom: 8 }}>{title}</h2>
        <p className="text-dim" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{desc}</p>
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tips.map((t, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--muted)' }}>
            <span style={{ color, fontSize: '0.6rem' }}>▶</span> {t}
          </li>
        ))}
      </ul>

      <button
        className="btn w100"
        style={{
          background: `rgba(${accent},0.12)`,
          border: `1px solid rgba(${accent},0.35)`,
          color, fontFamily: 'var(--font-d)',
          fontSize: '0.78rem', letterSpacing: '0.06em',
          marginTop: 4,
        }}
      >
        Play Now →
      </button>
    </div>
  );
}
