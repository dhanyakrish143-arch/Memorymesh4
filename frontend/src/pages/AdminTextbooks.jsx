import React, { useEffect, useState } from "react";
import client from "../api/client";
import "./AdminTextbooks.css";

const CLASSES = [5, 6, 7, 8, 9, 10];
const SUBJECTS = ["English", "Mathematics", "Science", "Social Science", "Hindi", "Kannada"];

export default function AdminTextbooks() {
  const [selectedClass, setSelectedClass] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState("English");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [uploadedBooks, setUploadedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadBooks = async () => {
    try {
      const res = await client.get(`/textbooks?class=${selectedClass}`);
      if (res.data?.success) {
        setUploadedBooks(res.data.textbooks);
      }
    } catch (err) {
      console.error("Fetch textbooks failed", err);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [selectedClass]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setStatusMessage("Please select a PDF file from your device.");
      return;
    }
    if (!chapterTitle.trim()) {
      setStatusMessage("Please enter a chapter title.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("");

      const formData = new FormData();
      formData.append("title", chapterTitle.trim());
      formData.append("subject", selectedSubject);
      formData.append("classNum", selectedClass);
      formData.append("chapterNumber", chapterNumber);
      formData.append("pdfFile", pdfFile);

      const res = await client.post("/textbooks/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        setStatusMessage(`Successfully uploaded "${chapterTitle}" to Class ${selectedClass} ${selectedSubject}!`);
        setChapterTitle("");
        setPdfFile(null);
        document.getElementById("pdfFileInput").value = "";
        loadBooks();
      }
    } catch (err) {
      setStatusMessage(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this textbook entry?")) return;
    try {
      await client.delete(`/textbooks/${id}`);
      loadBooks();
    } catch (err) {
      alert("Failed to delete textbook entry.");
    }
  };

  return (
    <div style={{ padding: "32px 48px 60px", maxWidth: "1150px", margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ marginBottom: "24px" }}>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          ADMINISTRATION PANEL
        </span>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: "4px 0" }}>
          Textbook Uploader & Curriculum Database
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Upload official PDF chapters directly from your computer into MongoDB and host them instantly.
        </p>
      </div>

      {statusMessage && (
        <div style={{ background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "700", fontSize: "13.5px" }}>
          {statusMessage}
        </div>
      )}

      {/* Upload Form */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", marginBottom: "32px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
          Upload New Chapter PDF to Database
        </h2>

        <form onSubmit={handleUpload} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
              GRADE LEVEL
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
              CURRICULUM SUBJECT
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
              CHAPTER / UNIT NUMBER
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(Number(e.target.value))}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
              CHAPTER TITLE
            </label>
            <input
              type="text"
              placeholder="e.g. Unit 1: Ice-Cream Man"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
              ATTACH OFFICIAL TEXTBOOK PDF
            </label>
            <input
              id="pdfFileInput"
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              style={{ width: "100%", padding: "10px", border: "1px dashed #059669", background: "#f0fdf4", borderRadius: "8px" }}
            />
          </div>

          <div style={{ gridColumn: "span 2", marginTop: "8px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#94a3b8" : "#059669",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "700",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Uploading to Server..." : "🚀 Upload & Register in Database"}
            </button>
          </div>
        </form>
      </div>

      {/* Database Inventory Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Uploaded Textbooks for Class {selectedClass} ({uploadedBooks.length} Books)
          </h3>
          <button onClick={loadBooks} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
            🔄 Refresh
          </button>
        </div>

        {uploadedBooks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: "14px" }}>
            No custom textbooks uploaded yet for Class {selectedClass}. Use the form above to upload PDFs.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "10px" }}>Subject</th>
                <th style={{ padding: "10px" }}>Chapter</th>
                <th style<th>Title</th>
                <th style={{ padding: "10px" }}>File URL</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedBooks.map((b) => (
                <tr key={b._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px", fontWeight: "800", color: "#059669" }}>{b.subject}</td>
                  <td style={{ padding: "10px", fontWeight: "700" }}>Ch {b.chapterNumber}</td>
                  <td style={{ padding: "10px", fontWeight: "600", color: "#0f172a" }}>{b.title}</td>
                  <td style={{ padding: "10px", color: "#0284c7" }}>
                    <a href={b.sourceUrl} target="_blank" rel="noreferrer">
                      View PDF ↗
                    </a>
                  </td>
                  <td style={{ padding: "10px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(b._id)}
                      style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 10px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Delete
                    </button>
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
