import React, { useState, useEffect } from "react";

const DEFAULT_HABITS_BY_TIER = {
  foundation: [
    { id: "f1", text: "Read 1 textbook chapter summary", done: false },
    { id: "f2", text: "Practice 5 formula flashcards", done: false },
    { id: "f3", text: "Take 1 quick 5-question chapter quiz", done: false },
    { id: "f4", text: "Observe 20-20-20 eye rest rule", done: false }
  ],
  standard: [
    { id: "s1", text: "Complete 15 scheduled BKT flashcards", done: false },
    { id: "s2", text: "Solve 3 previous year board questions", done: false },
    { id: "s3", text: "Review 1 full chapter study note", done: false },
    { id: "s4", text: "Maintain 30-minute focused study sprint", done: false }
  ],
  advanced: [
    { id: "a1", text: "Complete 25 spaced repetition review cards", done: false },
    { id: "a2", text: "Solve 5 high-difficulty application problems", done: false },
    { id: "a3", text: "Attempt 1 full timed board mock exam section", done: false },
    { id: "a4", text: "Perform 1 error-log review of incorrect items", done: false }
  ]
};

export default function StudyHabits() {
  const [tier, setTier] = useState(() => localStorage.getItem("mm_habit_tier") || "standard");
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem(`mm_habits_${tier}`);
    return saved ? JSON.parse(saved) : DEFAULT_HABITS_BY_TIER[tier];
  });
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("mm_study_streak")) || 3);

  useEffect(() => {
    const saved = localStorage.getItem(`mm_habits_${tier}`);
    setHabits(saved ? JSON.parse(saved) : DEFAULT_HABITS_BY_TIER[tier]);
    localStorage.setItem("mm_habit_tier", tier);
  }, [tier]);

  const toggleHabit = (id) => {
    const updated = habits.map((h) => (h.id === id ? { ...h, done: !h.done } : h));
    setHabits(updated);
    localStorage.setItem(`mm_habits_${tier}`, JSON.stringify(updated));

    // If all tasks completed, celebrate & ensure streak
    if (updated.every((h) => h.done)) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("mm_study_streak", String(newStreak));
    }
  };

  const completedCount = habits.filter((h) => h.done).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: "100%", boxSizing: "border-box" }}>
      <div style={{ marginBottom: "24px" }}>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          COGNITIVE HABIT ENGINE
        </span>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: "6px 0" }}>
          Daily Adaptive Study Habits
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Micro-goals calibrated to your learning pace and board exam targets.
        </p>
      </div>

      {/* Top Banner Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Active Streak</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", marginTop: "4px" }}>
            🔥 {streak} <span style={{ fontSize: "14px", fontWeight: "700", color: "#64748b" }}>Days</span>
          </div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Today's Completion</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#10b981", marginTop: "4px" }}>
            {progressPercent}%
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {completedCount} of {habits.length} micro-goals completed
          </div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Adaptive Tier</div>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13.5px",
              fontWeight: "700"
            }}
          >
            <option value="foundation">Foundation (Visual Pace)</option>
            <option value="standard">Standard (Board Regular)</option>
            <option value="advanced">Advanced (Exam Ranker)</option>
          </select>
        </div>
      </div>

      {/* Habit Checklist Card */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", maxWidth: "700px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 18px 0" }}>
          Today's NCERT Revision Tasks
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {habits.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleHabit(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 18px",
                borderRadius: "12px",
                background: item.done ? "#ecfdf5" : "#f8fafc",
                border: item.done ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => {}}
                style={{ width: "18px", height: "18px", accentColor: "#10b981", cursor: "pointer" }}
              />
              <span
                style={{
                  fontSize: "14.5px",
                  fontWeight: "600",
                  color: item.done ? "#065f46" : "#334155",
                  textDecoration: item.done ? "line-through" : "none"
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
