import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import "./FocusMode.css";

// Official State Board Subjects for Class 5 - 10
const STATE_BOARD_DEFAULT_SUBJECTS = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Kannada",
  "Hindi",
  "Environmental Studies",
  "Computer Science"
];

const TIME_OPTIONS = [15, 25, 45, 60];

export default function FocusMode() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [notes, setNotes] = useState([]);

  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [minutes, setMinutes] = useState(25);

  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const studentClass = Number(user?.class) || 10;
  const studentBoard = user?.board || "State";

  useEffect(() => {
    let active = true;

    const loadMaterial = async () => {
      try {
        const [cardsResponse, notesResponse] = await Promise.allSettled([
          client.get("/cards"),
          client.get("/notes"),
        ]);

        if (!active) return;

        const cardData =
          cardsResponse.status === "fulfilled"
            ? Array.isArray(cardsResponse.value.data)
              ? cardsResponse.value.data
              : cardsResponse.value.data?.cards || []
            : [];

        const noteData =
          notesResponse.status === "fulfilled"
            ? Array.isArray(notesResponse.value.data)
              ? notesResponse.value.data
              : notesResponse.value.data?.notes || []
            : [];

        setCards(cardData);
        setNotes(noteData);
      } catch (err) {
        console.error("Failed to load focus mode curriculum material:", err);
      }
    };

    loadMaterial();
    return () => {
      active = false;
    };
  }, []);

  const subjects = useMemo(() => {
    const dbSubjects = [
      ...cards.map((c) => c.subject),
      ...notes.map((n) => n.subject),
    ]
      .map((v) => v?.trim())
      .filter(Boolean);

    return [...new Set([...STATE_BOARD_DEFAULT_SUBJECTS, ...dbSubjects])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [cards, notes]);

  const chapters = useMemo(() => {
    if (!subject || subject === "Other") return [];
    const key = subject.toLowerCase();

    const values = [
      ...cards
        .filter((c) => c.subject?.trim().toLowerCase() === key)
        .map((c) => c.chapter),
      ...notes
        .filter((n) => n.subject?.trim().toLowerCase() === key)
        .map((n) => n.chapter),
    ]
      .map((v) => v?.trim())
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [cards, notes, subject]);

  const activeSubject = subject === "Other"
    ? customSubject.trim() || "Custom Study"
    : subject || "General Study";

  useEffect(() => {
    if (!running || finished) return;

    if (remaining <= 0) {
      setRunning(false);
      setFinished(true);

      try {
        const sessions = JSON.parse(
          localStorage.getItem("memorymesh_focus_sessions") || "[]"
        );
        sessions.push({
          subject: activeSubject,
          chapter: chapter || "General",
          minutes,
          completedAt: new Date().toISOString(),
        });
        localStorage.setItem(
          "memorymesh_focus_sessions",
          JSON.stringify(sessions)
        );
      } catch (err) {
        console.error("Failed to record focus session:", err);
      }
      return;
    }

    const timer = setInterval(() => {
      setRemaining((c) => Math.max(c - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [running, finished, remaining, activeSubject, chapter, minutes]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startSession = () => {
    setRemaining(minutes * 60);
    setFinished(false);
    setRunning(true);
    setSessionStarted(true);
  };

  const resetSession = () => {
    setRunning(false);
    setFinished(false);
    setSessionStarted(false);
    setRemaining(minutes * 60);
  };

  const changeMinutes = (value) => {
    setMinutes(value);
    if (!sessionStarted) {
      setRemaining(value * 60);
    }
  };

  const totalSeconds = minutes * 60;
  const elapsedSeconds = totalSeconds - remaining;
  const progressPercent = Math.min(
    Math.round((elapsedSeconds / totalSeconds) * 100),
    100
  );

  /* ================= 1. SESSION COMPLETE ================= */
  if (finished) {
    return (
      <div className="focus-studio-wrapper">
        <div className="focus-summary-card">
          <div className="summary-icon-bubble">✓</div>
          <span className="focus-tagline">Deep Work Audit</span>
          <h1 className="summary-title">Session Concluded!</h1>
          <p className="summary-sub">
            Your uninterrupted focus cycle has been logged to your retention history.
          </p>

          <div className="summary-stat-box">
            <span className="stat-minutes-num">{minutes}</span>
            <span className="stat-minutes-unit">MINUTES OF FOCUSED RETENTION</span>
          </div>

          <div className="summary-context-pill">
            <span className="context-dot" />
            <span>
              {activeSubject}{chapter ? ` • ${chapter}` : ""}
            </span>
          </div>

          <div className="summary-actions-row">
            <button
              type="button"
              className="focus-btn-primary"
              onClick={resetSession}
            >
              Start Another Focus Session →
            </button>
            <button
              type="button"
              className="focus-btn-secondary"
              onClick={() => (window.location.href = "/progress")}
            >
              View Retention Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= 2. ACTIVE RUNNING IMMERSIVE STAGE ================= */
  if (sessionStarted) {
    return (
      <div className="focus-studio-wrapper">
        <div className="focus-running-stage">
          <div className="stage-topbar">
            <span className="stage-live-badge">
              <span className="live-dot" /> Deep Work Active
            </span>
            <span className="stage-target-subject">
              {activeSubject}{chapter ? ` • ${chapter}` : ""}
            </span>
          </div>

          <div className="stage-timer-hero">
            <div className="stage-timer-display">{formatTime(remaining)}</div>
            <span className="stage-timer-caption">
              {running ? "Uninterrupted Attention Required" : "Session Paused"}
            </span>
          </div>

          <div className="stage-progress-shell">
            <div className="stage-progress-bar">
              <div
                className="stage-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="stage-progress-meta">
              <span>{progressPercent}% elapsed</span>
              <span>{Math.ceil(remaining / 60)}m remaining</span>
            </div>
          </div>

          <div className="stage-controls-row">
            <button
              type="button"
              className={`stage-toggle-btn ${running ? "pause-state" : "resume-state"}`}
              onClick={() => setRunning((c) => !c)}
            >
              {running ? "⏸ Pause Interval" : "▶ Resume Session"}
            </button>

            <button
              type="button"
              className="stage-end-btn"
              onClick={resetSession}
            >
              End Session Early
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= 3. SESSION CONFIGURATION SETUP ================= */
  return (
    <div className="focus-studio-wrapper">
      <div className="focus-header-pane">
        <div>
          <span className="focus-tagline">Cognitive Deep Work Engine</span>
          <h1 className="focus-main-title">Focus Mode</h1>
          <p className="focus-main-subtitle">
            Eliminate cognitive friction and dedicate uninterrupted interval sprints to state board curriculum chapters.
          </p>
        </div>

        <div className="focus-curriculum-badge">
          <span className="badge-class">Class {studentClass}</span>
          <span className="badge-board">{studentBoard} Board</span>
        </div>
      </div>

      <div className="focus-console-card">
        <div className="console-section-title">
          <span className="console-icon">🎯</span>
          <div>
            <h3>1. Target Curriculum Material</h3>
            <p>Select a subject from your syllabus or enter an additional custom topic.</p>
          </div>
        </div>

        <div className="focus-select-grid">
          <div className="focus-field-group">
            <label>Subject</label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setChapter("");
              }}
              className="focus-select"
            >
              <option value="">General Syllabus Study</option>
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="Other">+ Other / Custom Subject</option>
            </select>
          </div>

          <div className="focus-field-group">
            <label>Chapter / Unit</label>
            {subject === "Other" ? (
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Unit 3 or Specific Concept"
                className="focus-select"
              />
            ) : (
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                disabled={!subject}
                className="focus-select"
              >
                <option value="">Entire Subject Overview</option>
                {chapters.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Input revealed if "Other" is selected */}
        {subject === "Other" && (
          <div className="focus-custom-subject-row">
            <label>Enter Custom Subject Name</label>
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="e.g. Sanskrit, Environmental Studies, Drawing, Mental Math..."
              maxLength={100}
              className="focus-select"
            />
          </div>
        )}

        <div className="focus-divider" />

        <div className="console-section-title">
          <span className="console-icon">⏱️</span>
          <div>
            <h3>2. Session Duration</h3>
            <p>Scientifically validated focus blocks designed for sustained active recall.</p>
          </div>
        </div>

        <div className="duration-buttons-row">
          {TIME_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`duration-pill-btn ${minutes === opt ? "active" : ""}`}
              onClick={() => changeMinutes(opt)}
            >
              <span className="pill-duration-val">{opt}</span>
              <span className="pill-duration-unit">MINUTES</span>
              {opt === 25 && <span className="pomodoro-tag">Pomodoro</span>}
            </button>
          ))}
        </div>

        <div className="focus-guideline-box">
          <span className="guideline-bulb">💡</span>
          <p>
            <strong>Cognitive Protocol:</strong> Maintain tab focus during this interval. Spaced recall retention improves when study intervals are executed without contextual task switching.
          </p>
        </div>

        <div className="focus-action-bar">
          <button
            type="button"
            className="focus-start-btn"
            onClick={startSession}
          >
            Start Focus Session ({minutes}m) →
          </button>
        </div>
      </div>
    </div>
  );
}
