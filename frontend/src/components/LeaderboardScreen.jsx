import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getInitials, getAvatarColor } from './LandingScreen';

const AVATAR_COLORS = ['av-purple','av-pink','av-teal','av-orange','av-sky','av-green','av-indigo','av-rose'];

const RANK_BADGE = { 1: '🥇', 2: '🥈', 3: '🥉' };

function AvatarCircle({ name, size = 44, fontSize = '1rem' }) {
  const colorClass = getAvatarColor(name);
  const initials   = getInitials(name || '?');
  return (
    <div
      className={`lb-avatar ${colorClass}`}
      style={{ width: size, height: size, fontSize }}
    >
      {initials || '?'}
    </div>
  );
}

function PodiumItem({ entry, rank }) {
  const colorClass = getAvatarColor(entry?.name || '');
  const sizes      = { 1: 68, 2: 56, 3: 56 };
  const fontSizes  = { 1: '1.6rem', 2: '1.3rem', 3: '1.3rem' };
  const blockClass = `podium-block rank-${rank}`;

  if (!entry) {
    return (
      <div className="podium-item">
        <div className={`podium-avatar rank-${rank}`} style={{ background: 'rgba(255,255,255,0.15)', width: sizes[rank], height: sizes[rank] }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem' }}>?</span>
        </div>
        <span className="podium-name" style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
        <div className={blockClass}>{rank}</div>
      </div>
    );
  }

  return (
    <div className="podium-item">
      <div
        className={`podium-avatar rank-${rank} ${colorClass}`}
        style={{ width: sizes[rank], height: sizes[rank], fontSize: fontSizes[rank] }}
      >
        {rank === 1 && <span className="podium-crown">👑</span>}
        {getInitials(entry.name)}
      </div>
      <span className="podium-name">{entry.name}</span>
      <span className="podium-points">{entry.score} pts</span>
      <div className={blockClass}>{rank}</div>
    </div>
  );
}

export default function LeaderboardScreen() {
  const navigate   = useNavigate();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const currentUser = sessionStorage.getItem('quizUserName') || '';

  const fetchLeaderboard = () => {
    setLoading(true);
    setError(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/leaderboard`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const top3     = [data[1], data[0], data[2]];   // 2nd, 1st, 3rd for podium layout
  const restList = data.slice(3);

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* ── Gradient Header ─────────────────── */}
      <div className="gradient-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
          <button className="btn btn-ghost" style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }} onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="btn btn-ghost" style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }} onClick={fetchLeaderboard}>
            <RefreshCw size={15} />
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
            Leaderboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
            Top quiz performers of all time
          </p>
        </div>

        {/* Podium */}
        {!loading && !error && data.length >= 1 && (
          <div className="podium-wrap" style={{ position: 'relative', zIndex: 1 }}>
            <PodiumItem entry={top3[0]} rank={2} />
            <PodiumItem entry={top3[1]} rank={1} />
            <PodiumItem entry={top3[2]} rank={3} />
          </div>
        )}
      </div>

      {/* ── List ────────────────────────────── */}
      <div className="container-wide" style={{ paddingTop: '0' }}>
        <div className="card" style={{ borderRadius: '1.5rem', marginTop: '1rem' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" />
            </div>
          )}

          {error && !loading && (
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <p>Failed to load leaderboard. Is the server running?</p>
              <button className="btn btn-primary" onClick={fetchLeaderboard} style={{ marginTop: '1rem' }}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>No scores yet!</p>
              <p>Be the first to complete the quiz and claim the top spot.</p>
              <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
                Take the Quiz
              </button>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <>
              <p className="section-title">All Rankings</p>
              <div className="lb-list">
                {data.map((entry, idx) => {
                  const rank      = idx + 1;
                  const colorClass = getAvatarColor(entry.name);
                  const isMe      = currentUser && entry.name.toLowerCase() === currentUser.toLowerCase();
                  return (
                    <div key={entry._id || idx} className={`lb-item ${isMe ? 'is-me' : ''}`}>
                      <span className="lb-rank">
                        {RANK_BADGE[rank] || rank}
                      </span>

                      <div className={`lb-avatar ${colorClass}`} style={{ width: 44, height: 44, fontSize: '1rem', flexShrink: 0 }}>
                        {getInitials(entry.name)}
                      </div>

                      <div className="lb-info">
                        <div className="lb-info-name">
                          {entry.name}
                          {isMe && (
                            <span style={{ marginLeft: 6, fontSize: '0.7rem', background: 'var(--primary)', color: 'white', borderRadius: '999px', padding: '1px 7px', fontWeight: 700 }}>
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="lb-info-sub">
                          {entry.score}/{entry.total} correct · {entry.percentage}%
                        </div>
                      </div>

                      <span className="lb-score-chip">{entry.score} pts</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Play Again CTA */}
        {!loading && (
          <button
            className="btn btn-primary btn-full"
            onClick={() => { sessionStorage.removeItem('quizState'); navigate('/'); }}
            style={{ marginTop: '1rem', padding: '1rem', borderRadius: '1rem' }}
          >
            🎯 Play Again
          </button>
        )}
      </div>
    </div>
  );
}
