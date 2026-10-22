import { useCallback, useEffect, useState } from "react";
import client from "../api/client";
import "./AdminNotes.css";

const emptyForm = {
  subject: "",
  chapter: "",
  class: "10",
  board: "NCERT",
  content: "",
  tags: "",
};

export default function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [boardFilter, setBoardFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await client.get("/admin/notes", {
        params: {
          search: search.trim() || undefined,
          class: classFilter || undefined,
          board: boardFilter || undefined,
        },
      });
      setNotes(response.data.notes || []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load shared notes.");
    } finally {
      setLoading(false);
    }
  }, [search, classFilter, boardFilter, reloadKey]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(note) {
    setEditingId(note._id);
    setForm({
      subject: note.subject || "",
      chapter: note.chapter || "",
      class: note.class == null ? "" : String(note.class),
      board: note.board || "NCERT",
      content: note.content || "",
      tags: (note.tags || []).join(", "),
    });
    setMessage("");
    setError("");
    document.getElementById("admin-note-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      class: form.class,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await client.put(`/admin/notes/${editingId}`, payload);
        setMessage("Shared note updated.");
      } else {
        await client.post("/admin/notes", payload);
        setMessage("Shared note created.");
      }
      resetForm();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the note.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(note) {
    const confirmed = window.confirm(
      `Delete the shared note "${note.subject} — ${note.chapter}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    setMessage("");
    try {
      await client.delete(`/admin/notes/${note._id}`);
      setMessage("Shared note deleted.");
      if (editingId === note._id) resetForm();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete the note.");
    }
  }

  return (
    <main className="admin-notes-page">
      <div className="admin-notes-kicker">ADMINISTRATION / LEARNING CONTENT</div>
      <div className="admin-notes-heading">
        <div>
          <h1>Notes Management</h1>
          <p>Create and maintain study notes shared with students.</p>
        </div>
        <span className="admin-notes-count">{notes.length} shown</span>
      </div>

      {error && <div className="admin-notes-alert error" role="alert">{error}</div>}
      {message && <div className="admin-notes-alert success" role="status">{message}</div>}

      <section className="admin-notes-panel" id="admin-note-form">
        <h2>{editingId ? "Edit shared note" : "Create a shared note"}</h2>
        <p className="admin-notes-help">
          These notes are shared learning resources. Student-owned notes are not managed here.
        </p>

        <form onSubmit={submitForm} className="admin-notes-form">
          <label>
            Subject *
            <input name="subject" value={form.subject} onChange={updateForm} required maxLength={120} />
          </label>
          <label>
            Chapter *
            <input name="chapter" value={form.chapter} onChange={updateForm} required maxLength={180} />
          </label>
          <label>
            Class
            <select name="class" value={form.class} onChange={updateForm}>
              <option value="">All classes / unspecified</option>
              {[5, 6, 7, 8, 9, 10, 11, 12].map((value) => (
                <option key={value} value={value}>Class {value}</option>
              ))}
            </select>
          </label>
          <label>
            Board
            <input name="board" value={form.board} onChange={updateForm} required maxLength={80} />
          </label>
          <label className="admin-notes-wide">
            Note content *
            <textarea
              name="content"
              value={form.content}
              onChange={updateForm}
              required
              rows={8}
              maxLength={100000}
              placeholder="Enter the study note content..."
            />
          </label>
          <label className="admin-notes-wide">
            Tags <span className="admin-notes-muted">(comma-separated)</span>
            <input name="tags" value={form.tags} onChange={updateForm} placeholder="e.g. revision, definitions, exam" />
          </label>
          <div className="admin-notes-form-actions admin-notes-wide">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Create shared note"}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-notes-panel">
        <div className="admin-notes-list-heading">
          <div>
            <h2>Shared notes</h2>
            <p>Search by subject, chapter, content, board, or tag.</p>
          </div>
          <button type="button" className="secondary" onClick={() => setReloadKey((key) => key + 1)}>
            Refresh
          </button>
        </div>

        <div className="admin-notes-filters">
          <label>
            Search
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes..." />
          </label>
          <label>
            Class
            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
              <option value="">All classes</option>
              {[5, 6, 7, 8, 9, 10, 11, 12].map((value) => (
                <option key={value} value={value}>Class {value}</option>
              ))}
            </select>
          </label>
          <label>
            Board
            <select value={boardFilter} onChange={(event) => setBoardFilter(event.target.value)}>
              <option value="">All boards</option>
              <option value="NCERT">NCERT</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="admin-notes-empty">Loading shared notes...</p>
        ) : notes.length === 0 ? (
          <p className="admin-notes-empty">No shared notes match these filters.</p>
        ) : (
          <div className="admin-notes-list">
            {notes.map((note) => (
              <article className="admin-note-card" key={note._id}>
                <div className="admin-note-card-main">
                  <div className="admin-note-meta">
                    <span>{note.class ? `Class ${note.class}` : "All classes"}</span>
                    <span>{note.board || "NCERT"}</span>
                    <span>Shared</span>
                  </div>
                  <h3>{note.subject} — {note.chapter}</h3>
                  <p className="admin-note-preview">
                    {note.content.length > 260 ? `${note.content.slice(0, 260)}…` : note.content}
                  </p>
                  {!!note.tags?.length && (
                    <div className="admin-note-tags">
                      {note.tags.map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}
                    </div>
                  )}
                  <p className="admin-note-updated">
                    Updated {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div className="admin-note-actions">
                  <button type="button" className="secondary" onClick={() => startEdit(note)}>Edit</button>
                  <button type="button" className="danger" onClick={() => deleteNote(note)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
