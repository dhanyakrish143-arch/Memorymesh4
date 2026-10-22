import React, { useEffect, useState } from "react";
import client from "../api/client";
import "./AdminTextbookUpload.css";

const CLASSES = [5, 6, 7, 8, 9, 10];
const SUBJECTS = ["English", "Mathematics", "Science", "Social Science", "Hindi", "Kannada"];

export default function AdminTextbookUpload() {
  const [selectedClass, setSelectedClass] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState("English");
  const [medium, setMedium] = useState("English");
  const [textbookTitle, setTextbookTitle] = useState("");
  const [chapterNo, setChapterNo] = useState(1);
  const [chapterName, setChapterName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [filterClass, setFilterClass] = useState("all");
  const [publishedBooks, setPublishedBooks] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = (client.defaults.baseURL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

  const loadBooks = async () => {
    try {
      const url = filterClass === "all" ? "/textbooks" : `/textbooks?class=${filterClass}`;
      const res = await client.get(url);
      if (res.data?.success && Array.isArray(res.data.textbooks)) {
        setPublishedBooks(res.data.textbooks);
      }
    } catch (err) {
      console.error("Failed to load textbooks:", err);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [filterClass]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Please select a PDF file to attach.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", textbookTitle.trim() || `${selectedSubject} Class ${selectedClass}`);
      formData.append("subject", selectedSubject);
      formData.append("class", selectedClass);
      formData.append("classNum", selectedClass);
      formData.append("chapterNumber", chapterNo);
      formData.append("chapterName", chapterName.trim() || `Chapter ${chapterNo}`);
      formData.append("board", "State (NCERT Syllabus)");
      formData.append("medium", medium);
      formData.append("pdfFile", pdfFile);

      const res = await client.post("/textbooks/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        setStatusMessage(`Successfully published ${selectedSubject} - Chapter ${chapterNo} for Class ${selectedClass}!`);
        setPdfFile(null);
        setChapterName("");
        setTextbookTitle("");
        const fileInput = document.getElementById("adminPdfPicker");
        if (fileInput) fileInput.value = "";
        loadBooks();
      }
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title, chNum) => {
    const confirmed = window.confirm(`Delete Chapter ${chNum} (${title})?`);
    if (!confirmed) return;

    try {
      const res = await client.delete(`/textbooks/${id}`);
      if (res.data?.success) {
        setStatusMessage("Textbook chapter deleted successfully.");
        loadBooks();
      }
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const getFullPdfUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url.startsWith("/") ? url : "/" + url}`;
  };

  return (
    <div style={{ padding: "28px 40px 60px", maxWidth: "1250px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            CURRICULUM MANAGEMENT
          </span>
          <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a", margin: "4px 0" }}>
            Publish State NCERT Textbooks
          </h1>
          <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0 }}>
            Upload syllabus chapters or preview live textbooks for Classes 5 through 10.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div style={{ background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "700", fontSize: "13.5px" }}>
          ✓ {statusMessage}
        </div>
      )}

      {/* Upload Form Card */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", marginBottom: "32px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          📤 Upload & Distribute New Chapter PDF
        </h2>

        <form onSubmit={handlePublish} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>GRADE / CLASS</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}>
              {CLASSES.map((c) => (<option key={c} value={c}>Class {c}</option>))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>CURRICULUM BOARD</label>
            <input type="text" value="State (NCERT Syllabus)" disabled style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: "600" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>CORE SUBJECT</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}>
              {SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>MEDIUM / LANGUAGE</label>
            <select value={medium} onChange={(e) => setMedium(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}>
              <option value="English">English</option>
              <option value="Kannada">Kannada</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>TEXTBOOK TITLE</label>
            <input type="text" value={textbookTitle} onChange={(e) => setTextbookTitle(e.target.value)} placeholder="e.g., Marigold Class 5" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>CHAPTER NO.</label>
            <input type="number" min="1" max="30" value={chapterNo} onChange={(e) => setChapterNo(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>CHAPTER NAME</label>
            <input type="text" value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="e.g., Ice-Cream Man" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }} />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>ATTACH CHAPTER PDF</label>
            <input id="adminPdfPicker" type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} style={{ width: "100%", padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "#f8fafc" }} />
          </div>

          <div style={{ gridColumn: "span 2", marginTop: "8px" }}>
            <button type="submit" disabled={isSubmitting} style={{ width: "100%", background: "#0f172a", color: "#ffffff", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "800", fontSize: "13.5px", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
              {isSubmitting ? "Uploading & Publishing..." : "Publish Chapter to Students"}
            </button>
          </div>
        </form>
      </div>

      {/* Published Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              📚 Published State NCERT Textbooks
            </h3>
            <p style={{ color: "#64748b", fontSize: "12.5px", margin: "2px 0 0" }}>
              Live textbooks actively available to enrolled students.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "700" }}>Filter:</span>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", fontWeight: "700" }}>
              <option value="all">All Classes (5–10)</option>
              {CLASSES.map((c) => (<option key={c} value={c}>Class {c}</option>))}
            </select>
          </div>
        </div>

        {publishedBooks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px", color: "#94a3b8", fontSize: "13.5px" }}>
            No textbooks currently published. Upload a chapter PDF using the form above.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px" }}>Class</th>
                <th style={{ padding: "12px" }}>Subject</th>
                <th style={{ padding: "12px" }}>Title</th>
                <th style={{ padding: "12px" }}>Chapters</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {publishedBooks.map((book) => (
                <tr key={book._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: "800", color: "#0f172a" }}>Class {book.class}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ background: "#ecfdf5", color: "#059669", fontWeight: "800", fontSize: "11px", padding: "3px 8px", borderRadius: "6px" }}>
                      {book.subject}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontWeight: "700", color: "#0f172a" }}>
                    {book.title} {book.chapterName ? `- ${book.chapterName}` : ""}
                  </td>
                  <td style={{ padding: "12px", color: "#475569" }}>Chapter {book.chapterNumber || 1}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ color: "#059669", fontWeight: "800", fontSize: "12px" }}>
                      ✓ Published
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                      <a href={getFullPdfUrl(book.sourceUrl)} target="_blank" rel="noreferrer" style={{ color: "#0284c7", fontWeight: "700", textDecoration: "none", fontSize: "12.5px" }}>
                        Open PDF ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(book._id, book.title, book.chapterNumber || 1)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontWeight: "800",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
