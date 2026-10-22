import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import "./Quiz.css";

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [quizMeta, setQuizMeta] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const studentClass = Number(user?.class) || 10;
  const studentBoard = user?.board || "State";

  useEffect(() => {
    let active = true;

    async function loadQuizzes() {
      try {
        setLoading(true);
        setError("");
        const response = await client.get("/quiz/published");

        if (active) {
          setQuizzes(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.error ||
              "Could not load published quizzes. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuizzes();
    return () => {
      active = false;
    };
  }, []);

  async function startQuiz(item) {
    try {
      setLoading(true);
      setError("");
      const response = await client.get(`/quiz/published/${item._id}`);

      setQuizMeta(item);
      setQuiz(response.data);
      setAnswers(Array(response.data.questions.length).fill(null));
      setIndex(0);
      setResults(null);
    } catch (err) {
      setError(err.response?.data?.error || "Could not open this quiz.");
    } finally {
      setLoading(false);
    }
  }

  function chooseAnswer(optionIndex) {
    if (!quiz || results || submitting) return;

    setAnswers((current) =>
      current.map((answer, i) => (i === index ? optionIndex : answer))
    );
  }

  async function submitQuiz() {
    if (!quiz || submitting || answers.some((answer) => answer === null)) {
      setError("Please answer every question before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await client.post(
        `/quiz/published/${quiz._id}/submit`,
        { answers }
      );

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit the quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  function backToList() {
    setQuiz(null);
    setQuizMeta(null);
    setAnswers([]);
    setIndex(0);
    setResults(null);
    setError("");
  }

  if (loading) {
    return (
      <div className="quiz-studio-wrapper">
        <div className="quiz-loading-state">
          <div className="quiz-spinner" />
          <p>Loading assessment workspace...</p>
        </div>
      </div>
    );
  }

  /* ================= 1. RESULTS & ANSWER REVIEW VIEW ================= */
  if (results) {
    const percentage = Math.round(results.percentage ?? 0);
    const isPassing = percentage >= 60;

    return (
      <div className="quiz-studio-wrapper">
        <div className="quiz-results-card">
          <div className="results-header-banner">
            <div className="results-icon-bubble">{isPassing ? "🏆" : "🎯"}</div>
            <div>
              <span className="results-tag">Assessment Complete</span>
              <h1 className="results-title">
                {percentage >= 80
                  ? "Mastery Demonstrated!"
                  : percentage >= 60
                  ? "Good Performance!"
                  : "Needs Focused Revision"}
              </h1>
              <p className="results-sub">{quiz.title}</p>
            </div>
          </div>

          <div className="results-score-row">
            <div className="score-radial-box">
              <span className="score-number">{percentage}%</span>
              <span className="score-label">Final Accuracy</span>
            </div>

            <div className="score-stat-quad">
              <div className="stat-quad-item stat-correct">
                <span className="stat-num">{results.score}</span>
                <span className="stat-desc">Correct Recalls</span>
              </div>
              <div className="stat-quad-item stat-incorrect">
                <span className="stat-num">{results.total - results.score}</span>
                <span className="stat-desc">Incorrect Recalls</span>
              </div>
              <div className="stat-quad-item">
                <span className="stat-num">{results.total}</span>
                <span className="stat-desc">Total Items</span>
              </div>
            </div>
          </div>

          <div className="review-section">
            <h3 className="review-heading">Item Breakdown & Rationales</h3>
            <div className="review-list">
              {quiz.questions.map((question, i) => {
                const result = results.results?.[i] || {};
                const isCorrect = result.correct;

                return (
                  <div
                    key={question._id || i}
                    className={`review-item-card ${isCorrect ? "card-pass" : "card-fail"}`}
                  >
                    <div className="review-item-top">
                      <span className="review-item-idx">Question {i + 1}</span>
                      <span className={`review-status-pill ${isCorrect ? "pill-pass" : "pill-fail"}`}>
                        {isCorrect ? "Correct ✓" : "Incorrect ✕"}
                      </span>
                    </div>

                    <h4 className="review-question-text">{question.question}</h4>

                    <div className="review-answers-box">
                      <div className="answer-line user-choice">
                        <span className="choice-tag">Your Choice:</span>
                        <span className={isCorrect ? "txt-correct" : "txt-wrong"}>
                          {question.options[answers[i]] ?? "Not answered"}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="answer-line key-choice">
                          <span className="choice-tag">Correct Key:</span>
                          <span className="txt-correct">
                            {question.options[result.correct_index]}
                          </span>
                        </div>
                      )}
                    </div>

                    {result.explanation && (
                      <div className="review-explanation">
                        <strong>Explanation:</strong> {result.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="results-actions-footer">
            <button type="button" className="quiz-btn-primary" onClick={backToList}>
              ← Return to Published Quizzes
            </button>
            <button
              type="button"
              className="quiz-btn-secondary"
              onClick={() => navigate("/progress")}
            >
              View Long-Term Analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= 2. ACTIVE QUIZ RUNNER ================= */
  if (quiz) {
    const currentQuestion = quiz.questions[index];
    const selected = answers[index];
    const progress = Math.round(((index + 1) / quiz.questions.length) * 100);
    const allAnswered = answers.every((answer) => answer !== null);

    return (
      <div className="quiz-studio-wrapper">
        <div className="quiz-runner-card">
          {/* Header */}
          <div className="runner-nav-header">
            <div>
              <span className="runner-quiz-tag">Active Assessment</span>
              <h2 className="runner-quiz-title">{quiz.title}</h2>
            </div>
            <button type="button" className="runner-exit-btn" onClick={backToList}>
              ✕ Exit
            </button>
          </div>

          {/* Progress Bar */}
          <div className="runner-progress-shell">
            <div className="runner-progress-label">
              <span>Question {index + 1} of {quiz.questions.length}</span>
              <span>{progress}% Completed</span>
            </div>
            <div className="runner-track">
              <div className="runner-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {error && (
            <div className="quiz-alert-banner">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Question Box */}
          <div className="runner-question-block">
            <span className="question-seq-pill">ITEM {index + 1}</span>
            <h3 className="question-body-text">{currentQuestion.question}</h3>

            <div className="runner-options-stack">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selected === optionIndex;

                return (
                  <button
                    type="button"
                    key={optionIndex}
                    className={`quiz-option-button ${isSelected ? "option-selected" : ""}`}
                    onClick={() => chooseAnswer(optionIndex)}
                    disabled={submitting}
                  >
                    <span className="option-letter-badge">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="option-label-text">{option}</span>
                    {isSelected && <span className="option-check-icon">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="runner-bottom-controls">
            <button
              type="button"
              className="quiz-btn-secondary"
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
              disabled={index === 0 || submitting}
            >
              ← Previous
            </button>

            {index < quiz.questions.length - 1 ? (
              <button
                type="button"
                className="quiz-btn-primary"
                onClick={() => {
                  if (selected === null) {
                    setError("Please select an answer to advance.");
                    return;
                  }
                  setError("");
                  setIndex((current) => current + 1);
                }}
                disabled={submitting}
              >
                Next Item →
              </button>
            ) : (
              <button
                type="button"
                className="quiz-btn-primary submit-accent"
                onClick={submitQuiz}
                disabled={submitting || !allAnswered}
              >
                {submitting ? "Scoring Assessment..." : "Submit Assessment →"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ================= 3. PUBLISHED QUIZZES CATALOG ================= */
  return (
    <div className="quiz-studio-wrapper">
      <div className="quiz-catalog-header">
        <div>
          <span className="quiz-tagline">Curriculum-Locked Assessment</span>
          <h1 className="quiz-main-title">Published Assessments</h1>
          <p className="quiz-main-subtitle">
            Diagnostic and chapter evaluations assigned by your academic administrator.
          </p>
        </div>

        <div className="quiz-curriculum-badge">
          <span className="badge-class">Class {studentClass}</span>
          <span className="badge-board">{studentBoard} Board</span>
        </div>
      </div>

      {error && (
        <div className="quiz-alert-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="quiz-empty-state">
          <div className="empty-bubble">📝</div>
          <h3>No Assessments Assigned</h3>
          <p>Your curriculum administrator has not published any quizzes for this grade yet.</p>
          <Link to="/learn" className="quiz-btn-secondary">
            Open Curriculum Textbooks
          </Link>
        </div>
      ) : (
        <div className="quiz-catalog-grid">
          {quizzes.map((item) => (
            <div className="quiz-catalog-card" key={item._id}>
              <div className="catalog-card-header">
                <span className="card-subject-pill">{item.subject}</span>
                <span className="card-questions-badge">
                  {item.questionsCount ? `${item.questionsCount} Questions` : "Diagnostic Quiz"}
                </span>
              </div>

              <h2 className="catalog-card-title">{item.title}</h2>
              {item.description && (
                <p className="catalog-card-desc">{item.description}</p>
              )}

              <div className="catalog-card-meta">
                <span className="meta-chip">Class {item.classNumber || studentClass}</span>
                <span className="meta-chip">{item.board || studentBoard} Board</span>
                {item.chapter && <span className="meta-chip">{item.chapter}</span>}
              </div>

              <button
                type="button"
                className="quiz-btn-primary"
                onClick={() => startQuiz(item)}
              >
                Start Assessment →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
