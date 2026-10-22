import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";

const ALL_CLASSES = [5, 6, 7, 8, 9, 10];
const ALL_SUBJECTS = ["Science", "Social Science", "Mathematics", "English", "Kannada", "Hindi"];

export default function StepLossDetective() {
  const { user } = useAuth();
  const initialClass = ALL_CLASSES.includes(Number(user?.class)) ? Number(user.class) : 10;

  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [error, setError] = useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      await client.post("/evaluator/seed");
      const { data } = await client.get("/evaluator/questions");
      const list = data.questions || [];
      setQuestions(list);

      const match = list.find((q) => Number(q.classLevel) === Number(selectedClass) && q.subject === selectedSubject)
        || list.find((q) => Number(q.classLevel) === Number(selectedClass))
        || list[0]
        || null;
      setSelectedQuestion(match);
    } catch (err) {
      setError("Unable to load subjective questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleClassChange = (c) => {
    setSelectedClass(c);
    setEvaluationResult(null);
    setStudentAnswer("");
    const match = questions.find((q) => Number(q.classLevel) === Number(c) && q.subject === selectedSubject)
      || questions.find((q) => Number(q.classLevel) === Number(c))
      || null;
    setSelectedQuestion(match);
  };

  const handleSubjectChange = (subj) => {
    setSelectedSubject(subj);
    setEvaluationResult(null);
    setStudentAnswer("");
    const match = questions.find((q) => Number(q.classLevel) === Number(selectedClass) && q.subject === subj)
      || questions.find((q) => q.subject === subj)
      || null;
    setSelectedQuestion(match);
  };

  const handleQuestionSelect = (q) => {
    setSelectedQuestion(q);
    setEvaluationResult(null);
    setStudentAnswer("");
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!studentAnswer.trim() || !selectedQuestion) return;

    setEvaluating(true);
    setError("");

    try {
      const { data } = await client.post("/evaluator/evaluate", {
        questionId: selectedQuestion._id,
        studentAnswer: studentAnswer.trim()
      });
      setEvaluationResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const filteredQuestions = questions.filter(
    (q) => Number(q.classLevel) === Number(selectedClass) && q.subject === selectedSubject
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p style={{ color: "#059669", fontWeight: "700" }}>Loading Board Step-Loss Evaluator (Classes 5-10)...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          EXAM MARK-MAXIMIZER • CLASSES 5 TO 10
        </span>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: "6px 0 4px" }}>
          Step-Loss Detective
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Write structured subjective answers for your class level. Our examiner algorithm evaluates your step breakdown and identifies exact keyword penalties.
        </p>
      </div>

      {/* Class Level Switcher (Class 5 - 10) */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", marginRight: "4px" }}>
          SELECT CLASS:
        </span>
        {ALL_CLASSES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleClassChange(c)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: selectedClass === c ? "2px solid #059669" : "1px solid #cbd5e1",
              background: selectedClass === c ? "#059669" : "#ffffff",
              color: selectedClass === c ? "#ffffff" : "#475569",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer"
            }}
          >
            Class {c}
          </button>
        ))}
      </div>

      {/* Subject Filter Bar */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "20px" }}>
        {ALL_SUBJECTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSubjectChange(s)}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              border: selectedSubject === s ? "1.5px solid #10b981" : "1px solid #cbd5e1",
              background: selectedSubject === s ? "#ecfdf5" : "#ffffff",
              color: selectedSubject === s ? "#065f46" : "#475569",
              fontSize: "12.5px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecdd3", borderRadius: "10px", color: "#b91c1c", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Split-Screen Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "24px", alignItems: "start" }}>
        {/* Left Side: Question List & Answer Input Box */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredQuestions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                Class {selectedClass} Questions ({filteredQuestions.length})
              </span>
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {filteredQuestions.map((q, idx) => (
                  <button
                    key={q._id}
                    type="button"
                    onClick={() => handleQuestionSelect(q)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: selectedQuestion?._id === q._id ? "2px solid #10b981" : "1px solid #cbd5e1",
                      background: selectedQuestion?._id === q._id ? "#ffffff" : "#f8fafc",
                      color: selectedQuestion?._id === q._id ? "#0f172a" : "#64748b",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      cursor: "pointer"
                    }}
                  >
                    Q{idx + 1}: {q.chapter} ({q.totalMarks}M)
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "16px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "10px", fontSize: "13px", color: "#64748b" }}>
              No subjective questions found for Class {selectedClass} ({selectedSubject}). You can add questions via the Admin Rubric Manager.
            </div>
          )}

          {/* Active Question Prompt Box */}
          {selectedQuestion && (
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff", background: "#059669", padding: "3px 8px", borderRadius: "6px" }}>
                    Class {selectedQuestion.classLevel || selectedClass}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", background: "#ecfdf5", padding: "3px 8px", borderRadius: "6px" }}>
                    {selectedQuestion.chapter}
                  </span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                  Max Score: {selectedQuestion.totalMarks} Marks
                </span>
              </div>
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "6px 0 16px", lineHeight: "1.4" }}>
                {selectedQuestion.questionText}
              </h2>

              {/* Subjective Response Box */}
              <form onSubmit={handleEvaluate}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px" }}>
                  YOUR WRITTEN ANSWER (INCLUDE FORMULAS, CONDITIONS & STEPS):
                </label>
                <textarea
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type your complete subjective solution step by step..."
                  rows={8}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                    boxSizing: "border-box",
                    outline: "none",
                    marginBottom: "14px"
                  }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={evaluating || !studentAnswer.trim()}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "10px",
                      border: "none",
                      background: !studentAnswer.trim() || evaluating ? "#94a3b8" : "#10b981",
                      color: "#ffffff",
                      fontSize: "13.5px",
                      fontWeight: "800",
                      cursor: !studentAnswer.trim() || evaluating ? "not-allowed" : "pointer",
                      boxShadow: !studentAnswer.trim() || evaluating ? "none" : "0 2px 8px rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    {evaluating ? "Evaluating Marking Rubric..." : "Analyze Step Deductions ➔"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Scorecard & Report */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: "0 0 14px" }}>
            Examiner Scorecard & Step-Loss Report
          </h3>

          {!evaluationResult ? (
            <div style={{ textAlign: "center", padding: "48px 16px", color: "#64748b" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>Awaiting Answer Submission</div>
              <p style={{ fontSize: "12.5px", maxWidth: "280px", margin: "4px auto 0" }}>
                Select your class level, type your answer, and click analyze to see how examiners allocate step marks.
              </p>
            </div>
          ) : (
            <div>
              {/* Score Highlight Box */}
              <div
                style={{
                  background: evaluationResult.totalAwarded === evaluationResult.maxMarks ? "#ecfdf5" : "#f8fafc",
                  border: evaluationResult.totalAwarded === evaluationResult.maxMarks ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                  marginBottom: "16px"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                  Marks Awarded
                </div>
                <div style={{ fontSize: "32px", fontWeight: "900", color: evaluationResult.totalAwarded === evaluationResult.maxMarks ? "#059669" : "#0f172a" }}>
                  {evaluationResult.totalAwarded} / {evaluationResult.maxMarks}
                </div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", marginTop: "4px" }}>
                  {evaluationResult.examinerSummary}
                </div>
              </div>

              {/* Step Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                {evaluationResult.rubricBreakdown?.map((step, sIdx) => {
                  const isFull = step.marksAwarded === step.maxMarks;
                  const isZero = step.marksAwarded === 0;

                  return (
                    <div
                      key={sIdx}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderLeft: `4px solid ${isFull ? "#10b981" : isZero ? "#ef4444" : "#f59e0b"}`,
                        borderRadius: "8px",
                        padding: "10px 12px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                          {step.title}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: isFull ? "#059669" : isZero ? "#dc2626" : "#d97706" }}>
                          +{step.marksAwarded} / {step.maxMarks}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        {step.feedback}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Official Board Model Answer */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  Official Board Model Solution
                </span>
                <p style={{ fontSize: "12.5px", color: "#334155", margin: 0, lineHeight: "1.5" }}>
                  {evaluationResult.modelAnswer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
