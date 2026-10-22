import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import "./StudyAssistant.css";

const ALL_SUBJECTS = ["Science", "Social Science", "Mathematics", "English", "Kannada", "Hindi"];

const CHAPTER_PRESETS = {
  Science: ["Chemical Reactions", "Electricity", "Life Processes", "Light & Reflection", "Acids, Bases & Salts"],
  "Social Science": ["Nationalism in India", "Federalism", "Resources & Development", "Power Sharing"],
  Mathematics: ["Quadratic Equations", "Arithmetic Progressions", "Trigonometry", "Real Numbers", "Surface Areas & Volumes"],
  English: ["Reported Speech", "Active & Passive Voice", "Tenses", "Formal Letter Writing"],
  Kannada: ["ಕನ್ನಡ ಸಂಧಿಗಳು", "ಸಮಾಸಗಳು", "ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು", "ತತ್ಸಮ-ತದ್ಭವ"],
  Hindi: ["समास", "पदबंध", "कारक", "उपसर्ग एवं प्रत्यय"]
};

const QUICK_PROMPTS = [
  "Explain this concept in simple terms.",
  "What are the high-yield facts to remember?",
  "Give me a real-world everyday example.",
  "Generate a 3-question memory check.",
];

export default function StudyAssistant() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [notes, setNotes] = useState([]);

  const [subject, setSubject] = useState("Science");
  const [chapter, setChapter] = useState("");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  // Speech Output (TTS)
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);

  const messagesEndRef = useRef(null);

  const studentClass = Number(user?.class) || 10;
  const studentBoard = user?.board || "State";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, asking]);

  useEffect(() => {
    let active = true;

    const loadStudyMaterial = async () => {
      try {
        const [cardsResponse, notesResponse] = await Promise.allSettled([
          client.get("/cards"),
          client.get("/notes"),
        ]);

        if (!active) return;

        const cardData =
          cardsResponse.status === "fulfilled"
            ? Array.isArray(cardsResponse.value.data)
              ? cardsResponse.value.data
              : cardsResponse.value.data?.cards || []
            : [];

        const noteData =
          notesResponse.status === "fulfilled"
            ? Array.isArray(notesResponse.value.data)
              ? notesResponse.value.data
              : notesResponse.value.data?.notes || []
            : [];

        setCards(cardData);
        setNotes(noteData);
      } catch (err) {
        console.error("Failed to load material:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStudyMaterial();
    return () => {
      active = false;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const availableChapters = useMemo(() => {
    const preset = CHAPTER_PRESETS[subject] || [];
    const uploaded = [
      ...cards.filter((c) => c.subject?.toLowerCase() === subject.toLowerCase()).map((c) => c.chapter),
      ...notes.filter((n) => n.subject?.toLowerCase() === subject.toLowerCase()).map((n) => n.chapter),
    ].filter(Boolean);

    return [...new Set([...preset, ...uploaded])];
  }, [subject, cards, notes]);

  // Clean Text-to-Speech Output
  const speakText = (text, index) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (speakingIndex === index) {
      setSpeakingIndex(null);
      return;
    }

    const clean = text.replace(/[*#_`>~-]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (subject === "Kannada") utterance.lang = "kn-IN";
    else if (subject === "Hindi") utterance.lang = "hi-IN";
    else utterance.lang = "en-IN";

    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
  };

  const executeAsk = async (queryText) => {
    const trimmed = (queryText || question).trim();
    if (!trimmed || asking) return;

    setAsking(true);
    setError("");

    const previousHistory = messages.slice(-10);

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuestion("");

    try {
      const { data } = await client.post("/assistant/ask", {
        question: trimmed,
        subject: subject || undefined,
        chapter: chapter || undefined,
        history: previousHistory,
      });

      const reply = data.answer || "I could not generate an answer based on your curriculum.";

      setMessages((prev) => {
        const next = [...prev, { role: "assistant", content: reply }];
        if (voiceReplyEnabled) {
          speakText(reply, next.length - 1);
        }
        return next;
      });
    } catch (err) {
      console.error("TutorAgent query error:", err);
      setError(err.response?.data?.error || "Unable to retrieve response. Please check your network or try again.");
      setMessages((prev) => {
        const next = [...prev];
        next.pop();
        return next;
      });
    } finally {
      setAsking(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    executeAsk();
  };

  const startNewChat = () => {
    stopAudio();
    setMessages([]);
    setQuestion("");
    setError("");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "65vh" }}>
        <div style={{ color: "#059669", fontWeight: "700", fontSize: "15px" }}>
          Initializing Curriculum Assistant...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            COGNITIVE AI STUDY PARTNER
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: "6px 0 4px" }}>
            TutorAgent Studio
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Curriculum-grounded assistant to clarify doubts, verify textbook formulas, and simplify exam chapters.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={() => {
              if (voiceReplyEnabled) stopAudio();
              setVoiceReplyEnabled(!voiceReplyEnabled);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: voiceReplyEnabled ? "1.5px solid #10b981" : "1px solid #cbd5e1",
              background: voiceReplyEnabled ? "#ecfdf5" : "#ffffff",
              color: voiceReplyEnabled ? "#047857" : "#64748b",
              fontWeight: "700",
              fontSize: "12.5px",
              cursor: "pointer"
            }}
          >
            {voiceReplyEnabled ? "🔊 Auto Read-Aloud ON" : "🔇 Read-Aloud OFF"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12.5px",
              fontWeight: "700",
              color: "#0f172a"
            }}
          >
            <span>Class {studentClass}</span>
            <span style={{ color: "#cbd5e1" }}>•</span>
            <span style={{ color: "#059669" }}>{studentBoard} Board</span>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={startNewChat}
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12.5px",
                fontWeight: "700",
                color: "#475569",
                cursor: "pointer"
              }}
            >
              + Clear Session
            </button>
          )}
        </div>
      </div>

      {/* Curriculum Context Filter */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "20px",
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>🎯</span>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a" }}>Curriculum Focus Filter</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Constrain TutorAgent's knowledge base to a specific syllabus unit.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Subject</label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setChapter("");
              }}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f172a",
                outline: "none"
              }}
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "10.5px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Chapter / Unit</label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f172a",
                outline: "none",
                minWidth: "180px"
              }}
            >
              <option value="">All Chapters in {subject}</option>
              {availableChapters.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Conversation Feed */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "24px 28px",
          minHeight: "420px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, overflowY: "auto", marginBottom: "20px" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#ecfdf5",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  margin: "0 auto 16px"
                }}
              >
                ✦
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
                How can TutorAgent assist your study session?
              </h2>
              <p style={{ color: "#64748b", fontSize: "13.5px", maxWidth: "520px", margin: "0 auto 28px" }}>
                Ask about key formulas, historical timelines, textbook proofs, or generate quick memory-check questions for Class {studentClass}.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", maxWidth: "700px", margin: "0 auto" }}>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => executeAsk(prompt)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: "13px",
                      fontWeight: "600",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#10b981";
                      e.currentTarget.style.background = "#ffffff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                  >
                    ↳ {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const isPlaying = speakingIndex === i;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    width: "100%"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b" }}>
                      {isUser ? "🧑‍🎓 YOU" : "🤖 TUTORAGENT"}
                    </span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.content, i)}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          color: isPlaying ? "#ef4444" : "#10b981",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0
                        }}
                      >
                        {isPlaying ? "⏹️ Stop" : "🔊 Listen"}
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      maxWidth: isUser ? "75%" : "90%",
                      borderRadius: "14px",
                      padding: isUser ? "12px 18px" : "18px 24px",
                      background: isUser ? "#f1f5f9" : "#ffffff",
                      border: isUser ? "1px solid #e2e8f0" : "1.5px solid #e2e8f0",
                      borderLeft: isUser ? "1px solid #e2e8f0" : "4px solid #10b981",
                      color: "#0f172a",
                      fontSize: "14px",
                      lineHeight: "1.6"
                    }}
                  >
                    {isUser ? (
                      <p style={{ margin: 0, fontWeight: "600" }}>{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {asking && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>
                🤖 TUTORAGENT
              </span>
              <div
                style={{
                  borderRadius: "14px",
                  padding: "14px 20px",
                  background: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderLeft: "4px solid #10b981",
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                Formulating curriculum-grounded explanation...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div style={{ padding: "10px 16px", background: "#fef2f2", border: "1px solid #fecdd3", borderRadius: "10px", color: "#b91c1c", fontSize: "13px", fontWeight: "600", marginBottom: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Clean Input Dock */}
        <form onSubmit={handleFormSubmit} style={{ border: "1px solid #cbd5e1", borderRadius: "14px", padding: "12px 16px", background: "#f8fafc" }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit();
              }
            }}
            placeholder={
              chapter
                ? `Ask anything about ${chapter}... (Press Enter to send)`
                : `Ask TutorAgent anything about ${subject}... (Press Enter to send)`
            }
            rows={2}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: "14px",
              color: "#0f172a",
              fontFamily: "inherit"
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
              Focus: <strong style={{ color: "#0f172a" }}>{subject}</strong> {chapter ? `• ${chapter}` : "(All Chapters)"}
            </span>

            <button
              type="submit"
              disabled={asking || !question.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                borderRadius: "10px",
                border: "none",
                background: !question.trim() || asking ? "#94a3b8" : "#10b981",
                color: "#ffffff",
                fontWeight: "800",
                fontSize: "13px",
                cursor: !question.trim() || asking ? "not-allowed" : "pointer",
                boxShadow: !question.trim() || asking ? "none" : "0 2px 8px rgba(16, 185, 129, 0.3)"
              }}
            >
              {asking ? "Processing..." : "Ask Assistant →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
