import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import "./StudyPlan.css";

// Strictly curated for Karnataka / State Board Classes 5 - 10
const STATE_BOARD_SUBJECTS = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Kannada",
  "Hindi",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Computer Science"
];

const TIME_PRESETS = [15, 30, 45, 60, 90, 120];

export default function StudyPlan() {
  const { user } = useAuth();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState(false);
  const [customSubject, setCustomSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [minutesPerDay, setMinutesPerDay] = useState(45);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const studentClass = Number(user?.class) || 10;
  const studentBoard = user?.board || "State";

  useEffect(() => {
    let active = true;
    client.get("/notes/subjects")
      .then(({ data }) => {
        if (active && Array.isArray(data?.subjects)) {
          setAvailableSubjects(
            data.subjects.filter(
              (item) => typeof item === "string" && item.trim()
            )
          );
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const subjects = useMemo(
    () => [...new Set([...STATE_BOARD_SUBJECTS, ...availableSubjects])]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
    [availableSubjects]
  );

  const finalSubjects = useMemo(() => {
    const chosen = allSubjects ? subjects : selectedSubjects;
    return [...new Set([
      ...chosen,
      ...(customSubject.trim() ? [customSubject.trim()] : [])
    ])];
  }, [allSubjects, subjects, selectedSubjects, customSubject]);

  function toggleSubject(item) {
    setSelectedSubjects((current) =>
      current.includes(item)
        ? current.filter((s) => s !== item)
        : [...current, item]
    );
    setAllSubjects(false);
    setError("");
  }

  function handleSelectAll() {
    if (allSubjects) {
      setAllSubjects(false);
      setSelectedSubjects([]);
    } else {
      setAllSubjects(true);
      setSelectedSubjects([...subjects]);
    }
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    if (!finalSubjects.length) {
      setError("Select at least one curriculum subject or enter a custom focus topic.");
      return;
    }

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const { data } = await client.post("/study-plan/generate", {
        subjects: finalSubjects,
        chapter: chapter.trim() || undefined,
        minutesPerDay: Number(minutesPerDay),
      });

      if (!data?.plan || !Array.isArray(data.plan.days)) {
        throw new Error("The cognitive engine did not return a structured plan.");
      }
      setPlan(data.plan);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Unable to generate study schedule at this time."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="planner-studio-wrapper">
      {/* Header */}
      <div className="planner-header-pane">
        <div>
          <span className="planner-tagline">Cognitive Spaced Schedule Generator</span>
          <h1 className="planner-main-title">Curriculum Study Planner</h1>
          <p className="planner-main-subtitle">
            Generate an adaptive multi-day revision roadmap engineered around your active recall load and state board syllabus.
          </p>
        </div>

        <div className="planner-curriculum-badge">
          <span className="badge-class">Class {studentClass}</span>
          <span className="badge-board">{studentBoard} Board</span>
        </div>
      </div>

      {/* Builder Console Card */}
      <div className="planner-console-card">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Subject Selection */}
          <div className="planner-section-top">
            <div>
              <h3>1. Target Subjects</h3>
              <p>Choose subjects to interleave across your study schedule.</p>
            </div>

            <button
              type="button"
              className={`select-all-toggle ${allSubjects ? "active" : ""}`}
              onClick={handleSelectAll}
            >
              {allSubjects ? "✓ All Subjects Selected" : "Select Entire Syllabus"}
            </button>
          </div>

          <div className="planner-chips-grid">
            {subjects.map((item) => {
              const isChecked = allSubjects || selectedSubjects.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  className={`subject-chip-btn ${isChecked ? "chip-checked" : ""}`}
                  onClick={() => toggleSubject(item)}
                >
                  <span className="chip-indicator">{isChecked ? "✓" : "+"}</span>
                  <span className="chip-label">{item}</span>
                </button>
              );
            })}
          </div>

          <div className="custom-subject-input-wrap">
            <label className="field-sublabel">Additional Focus Topic or Unit (Optional)</label>
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="e.g. Karnataka History & Heritage or Trigonometric Identities"
              maxLength={120}
              className="planner-input"
            />
          </div>

          <div className="planner-divider" />

          {/* Section 2: Time and Topic Parameters */}
          <div className="planner-section-top">
            <div>
              <h3>2. Session Parameters</h3>
              <p>Configure daily pacing and specific chapter targets.</p>
            </div>
            <span className="selection-count-pill">
              {finalSubjects.length} Subject{finalSubjects.length === 1 ? "" : "s"} In Plan
            </span>
          </div>

          <div className="planner-params-grid">
            <div className="param-field">
              <label className="field-sublabel">Chapter / Specific Module (Optional)</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Life Processes, Quadratic Equations..."
                maxLength={160}
                className="planner-input"
              />
            </div>

            <div className="param-field">
              <label className="field-sublabel">Daily Study Commitment</label>
              <div className="time-presets-row">
                {TIME_PRESETS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={`time-preset-btn ${minutesPerDay === m ? "active" : ""}`}
                    onClick={() => setMinutesPerDay(m)}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="planner-alert-box" role="alert">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="planner-submit-row">
            <button
              type="submit"
              className="planner-generate-btn"
              disabled={loading || !finalSubjects.length}
            >
              {loading ? "Synthesizing Revision Plan..." : "Generate Spaced Study Plan →"}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Multi-Day Schedule Section */}
      {plan && (
        <div className="planner-schedule-section" aria-live="polite">
          <div className="schedule-header-card">
            <div className="schedule-header-left">
              <span className="schedule-tag">Generated Active Plan</span>
              <h2>{plan.title || "Targeted Revision Schedule"}</h2>
              <p className="schedule-subjects-summary">
                Targeting: {finalSubjects.join(" • ")}
              </p>
              {plan.overview && <p className="schedule-overview-text">{plan.overview}</p>}
            </div>

            <div className="schedule-daily-stat">
              <span className="daily-minutes">{minutesPerDay}</span>
              <span className="daily-unit">MINUTES / DAY</span>
            </div>
          </div>

          <div className="schedule-timeline-list">
            {plan.days.map((day, index) => (
              <div className="schedule-day-card" key={`${day.day ?? index}-${index}`}>
                <div className="day-number-badge">
                  <span className="badge-day-label">DAY</span>
                  <span className="badge-day-val">{day.day ?? index + 1}</span>
                </div>

                <div className="day-details-content">
                  <div className="day-card-topbar">
                    <h3 className="day-focus-title">{day.title || `Review Session ${index + 1}`}</h3>
                    <span className="day-time-tag">⏱ {day.minutes ?? minutesPerDay} min allocated</span>
                  </div>

                  <div className="day-tasks-stack">
                    {(day.tasks || []).map((task, i) => (
                      <div className="day-task-item" key={`${i}-${task}`}>
                        <span className="task-step-number">{i + 1}</span>
                        <p className="task-text">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
