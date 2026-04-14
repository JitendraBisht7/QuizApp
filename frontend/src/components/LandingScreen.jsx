import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AVATAR_COLORS = ['av-purple','av-pink','av-teal','av-orange','av-sky','av-green','av-indigo','av-rose'];

function getInitials(name) {
  return name.trim().split(' ').map(w => w[0]?.toUpperCase()).slice(0, 2).join('');
}
function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export { getInitials, getAvatarColor, AVATAR_COLORS };

export default function NameScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter your name to continue'); return; }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters'); return; }
    const previousName = sessionStorage.getItem('quizUserName');
    if (previousName && trimmed === previousName) { setError('Please enter a different name'); return; }
    sessionStorage.setItem('quizUserName', trimmed);
    navigate('/quiz');
  };

  return (
    <div className="name-page">
      <div className="name-card">
        <div className="name-icon">🎯</div>
        <h1 className="name-title">Magictap Quiz</h1>
        <p className="name-sub">
          Test your aptitude with 20 random questions in 20 minutes.
          Enter your name to get started!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              id="player-name"
              className="input-field"
              type="text"
              placeholder="Enter your name…"
              value={name}
              maxLength={32}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              autoFocus
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '6px', textAlign: 'left' }}>
                {error}
              </p>
            )}
          </div>

          <button className="btn btn-primary btn-full" onClick={handleStart} style={{ padding: '1rem' }}>
            Start Quiz ✨
          </button>

          <button
            className="btn btn-outline btn-full"
            onClick={() => navigate('/leaderboard')}
            style={{ padding: '0.9rem' }}
          >
            🏆 View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
