import { useCallback, useEffect, useState } from "react";
import client from "../api/client";
import "./AdminFlashcards.css";

const emptyForm = {
  title: "",
  description: "",
  subject: "",
  chapter: "",
  classNumber: "5",
  board: "CBSE",
  cards: [{ question: "", answer: "" }],
  published: false,
};

const boards = [
  { value: "CBSE", label: "NCERT / CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "State", label: "State board" },
];

export default function AdminFlashcards() {
  const [sets, setSets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/admin/flashcard-sets");
      setSets(Array.isArray(data.sets) ? data.sets : []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load flashcard sets. Check your admin login and backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateCard = (index, key, value) => {
    setForm((current) => {
      const nextCards = current.cards.map((card, i) =>
        i === index ? { ...card, [key]: value } : card
      );
      return { ...current, cards: nextCards };
    });
  };

  const addCard = () => {
    setForm((current) => ({
      ...current,
      cards: [...current.cards, { question: "", answer: "" }],
    }));
  };

  const removeCard = (index) => {
    if (form.cards.length <= 1) return;
    setForm((current) => ({
      ...current,
      cards: current.cards.filter((_, i) => i !== index),
    }));
  };

  const startEdit = (set) => {
    setEditingId(set._id);
    setForm({
      title: set.title || "",
      description: set.description || "",
      subject: set.subject || "",
      chapter: set.chapter || "",
      classNumber: String(set.classNumber || "5"),
      board: set.board || "CBSE",
      cards: Array.isArray(set.cards) && set.cards.length ? set.cards : [{ question: "", answer: "" }],
      published: Boolean(set.published),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveSet = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      classNumber: Number(form.classNumber),
      cards: form.cards.filter((c) => c.question.trim() && c.answer.trim()),
    };

    if (!payload.cards.length) {
      setError("Please add at least one valid question and answer.");
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await client.put(`/admin/flashcard-sets/${editingId}`, payload);
        setNotice("Flashcard set updated.");
      } else {
        await client.post("/admin/flashcard-sets", payload);
        setNotice("Flashcard set created.");
      }
      resetForm();
      await loadSets();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save this set.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (set) => {
    setError("");
    setNotice("");
    try {
      await client.patch(`/admin/flashcard-sets/${set._id}/publish`, {
        published: !set.published,
      });
      setNotice(set.published ? "Set unpublished." : "Set published for matching students.");
      await loadSets();
    } catch (err) {
      setError(err.response?.data?.error || "Could not change publishing status.");
    }
  };

  const deleteSet = async (set) => {
    if (!window.confirm(`Delete "${set.title}"? This cannot be undone.`)) return;

    setError("");
    setNotice("");
    try {
      await client.delete(`/admin/flashcard-sets/${set._id}`);
      if (editingId === set._id) resetForm();
      setNotice("Flashcard set deleted.");
      await loadSets();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete this set.");
    }
  };

  return (
    <main className="admin-flashcards-page">
      <div className="admin-flashcards-header">
        <p className="admin-flashcards-kicker">CONTENT MANAGEMENT</p>
        <h1>Shared flashcards</h1>
        <p className="admin-flashcards-subtitle">
          Create curriculum-based revision sets for students in Classes 5–10. Only published sets are available to matching students.
        </p>
      </div>

      {error && <div role="alert" className="admin-flashcards-alert error">{error}</div>}
      {notice && <div role="status" className="admin-flashcards-alert notice">{notice}</div>}

      <section className="admin-flashcards-card">
        <h2>{editingId ? "Edit flashcard set" : "Create a flashcard set"}</h2>
        <form onSubmit={saveSet}>
          <div className="admin-flashcards-grid">
            <label className="admin-flashcards-field">
              <span>Set title *</span>
              <input
                value={form.title}
                maxLength={160}
                required
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Fractions revision"
              />
            </label>

            <label className="admin-flashcards-field">
              <span>Subject *</span>
              <input
                value={form.subject}
                maxLength={100}
                required
                onChange={(e) => updateField("subject", e.target.value)}
                placeholder="e.g. Mathematics"
              />
            </label>

            <label className="admin-flashcards-field">
              <span>Class *</span>
              <select
                value={form.classNumber}
                onChange={(e) => updateField("classNumber", e.target.value)}
              >
                {[5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>Class {n}</option>
                ))}
              </select>
            </label>

            <label className="admin-flashcards-field">
              <span>Curriculum / board *</span>
              <select
                value={form.board}
                onChange={(e) => updateField("board", e.target.value)}
              >
                {boards.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-flashcards-field admin-flashcards-full">
            <span>Chapter</span>
            <input
              value={form.chapter}
              maxLength={120}
              onChange={(e) => updateField("chapter", e.target.value)}
              placeholder="Chapter name or number"
            />
          </div>

          <div className="admin-flashcards-field admin-flashcards-full">
            <span>Description</span>
            <textarea
              value={form.description}
              maxLength={400}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="What will students revise in this set?"
            />
          </div>

          <div className="admin-flashcards-qa-header">
            <h3>Questions and answers</h3>
            <button
              type="button"
              className="admin-flashcards-btn-add"
              onClick={addCard}
            >
              + Add card
            </button>
          </div>

          {form.cards.map((card, index) => (
            <div key={index} className="admin-flashcards-item-box">
              <div className="admin-flashcards-item-top">
                <strong>Card {index + 1}</strong>
                {form.cards.length > 1 && (
                  <button
                    type="button"
                    className="admin-flashcards-item-remove"
                    onClick={() => removeCard(index)}
                  >
                    Remove card
                  </button>
                )}
              </div>
              <textarea
                placeholder="Enter the question"
                value={card.question}
                onChange={(e) => updateCard(index, "question", e.target.value)}
              />
              <textarea
                placeholder="Enter the answer"
                value={card.answer}
                onChange={(e) => updateCard(index, "answer", e.target.value)}
              />
            </div>
          ))}

          <label className="admin-flashcards-publish">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
            />
            <span>Publish immediately after saving</span>
          </label>

          <div className="admin-flashcards-actions">
            <button
              type="submit"
              disabled={saving}
              className="admin-flashcards-btn-primary"
            >
              {saving ? "Saving..." : editingId ? "Update set" : "Create set"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="admin-flashcards-btn-cancel"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="admin-flashcards-list-header">
          <h2>All shared sets</h2>
          <button
            type="button"
            className="admin-flashcards-btn-refresh"
            onClick={loadSets}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading sets...</p>
        ) : sets.length === 0 ? (
          <p style={{ color: "#64748b" }}>No shared flashcard sets yet.</p>
        ) : (
          <div className="admin-flashcards-cards-grid">
            {sets.map((set) => (
              <div key={set._id} className="admin-flashcards-set-card">
                <div>
                  <div className="admin-flashcards-badge-row">
                    <span className={`admin-flashcards-badge ${set.published ? "pub" : "draft"}`}>
                      {set.published ? "PUBLISHED" : "DRAFT"}
                    </span>
                    <span className="admin-flashcards-count-label">
                      {set.cards?.length || 0} cards
                    </span>
                  </div>
                  <h3>{set.title}</h3>
                  <div className="admin-flashcards-meta">
                    {set.subject}{set.chapter ? ` · ${set.chapter}` : ""}<br />
                    Class {set.classNumber} · {set.board}
                  </div>
                  <p className="admin-flashcards-desc">
                    {set.description || "No description provided."}
                  </p>
                </div>

                <div className="admin-flashcards-card-actions">
                  <button
                    type="button"
                    className="admin-flashcards-btn-edit"
                    onClick={() => startEdit(set)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={set.published ? "admin-flashcards-btn-unpub" : "admin-flashcards-btn-pub"}
                    onClick={() => togglePublished(set)}
                  >
                    {set.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    className="admin-flashcards-btn-del"
                    onClick={() => deleteSet(set)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
