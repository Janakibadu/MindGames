import React, { useState } from 'react';

const AVATARS = ['🚀', '⚡', '🧠', '🎯', '🔥', '💎', '🌟', '🦋'];

export default function PlayerSetup({ onComplete }) {
  const [step, setStep] = useState('mode'); // 'mode' | 'names'
  const [mode, setMode] = useState(null);
  const [p1, setP1] = useState('Player 1');
  const [p2, setP2] = useState('Player 2');
  const [avatar1, setAvatar1] = useState(0);
  const [avatar2, setAvatar2] = useState(2);

  const handleStart = () => {
    const players = [
      { id: 'p1', name: p1.trim() || 'Player 1', color: '#00d4ff', avatar: AVATARS[avatar1] },
      ...(mode === '2p' ? [{ id: 'p2', name: p2.trim() || 'Player 2', color: '#a855f7', avatar: AVATARS[avatar2] }] : []),
    ];
    onComplete(players);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>

        {/* Header */}
        <div className="text-center mb16" style={{ marginBottom: 40 }}>
          <div className="animate-float" style={{ fontSize: '3.5rem', marginBottom: 16 }}>🧠</div>
          <h1 className="h1 glow-cyan text-cyan">MindGames</h1>
          <p className="text-dim" style={{ marginTop: 10, fontSize: '1rem' }}>
            Test your reaction, memory & cognition
          </p>
        </div>

        {/* Mode selection */}
        {step === 'mode' && (
          <div className="animate-fadeUp">
            <div className="card">
              <p className="label text-center mb16" style={{ marginBottom: 28 }}>Choose Mode</p>
              <div className="flex gap16">
                <ModeCard
                  icon="🧑‍💻"
                  title="Solo Play"
                  desc="Test your own limits"
                  color="#00d4ff"
                  onClick={() => { setMode('1p'); setStep('names'); }}
                />
                <ModeCard
                  icon="⚔️"
                  title="2 Players"
                  desc="Challenge a friend"
                  color="#a855f7"
                  onClick={() => { setMode('2p'); setStep('names'); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Name entry */}
        {step === 'names' && (
          <div className="animate-fadeUp">
            <div className="card">
              <p className="label text-center" style={{ marginBottom: 28 }}>
                {mode === '1p' ? 'Enter Your Name' : 'Enter Player Names'}
              </p>

              <PlayerInput
                label="Player 1"
                color="#00d4ff"
                value={p1}
                onChange={setP1}
                avatar={AVATARS[avatar1]}
                avatars={AVATARS}
                avatarIdx={avatar1}
                onAvatar={setAvatar1}
              />

              {mode === '2p' && (
                <>
                  <div className="divider" />
                  <PlayerInput
                    label="Player 2"
                    color="#a855f7"
                    value={p2}
                    onChange={setP2}
                    avatar={AVATARS[avatar2]}
                    avatars={AVATARS}
                    avatarIdx={avatar2}
                    onAvatar={setAvatar2}
                  />
                </>
              )}

              <div className="flex gap12 mt24" style={{ marginTop: 32 }}>
                <button className="btn btn-ghost" onClick={() => setStep('mode')}>
                  ← Back
                </button>
                <button
                  className="btn btn-primary w100"
                  onClick={handleStart}
                  style={{ flex: 1 }}
                >
                  Launch Games 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '28px 20px',
        background: `rgba(${color === '#00d4ff' ? '0,212,255' : '168,85,247'},0.06)`,
        border: `1px solid ${color}33`,
        borderRadius: 18, cursor: 'pointer',
        color: 'white', transition: 'all 0.25s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}33`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = `${color}33`;
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <span style={{ fontSize: '2.8rem' }}>{icon}</span>
      <div>
        <div style={{
          fontFamily: 'var(--font-d)', fontSize: '0.9rem', fontWeight: 700,
          color, letterSpacing: '0.04em', marginBottom: 4,
        }}>{title}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--dim)' }}>{desc}</div>
      </div>
    </button>
  );
}

function PlayerInput({ label, color, value, onChange, avatars, avatarIdx, onAvatar }) {
  return (
    <div>
      <div className="flex gap12" style={{ marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}22`, border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', flexShrink: 0,
        }}>
          {avatars[avatarIdx]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="label" style={{ color, marginBottom: 6 }}>{label}</div>
          <input
            className="input"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={label}
            maxLength={20}
            style={{ borderColor: `${color}44` }}
            onFocus={e => { e.target.style.borderColor = color; }}
            onBlur={e => { e.target.style.borderColor = `${color}44`; }}
          />
        </div>
      </div>
      <div>
        <p className="label" style={{ marginBottom: 8 }}>Choose Avatar</p>
        <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
          {avatars.map((av, i) => (
            <button
              key={i}
              onClick={() => onAvatar(i)}
              style={{
                width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                fontSize: '1.3rem',
                background: i === avatarIdx ? `${color}33` : 'var(--glass2)',
                border: i === avatarIdx ? `2px solid ${color}` : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {av}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
