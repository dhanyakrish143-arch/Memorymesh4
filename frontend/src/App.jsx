import React from "react";
﻿import CheatSheets from "./pages/CheatSheets";
import StudyHabits from "./pages/StudyHabits";
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
import NotificationBell from "./components/NotificationBell";
import Notifications from "./pages/Notifications";

import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import AdminStudents from "./pages/AdminStudents";
import AdminLayout from "./pages/AdminLayout";
import AdminSection from "./pages/AdminSection";
import AdminNotes from "./pages/AdminNotes";
import AdminFlashcards from "./pages/AdminFlashcards";
import AdminQuizzes from "./pages/AdminQuizzes";
import AdminRubrics from "./pages/AdminRubrics";
import Home from "./pages/Home";
import Learn from "./pages/Learn";

import Progress from "./pages/Progress";
import Cards from "./pages/Cards";
import Activity from "./pages/Activity";
import Achievements from "./pages/Achievements";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import StudyAssistant from "./pages/StudyAssistant";
import StepLossDetective from "./pages/StepLossDetective";
import StudyPlan from "./pages/StudyPlan";
import Exam from "./pages/Exam";
import FocusMode from "./pages/FocusMode";
import ScreenTime from "./pages/ScreenTime";
import WordMatch from "./pages/WordMatch";
import RapidFire from "./pages/RapidFire";
import FillInStory from "./pages/FillInStory";
import TimelineDrop from "./pages/TimelineDrop";
import QuizHistory from "./pages/QuizHistory";



function Private({ children }) {
  const { user } = useAuth();

  return user ? children : <Navigate to="/login" />;
}

function AdminOnly({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
const studentIcons = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  learn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  cards: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  progress: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  quiz: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  exam: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="m12 2 10 5H2l10-5z" />
      <path d="M6 12v7M10 12v7M14 12v7M18 12v7" />
      <path d="M4 22h16" />
    </svg>
  ),
  achievements: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  cheatSheets: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
    studyHabits: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
    stepLoss: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  assistant: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  studyPlan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  focusMode: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  screenTime: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
};
function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

      const navItems = [
    { path: "/", label: "Home", icon: studentIcons.home },
    { path: "/learn", label: "Learn", icon: studentIcons.learn },
    { path: "/cards", label: "Flashcards", icon: studentIcons.cards },
    { path: "/progress", label: "Progress", icon: studentIcons.progress },
    { path: "/quiz", label: "Chapter Quiz", icon: studentIcons.quiz },
    { path: "/exam", label: "Board Simulator", icon: studentIcons.exam },
    { path: "/achievements", label: "Achievements", icon: studentIcons.achievements },
  ];

  const toolItems = [
        { path: "/cheat-sheets", label: "Formula Sheets", icon: studentIcons.cheatSheets },
        { path: "/habits", label: "Habit Tracker", icon: studentIcons.studyHabits },
        { path: "/step-loss", label: "Step-Loss Detective", icon: studentIcons.stepLoss },
    { path: "/assistant", label: "Study Assistant", icon: studentIcons.assistant },
    { path: "/study-plan", label: "Study Planner", icon: studentIcons.studyPlan },
    { path: "/focus-mode", label: "Focus Mode", icon: studentIcons.focusMode },
    { path: "/screen-time", label: "Screen Time", icon: studentIcons.screenTime },
  ];

  const accountItems = [
    { path: "/profile", label: "Profile", icon: studentIcons.profile },
    { path: "/settings", label: "Settings", icon: studentIcons.settings },
  ];

  if (!user || location.pathname.startsWith("/admin") || location.pathname === "/login" || location.pathname === "/admin-login") return null;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="sidebar">
      <div className="admin-brand" style={{ padding: "8px 12px 18px", borderBottom: "1px solid #f1f5f9", marginBottom: "16px" }}>
        <span className="admin-brand-mark">M</span>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <strong>MemoryMesh</strong>
          <small style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", letterSpacing: "0.08em" }}>STUDENT PORTAL</small>
        </span>
      </div>
      <NotificationBell />

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

                <div className="sidebar-section-title">TOOLS</div>
        {toolItems.map((item) => (
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
          <span className="sidebar-link-icon">{studentIcons.logout}</span>
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
        <div className="student-shell">
          <Nav />
          <div className="student-main-content">
                        <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />

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
                path="/flashcards"
                element={
                  <Private>
                    <Cards />
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
                path="/progress"
                element={
                  <Private>
                    <Progress />
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
                path="/notifications"
                element={
                  <Private>
                    <Notifications />
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

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminOnly>
                    <AdminLayout />
                  </AdminOnly>
                }
              >
                                <Route index element={<Admin />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="analytics" element={<AdminSection />} />
                <Route path="notes" element={<AdminNotes />} />
                <Route path="textbooks" element={<AdminSection />} />
                <Route path="flashcards" element={<AdminFlashcards />} />
                <Route path="quizzes" element={<AdminQuizzes />} />
                <Route path="rubrics" element={<AdminRubrics />} />
                <Route path="content" element={<AdminSection />} />
                <Route path="settings" element={<AdminSection />} />
                <Route path="profile" element={<AdminSection />} />
                <Route path="section" element={<AdminSection />} />
              </Route>

              <Route
                path="/cheat-sheets"
            element={
              <Private>
                <CheatSheets />
              </Private>
            }
          />
          <Route
            path="/habits"
            element={
              <Private>
                <StudyHabits />
              </Private>
            }
          />
                    <Route
            path="/step-loss"
            element={
              <Private>
                <StepLossDetective />
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
            path="/study-plan"
            element={
              <Private>
                <StudyPlan />
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
            path="/screen-time"
            element={
              <Private>
                <ScreenTime />
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
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;




















