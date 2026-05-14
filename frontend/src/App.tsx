import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import QuizGenerator from './pages/QuizGenerator';
import StudyPlanner from './pages/StudyPlanner';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Documents from './pages/Documents';

import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Logout from './pages/Logout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/quiz" element={<QuizGenerator />} />
        <Route path="/planner" element={<StudyPlanner />} />
        <Route path="/docs" element={<Documents />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}