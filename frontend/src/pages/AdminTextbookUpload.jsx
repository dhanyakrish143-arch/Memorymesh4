import React, { useEffect, useState } from "react";
import client from "../api/client";
import "./AdminTextbookUpload.css";

const CORE_SUBJECTS = ["Science", "Mathematics", "Social Science", "English", "Kannada", "Hindi"];
const CLASSES = [5, 6, 7, 8, 9, 10];

export default function AdminTextbookUpload() {
  const [form, setForm] = useState({
    title: "",
    classNumber: "10",
    board: "State",
    subject: "Science",
    language: "English",
    chapter: "",
    chapterNumber: "1",
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [publishedBooks, setPublishedBooks] = useState([]);
  const [filterClass, setFilterClass] = useState("all");

  const loadPublishedBooks = async () => {
    try {
      const res = await client.get("/textbooks?board=State");
      if (Array.isArray(res.data?.textbooks)) {
        setPublishedBooks(res.data.textbooks);
      }
    } catch {
      // Keep UI active
    }
  };

  useEffect(() => {
    loadPublishedBooks();
  }, []);

  function update(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("pdf", file);

    setBusy(true);
    try {
      const response = await client.post("/admin/textbooks/upload", data);
      setMessage(response.data?.message || "State NCERT textbook published successfully!");
      setFile(null);
      setForm((prev) => ({ ...prev, chapter: "", chapterNumber: String(Number(prev.chapterNumber) + 1) }));
      await loadPublishedBooks();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish textbook.");
    } finally {
      setBusy(false);
    }
  }

  async function handleQuickSeed() {
    setMessage("");
    setError("");
    setBusy(true);
    try {
      const res = await client.post("/admin/textbooks/seed-state-ncert");
      setMessage(res.data?.message || "Successfully refreshed State NCERT curriculum!");
      await loadPublishedBooks();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to seed books.");
    } finally {
      setBusy(false);
    }
  }

  const openBookPdf = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filteredCatalog = publishedBooks.filter((book) => {
    if (filterClass === "all") return true;
    return String(book.classNumber) === String(filterClass);
  });

  return (
    <div style={{ maxWidth: "1120px", margin: "32px auto", padding: "0 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            CURRICULUM MANAGEMENT
          </span>
          <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a", margin: "4px 0" }}>
            Publish State NCERT Textbooks
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Upload syllabus chapters or preview live textbooks for Classes 5 through 10.
          </p>
        </div>

        <button
          type="button"
          onClick={handleQuickSeed}
          disabled={busy}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #fed7aa",
            background: "#fff7ed",
            color: "#c2410c",
            fontWeight: "800",
            fontSize: "13px",
            cursor: busy ? "not-allowed" : "pointer"
          }}
        >
          ⚡ Reload State NCERT Books (5–10)
        </button>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", color: "#065f46", marginBottom: "16px", fontSize: "13px", fontWeight: "700" }}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecdd3", borderRadius: "8px", color: "#b91c1c", marginBottom: "16px", fontSize: "13px", fontWeight: "700" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Manual Upload Section */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)", marginBottom: "36px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px" }}>
          📤 Upload & Distribute New Chapter PDF
        </h2>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                GRADE / CLASS
              </label>
              <select
                name="classNumber"
                value={form.classNumber}
                onChange={update}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                CURRICULUM BOARD
              </label>
              <input
                type="text"
                name="board"
                value="State (NCERT Syllabus)"
                disabled
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: "14px", fontWeight: "700" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                CORE SUBJECT
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={update}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              >
                {CORE_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                MEDIUM / LANGUAGE
              </label>
              <select
                name="language"
                value={form.language}
                onChange={update}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              >
                <option value="English">English</option>
                <option value="Kannada">Kannada</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
              TEXTBOOK TITLE
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g., State NCERT Science Class 10"
              value={form.title}
              onChange={update}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                CHAPTER NO.
              </label>
              <input
                type="number"
                name="chapterNumber"
                min="1"
                value={form.chapterNumber}
                onChange={update}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                CHAPTER NAME
              </label>
              <input
                type="text"
                name="chapter"
                placeholder="e.g., Electricity"
                value={form.chapter}
                onChange={update}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
              ATTACH CHAPTER PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              style={{ width: "100%", padding: "8px", border: "1px dashed #94a3b8", borderRadius: "8px", background: "#f8fafc" }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "800",
              cursor: busy ? "not-allowed" : "pointer",
              marginTop: "10px"
            }}
          >
            {busy ? "Publishing to Students..." : "Publish Chapter to Students"}
          </button>
        </form>
      </div>

      {/* Published Curriculum Table with Direct Open Link */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              📚 Published State NCERT Textbooks
            </h2>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "2px 0 0" }}>
              Live textbooks actively available to enrolled students.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Filter:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
            >
              <option value="all">All Classes (5–10)</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredCatalog.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            No published textbooks found. Click "Reload State NCERT Books (5–10)" above.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "10px" }}>Class</th>
                  <th style={{ padding: "10px" }}>Subject</th>
                  <th style={{ padding: "10px" }}>Title</th>
                  <th style={{ padding: "10px" }}>Chapters</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCatalog.map((book, idx) => {
                  const url = book.chapters?.[0]?.sourceUrl || book.sourceUrl;
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px", fontWeight: "800", color: "#0f172a" }}>
                        Class {book.classNumber}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ background: "#ecfdf5", color: "#059669", padding: "3px 8px", borderRadius: "6px", fontWeight: "700", fontSize: "11.5px" }}>
                          {book.subject}
                        </span>
                      </td>
                      <td style={{ padding: "10px", fontWeight: "700", color: "#1e293b" }}>
                        {book.title}
                      </td>
                      <td style={{ padding: "10px", color: "#64748b" }}>
                        {Array.isArray(book.chapters) ? `${book.chapters.length} chapter(s)` : "1 chapter"}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "800" }}>
                          ✓ Published
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => openBookPdf(url)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#0284c7",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Open PDF ↗
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
