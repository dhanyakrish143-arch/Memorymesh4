import { useCallback, useEffect, useState } from "react";
import client from "../api/client";

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

  const updateCard = (index, field, value) => {
    setForm((current) => ({
      ...current,
      cards: current.cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      ),
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setNotice("");
  };

  const editSet = (set) => {
    setEditingId(set._id);
    setForm({
      title: set.title || "",
      description: set.description || "",
      subject: set.subject || "",
      chapter: set.chapter || "",
      classNumber: String(set.classNumber || 5),
      board: set.board || "CBSE",
      cards: set.cards?.length
        ? set.cards.map(({ question, answer }) => ({ question, answer }))
        : [{ question: "", answer: "" }],
      published: Boolean(set.published),
    });
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSet = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const validCards = form.cards.filter(
      (card) => card.question.trim() && card.answer.trim()
    );

    if (!form.title.trim() || !form.subject.trim()) {
      setError("Enter a title and subject.");
      return;
    }

    if (validCards.length === 0) {
      setError("Add at least one complete question and answer.");
      return;
    }

    if (validCards.length > 200) {
      setError("A set can contain at most 200 cards.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        classNumber: Number(form.classNumber),
        title: form.title.trim(),
        subject: form.subject.trim(),
        cards: validCards,
      };

      if (editingId) {
        await client.put(`/admin/flashcard-sets/${editingId}`, payload);
        setNotice("Flashcard set updated.");
      } else {
        await client.post("/admin/flashcard-sets", payload);
        setNotice("Flashcard set created.");
      }

      setForm(emptyForm);
      setEditingId(null);
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

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dce3ed",
    borderRadius: 9,
    padding: "11px 12px",
    font: "inherit",
    background: "#fff",
    color: "#1c2940",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 650,
    marginBottom: 6,
    color: "#34435a",
  };

  return (
    <main style={{ padding: "28px clamp(16px, 3vw, 36px)", color: "#1c2940", maxWidth: 1200, margin: "0 auto" }}>
      <p style={{ color: "#688c42", fontSize: 11, letterSpacing: 1.5, fontWeight: 800 }}>CONTENT MANAGEMENT</p>
      <h1 style={{ margin: "8px 0" }}>Shared flashcards</h1>
      <p style={{ color: "#77849a", marginTop: 0 }}>
        Create curriculum-based revision sets for students in Classes 5–10.
        Only published sets are available to matching students.
      </p>

      {error && <div role="alert" style={{ background: "#fff0f0", color: "#9f2525", padding: 12, borderRadius: 9, margin: "16px 0" }}>{error}</div>}
      {notice && <div role="status" style={{ background: "#eef7e8", color: "#386322", padding: 12, borderRadius: 9, margin: "16px 0" }}>{notice}</div>}

      <section style={{ background: "#fff", border: "1px solid #e3e9f1", borderRadius: 16, padding: "22px clamp(14px, 3vw, 26px)", marginTop: 22 }}>
        <h2 style={{ fontSize: 20, marginTop: 0 }}>{editingId ? "Edit flashcard set" : "Create a flashcard set"}</h2>
        <form onSubmit={saveSet}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
            <label>
              <span style={labelStyle}>Set title *</span>
              <input style={inputStyle} value={form.title} maxLength={160} required onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Fractions revision" />
            </label>
            <label>
              <span style={labelStyle}>Subject *</span>
              <input style={inputStyle} value={form.subject} maxLength={100} required onChange={(e) => updateField("subject", e.target.value)} placeholder="e.g. Mathematics" />
            </label>
            <label>
              <span style={labelStyle}>Class *</span>
              <select style={inputStyle} value={form.classNumber} onChange={(e) => updateField("classNumber", e.target.value)}>
                {[5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>Class {n}</option>)}
              </select>
            </label>
            <label>
              <span style={labelStyle}>Curriculum / board *</span>
              <select style={inputStyle} value={form.board} onChange={(e) => updateField("board", e.target.value)}>
                {boards.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </label>
            <label>
              <span style={labelStyle}>Chapter</span>
              <input style={inputStyle} value={form.chapter} maxLength={160} onChange={(e) => updateField("chapter", e.target.value)} placeholder="Chapter name or number" />
            </label>
          </div>

          <label style={{ display: "block", marginTop: 16 }}>
            <span style={labelStyle}>Description</span>
            <textarea style={{ ...inputStyle, minHeight: 75, resize: "vertical" }} value={form.description} maxLength={1000} onChange={(e) => updateField("description", e.target.value)} placeholder="What will students revise in this set?" />
          </label>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <h3 style={{ margin: 0, fontSize: 17 }}>Questions and answers</h3>
            <button type="button" disabled={form.cards.length >= 200} onClick={() => updateField("cards", [...form.cards, { question: "", answer: "" }])} style={{ border: "1px solid #cdd9e7", background: "#fff", padding: "9px 13px", borderRadius: 9, cursor: "pointer" }}>+ Add card</button>
          </div>

          {form.cards.map((card, index) => (
            <div key={index} style={{ background: "#f7f9fc", border: "1px solid #e5eaf1", borderRadius: 12, padding: 14, marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <strong style={{ fontSize: 13 }}>Card {index + 1}</strong>
                {form.cards.length > 1 && <button type="button" onClick={() => updateField("cards", form.cards.filter((_, i) => i !== index))} style={{ border: 0, background: "transparent", color: "#a53636", cursor: "pointer" }}>Remove</button>}
              </div>
              <label style={{ display: "block", marginTop: 12 }}>
                <span style={labelStyle}>Question *</span>
                <textarea style={{ ...inputStyle, minHeight: 65, resize: "vertical" }} value={card.question} maxLength={2000} onChange={(e) => updateCard(index, "question", e.target.value)} placeholder="Enter the question" />
              </label>
              <label style={{ display: "block", marginTop: 12 }}>
                <span style={labelStyle}>Answer *</span>
                <textarea style={{ ...inputStyle, minHeight: 75, resize: "vertical" }} value={card.answer} maxLength={5000} onChange={(e) => updateCard(index, "answer", e.target.value)} placeholder="Enter the answer" />
              </label>
            </div>
          ))}

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, fontSize: 14 }}>
            <input type="checkbox" checked={form.published} onChange={(e) => updateField("published", e.target.checked)} />
            Publish immediately after saving
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            <button type="submit" disabled={saving} style={{ border: 0, background: "#4f762e", color: "#fff", borderRadius: 9, padding: "11px 18px", fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Create set"}
            </button>
            {editingId && <button type="button" onClick={resetForm} style={{ border: "1px solid #d5deea", background: "#fff", borderRadius: 9, padding: "11px 16px", cursor: "pointer" }}>Cancel editing</button>}
          </div>
        </form>
      </section>

      <section style={{ marginTop: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 21 }}>All shared sets</h2>
          <button type="button" onClick={loadSets} style={{ border: "1px solid #d5deea", background: "#fff", borderRadius: 9, padding: "9px 13px", cursor: "pointer" }}>Refresh</button>
        </div>

        {loading ? <p>Loading flashcard sets...</p> : sets.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e3e9f1", borderRadius: 14, padding: 24, color: "#77849a" }}>No shared sets yet. Create your first set above.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {sets.map((set) => (
              <article key={set._id} style={{ background: "#fff", border: "1px solid #e3e9f1", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: set.published ? "#386322" : "#69778c", background: set.published ? "#eef7e8" : "#eef1f5", borderRadius: 7, padding: "6px 8px" }}>{set.published ? "PUBLISHED" : "DRAFT"}</span>
                  <span style={{ color: "#77849a", fontSize: 12 }}>{set.cards?.length || 0} cards</span>
                </div>
                <h3 style={{ marginBottom: 6 }}>{set.title}</h3>
                <p style={{ margin: "0 0 6px", color: "#58677e", fontSize: 13 }}>{set.subject}{set.chapter ? ` · ${set.chapter}` : ""}</p>
                <p style={{ margin: "0 0 16px", color: "#77849a", fontSize: 12 }}>Class {set.classNumber} · {boards.find((b) => b.value === set.board)?.label || set.board}</p>
                {set.description && <p style={{ fontSize: 13, lineHeight: 1.5 }}>{set.description}</p>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                  <button type="button" onClick={() => editSet(set)} style={{ border: "1px solid #d5deea", background: "#fff", borderRadius: 8, padding: "8px 11px", cursor: "pointer" }}>Edit</button>
                  <button type="button" onClick={() => togglePublished(set)} style={{ border: 0, background: set.published ? "#fff0e6" : "#edf6e3", color: set.published ? "#925022" : "#386322", borderRadius: 8, padding: "8px 11px", cursor: "pointer" }}>{set.published ? "Unpublish" : "Publish"}</button>
                  <button type="button" onClick={() => deleteSet(set)} style={{ border: "1px solid #f0d6d6", background: "#fff", color: "#a53636", borderRadius: 8, padding: "8px 11px", cursor: "pointer" }}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
