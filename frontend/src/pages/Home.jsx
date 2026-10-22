import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import DailyGoal from "../components/DailyGoal";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [dueCards, setDueCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [statsResponse, dueResponse] = await Promise.allSettled([
          client.get("/review/stats"),
          client.get("/review/due"),
        ]);

        if (!active) return;

        if (statsResponse.status === "fulfilled") {
          setStats(statsResponse.value.data);
        }
        if (dueResponse.status === "fulfilled") {
          setDueCards(dueResponse.value.data || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const studentClass = Number(user?.class) || 10;
  const studentBoard = user?.board || "State";
  const studentName = user?.name ? user.name.split(" ")[0] : "Student";

  const totalCards = stats?.totalCards ?? 0;
  const mastered = stats?.mastered ?? 0;
  const accuracy = Math.round(stats?.accuracy ?? 0);
  const streak = stats?.streak ?? 0;
  const dueCount = dueCards.length;

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="home-dashboard-wrapper">
        <div className="dashboard-loading-state">
          <div className="dashboard-spinner" />
          <p>Synchronizing cognitive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-dashboard-wrapper">
      {/* Executive Command Header */}
      <div className="dash-executive-header">
        <div>
          <span className="dash-date-indicator">{todayDate}</span>
          <h1 className="dash-greeting-title">Welcome back, {studentName}</h1>
          <p className="dash-greeting-subtitle">
            Here is your daily cognitive retention overview and scheduled revision tasks.
          </p>
        </div>

        {/* Board & Grade Isolation Badge */}
        <div className="dash-curriculum-badge">
          <span className="badge-class">Class {studentClass}</span>
          <span className="badge-board">{studentBoard} Board</span>
        </div>
      </div>

      {/* Primary Revision Priority Banner */}
      <div className="dash-review-banner">
        <div className="banner-content">
          <div className="banner-icon-box">
            {dueCount > 0 ? "⚡" : "✓"}
          </div>
          <div>
            <h3>
              {dueCount > 0
                ? `${dueCount} flashcard${dueCount > 1 ? "s" : ""} scheduled for review`
                : "Your revision queue is up to date"}
            </h3>
            <p>
              {dueCount > 0
                ? "Cognitive intervals calculated by the Ebbinghaus algorithm are ready for active recall."
                : "No cards due right now. You can explore textbooks or practice your subject decks."}
            </p>
          </div>
        </div>

        <div className="banner-actions">
          {dueCount > 0 ? (
            <Link to="/flashcards" className="dash-btn-primary">
              Start Review Session →
            </Link>
          ) : (
            <Link to="/learn" className="dash-btn-secondary">
              Open Curriculum Library →
            </Link>
          )}
        </div>
      </div>

      {/* Performance Metric Grid */}
      <div className="dash-metrics-grid">
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Retention Accuracy</span>
            <span className="metric-tile-icon">🎯</span>
          </div>
          <div className="metric-tile-value">{accuracy}%</div>
          <span className="metric-tile-foot">Based on spaced recall rating history</span>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Active Streak</span>
            <span className="metric-tile-icon">🔥</span>
          </div>
          <div className="metric-tile-value">
            {streak} <span className="value-unit">{streak === 1 ? "Day" : "Days"}</span>
          </div>
          <span className="metric-tile-foot">Consecutive study consistency</span>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Mastered Concepts</span>
            <span className="metric-tile-icon">🧠</span>
          </div>
          <div className="metric-tile-value">
            {mastered} <span className="value-unit">/ {totalCards}</span>
          </div>
          <span className="metric-tile-foot">Long-term interval memorization</span>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Pending Reviews</span>
            <span className="metric-tile-icon">⏱️</span>
          </div>
          <div className="metric-tile-value">{dueCount}</div>
          <span className="metric-tile-foot">Cards due within current window</span>
        </div>
      </div>

      {/* Secondary Modules: Daily Target & Quick Launchpads */}
      <div className="dash-sub-grid">
        <div className="dash-panel-card">
          <div className="dash-panel-header">
            <h3>Daily Review Target</h3>
            <span className="panel-tag">Active Routine</span>
          </div>
          <div className="dash-panel-body">
            <DailyGoal />
          </div>
        </div>

        <div className="dash-panel-card">
          <div className="dash-panel-header">
            <h3>Quick Launchpad</h3>
            <span className="panel-tag">Workspace</span>
          </div>
          <div className="quick-nav-list">
            <Link to="/learn" className="quick-nav-item">
              <div className="quick-nav-icon">📚</div>
              <div className="quick-nav-details">
                <strong>Curriculum & Textbooks</strong>
                <span>Class {studentClass} verified textbooks and study notes</span>
              </div>
              <span className="quick-nav-arrow">→</span>
            </Link>

            <Link to="/flashcards" className="quick-nav-item">
              <div className="quick-nav-icon">🗂️</div>
              <div className="quick-nav-details">
                <strong>Flashcard Practice Decks</strong>
                <span>Active recall decks categorized by subject</span>
              </div>
              <span className="quick-nav-arrow">→</span>
            </Link>

            <Link to="/progress" className="quick-nav-item">
              <div className="quick-nav-icon">📈</div>
              <div className="quick-nav-details">
                <strong>Retention Analytics</strong>
                <span>Detailed mastery charts and interval schedules</span>
              </div>
              <span className="quick-nav-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
