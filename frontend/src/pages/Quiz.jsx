
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Quiz() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [quizMeta, setQuizMeta] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      setError(
        err.response?.data?.error || "Could not open this quiz."
      );
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
      setError(
        err.response?.data?.error || "Could not submit the quiz."
      );
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
      <div className="page quiz-page">
        <div className="card">
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="page quiz-page">
        <section className="quiz-header">
          <div>
            <span className="eyebrow">MEMORYMESH QUIZ</span>
            <h1>Published quizzes</h1>
            <p>Choose a quiz assigned by your administrator.</p>
          </div>
        </section>

        {error && <div className="card" role="alert">{error}</div>}

        {quizzes.length === 0 ? (
          <div className="quiz-empty card">
            <div className="quiz-empty-icon">📝</div>
            <h2>No published quizzes yet</h2>
            <p>Check back after your administrator publishes a quiz.</p>
            <Link to="/activity" className="secondary-button">
              View Activity
            </Link>
          </div>
        ) : (
          <div className="quiz-list">
            {quizzes.map((item) => (
              <section className="card" key={item._id}>
                <h2>{item.title}</h2>
                {item.description && <p>{item.description}</p>}
                <p>
                  {item.subject}
                  {item.chapter ? ` · ${item.chapter}` : ""}
                </p>
                <p>
                  Class {item.classNumber} · {item.board} ·{" "}
                  {item.questionsCount ?? "Quiz"} 
                </p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => startQuiz(item)}
                >
                  Start Quiz
                </button>
              </section>
            ))}
          </div>
        )}

        <p>{/* Keep existing navigation available. */}</p>
      </div>
    );
  }

  if (results) {
    const percentage = results.percentage;
    const message =
      percentage >= 80
        ? "Excellent work!"
        : percentage >= 60
          ? "Good job! Keep improving."
          : "Keep practicing!";

    return (
      <div className="page quiz-page">
        <div className="quiz-result-card card">
          <div className="quiz-result-icon">
            {percentage >= 80 ? "🏆" : "🎯"}
          </div>
          <span className="eyebrow">QUIZ COMPLETE</span>
          <h1>{message}</h1>
          <p className="quiz-result-subtitle">{quiz.title}</p>

          <div className="quiz-score-circle">
            <strong>{percentage}%</strong>
            <span>Score</span>
          </div>

          <div className="quiz-result-stats">
            <div>
              <strong>{results.score}</strong>
              <span>Correct</span>
            </div>
            <div>
              <strong>{results.total - results.score}</strong>
              <span>Incorrect</span>
            </div>
            <div>
              <strong>{results.total}</strong>
              <span>Total</span>
            </div>
          </div>

          <h2>Answer review</h2>
          {quiz.questions.map((question, i) => {
            const result = results.results[i];
            return (
              <section className="card" key={question._id || i}>
                <h3>
                  {i + 1}. {question.question}
                </h3>
                <p>
                  Your answer:{" "}
                  {question.options[answers[i]] ?? "Not answered"}
                </p>
                <p>
                  Correct answer:{" "}
                  {question.options[result.correct_index]}
                </p>
                <strong>{result.correct ? "Correct ✓" : "Incorrect ✕"}</strong>
                {result.explanation && <p>{result.explanation}</p>}
              </section>
            );
          })}

          <div className="quiz-result-actions">
            <button
              type="button"
              className="primary-button"
              onClick={backToList}
            >
              Choose Another Quiz
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/activity")}
            >
              View Activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[index];
  const selected = answers[index];
  const progress = Math.round(((index + 1) / quiz.questions.length) * 100);
  const allAnswered = answers.every((answer) => answer !== null);

  return (
    <div className="page quiz-page">
      <section className="quiz-header">
        <div>
          <span className="eyebrow">MEMORYMESH QUIZ</span>
          <h1>{quiz.title}</h1>
          <p>
            Question {index + 1} of {quiz.questions.length}
          </p>
        </div>
      </section>

      <div className="quiz-progress-card">
        <div className="quiz-progress-top">
          <span>Quiz progress</span>
          <strong>{progress}%</strong>
        </div>
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && <div className="card" role="alert">{error}</div>}

      <section className="quiz-question-card card">
        <span className="quiz-question-number">
          QUESTION {index + 1}
        </span>
        <h2>{currentQuestion.question}</h2>

        <div className="quiz-options">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selected === optionIndex;
            let className = "quiz-option";
            if (isSelected) className += " quiz-option-selected";

            return (
              <button
                type="button"
                key={optionIndex}
                className={className}
                onClick={() => chooseAnswer(optionIndex)}
                disabled={submitting}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="quiz-option-text">{option}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>

        <div className="quiz-result-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0 || submitting}
          >
            Previous
          </button>

          {index < quiz.questions.length - 1 ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                if (selected === null) {
                  setError("Please select an answer to continue.");
                  return;
                }
                setError("");
                setIndex((current) => current + 1);
              }}
              disabled={submitting}
            >
              Next Question →
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={submitQuiz}
              disabled={submitting || !allAnswered}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>

        {!allAnswered && (
          <p>Please answer every question before submitting.</p>
        )}
        <button
          type="button"
          className="secondary-button"
          onClick={backToList}
          disabled={submitting}
        >
          Exit Quiz
        </button>
      </section>
    </div>
  );
}
