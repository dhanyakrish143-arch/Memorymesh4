import { useCallback, useEffect, useState } from "react";
import client from "../api/client";

const makeQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correct_index: "0",
  explanation: "",
});

const emptyForm = () => ({
  title: "",
  description: "",
  subject: "",
  chapter: "",
  classNumber: "5",
  board: "CBSE",
  questions: [makeQuestion()],
  published: false,
});

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  marginTop: "5px",
  background: "#fff",
  color: "#172033",
};

const labelStyle = {
  display: "block",
  fontWeight: 600,
  fontSize: "14px",
  color: "#334155",
  marginBottom: "14px",
};

const buttonStyle = {
  padding: "9px 14px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "13px",
};

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await client.get("/admin/quizzes");
      const data = response.data;
      setQuizzes(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.quizzes)
            ? data.quizzes
            : []
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not load quizzes. Check your login and backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) =>
        index === questionIndex
          ? { ...question, [field]: value }
          : question
      ),
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setForm((previous) => ({
      ...previous,
      questions: previous.questions.map((question, index) => {
        if (index !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? value : option
          ),
        };
      }),
    }));
  };

  const addQuestion = () => {
    if (form.questions.length >= 100) {
      setError("A quiz can contain at most 100 questions.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      questions: [...previous.questions, makeQuestion()],
    }));
    setError("");
  };

  const removeQuestion = (questionIndex) => {
    if (form.questions.length === 1) {
      setError("A quiz must have at least one question.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      questions: previous.questions.filter(
        (_, index) => index !== questionIndex
      ),
    }));
    setError("");
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const editQuiz = (quiz) => {
    setEditingId(quiz._id);
    setForm({
      title: quiz.title || "",
      description: quiz.description || "",
      subject: quiz.subject || "",
      chapter: quiz.chapter || "",
      classNumber: String(quiz.classNumber ?? 5),
      board: quiz.board || "CBSE",
      published: Boolean(quiz.published),
      questions:
        Array.isArray(quiz.questions) && quiz.questions.length > 0
          ? quiz.questions.map((question) => ({
              question: question.question || "",
              options: [
                question.options?.[0] || "",
                question.options?.[1] || "",
                question.options?.[2] || "",
                question.options?.[3] || "",
              ],
              correct_index: String(question.correct_index ?? 0),
              explanation: question.explanation || "",
            }))
          : [makeQuestion()],
    });

    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveQuiz = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim() || !form.subject.trim()) {
      setError("Please enter both the quiz title and subject.");
      return;
    }

    if (
      form.questions.length < 1 ||
      form.questions.length > 100
    ) {
      setError("A quiz must contain between 1 and 100 questions.");
      return;
    }

    for (let index = 0; index < form.questions.length; index += 1) {
      const question = form.questions[index];

      if (!question.question.trim()) {
        setError(`Please enter the text for question ${index + 1}.`);
        return;
      }

      if (
        question.options.length !== 4 ||
        question.options.some((option) => !option.trim())
      ) {
        setError(`Question ${index + 1} must have four non-empty options.`);
        return;
      }
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
      chapter: form.chapter.trim(),
      classNumber: Number(form.classNumber),
      board: form.board,
      published: form.published,
      questions: form.questions.map((question) => ({
        question: question.question.trim(),
        options: question.options.map((option) => option.trim()),
        correct_index: Number(question.correct_index),
        explanation: question.explanation.trim(),
      })),
    };

    setSaving(true);

    try {
      if (editingId) {
        await client.put(`/admin/quizzes/${editingId}`, payload);
        setMessage("Quiz updated successfully.");
      } else {
        await client.post("/admin/quizzes", payload);
        setMessage("Quiz created successfully.");
      }

      setForm(emptyForm());
      setEditingId(null);
      await loadQuizzes();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not save the quiz. Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (quiz) => {
    setError("");
    setMessage("");

    try {
      await client.patch(`/admin/quizzes/${quiz._id}/publish`, {
        published: !quiz.published,
      });

      setMessage(
        quiz.published
          ? "Quiz unpublished. Students can no longer start it."
          : "Quiz published and available to students."
      );

      await loadQuizzes();
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not change the quiz status."
      );
    }
  };

  const deleteQuiz = async (quiz) => {
    const confirmed = window.confirm(
      `Delete "${quiz.title}"? This deletes the quiz itself, not existing student history.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await client.delete(`/admin/quizzes/${quiz._id}`);

      if (editingId === quiz._id) resetForm();

      setMessage("Quiz deleted.");
      await loadQuizzes();
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not delete the quiz."
      );
    }
  };

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px",
        color: "#172033",
      }}
    >
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "28px" }}>
          Quiz Management
        </h1>
        <p style={{ color: "#64748b", margin: 0, lineHeight: 1.6 }}>
          Create quizzes, manage questions, and publish quizzes for students.
          Only published quizzes appear in the student quiz list.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "#dcfce7",
            color: "#166534",
            marginBottom: "16px",
          }}
        >
          {message}
        </div>
      )}

      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "22px",
          marginBottom: "28px",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <h2 style={{ fontSize: "21px", marginTop: 0 }}>
          {editingId ? "Edit Quiz" : "Create a Quiz"}
        </h2>

        <form onSubmit={saveQuiz}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <label style={labelStyle}>
              Quiz Title *
              <input
                style={inputStyle}
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                maxLength={160}
                required
              />
            </label>

            <label style={labelStyle}>
              Subject *
              <input
                style={inputStyle}
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                maxLength={100}
                required
              />
            </label>

            <label style={labelStyle}>
              Chapter
              <input
                style={inputStyle}
                value={form.chapter}
                onChange={(event) => updateField("chapter", event.target.value)}
                maxLength={160}
              />
            </label>

            <label style={labelStyle}>
              Class
              <select
                style={inputStyle}
                value={form.classNumber}
                onChange={(event) =>
                  updateField("classNumber", event.target.value)
                }
              >
                {Array.from({ length: 8 }, (_, index) => index + 5).map(
                  (classNumber) => (
                    <option key={classNumber} value={String(classNumber)}>
                      Class {classNumber}
                    </option>
                  )
                )}
              </select>
            </label>

            <label style={labelStyle}>
              Board
              <select
                style={inputStyle}
                value={form.board}
                onChange={(event) => updateField("board", event.target.value)}
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State">State</option>
              </select>
            </label>
          </div>

          <label style={labelStyle}>
            Description
            <textarea
              style={{ ...inputStyle, minHeight: "75px", resize: "vertical" }}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              maxLength={1000}
            />
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              margin: "22px 0 14px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "18px" }}>
              Questions ({form.questions.length}/100)
            </h3>
            <button
              type="button"
              style={{ ...buttonStyle, background: "#e0e7ff", color: "#3730a3" }}
              onClick={addQuestion}
              disabled={form.questions.length >= 100}
            >
              + Add Question
            </button>
          </div>

          {form.questions.map((question, questionIndex) => (
            <article
              key={questionIndex}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <h4 style={{ margin: "0 0 12px" }}>
                  Question {questionIndex + 1}
                </h4>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: "#fee2e2",
                    color: "#991b1b",
                    marginBottom: "10px",
                  }}
                  onClick={() => removeQuestion(questionIndex)}
                >
                  Remove
                </button>
              </div>

              <label style={labelStyle}>
                Question Text *
                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: "70px",
                    resize: "vertical",
                  }}
                  value={question.question}
                  onChange={(event) =>
                    updateQuestion(questionIndex, "question", event.target.value)
                  }
                  maxLength={2000}
                  required
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                }}
              >
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} style={labelStyle}>
                    Option {optionIndex + 1} *
                    <input
                      style={inputStyle}
                      value={option}
                      onChange={(event) =>
                        updateOption(
                          questionIndex,
                          optionIndex,
                          event.target.value
                        )
                      }
                      maxLength={500}
                      required
                    />
                  </label>
                ))}
              </div>

              <label style={labelStyle}>
                Correct Answer *
                <select
                  style={inputStyle}
                  value={question.correct_index}
                  onChange={(event) =>
                    updateQuestion(
                      questionIndex,
                      "correct_index",
                      event.target.value
                    )
                  }
                >
                  {question.options.map((option, optionIndex) => (
                    <option key={optionIndex} value={String(optionIndex)}>
                      {`Option ${optionIndex + 1}${
                        option.trim() ? ` â€” ${option.trim()}` : ""
                      }`}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Explanation (shown after submission)
                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: "60px",
                    resize: "vertical",
                  }}
                  value={question.explanation}
                  onChange={(event) =>
                    updateQuestion(
                      questionIndex,
                      "explanation",
                      event.target.value
                    )
                  }
                  maxLength={5000}
                />
              </label>
            </article>
          ))}

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <button
              type="submit"
              disabled={saving}

              style={{
                ...buttonStyle,
                background: "#2563eb",
                color: "#fff",
                padding: "11px 18px",
                opacity: saving ? 0.65 : 1,
              }}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Create Quiz"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{ ...buttonStyle, background: "#e2e8f0", color: "#334155" }}
            >
              {editingId ? "Cancel Edit" : "Clear Form"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: "22px" }}>Existing Quizzes</h2>
        {loading ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            No quizzes found yet. Create your first quiz above.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {quizzes.map((quiz) => (
              <article
                key={quiz._id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 260px" }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>
                      {quiz.title}
                    </h3>
                    <p style={{ margin: "0 0 8px", color: "#475569" }}>
                      {quiz.subject}
                      {quiz.chapter ? ` · ${quiz.chapter}` : ""}
                      {" · "}Class {quiz.classNumber}
                      {" · "}{quiz.board || "CBSE"}
                    </p>
                    <p style={{ margin: "0 0 8px", color: "#64748b" }}>
                      {quiz.questions?.length || 0} question(s)
                    </p>
                    {quiz.description && <p>{quiz.description}</p>}
                  </div>
                  <span
                    style={{
                      background: quiz.published ? "#dcfce7" : "#fef3c7",
                      color: quiz.published ? "#166534" : "#92400e",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {quiz.published ? "Published" : "Draft"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginTop: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => editQuiz(quiz)}
                    style={{ ...buttonStyle, background: "#e0e7ff", color: "#3730a3" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublished(quiz)}
                    style={{
                      ...buttonStyle,
                      background: quiz.published ? "#fef3c7" : "#dcfce7",
                      color: quiz.published ? "#92400e" : "#166534",
                    }}
                  >
                    {quiz.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuiz(quiz)}
                    style={{ ...buttonStyle, background: "#fee2e2", color: "#991b1b" }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
