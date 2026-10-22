import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";

const CORE_SUBJECTS = ["Science", "Mathematics", "Social Science", "English", "Kannada", "Hindi"];
const CLASSES = [5, 6, 7, 8, 9, 10];

export default function Cards() {
  const { user } = useAuth();
  const initialClass = CLASSES.includes(Number(user?.class)) ? Number(user.class) : 5;

  const [sets, setSets] = useState([]);
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewStatus, setReviewStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await client.get("/flashcard-sets");
      setSets(Array.isArray(res.data?.sets) ? res.data.sets : []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to sync flashcards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashcards();
  }, []);

  // Filter cards by selected single subject and classNumber
  const activeDeck = useMemo(() => {
    const matchingSets = sets.filter((s) => {
      const matchSubj = (s.subject || "").trim().toLowerCase() === selectedSubject.trim().toLowerCase();
      const matchCls = Number(s.classNumber ?? s.classLevel) === Number(selectedClass);
      return matchSubj && matchCls;
    });

    return matchingSets.flatMap((set) =>
      (Array.isArray(set.cards) ? set.cards : []).map((card, idx) => ({
        _id: card._id || `${set._id}-${idx}`,
        questionText: card.question || card.front || "No question provided",
        answerText: card.answer || card.back || "No answer provided",
        setTitle: set.title,
        subject: set.subject,
        classNumber: set.classNumber,
        board: set.board || user?.board || "State"
      }))
    );
  }, [sets, selectedSubject, selectedClass, user]);

  const currentCard = activeDeck[currentIndex] || null;

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleClassChange = (c) => {
    setSelectedClass(c);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentIndex < activeDeck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleRating = async (rating) => {
    if (!currentCard) return;
    setReviewStatus((prev) => ({ ...prev, [currentCard._id]: rating }));

    try {
      await client.post("/review/rate", {
        cardId: currentCard._id,
        rating
      });
    } catch {
      // Retain optimistic UI update
    }

    handleNext();
  };

  const masteredCount = activeDeck.filter(
    (c) => reviewStatus[c._id] === "easy" || reviewStatus[c._id] === "good"
  ).length;
  const masteryPercentage = activeDeck.length > 0 ? Math.round((masteredCount / activeDeck.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "65vh" }}>
        <p style={{ color: "#059669", fontWeight: "700" }}>Loading Flashcard Decks...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 48px 60px", maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Top Header */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          ACTIVE RECALL & SPACED RETENTION
        </span>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: "6px 0 4px" }}>
          Flashcards
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Master key definitions, formulas, and terminology subject-by-subject using active recall intervals.
        </p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecdd3", borderRadius: "8px", color: "#b91c1c", marginBottom: "16px", fontSize: "13px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Grade Level Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", marginRight: "4px" }}>
          GRADE:
        </span>
        {CLASSES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleClassChange(c)}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              border: selectedClass === c ? "2px solid #059669" : "1px solid #cbd5e1",
              background: selectedClass === c ? "#059669" : "#ffffff",
              color: selectedClass === c ? "#ffffff" : "#475569",
              fontSize: "12px",
              fontWeight: "800",
              cursor: "pointer"
            }}
          >
            Class {c}
          </button>
        ))}
      </div>

      {/* Single Subject Selector Tabs */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "24px", paddingBottom: "4px" }}>
        {CORE_SUBJECTS.map((subject) => {
          const isSelected = selectedSubject.toLowerCase() === subject.toLowerCase();
          return (
            <button
              key={subject}
              type="button"
              onClick={() => handleSubjectChange(subject)}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: isSelected ? "2px solid #10b981" : "1px solid #e2e8f0",
                background: isSelected ? "#ecfdf5" : "#ffffff",
                color: isSelected ? "#065f46" : "#475569",
                fontSize: "13px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: isSelected ? "0 2px 6px rgba(16, 185, 129, 0.15)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <span>{subject}</span>
              {isSelected && (
                <span style={{ background: "#10b981", color: "#ffffff", fontSize: "10px", padding: "2px 6px", borderRadius: "10px" }}>
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress & Deck Status Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>
          {activeDeck.length > 0 ? `Card ${currentIndex + 1} of ${activeDeck.length}` : "0 Cards"}
        </span>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#059669" }}>
          {masteryPercentage}% Mastered
        </span>
      </div>

      {/* Progress Track */}
      <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", marginBottom: "24px" }}>
        <div
          style={{
            height: "100%",
            width: `${activeDeck.length > 0 ? ((currentIndex + 1) / activeDeck.length) * 100 : 0}%`,
            background: "#10b981",
            transition: "width 0.25s ease"
          }}
        />
      </div>

      {/* Active Recall Card */}
      {currentCard ? (
        <div>
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "48px 36px",
              minHeight: "280px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            {/* Metadata Tags */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", background: "#ecfdf5", padding: "4px 10px", borderRadius: "6px" }}>
                  {currentCard.subject}
                </span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px" }}>
                  {currentCard.setTitle}
                </span>
              </div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#d97706", background: "#fef3c7", padding: "4px 8px", borderRadius: "6px" }}>
                {currentCard.board} • Class {currentCard.classNumber}
              </span>
            </div>

            {/* Centered Question / Answer Content */}
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: isFlipped ? "#059669" : "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {isFlipped ? "ANSWER / EXPLANATION" : "QUESTION"}
              </span>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "14px", lineHeight: "1.4" }}>
                {isFlipped ? currentCard.answerText : currentCard.questionText}
              </h2>
            </div>

            {/* Flip prompt */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", color: "#94a3b8" }}>
              <span>Class {currentCard.classNumber} • {currentCard.setTitle}</span>
              <span style={{ color: "#059669", fontWeight: "700" }}>
                {isFlipped ? "↺ Click card to view question" : "Click card to flip ↺"}
              </span>
            </div>
          </div>

          {/* Spaced Repetition Rating Buttons */}
          {isFlipped && (
            <div style={{ marginTop: "18px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleRating("again")}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #fecdd3", background: "#fef2f2", color: "#b91c1c", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
              >
                1 • Hard (Review Soon)
              </button>
              <button
                type="button"
                onClick={() => handleRating("good")}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#334155", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
              >
                2 • Good
              </button>
              <button
                type="button"
                onClick={() => handleRating("easy")}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #a7f3d0", background: "#ecfdf5", color: "#065f46", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}
              >
                3 • Easy (Mastered)
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: currentIndex === 0 ? "#f8fafc" : "#ffffff",
                color: currentIndex === 0 ? "#cbd5e1" : "#475569",
                fontWeight: "700",
                fontSize: "13px",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer"
              }}
            >
              ← Previous
            </button>

            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Click card to Flip, or rate to advance
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === activeDeck.length - 1}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: currentIndex === activeDeck.length - 1 ? "#cbd5e1" : "#10b981",
                color: "#ffffff",
                fontWeight: "800",
                fontSize: "13px",
                cursor: currentIndex === activeDeck.length - 1 ? "not-allowed" : "pointer"
              }}
            >
              Next →
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: "14px", padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🗂️</div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
            No Flashcards Found for {selectedSubject} (Class {selectedClass})
          </h3>
          <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "380px", margin: "0 auto 16px" }}>
            Select another subject above or switch between Class 5 and Class 10.
          </p>
          <button
            type="button"
            onClick={() => handleSubjectChange("Science")}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#10b981", color: "#ffffff", fontWeight: "700", fontSize: "12.5px", cursor: "pointer" }}
          >
            Switch to Science Decks
          </button>
        </div>
      )}
    </div>
  );
}
