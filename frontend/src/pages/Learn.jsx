import React, { useEffect, useState } from "react";
import client from "../api/client";
import { CLASS_5_SUBJECTS } from "./class5Data";
import { CLASS_6_SUBJECTS } from "./class6Data";
import "./Learn.css";

export default function Learn() {
  const [currentClass, setCurrentClass] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [dbBooks, setDbBooks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  const fallbackDataset = currentClass === 6 ? CLASS_6_SUBJECTS : CLASS_5_SUBJECTS;

  useEffect(() => {
    client.get(`/textbooks?class=${currentClass}`)
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.textbooks)) {
          setDbBooks(res.data.textbooks);
        }
      })
      .catch(() => {});
  }, [currentClass]);

  const handleOpenPdf = (subject, chNum, defaultTitle) => {
    // 1. Check if an official PDF was uploaded through Admin for this subject & chapter
    const uploadedMatch = dbBooks.find(
      (b) => b.subject.toLowerCase() === subject.toLowerCase() && Number(b.chapterNumber) === Number(chNum)
    );

    let pdfUrl = uploadedMatch ? uploadedMatch.sourceUrl : null;

    // 2. If not uploaded yet, use the verified local multi-page backup
    if (!pdfUrl) {
      const s = subject.toLowerCase();
      let prefix = "science";
      if (s.includes("english")) prefix = "english";
      else if (s.includes("math")) prefix = "maths";
      else if (s.includes("social")) prefix = "social";
      else if (s.includes("hindi")) prefix = "hindi";
      else if (s.includes("kannada")) prefix = "kannada";
      pdfUrl = `/textbooks/${prefix}_ch${chNum}.pdf`;
    }

    setActiveModal({
      title: defaultTitle,
      subject,
      url: pdfUrl
    });
  };

  const displayedSubjects = selectedSubject === "all"
    ? fallbackDataset
    : fallbackDataset.filter((s) => s.subject === selectedSubject);

  return (
    <div style={{ padding: "32px 48px 60px", maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            CURRICULUM LIBRARY & STUDY HUB
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: "4px 0" }}>
            Class {currentClass} Digital Curriculum Hub
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Official NCERT chapter reader running offline inside the portal.
          </p>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "8px 16px", textAlign: "right" }}>
          <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>Class {currentClass}</strong>
          <span style={{ color: "#f97316", fontSize: "12px", fontWeight: "700" }}>State NCERT</span>
        </div>
      </div>

      {/* Grade Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "22px" }}>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", marginRight: "6px" }}>
          SELECT GRADE:
        </span>
        {[5, 6].map((cls) => (
          <button
            key={cls}
            type="button"
            onClick={() => {
              setCurrentClass(cls);
              setSelectedSubject("all");
            }}
            style={{
              padding: "7px 18px",
              borderRadius: "8px",
              border: currentClass === cls ? "2px solid #059669" : "1px solid #cbd5e1",
              background: currentClass === cls ? "#059669" : "#ffffff",
              color: currentClass === cls ? "#ffffff" : "#475569",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer"
            }}
          >
            Class {cls}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>
          Showing {displayedSubjects.length} Core Subjects
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Filter Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600" }}
          >
            <option value="all">All Subjects</option>
            {fallbackDataset.map((s) => (
              <option key={s.subject} value={s.subject}>{s.subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {displayedSubjects.map((item) => (
          <div
            key={item.subject}
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
                  {item.subject}
                </span>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b" }}>
                  Class {currentClass} Official
                </span>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px" }}>
                {item.title}
              </h3>

              <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "12px 0 6px" }}>
                Official Syllabus Chapters:
              </p>

              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px" }}>
                {item.chapters.map((ch) => (
                  <li key={ch.num} style={{ marginBottom: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleOpenPdf(item.subject, ch.num, ch.title)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#0284c7",
                        fontSize: "13px",
                        fontWeight: "600",
                        textAlign: "left",
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      {ch.title} ↗
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ paddingTop: "14px", borderTop: "1px solid #f1f5f9", marginTop: "14px" }}>
              <button
                type="button"
                onClick={() => handleOpenPdf(item.subject, 1, item.chapters[0].title)}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "13px",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <span>📖</span> Open In-Portal Digital Reader
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
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
                  {activeModal.subject} — Grade {currentClass}
                </span>
                <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "2px 0 0" }}>
                  {activeModal.title}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => window.open(activeModal.url, "_blank")}
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
                src={`${activeModal.url}#toolbar=1&navpanes=0`}
                title="Reader Modal"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
