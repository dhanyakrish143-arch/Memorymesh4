import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import "./Progress.css";

export default function Progress() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [rubricStats, setRubricStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProgress = async () => {
      try {
        const [progressRes, rubricRes] = await Promise.allSettled([
          client.get("/review/stats"),
          client.get("/evaluator/analytics")
        ]);

        if (!active) return;

        if (progressRes.status === "fulfilled") {
          const data = progressRes.value.data;
          setStats(data?.success || data ? data : null);
        }

        if (rubricRes.status === "fulfilled") {
          setRubricStats(rubricRes.value.data?.stats || null);
        }
      } catch (err) {
        console.error("Failed to load progress data:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProgress();
    return () => {
      active = false;
    };
  }, []);

  const studentClass = Number(user?.class) || 10;
  const studentBoard = user?.board || "State";

  if (loading) {
    return (
      <div className="progress-analytics-wrapper">
        <div className="analytics-loading-box">
          <div className="analytics-spinner" />
          <p>Compiling cognitive retention metrics...</p>
        </div>
      </div>
    );
  }

  const overview = stats?.overview ?? stats ?? {};
  const totalReviews = overview.totalReviews ?? stats?.totalReviews ?? 0;
  const accuracy = Math.round(overview.accuracy ?? stats?.accuracy ?? 0);
  const mastered = overview.masteredCards ?? stats?.mastered ?? 0;
  const totalCards = overview.totalCards ?? stats?.totalCards ?? 0;
  const streak = overview.streak ?? stats?.streak ?? 0;

  const subjects = stats?.subjects ?? [];

  return (
    <div className="progress-analytics-wrapper">
      {/* Analytics Command Header */}
      <div className="analytics-header">
        <div>
          <span className="analytics-tagline">Cognitive Spaced Repetition Analytics</span>
          <h1 className="analytics-title">Learning & Retention Progress</h1>
          <p className="analytics-subtitle">
            Real-time performance analytics based on your active recall intervals, confidence ratings, and subjective step rubrics.
          </p>
        </div>

        <div className="analytics-curriculum-badge">
          <span className="badge-class">Class {studentClass}</span>
          <span className="badge-board">{studentBoard} Board</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Recall Accuracy</span>
            <span className="kpi-icon">🎯</span>
          </div>
          <div className="kpi-value">{accuracy}%</div>
          <span className="kpi-subtext">Overall correct response rate</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Reviews</span>
            <span className="kpi-icon">⚡</span>
          </div>
          <div className="kpi-value">{totalReviews}</div>
          <span className="kpi-subtext">Active recall cards reviewed</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Streak</span>
            <span className="kpi-icon">🔥</span>
          </div>
          <div className="kpi-value">{streak} Days</div>
          <span className="kpi-subtext">Consecutive daily study sessions</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Concepts Mastered</span>
            <span className="kpi-icon">🧠</span>
          </div>
          <div className="kpi-value">{mastered} / {totalCards}</div>
          <span className="kpi-subtext">Long-term interval retention</span>
        </div>
      </div>

      {/* NEW BE PROJECT DELIVERABLE: Step-Loss Detective Performance Card */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", marginTop: "24px", boxShadow: "0 2px 6px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              BE PROJECT DELIVERABLE • ALGORITHMIC RUBRIC EVALUATION
            </span>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "4px 0 2px" }}>
              Subjective Step-Loss & Examiner Scoring
            </h2>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              Audit of subjective board answers evaluated for step accuracy, compulsory keywords, and mark deductions.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ textAlign: "right", background: "#f8fafc", padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>EVALUATIONS</div>
              <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>{rubricStats?.totalEvaluations ?? 0}</div>
            </div>
            <div style={{ textAlign: "right", background: "#ecfdf5", padding: "8px 14px", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#065f46" }}>STEP ACCURACY</div>
              <div style={{ fontSize: "18px", fontWeight: "900", color: "#059669" }}>{rubricStats?.averageAccuracy ?? 0}%</div>
            </div>
          </div>
        </div>

        {rubricStats?.recentAttempts && rubricStats.recentAttempts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rubricStats.recentAttempts.map((att, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                    {att.subject} • {att.chapter}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                    {att.missedKeywords?.length > 0 
                      ? `Penalized Keywords: [${att.missedKeywords.join(", ")}]` 
                      : "Full step marks retained • No penalty clauses triggered"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: att.scoreAwarded === att.maxMarks ? "#059669" : "#d97706" }}>
                    {att.scoreAwarded} / {att.maxMarks} Marks
                  </span>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>
                    {att.percentage}% step accuracy
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "8px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
            No subjective answers evaluated yet. Complete a practice question in the <strong>Step-Loss Detective</strong> to generate your step deduction analytics.
          </div>
        )}
      </div>

      {/* Subject Mastery Overview */}
      {subjects.length > 0 && (
        <div style={{ marginTop: "24px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" }}>
            Subject Mastery Distribution
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {subjects.map((s, idx) => (
              <div key={idx} style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>{s.name || s.subject}</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{s.accuracy || 0}% Retention</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
