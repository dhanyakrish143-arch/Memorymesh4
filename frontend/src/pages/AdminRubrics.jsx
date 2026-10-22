import React, { useEffect, useState } from "react";
import client from "../api/client";

const ALL_CLASSES = [5, 6, 7, 8, 9, 10];
const ALL_SUBJECTS = ["Science", "Social Science", "Mathematics", "English", "Kannada", "Hindi"];

export default function AdminRubrics() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter & Form states
  const [filterClass, setFilterClass] = useState("all");
  const [classLevel, setClassLevel] = useState(10);
  const [subject, setSubject] = useState("Science");
  const [chapter, setChapter] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [totalMarks, setTotalMarks] = useState(3);
  const [modelAnswer, setModelAnswer] = useState("");

  const [rubricSteps, setRubricSteps] = useState([
    { title: "Step 1: Formula / Core Law Statement", maxMarks: 1, requiredKeywords: "", penaltyIfMissing: "Loss of 1 mark: Missing formula or law statement." },
    { title: "Step 2: Crucial Conditions / Derivation", maxMarks: 1, requiredKeywords: "", penaltyIfMissing: "Loss of 1 mark: Incomplete step derivation." },
    { title: "Step 3: Units, Working & Conclusion", maxMarks: 1, requiredKeywords: "", penaltyIfMissing: "Loss of 1 mark: Missing final SI unit or conclusion." }
  ]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      await client.post("/evaluator/seed");
      const { data } = await client.get("/evaluator/questions");
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load subjective questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleStepChange = (index, field, value) => {
    const updated = [...rubricSteps];
    updated[index][field] = value;
    setRubricSteps(updated);
  };

  const addStep = () => {
    setRubricSteps([
      ...rubricSteps,
      {
        title: `Step ${rubricSteps.length + 1}: Key Component`,
        maxMarks: 1,
        requiredKeywords: "",
        penaltyIfMissing: "Loss of 1 mark: Key step omitted."
      }
    ]);
  };

  const removeStep = (index) => {
    if (rubricSteps.length <= 1) return;
    setRubricSteps(rubricSteps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!questionText.trim() || !chapter.trim() || !modelAnswer.trim()) {
      setError("Please fill in question text, chapter, and official model answer.");
      return;
    }

    const formattedSteps = rubricSteps.map((step) => ({
      title: step.title,
      maxMarks: Number(step.maxMarks) || 1,
      requiredKeywords: typeof step.requiredKeywords === "string"
        ? step.requiredKeywords.split(",").map((k) => k.trim()).filter(Boolean)
        : step.requiredKeywords,
      penaltyIfMissing: step.penaltyIfMissing
    }));

    try {
      await client.post("/evaluator/questions", {
        classLevel: Number(classLevel),
        subject,
        chapter,
        questionText,
        totalMarks: Number(totalMarks) || 3,
        modelAnswer,
        rubricSteps: formattedSteps
      });

      setSuccessMsg(`Question saved successfully for Class ${classLevel}!`);
      setQuestionText("");
      setChapter("");
      setModelAnswer("");
      loadQuestions();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create question.");
    }
  };

  const displayedQuestions = filterClass === "all"
    ? questions
    : questions.filter((q) => Number(q.classLevel) === Number(filterClass));

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
          Subjective Rubric & Step-Loss Manager (Classes 5 - 10)
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Manage step-by-step marking rubrics and keywords for board-exam preparation across Class 5 through Class 10.
        </p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecdd3", borderRadius: "8px", color: "#b91c1c", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", color: "#065f46", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Question Form */}
      <form onSubmit={handleSubmit} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", marginBottom: "32px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px" }}>
          Create New Subjective Question
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 110px", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px" }}>CLASS LEVEL</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(Number(e.target.value))}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #059669", background: "#ecfdf5", fontWeight: "800", color: "#065f46", outline: "none", fontSize: "13px" }}
            >
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px" }}>SUBJECT</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px" }}
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px" }}>CHAPTER / TOPIC</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g., Force and Pressure"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px" }}>MAX MARKS</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              min="1"
              max="10"
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px" }}>QUESTION TEXT</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g., State the formula for pressure and explain why school bags have broad straps."
            rows={2}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px" }}>OFFICIAL MODEL ANSWER</label>
          <textarea
            value={modelAnswer}
            onChange={(e) => setModelAnswer(e.target.value)}
            placeholder="Official standard answer for student step comparison..."
            rows={3}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        {/* Dynamic Rubric Steps */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>Step Marking Rubric</span>
            <button
              type="button"
              onClick={addStep}
              style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
            >
              + Add Step
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rubricSteps.map((step, idx) => (
              <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 30px", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                    placeholder="Step Title"
                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
                  />
                  <input
                    type="number"
                    value={step.maxMarks}
                    onChange={(e) => handleStepChange(idx, "maxMarks", e.target.value)}
                    min="0.5"
                    step="0.5"
                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
                  />
                  {rubricSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "16px", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="text"
                    value={step.requiredKeywords}
                    onChange={(e) => handleStepChange(idx, "requiredKeywords", e.target.value)}
                    placeholder="Mandatory keywords (comma separated, e.g., force, area)"
                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  />
                  <input
                    type="text"
                    value={step.penaltyIfMissing}
                    onChange={(e) => handleStepChange(idx, "penaltyIfMissing", e.target.value)}
                    placeholder="Penalty explanation note"
                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          style={{ background: "#10b981", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "13.5px", cursor: "pointer" }}
        >
          Save Subjective Question & Rubric
        </button>
      </form>

      {/* Filter and List Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Configured Rubrics ({displayedQuestions.length})
          </h2>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>FILTER CLASS:</span>
            <button
              type="button"
              onClick={() => setFilterClass("all")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: filterClass === "all" ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                background: filterClass === "all" ? "#ecfdf5" : "#ffffff",
                color: filterClass === "all" ? "#065f46" : "#475569",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              All
            </button>
            {ALL_CLASSES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterClass(c)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: filterClass === c ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                  background: filterClass === c ? "#ecfdf5" : "#ffffff",
                  color: filterClass === c ? "#065f46" : "#475569",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Class {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading questions...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {displayedQuestions.map((q) => (
              <div key={q._id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff", background: "#059669", padding: "3px 8px", borderRadius: "6px" }}>
                      Class {q.classLevel || 10}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", background: "#ecfdf5", padding: "3px 8px", borderRadius: "6px" }}>
                      {q.subject} • {q.chapter}
                    </span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                    {q.totalMarks} Marks
                  </span>
                </div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: "6px 0 8px" }}>
                  {q.questionText}
                </h3>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {q.rubricSteps?.map((step, sIdx) => (
                    <span key={sIdx} style={{ fontSize: "11.5px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", color: "#475569" }}>
                      {step.title} (+{step.maxMarks}m)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
