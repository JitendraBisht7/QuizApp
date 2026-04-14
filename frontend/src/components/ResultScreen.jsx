import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw, Trophy } from 'lucide-react';

export default function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const scoreSaved = useRef(false); // prevent duplicate saves on re-render

  const score = location.state?.score ?? 0;
  const total = location.state?.total ?? 20;
  const name  = location.state?.name  || sessionStorage.getItem('quizUserName') || 'Anonymous';

  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

  let emoji = '🏆';
  let grade = '';
  let message = '';
  let gradientColors = 'linear-gradient(135deg, #6c3ce1, #9b72ef)';

  if (percentage >= 80) {
    emoji = '🏆'; grade = 'Excellent!';
    message = 'Outstanding performance! You have exceptional aptitude skills.';
    gradientColors = 'linear-gradient(135deg, #10b981, #06b6d4)';
  } else if (percentage >= 60) {
    emoji = '⭐'; grade = 'Great Job!';
    message = 'Good effort! You scored above average. Keep it up!';
    gradientColors = 'linear-gradient(135deg, #6c3ce1, #9b72ef)';
  } else if (percentage >= 40) {
    emoji = '💪'; grade = 'Not Bad!';
    message = "Average score. A bit more practice and you'll nail it!";
    gradientColors = 'linear-gradient(135deg, #f59e0b, #f97316)';
  } else {
    emoji = '📚'; grade = 'Keep Trying!';
    message = "Don't worry — every attempt makes you better. Try again!";
    gradientColors = 'linear-gradient(135deg, #ef4444, #f97316)';
  }

  // ── Save score to MongoDB — only ONCE per quiz session ─────────────────────
  useEffect(() => {
    // Must have come from quiz navigation (has state) and not already saved
    if (!location.state) return;
    if (sessionStorage.getItem('scoreSaved') === 'true') return;

    // Mark as saved immediately to block any re-runs (StrictMode, remounts, etc.)
    sessionStorage.setItem('scoreSaved', 'true');

    const payload = {
      name:  location.state.name  || sessionStorage.getItem('quizUserName') || 'Anonymous',
      score: location.state.score ?? 0,
      total: location.state.total ?? 20,
    };

    console.log('[ResultScreen] Saving score to DB:', payload);

    fetch('http://localhost:5000/api/scores', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => console.log('[ResultScreen] Score saved ✅', data))
      .catch(err => console.error('[ResultScreen] Save failed ❌', err));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayAgain = () => {
    sessionStorage.removeItem('quizState');
    navigate('/');
  };

  return (
    <div className="result-page">
      <div className="result-card">
        {/* Score Ring */}
        <div className="result-score-ring" style={{ background: gradientColors }}>
          <span className="result-score-num">{score}/{total}</span>
          <span className="result-score-label">SCORE</span>
        </div>

        {/* Name & grade */}
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          {name}
        </p>
        <h1 className="result-title">{emoji} {grade}</h1>
        <p className="result-msg">{message}</p>

        {/* Stats */}
        <div className="stat-row">
          <div className="stat-box">
            <span className="stat-box-val">{percentage}%</span>
            <span className="stat-box-label">Accuracy</span>
          </div>
          <div className="stat-box">
            <span className="stat-box-val">{score}</span>
            <span className="stat-box-label">Correct</span>
          </div>
          <div className="stat-box">
            <span className="stat-box-val">{total - score}</span>
            <span className="stat-box-label">Wrong</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            id="play-again-btn"
            className="btn btn-primary btn-full"
            onClick={handlePlayAgain}
            style={{ padding: '1rem' }}
          >
            <RotateCcw size={18} /> Play Again
          </button>
          <button
            id="leaderboard-btn"
            className="btn btn-outline btn-full"
            onClick={() => navigate('/leaderboard')}
            style={{ padding: '0.9rem' }}
          >
            <Trophy size={18} /> View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
