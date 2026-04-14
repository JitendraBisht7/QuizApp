import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingScreen from './components/LandingScreen';
import QuizFlow from './components/QuizFlow';
import ResultScreen from './components/ResultScreen';
import LeaderboardScreen from './components/LeaderboardScreen';

// Guard: only allow /quiz if a name is set OR quiz state is saved (refresh case)
function QuizGuard() {
  const hasName  = !!sessionStorage.getItem('quizUserName');
  const hasState = !!sessionStorage.getItem('quizState');
  if (!hasName && !hasState) return <Navigate to="/" replace />;
  return <QuizFlow />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"            element={<LandingScreen />} />
        <Route path="/quiz"        element={<QuizGuard />} />
        <Route path="/result"      element={<ResultScreen />} />
        <Route path="/leaderboard" element={<LeaderboardScreen />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
