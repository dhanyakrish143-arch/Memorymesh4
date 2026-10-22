import React, { useEffect, useState } from "react";
import "./Learn.css";

const CLASSES = [5, 6, 7, 8, 9, 10];
const SUBJECTS = ["All", "English", "Mathematics", "Science", "Social Science", "Hindi", "Kannada"];
const BACKEND_URL = "http://localhost:5000";

export default function Learn() {
  const [selectedClass, setSelectedClass] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [textbooks, setTextbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Fetch directly from the backend server to avoid any client interceptor redirects
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${BACKEND_URL}/api/textbooks?class=${selectedClass}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      console.log(`[Learn] Fetched textbooks for Class ${selectedClass}:`, data);

      if (data?.success && Array.isArray(data.textbooks)) {
        setTextbooks(data.textbooks);
      } else if (Array.isArray(data)) {
        setTextbooks(data);
      } else {
        setTextbooks([]);
      }
    } catch (err) {
      console.error("[Learn] Error fetching textbooks:", err);
      setTextbooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedClass]);

  const displayedBooks = selectedSubject === "All"
    ? textbooks
    : textbooks.filter((b) => b.subject?.toLowerCase() === selectedSubject.toLowerCase());

  const getFullPdfUrl = (sourceUrl) => {
    if (!sourceUrl) return "";
    if (sourceUrl.startsWith("http://") || sourceUrl.startsWith("https://")) {
      return sourceUrl;
    }
    const cleanPath = sourceUrl.startsWith("/") ? sourceUrl : `/${sourceUrl}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

  return (
    <div style={{ padding: "32px 48px 60px", maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            CURRICULUM LIBRARY & STUDY HUB
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: "4px 0" }}>
            Class {selectedClass} Textbooks
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Official textbook library managed by the curriculum portal.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchBooks}
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12.5px",
              fontWeight: "700",
              color: "#334155",
              cursor: "pointer"
            }}
          >
            🔄 Refresh Books
          </button>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "8px 16px", textAlign: "right" }}>
            <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>Class {selectedClass}</strong>
            <span style={{ color: "#f97316", fontSize: "12px", fontWeight: "700" }}>State / NCERT</span>
          </div>
        </div>
      </div>

      {/* Grade Selector Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "22px" }}>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", marginRight: "6px" }}>
          SELECT GRADE:
        </span>
        {CLASSES.map((cls) => (
          <button
            key={cls}
            type="button"
            onClick={() => {
              setSelectedClass(cls);
              setSelectedSubject("All");
            }}
            style={{
              padding: "7px 18px",
              borderRadius: "8px",
              border: selectedClass === cls ? "2px solid #059669" : "1px solid #cbd5e1",
              background: selectedClass === cls ? "#059669" : "#ffffff",
              color: selectedClass === cls ? "#ffffff" : "#475569",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Class {cls}
          </button>
        ))}
      </div>

      {/* Filter Subject Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>
          Available Textbooks ({displayedBooks.length})
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Filter Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600" }}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#64748b", fontSize: "15px", fontWeight: "600" }}>
          Loading library from server...
        </div>
      ) : displayedBooks.length === 0 ? (
        <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: "14px", padding: "60px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>📚</span>
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
            No Textbooks Uploaded for Class {selectedClass}
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Upload official PDF chapters through the Admin Dashboard to display them here.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {displayedBooks.map((book) => {
            const resolvedUrl = getFullPdfUrl(book.sourceUrl);
            return (
              <div
                key={book._id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", background: "#ecfdf5", padding: "3px 8px", borderRadius: "6px" }}>
                      {book.subject}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
                      Class {book.class}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>
                    {book.title}
                  </h3>
                  <span style={{ fontSize: "13px", color: "#475569", fontWeight: "600" }}>
                    Chapter {book.chapterNumber || 1} {book.chapterName ? `— ${book.chapterName}` : ""}
                  </span>
                </div>

                <div style={{ paddingTop: "14px", borderTop: "1px solid #f1f5f9", marginTop: "16px" }}>
                  <button
                    type="button"
                    onClick={() => setActiveModal({ ...book, fullUrl: resolvedUrl })}
                    style={{
                      width: "100%",
                      background: "#0f172a",
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: "13px",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    📖 Read Textbook PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {activeModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            width: "100%",
            maxWidth: "1050px",
            height: "90vh",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 24px",
              background: "#0f172a",
              color: "#ffffff"
            }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase" }}>
                  {activeModal.subject} — Class {activeModal.class}
                </span>
                <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "2px 0 0" }}>
                  {activeModal.title} {activeModal.chapterName ? `(${activeModal.chapterName})` : ""}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => window.open(activeModal.fullUrl, "_blank")}
                  style={{ background: "#334155", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Full Tab ↗
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div style={{ flex: 1, background: "#f8fafc" }}>
              <iframe
                src={`${activeModal.fullUrl}#toolbar=1`}
                title="Textbook Viewer"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
