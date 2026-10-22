import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import "./Exam.css";

const DEFAULT_COUNTS = [5, 10, 20, 30];
const TIME_OPTIONS = [5, 10, 15, 30];

export default function Exam() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentClass = Number(user?.class) || 10;
  const studentBoard = user?.board || "State";

  // Data states
  const [adminPapers, setAdminPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [quizPool, setQuizPool] = useState([]);
  const [paperTitle, setPaperTitle] = useState("Standard Board Mock Paper");

  // Setup options
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(10);

  // Runtime states
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check incoming quiz from state/storage
  const incomingQuiz = useMemo(() => {
    try {
      const stored = localStorage.getItem("memorymesh_quiz");
      const source = location.state?.quiz || (stored ? JSON.parse(stored) : []);
      return Array.isArray(source)
        ? source.filter(
            (item) =>
              item &&
              typeof item.question === "string" &&
              Array.isArray(item.options) &&
              item.options.length >= 2
          )
        : [];
    } catch {
      return [];
    }
  }, [location.state]);

  // Load Admin Published Quizzes on mount
  useEffect(() => {
    let active = true;

    async function fetchAdminExams() {
      try {
        setLoading(true);
        const { data } = await client.get("/quiz/published");
        if (!active) return;

        const list = Array.isArray(data) ? data : [];
        setAdminPapers(list);

        if (list.length > 0) {
          const first = list[0];
          setSelectedPaperId(first._id);
          setPaperTitle(first.title);
          
          // Always fetch full published quiz details to ensure all questions load
          try {
            const detailRes = await client.get(`/quiz/published/${first._id}`);
            if (detailRes.data?.questions && Array.isArray(detailRes.data.questions)) {
              setQuizPool(detailRes.data.questions);
              setQuestionCount(detailRes.data.questions.length);
            } else {
              setQuizPool(first.questions || incomingQuiz);
              setQuestionCount(first.questions?.length || incomingQuiz.length || 10);
            }
          } catch {
            setQuizPool(first.questions || incomingQuiz);
          }
        } else {
          setSelectedPaperId("ai-generated");
          setQuizPool(incomingQuiz);
          setQuestionCount(incomingQuiz.length || 10);
        }
      } catch (err) {
        console.error("Could not fetch published admin papers:", err);
        if (active) {
          setQuizPool(incomingQuiz);
          setQuestionCount(incomingQuiz.length || 10);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAdminExams();
    return () => {
      active = false;
    };
  }, [incomingQuiz]);

  // Handle switching paper source
  const handlePaperSelect = async (paperId) => {
    setSelectedPaperId(paperId);
    if (paperId === "ai-generated") {
      setQuizPool(incomingQuiz);
      setPaperTitle("Adaptive AI Practice Paper");
      setQuestionCount(incomingQuiz.length || 10);
      return;
    }

    try {
      setLoading(true);
      const res = await client.get(`/quiz/published/${paperId}`);
      if (res.data?.questions && Array.isArray(res.data.questions)) {
        setQuizPool(res.data.questions);
        setPaperTitle(res.data.title || "Admin Board Simulation");
        setQuestionCount(res.data.questions.length);
      }
    } catch (err) {
      console.error("Failed to load paper details:", err);
    } finally {
      setLoading(false);
    }
  };

  const availableCount = quizPool.length;
  const examCount = Math.min(Number(questionCount) || availableCount, availableCount);
  const examQuestions = useMemo(() => quizPool.slice(0, examCount), [quizPool, examCount]);

  // Deduplicated question count options
  const availableCountOptions = useMemo(() => {
    if (availableCount <= 0) return [];
    const valid = DEFAULT_COUNTS.filter((c) => c < availableCount);
    return [...valid, availableCount];
  }, [availableCount]);

  // Timer countdown
  useEffect(() => {
    if (!started || finished) return;

    if (remainingSeconds <= 0) {
      setFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, remainingSeconds]);

  // Submission & Scoring
  useEffect(() => {
    if (!finished || examQuestions.length === 0 || saved) return;

    const saveExamResult = async () => {
      setSaving(true);
      const correct = examQuestions.reduce((total, question, qIdx) => {
        return total + (answers[qIdx] === question.correct_index ? 1 : 0);
      }, 0);

      const percentage = Math.round((correct / examQuestions.length) * 100);
      const subject =
        localStorage.getItem("memorymesh_quiz_subject") || "State Syllabus";
      const chapter =
        localStorage.getItem("memorymesh_quiz_chapter") || "Comprehensive";

      try {
        await client.post("/quiz/result", {
          score: correct,
          total: examQuestions.length,
          percentage,
          subject,
          chapter,
          title: paperTitle,
          mode: "board_simulation",
        });
        setSaved(true);
      } catch (err) {
        console.error("Failed to record simulation result:", err);
      } finally {
        setSaving(false);
      }
    };

    saveExamResult();
  }, [finished, examQuestions, answers, saved, paperTitle]);

  const correctCount = useMemo(() => {
    return examQuestions.reduce(
      (total, q, qIdx) => total + (answers[qIdx] === q.correct_index ? 1 : 0),
      0
    );
  }, [examQuestions, answers]);

  const incorrectCount = examQuestions.length - correctCount;
  const percentage =
    examQuestions.length > 0
      ? Math.round((correctCount / examQuestions.length) * 100)
      : 0;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startExam = () => {
    if (examQuestions.length === 0) return;
    setAnswers({});
    setFlagged({});
    setIndex(0);
    setFinished(false);
    setSaved(false);
    setRemainingSeconds(Number(timeLimit) * 60);
    setStarted(true);
  };

  const chooseAnswer = (optionIndex) => {
    if (finished) return;
    setAnswers((current) => ({
      ...current,
      [index]: optionIndex,
    }));
  };

  const toggleFlag = (qIdx) => {
    setFlagged((prev) => ({
      ...prev,
      [qIdx]: !prev[qIdx],
    }));
  };

  // 1. EMPTY STATE
  if (!loading && quizPool.length === 0 && incomingQuiz.length === 0) {
    return (
      <div className="sim-arena-wrapper">
        <div className="sim-empty-card">
          <div className="sim-empty-badge">📋</div>
          <span className="sim-tag">State Board Assessment Engine</span>
          <h1>No Simulation Papers Available</h1>
          <p>
            No examination papers have been assigned by your academic administrator for Class {studentClass} yet.
          </p>
          <div className="sim-empty-actions">
            <Link to="/learn" className="sim-btn-primary">
              Review Syllabus Textbooks
            </Link>
            <Link to="/quiz" className="sim-btn-secondary">
              Open Chapter Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. CONFIGURATION & PRE-EXAM BRIEFING
  if (!started) {
    return (
      <div className="sim-arena-wrapper">
        <div className="sim-briefing-header">
          <div>
            <span className="sim-tag">Official Assessment Arena</span>
            <h1 className="sim-title">Mock Board Simulation</h1>
            <p className="sim-subtitle">
              Strict timed assessment mirroring state board constraints without real-time answer reveals.
            </p>
          </div>

          <div className="sim-curriculum-badge">
            <span className="badge-class">Class {studentClass}</span>
            <span className="badge-board">{studentBoard} Board</span>
          </div>
        </div>

        <div className="sim-builder-card">
          <div className="sim-section-header">
            <h3>1. Choose Examination Source</h3>
            <span className="sim-section-pill">Admin Synced</span>
          </div>

          <div className="sim-paper-selector-grid">
            {adminPapers.map((paper) => (
              <div
                key={paper._id}
                className={`sim-paper-option ${selectedPaperId === paper._id ? "selected" : ""}`}
                onClick={() => handlePaperSelect(paper._id)}
              >
                <div className="option-top">
                  <span className="paper-tag">Official Board Paper</span>
                  <span className="paper-q-count">
                    {paper.questionsCount || (paper.questions ? paper.questions.length : "Full")} Items
                  </span>
                </div>
                <h4>{paper.title}</h4>
                <p>{paper.subject} • {paper.chapter || "Syllabus Module"}</p>
              </div>
            ))}

            {incomingQuiz.length > 0 && (
              <div
                className={`sim-paper-option ${selectedPaperId === "ai-generated" ? "selected" : ""}`}
                onClick={() => handlePaperSelect("ai-generated")}
              >
                <div className="option-top">
                  <span className="paper-tag ai-tag">AI Generated Deck</span>
                  <span className="paper-q-count">{incomingQuiz.length} Items</span>
                </div>
                <h4>Adaptive AI Practice Paper</h4>
                <p>Synthesized recall questions from recent sessions</p>
              </div>
            )}
          </div>

          <div className="sim-divider" />

          <div className="sim-section-header">
            <h3>2. Simulation Parameters</h3>
            <span className="sim-section-pill">{availableCount} Questions Ready</span>
          </div>

          <div className="sim-config-split">
            <div className="config-block">
              <label>Questions in Paper</label>
              <div className="choice-button-group">
                {availableCountOptions.map((count) => (
                  <button
                    type="button"
                    key={count}
                    className={`choice-pill-btn ${questionCount === count ? "active" : ""}`}
                    onClick={() => setQuestionCount(count)}
                  >
                    {count === availableCount
                      ? `All ${availableCount} Items`
                      : `${count} Items`}
                  </button>
                ))}
              </div>
            </div>

            <div className="config-block">
              <label>Time Constraint</label>
              <div className="choice-button-group">
                {TIME_OPTIONS.map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    className={`choice-pill-btn ${timeLimit === mins ? "active" : ""}`}
                    onClick={() => setTimeLimit(mins)}
                  >
                    ⏱ {mins} Minutes
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sim-rules-box">
            <h4>Board Simulation Protocols:</h4>
            <ul>
              <li><strong>Zero Immediate Feedback:</strong> Answers and scoring are sealed until final submission.</li>
              <li><strong>Free Navigation & Flagging:</strong> Jump between items and flag uncertain questions for later review.</li>
              <li><strong>Auto-Submission:</strong> The simulation automatically finalizes when the timer hits 00:00.</li>
            </ul>
          </div>

          <div className="sim-action-row">
            <button
              type="button"
              className="sim-launch-btn"
              onClick={startExam}
              disabled={examQuestions.length === 0}
            >
              Enter Simulation Arena →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. RESULTS & DIAGNOSTIC REPORT
  if (finished) {
    const isDistinction = percentage >= 75;
    const isPassed = percentage >= 50;

    return (
      <div className="sim-arena-wrapper">
        <div className="sim-results-container">
          <div className="sim-result-banner">
            <div className="result-banner-left">
              <div className="result-trophy-badge">{isDistinction ? "🏆" : "📊"}</div>
              <div>
                <span className="sim-tag">State Board Performance Audit</span>
                <h2>{paperTitle}</h2>
                <p>Official Simulation Report for Class {studentClass} • {studentBoard} Board</p>
              </div>
            </div>

            <div className="result-grade-stamp">
              <span className="stamp-title">Board Standing</span>
              <span className={`stamp-value ${isDistinction ? "distinction" : isPassed ? "passed" : "needs-revision"}`}>
                {isDistinction ? "Distinction" : isPassed ? "First Class" : "Revision Required"}
              </span>
            </div>
          </div>

          <div className="sim-metric-quad">
            <div className="quad-item score-focus">
              <span className="quad-label">Overall Accuracy</span>
              <span className="quad-num">{percentage}%</span>
              <span className="quad-sub">{correctCount} of {examQuestions.length} correct</span>
            </div>
            <div className="quad-item">
              <span className="quad-label">Correct Answers</span>
              <span className="quad-num text-emerald">{correctCount}</span>
              <span className="quad-sub">Validated board marks</span>
            </div>
            <div className="quad-item">
              <span className="quad-label">Incorrect / Missed</span>
              <span className="quad-num text-crimson">{incorrectCount}</span>
              <span className="quad-sub">Requires recall review</span>
            </div>
            <div className="quad-item">
              <span className="quad-label">Time Invested</span>
              <span className="quad-num">
                {formatTime(Number(timeLimit) * 60 - remainingSeconds)}
              </span>
              <span className="quad-sub">Of {timeLimit}m allocation</span>
            </div>
          </div>

          <div className="sim-review-section">
            <h3>Detailed Item Analysis & Solutions</h3>
            <div className="sim-review-list">
              {examQuestions.map((q, qIdx) => {
                const userAns = answers[qIdx];
                const isCorrect = userAns === q.correct_index;

                return (
                  <div
                    key={qIdx}
                    className={`sim-review-card ${isCorrect ? "card-correct" : "card-wrong"}`}
                  >
                    <div className="review-top-row">
                      <span className="q-index-pill">Question {qIdx + 1}</span>
                      <span className={`status-pill ${isCorrect ? "status-pass" : "status-fail"}`}>
                        {isCorrect ? "Correct ✓" : "Incorrect ✕"}
                      </span>
                    </div>

                    <h4 className="review-q-title">{q.question}</h4>

                    <div className="review-answer-grid">
                      <div className="ans-tile user-tile">
                        <span className="ans-label">Your Response:</span>
                        <span className={isCorrect ? "ans-val green" : "ans-val red"}>
                          {userAns !== undefined && q.options[userAns]
                            ? q.options[userAns]
                            : "Unanswered"}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="ans-tile correct-tile">
                          <span className="ans-label">Verified Correct Key:</span>
                          <span className="ans-val green">
                            {q.options[q.correct_index]}
                          </span>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="review-rationale">
                        <strong>Board Solution Rationale:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sim-result-actions">
            <button
              type="button"
              className="sim-btn-primary"
              onClick={() => {
                setStarted(false);
                setFinished(false);
                setAnswers({});
                setFlagged({});
                setIndex(0);
                setSaved(false);
              }}
            >
              ← Attempt Another Simulation
            </button>
            <button
              type="button"
              className="sim-btn-secondary"
              onClick={() => navigate("/progress")}
            >
              Open Retention Analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. ACTIVE SIMULATION RUNNER WITH PALETTE DRAWER
  const currentQuestion = examQuestions[index] || { question: "", options: [] };
  const selected = answers[index];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="sim-arena-wrapper">
      <div className="sim-runner-topbar">
        <div>
          <span className="runner-sim-tag">{paperTitle}</span>
          <h2 className="runner-q-indicator">
            Question {index + 1} of {examQuestions.length}
          </h2>
        </div>

        <div className="sim-status-right">
          <button
            type="button"
            className={`flag-question-btn ${flagged[index] ? "flagged" : ""}`}
            onClick={() => toggleFlag(index)}
          >
            {flagged[index] ? "🚩 Flagged for Review" : "🏳️ Flag Item"}
          </button>

          <div className={`sim-live-timer ${remainingSeconds <= 60 ? "timer-danger" : ""}`}>
            <span className="timer-label">TIME LEFT</span>
            <span className="timer-digits">{formatTime(remainingSeconds)}</span>
          </div>
        </div>
      </div>

      <div className="sim-stage-split">
        <div className="sim-question-console">
          <div className="q-console-header">
            <span className="console-q-badge">ITEM #{index + 1}</span>
            <span className="console-q-status">
              {selected !== undefined ? "✓ Marked" : "Pending"}
            </span>
          </div>

          <h3 className="console-question-text">{currentQuestion.question}</h3>

          <div className="console-options-list">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selected === optIdx;
              return (
                <button
                  type="button"
                  key={optIdx}
                  className={`console-option-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => chooseAnswer(optIdx)}
                >
                  <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                  <span className="opt-text">{opt}</span>
                  {isSelected && <span className="opt-check">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="console-nav-row">
            <button
              type="button"
              className="console-nav-btn"
              onClick={() => setIndex((c) => Math.max(c - 1, 0))}
              disabled={index === 0}
            >
              ← Previous Item
            </button>

            {index + 1 === examQuestions.length ? (
              <button
                type="button"
                className="console-submit-btn"
                onClick={() => setFinished(true)}
              >
                Submit Simulation Paper →
              </button>
            ) : (
              <button
                type="button"
                className="console-nav-btn next-btn"
                onClick={() => setIndex((c) => c + 1)}
              >
                Next Item →
              </button>
            )}
          </div>
        </div>

        <div className="sim-palette-sidebar">
          <div className="palette-header">
            <h4>Question Palette</h4>
            <span>{answeredCount} / {examQuestions.length} Attempted</span>
          </div>

          <div className="palette-grid">
            {examQuestions.map((_, qIdx) => {
              const isAnswered = answers[qIdx] !== undefined;
              const isFlagged = flagged[qIdx];
              const isCurrent = index === qIdx;

              let cellClass = "palette-cell";
              if (isCurrent) cellClass += " cell-current";
              if (isFlagged) cellClass += " cell-flagged";
              else if (isAnswered) cellClass += " cell-answered";

              return (
                <button
                  type="button"
                  key={qIdx}
                  className={cellClass}
                  onClick={() => setIndex(qIdx)}
                >
                  {qIdx + 1}
                  {isFlagged && <span className="cell-flag-dot" />}
                </button>
              );
            })}
          </div>

          <div className="palette-legend">
            <div className="legend-item">
              <span className="legend-swatch swatch-green" /> Attempted
            </div>
            <div className="legend-item">
              <span className="legend-swatch swatch-amber" /> Flagged
            </div>
            <div className="legend-item">
              <span className="legend-swatch swatch-slate" /> Pending
            </div>
          </div>

          <button
            type="button"
            className="palette-finish-btn"
            onClick={() => setFinished(true)}
          >
            End Simulation Early
          </button>
        </div>
      </div>
    </div>
  );
}
