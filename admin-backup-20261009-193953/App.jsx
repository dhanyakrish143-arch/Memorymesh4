import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Learn from "./pages/Learn";

import Upload from "./pages/Upload";
import Progress from "./pages/Progress";
import Cards from "./pages/Cards";
import Activity from "./pages/Activity";
import Achievements from "./pages/Achievements";
import Review from "./pages/Review";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import StudyAssistant from "./pages/StudyAssistant";
import Exam from "./pages/Exam";
import FocusMode from "./pages/FocusMode";
import Games from "./pages/Games";
import WordMatch from "./pages/WordMatch";
import RapidFire from "./pages/RapidFire";
import FillInStory from "./pages/FillInStory";
import TimelineDrop from "./pages/TimelineDrop";
import QuizHistory from "./pages/QuizHistory";



function Private({ children }) {
  const { user } = useAuth();

  return user ? children : <Navigate to="/login" />;
}

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/learn", label: "Learn", icon: "📚" },
    { path: "/games", label: "Games", icon: "🎮" },
    { path: "/upload", label: "Upload", icon: "⬆️" },
    { path: "/cards", label: "Flashcards", icon: "🃏" },
    { path: "/progress", label: "Progress", icon: "📈" },
    { path: "/review", label: "Review", icon: "🔄" },
    { path: "/quiz", label: "Quiz", icon: "📝" },
    { path: "/achievements", label: "Achievements", icon: "🏆" },
  ];

  const accountItems = [
    { path: "/profile", label: "Profile", icon: "👤" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    { path: "/assistant", label: "Study Assistant", icon: "🤖" },
    { path: "/exam", label: "Exam", icon: "📝" },
    { path: "/focus-mode", label: "Focus Mode", icon: "🎯" },
  ];

  if (!user) return null;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">M</div>
        <div>
          <div className="sidebar-brand-name">MemoryMesh</div>
          <div className="sidebar-brand-subtitle">Learn smarter</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">STUDY</div>

        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="sidebar-section-title sidebar-section-account">
          ACCOUNT
        </div>

        {accountItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-link sidebar-logout"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <span className="sidebar-link-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <Private>
                <Home />
              </Private>
            }
          />

          <Route
            path="/learn"
            element={
              <Private>
                <Learn />
              </Private>
            }
          />

          <Route
            path="/upload"
            element={
              <Private>
                <Upload />
              </Private>
            }
          />

          <Route
            path="/progress"
            element={
              <Private>
                <Progress />
              </Private>
            }
          />

          <Route
            path="/cards"
            element={
              <Private>
                <Cards />
              </Private>
            }
          />

          <Route
            path="/activity"
            element={
              <Private>
                <Activity />
              </Private>
            }
          />

          <Route
            path="/achievements"
            element={
              <Private>
                <Achievements />
              </Private>
            }
          />

          <Route
            path="/review"
            element={
              <Private>
                <Review />
              </Private>
            }
          />

          <Route
            path="/quiz"
            element={
              <Private>
                <Quiz />
              </Private>
            }
          />

          <Route
            path="/profile"
            element={
              <Private>
                <Profile />
              </Private>
            }
          />

          <Route
            path="/settings"
            element={
              <Private>
                <Settings />
              </Private>
            }
          />

          <Route
            path="/assistant"
            element={
              <Private>
                <StudyAssistant />
              </Private>
            }
          />

          <Route
            path="/exam"
            element={
              <Private>
                <Exam />
              </Private>
            }
          />

          <Route
            path="/focus-mode"
            element={
              <Private>
                <FocusMode />
              </Private>
            }
          />

          <Route
            path="/games"
            element={
              <Private>
                <Games />
              </Private>
            }
          />

          <Route
            path="/word-match"
            element={
              <Private>
                <WordMatch />
              </Private>
            }
          />

          <Route
            path="/rapid-fire"
            element={
              <Private>
                <RapidFire />
              </Private>
            }
          />

          <Route
            path="/fill-in-story"
            element={
              <Private>
                <FillInStory />
              </Private>
            }
          />

          <Route
            path="/timeline-drop"
            element={
              <Private>
                <TimelineDrop />
              </Private>
            }
          />

          <Route
            path="/quiz-history"
            element={
              <Private>
                <QuizHistory />
              </Private>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

