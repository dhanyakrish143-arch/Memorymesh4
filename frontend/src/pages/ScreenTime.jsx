import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./ScreenTime.css";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScreenTime() {
  const { user } = useAuth();
  const [dailyLimitHours, setDailyLimitHours] = useState(3);
  const [focusSessions, setFocusSessions] = useState([]);
  const [activeSessionSeconds, setActiveSessionSeconds] = useState(0);

  const studentClass = Number(user?.class) || 10;
  const studentBoard = user?.board || "State";

  // Load saved focus sessions and screen limits
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem("memorymesh_focus_sessions");
      if (storedSessions) {
        setFocusSessions(JSON.parse(storedSessions));
      }

      const storedLimit = localStorage.getItem("memorymesh_screen_limit");
      if (storedLimit) {
        setDailyLimitHours(Number(storedLimit));
      }
    } catch (err) {
      console.error("Failed to parse screen time data:", err);
    }
  }, []);

  // Track active page engagement seconds for this session
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate today's logged minutes from Focus Sessions + Current Session
  const todayMinutes = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const completedMins = focusSessions
      .filter((s) => s.completedAt && s.completedAt.slice(0, 10) === todayStr)
      .reduce((sum, s) => sum + (Number(s.minutes) || 0), 0);

    const liveMins = Math.floor(activeSessionSeconds / 60);
    return completedMins + liveMins;
  }, [focusSessions, activeSessionSeconds]);

  // Aggregate weekly day-by-day minutes
  const weeklyData = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayName = DAY_NAMES[d.getDay()];

      let dayTotal = focusSessions
        .filter((s) => s.completedAt && s.completedAt.slice(0, 10) === dateKey)
        .reduce((sum, s) => sum + (Number(s.minutes) || 0), 0);

      if (i === 0) {
        dayTotal += Math.floor(activeSessionSeconds / 60);
      }

      days.push({
        dayName,
        dateKey,
        minutes: dayTotal,
        isToday: i === 0,
      });
    }

    return days;
  }, [focusSessions, activeSessionSeconds]);

  const maxDayMinutes = useMemo(() => {
    const maxVal = Math.max(...weeklyData.map((d) => d.minutes), dailyLimitHours * 60, 60);
    return maxVal;
  }, [weeklyData, dailyLimitHours]);

  const updateScreenLimit = (hours) => {
    setDailyLimitHours(hours);
    localStorage.setItem("memorymesh_screen_limit", String(hours));
  };

  const limitMinutes = dailyLimitHours * 60;
  const usagePercentage = Math.min(Math.round((todayMinutes / limitMinutes) * 100), 100);
  const isOverLimit = todayMinutes > limitMinutes;

  return (
    <div className="screentime-studio-wrapper">
      {/* Header */}
      <div className="screentime-header-pane">
        <div>
          <span className="screentime-tagline">Cognitive Health & Digital Wellbeing</span>
          <h1 className="screentime-main-title">Study Screen Time</h1>
          <p className="screentime-main-subtitle">
            Monitor revision screen exposure, maintain healthy study rhythms, and prevent cognitive eye fatigue.
          </p>
        </div>

        <div className="screentime-curriculum-badge">
          <span className="badge-class">Class {studentClass}</span>
          <span className="badge-board">{studentBoard} Board</span>
        </div>
      </div>

      {/* Overview Metric Quad */}
      <div className="screentime-metrics-quad">
        <div className="st-quad-card focus-metric">
          <span className="st-quad-label">Today's Study Time</span>
          <div className="st-quad-value">
            {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
          </div>
          <span className="st-quad-sub">Active platform engagement</span>
        </div>

        <div className="st-quad-card">
          <span className="st-quad-label">Daily Target Ceiling</span>
          <div className="st-quad-value">{dailyLimitHours} Hours</div>
          <span className="st-quad-sub">{limitMinutes - todayMinutes > 0 ? `${limitMinutes - todayMinutes}m remaining` : "Daily ceiling reached"}</span>
        </div>

        <div className="st-quad-card">
          <span className="st-quad-label">Focus Sessions Run</span>
          <div className="st-quad-value text-emerald">
            {focusSessions.filter((s) => s.completedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}
          </div>
          <span className="st-quad-sub">Completed focus sprints</span>
        </div>

        <div className="st-quad-card">
          <span className="st-quad-label">Digital Health Index</span>
          <div className={`st-quad-value ${isOverLimit ? "text-amber" : "text-emerald"}`}>
            {isOverLimit ? "Excess Screen" : "Balanced"}
          </div>
          <span className="st-quad-sub">{usagePercentage}% of daily threshold</span>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="screentime-chart-card">
        <div className="chart-header-row">
          <div>
            <h3>7-Day Active Revision Trend</h3>
            <p>Aggregated study duration across textbook review and simulation drills.</p>
          </div>
          <div className="chart-legend-row">
            <span className="legend-chip-bar" /> <span>Revision Minutes</span>
          </div>
        </div>

        <div className="weekly-bars-wrapper">
          {weeklyData.map((d) => {
            const barHeightPercent = Math.max(Math.round((d.minutes / maxDayMinutes) * 100), 6);
            return (
              <div key={d.dateKey} className="day-bar-column">
                <span className="bar-minute-tooltip">{d.minutes}m</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${d.isToday ? "bar-today" : ""}`}
                    style={{ height: `${barHeightPercent}%` }}
                  />
                </div>
                <span className={`bar-day-label ${d.isToday ? "label-today" : ""}`}>
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Threshold & Digital Wellbeing Settings */}
      <div className="screentime-settings-grid">
        <div className="st-settings-card">
          <div className="card-top-icon">⏱️</div>
          <h3>Daily Screen Time Limit</h3>
          <p>Set recommended maximum active digital hours per day for syllabus study.</p>

          <div className="limit-buttons-group">
            {[1, 2, 3, 4, 5].map((h) => (
              <button
                type="button"
                key={h}
                className={`limit-pill-btn ${dailyLimitHours === h ? "active" : ""}`}
                onClick={() => updateScreenLimit(h)}
              >
                {h}h / Day
              </button>
            ))}
          </div>
        </div>

        <div className="st-settings-card wellness-card">
          <div className="card-top-icon">🌿</div>
          <h3>20-20-20 Cognitive Rest Protocol</h3>
          <p>
            Every 20 minutes of on-screen review, look at an object 20 feet away for 20 seconds to prevent cognitive strain and retina fatigue during exam preparation.
          </p>
          <div className="wellness-status-tag">
            <span className="wellness-dot" /> Protocol Active for State Board Sprints
          </div>
        </div>
      </div>
    </div>
  );
}
