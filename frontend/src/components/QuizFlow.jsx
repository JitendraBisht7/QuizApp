import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, ChevronLeft, Star } from 'lucide-react';

const QUIZ_STATE_KEY = 'quizState';
const QUESTIONS_COUNT = 20;

export default function QuizFlow() {
  const navigate = useNavigate();

  // Restore or init quiz state from sessionStorage so refresh doesn't restart
  const [questions, setQuestions]       = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [timeLeft, setTimeLeft]         = useState(20 * 60);
  const [loading, setLoading]           = useState(true);
  const [initialized, setInitialized]   = useState(false);

  const userName = sessionStorage.getItem('quizUserName') || 'Anonymous';

  // ── Load or restore quiz ─────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem(QUIZ_STATE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setQuestions(parsed.questions);
        setCurrentIndex(parsed.currentIndex ?? 0);
        setAnswers(parsed.answers ?? {});
        setTimeLeft(parsed.timeLeft ?? 20 * 60);
        setLoading(false);
        setInitialized(true);
        return;
      } catch { /* fall through to fresh fetch */ }
    }

    // Fresh fetch
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/questions?count=${QUESTIONS_COUNT}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
        setInitialized(true);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Persist state on every change ───────────────────
  useEffect(() => {
    if (!initialized || questions.length === 0) return;
    sessionStorage.setItem(QUIZ_STATE_KEY, JSON.stringify({
      questions,
      currentIndex,
      answers,
      timeLeft,
    }));
  }, [questions, currentIndex, answers, timeLeft, initialized]);

  // ── Timer ────────────────────────────────────────────
  useEffect(() => {
    if (!initialized || loading) return;
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerId); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [initialized, loading]);

  // ── Time-up: auto-submit ─────────────────────────────
  const finishQuiz = useCallback((finalAnswers, finalQuestions) => {
    const score = finalQuestions.reduce((acc, q, i) => {
      return finalAnswers[i] === q.correctAnswer ? acc + 1 : acc;
    }, 0);
    sessionStorage.removeItem(QUIZ_STATE_KEY);
    navigate('/result', { state: { score, total: finalQuestions.length, name: userName } });
  }, [navigate, userName]);

  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0) {
      finishQuiz(answers, questions);
    }
  }, [timeLeft, questions, answers, finishQuiz]);

  // ── Navigation ───────────────────────────────────────
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz(answers, questions);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const selectOption = (idx) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
  };

  // ── Helpers ──────────────────────────────────────────
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const selectedOption = answers[currentIndex] ?? null;
  const isLastQuestion = currentIndex + 1 === questions.length;

  // ── Render states ────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-page">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading questions…</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="loading-page">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</p>
          <p style={{ color: 'var(--text-muted)' }}>No questions available. Please check the server.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/')}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="quiz-page">
      {/* Header */}
      <div className="quiz-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>Magictap</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className={`timer-chip ${timeLeft < 300 ? 'danger' : ''}`}>
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>
          <div className="score-chip">
            <Star size={14} />
            {answeredCount}/{questions.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question Card */}
      <div className="quiz-card" key={currentIndex} style={{ animation: 'fadeUp 0.3s ease-out' }}>
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="question-text">{currentQ.text}</p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              id={`option-${idx}`}
              className={`option-btn ${selectedOption === idx ? 'selected' : ''}`}
              onClick={() => selectOption(idx)}
            >
              <span className={`option-label ${selectedOption === idx ? '' : ''}`}>
                {OPTION_LABELS[idx] || idx + 1}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {/* Footer Nav */}
        <div className="quiz-footer">
          <button
            id="prev-btn"
            className="btn btn-outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{ flex: 1, gap: '6px' }}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          <button
            id="next-btn"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={selectedOption === null}
            style={{ flex: 2 }}
          >
            {isLastQuestion ? 'Finish Quiz 🎉' : <>Next <ChevronRight size={18} /></>}
          </button>
        </div>
      </div>

      {/* Dot navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '1.2rem', flexWrap: 'wrap', padding: '0 0.5rem' }}>
        {questions.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              width: i === currentIndex ? '22px' : '8px',
              height: '8px',
              borderRadius: '99px',
              background: answers[i] != null
                ? 'var(--success)'
                : i === currentIndex
                ? 'var(--primary)'
                : 'rgba(108,60,225,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
