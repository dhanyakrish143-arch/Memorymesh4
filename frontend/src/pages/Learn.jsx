import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";

const DEFAULT_SUBJECTS = [];

const BACKEND_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const resolveTextbookUrl = (url) => {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function Learn() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cards, setCards] = useState([]);
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [textbooks, setTextbooks] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [generationError, setGenerationError] = useState("");
  const [savingCards, setSavingCards] = useState(false);

  useEffect(() => {
    const loadLearningContent = async () => {
      try {
        setLoading(true);
        setError("");

        const classNumber = Number(user?.class) || 10;

        const subjectsToLoad = [
          "English",
          "Mathematics",
          "Science",
          "Social Science",
          "Hindi",
        ];

        const responses = await Promise.all(
          subjectsToLoad.map((subject) =>
            client.get(
              `/learn/chapters?class=${classNumber}&subject=${encodeURIComponent(subject)}`
            )
          )
        );

        const books = [];
        const discoveredSubjects = [];

        responses.forEach((response, index) => {
          const data = response.data;

          if (!data?.success) return;

          const subject = subjectsToLoad[index];

          discoveredSubjects.push(subject);

          if (data.textbook) {
            books.push({
              ...data.textbook,
              chapters: data.chapters || [],
            });
          }
        });

        setTextbooks(books);
        setCards([]);
        setNotes([]);
        setSubjects([...new Set(discoveredSubjects)]);
      } catch (err) {
        console.error("Failed to load Learn content:", err);
        console.error(
          "Learn API error:",
          err?.response?.data || err?.message
        );

        setError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load your learning content."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLearningContent();
  }, [user?.class]);

  const subjectCards = useMemo(() => {
    if (!selectedSubject) return [];

    return cards.filter(
      (card) =>
        card.subject?.trim().toLowerCase() ===
        selectedSubject.trim().toLowerCase()
    );
  }, [cards, selectedSubject]);

  const subjectNotes = useMemo(() => {
    if (!selectedSubject) return [];

    return notes.filter(
      (note) =>
        note.subject?.trim().toLowerCase() ===
        selectedSubject.trim().toLowerCase()
    );
  }, [notes, selectedSubject]);

  const subjectTextbooks = useMemo(() => {
    if (!selectedSubject) return [];

    return textbooks.filter(
      (book) =>
        book.subject?.trim().toLowerCase() ===
        selectedSubject.trim().toLowerCase()
    );
  }, [textbooks, selectedSubject]);

  const chapters = useMemo(() => {
    const chapterMap = new Map();

    subjectCards.forEach((card) => {
      if (card.chapter?.trim()) {
        const name = card.chapter.trim();

        if (!chapterMap.has(name)) {
          chapterMap.set(name, {
            name,
            index: Number.MAX_SAFE_INTEGER,
            source: "local",
          });
        }
      }
    });

    subjectNotes.forEach((note) => {
      if (note.chapter?.trim()) {
        const name = note.chapter.trim();

        if (!chapterMap.has(name)) {
          chapterMap.set(name, {
            name,
            index: Number.MAX_SAFE_INTEGER,
            source: "local",
          });
        }
      }
    });

    subjectTextbooks.forEach((book) => {
      const bookChapters = Array.isArray(book.chapters)
        ? book.chapters
        : [];

      bookChapters.forEach((chapter, index) => {
        if (!chapter?.name?.trim()) return;

        const name = chapter.name.trim();

        chapterMap.set(name, {
          name,
          index:
            Number.isFinite(Number(chapter.index))
              ? Number(chapter.index)
              : index + 1,
          source: "textbook",
          id: chapter.id,
          url: chapter.url,
          textbookUrl: chapter.textbookUrl || book.url,
          textbookName: book.name,
        });
      });
    });

    return [...chapterMap.values()].sort((a, b) => {
      const bookA = String(a.name || "").split(" - Chapter")[0].trim();
      const bookB = String(b.name || "").split(" - Chapter")[0].trim();

      const bookOrder = bookA.localeCompare(bookB);

      if (bookOrder !== 0) {
        return bookOrder;
      }

      return Number(a.index || 0) - Number(b.index || 0);
    });
  }, [subjectCards, subjectNotes, subjectTextbooks]);

  const chapterCards = useMemo(() => {
    if (!selectedChapter) return [];

    return subjectCards.filter(
      (card) =>
        (card.chapter?.trim() || "General") === selectedChapter
    );
  }, [subjectCards, selectedChapter]);

  const chapterNotes = useMemo(() => {
    if (!selectedChapter) return [];

    return subjectNotes.filter(
      (note) =>
        (note.chapter?.trim() || "General") === selectedChapter
    );
  }, [subjectNotes, selectedChapter]);

  const chapterTextbooks = useMemo(() => {
    if (!selectedChapter) return [];

    const matches = [];

    subjectTextbooks.forEach((book) => {
      const bookChapters = Array.isArray(book.chapters)
        ? book.chapters
        : [];

      bookChapters.forEach((chapter) => {
        if (chapter?.name?.trim() === selectedChapter) {
          matches.push({
            ...book,
            chapter: chapter.name,
            chapterNumber: chapter.index,
            chapterId: chapter.id,
            sourceUrl:
              chapter.textbookUrl ||
              chapter.url ||
              book.sourceUrl ||
              book.url,
          });
        }
      });
    });

    return matches;
  }, [subjectTextbooks, selectedChapter]);

  const selectedTextbookChapter = chapterTextbooks[0];

  const chapterMastery = useMemo(() => {
    if (!chapterCards.length) return 0;

    const mastered = chapterCards.filter(
      (card) => card.mastered
    ).length;

    return Math.round(
      (mastered / chapterCards.length) * 100
    );
  }, [chapterCards]);

  const openSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
    setGeneratedCards([]);
    setGenerationError("");
  };

  const openChapter = (chapter) => {
    setSelectedChapter(chapter);
    setGeneratedCards([]);
    setGenerationError("");
  };

  const goBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedChapter(null);
    setGeneratedCards([]);
    setGenerationError("");
  };

  const goBackToChapters = () => {
    setSelectedChapter(null);
    setGeneratedCards([]);
    setGenerationError("");
  };

  const generateFlashcards = async () => {
    const textbookId = selectedTextbookChapter?.chapterId;

    if (!textbookId) {
      setGenerationError(
        "This chapter does not have a local NCERT PDF available."
      );
      return;
    }

    try {
      setGenerating(true);
      setGenerationError("");
      setGeneratedCards([]);

      const response = await client.post(
        "/learn/generate-cards",
        {
          textbookId,
        }
      );

      const cardsFromAI = Array.isArray(response.data?.flashcards)
        ? response.data.flashcards
        : [];

      if (!cardsFromAI.length) {
        throw new Error(
          "The AI did not generate any flashcards."
        );
      }

      setGeneratedCards(
        cardsFromAI.map((card, index) => ({
          ...card,
          _tempId: `${Date.now()}-${index}`,
          selected: true,
        }))
      );
    } catch (err) {
      console.error("Flashcard generation failed:", err);

      setGenerationError(
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate flashcards."
      );
    } finally {
      setGenerating(false);
    }
  };

  const toggleGeneratedCard = (tempId) => {
    setGeneratedCards((current) =>
      current.map((card) =>
        card._tempId === tempId
          ? {
              ...card,
              selected: !card.selected,
            }
          : card
      )
    );
  };

  const saveGeneratedCards = async () => {
    const selectedCards = generatedCards
      .filter((card) => card.selected)
      .map(({ question, answer }) => ({
        question,
        answer,
      }));

    if (!selectedCards.length) {
      setGenerationError(
        "Select at least one flashcard to save."
      );
      return;
    }

    try {
      setSavingCards(true);
      setGenerationError("");

      await client.post("/upload/save-cards", {
        flashcards: selectedCards,
        subject: selectedSubject,
        chapter: selectedChapter,
        class: Number(user?.class) || 10,
        source: "ncert",
      });

      setGeneratedCards([]);

      setCards((current) => [
        ...current,
        ...selectedCards.map((card, index) => ({
          ...card,
          _id: `generated-${Date.now()}-${index}`,
          subject: selectedSubject,
          chapter: selectedChapter,
          class: Number(user?.class) || 10,
          source: "ncert",
          mastered: false,
        })),
      ]);
    } catch (err) {
      console.error("Saving NCERT flashcards failed:", err);

      setGenerationError(
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save flashcards."
      );
    } finally {
      setSavingCards(false);
    }
  };

  if (loading) {
    return (
      <div className="page learn-page">
        <div className="learn-loading">
          <div className="review-spinner" />
          <p>Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page learn-page">
        <section className="card learn-error">
          <div className="learn-empty-icon">!</div>
          <p className="eyebrow">LEARN</p>
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </section>
      </div>
    );
  }

  /*
    LEVEL 1 — SUBJECTS
  */
  if (!selectedSubject) {
    return (
      <div className="page learn-page">
        <section className="learn-hero">
          <div>
            <p className="eyebrow">
              MEMORYMESH LEARN · CLASS {user?.class || "—"}
            </p>

            <h1>What do you want to learn?</h1>

            <p>
              Choose a subject to explore chapters, notes,
              and flashcards.
            </p>
          </div>

          <div className="learn-hero-stat">
            <span>Subjects</span>
            <strong>{subjects.length}</strong>
          </div>
        </section>

        {subjects.length === 0 ? (
          <section className="card learn-empty">
            <div className="learn-empty-icon">??</div>

            <h2>No subjects yet</h2>

            <p>
              Upload study material to start building your
              learning library.
            </p>

            <Link
              to="/upload"
              className="primary-button"
            >
              Upload Material
            </Link>
          </section>
        ) : (
          <section className="learn-subject-grid">
            {subjects.map((subject) => {
              const cardCount = cards.filter(
                (card) =>
                  card.subject?.trim().toLowerCase() ===
                  subject.toLowerCase()
              ).length;

              const noteCount = notes.filter(
                (note) =>
                  note.subject?.trim().toLowerCase() ===
                  subject.toLowerCase()
              ).length;

              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => openSubject(subject)}
                  className="learn-subject-card"
                >
                  <div className="learn-card-icon">
                    {subject.charAt(0).toUpperCase()}
                  </div>

                  <div className="learn-card-body">
                    <span className="learn-card-label">
                      SUBJECT
                    </span>

                    <h2>{subject}</h2>

                    <p>
                      {cardCount} flashcard
                      {cardCount === 1 ? "" : "s"}
                      {" · "}
                      {noteCount} note
                      {noteCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <span className="learn-card-arrow">
                    →
                  </span>
                </button>
              );
            })}
          </section>
        )}
      </div>
    );
  }

  /*
    LEVEL 2 — CHAPTERS
  */
  if (!selectedChapter) {
    return (
      <div className="page learn-page">
        <button
          type="button"
          onClick={goBackToSubjects}
          className="learn-back-button"
        >
          ← All Subjects
        </button>

        <section className="learn-hero">
          <div>
            <p className="eyebrow">
              {selectedSubject.toUpperCase()}
            </p>

            <h1>Choose a chapter</h1>

            <p>
              Select a chapter to study notes and
              practice flashcards.
            </p>
          </div>

          <div className="learn-hero-stat">
            <span>Chapters</span>
            <strong>{chapters.length}</strong>
          </div>
        </section>

        {chapters.length === 0 ? (
          <section className="card learn-empty">
            <div className="learn-empty-icon">??</div>

            <h2>No chapters yet</h2>

            <p>
              Upload study material for {selectedSubject}
              to create learning content.
            </p>

            <Link to="/upload" className="primary-button">
              Upload Material
            </Link>
          </section>
        ) : (
          <section className="learn-chapter-grid">
            {chapters.map((chapter) => {
              const chapterName = chapter.name;

              const cardCount = subjectCards.filter(
                (card) =>
                  (card.chapter?.trim() || "General") === chapterName
              ).length;

              const noteCount = subjectNotes.filter(
                (note) =>
                  (note.chapter?.trim() || "General") === chapterName
              ).length;

              return (
                <button
                  key={chapter.id || chapterName}
                  type="button"
                  onClick={() => openChapter(chapterName)}
                  className="learn-chapter-card"
                >
                  <div className="chapter-number">
                    {chapter.index || chapters.indexOf(chapter) + 1}
                  </div>

                  <div className="learn-card-body">
                    <span className="learn-card-label">
                      CHAPTER
                    </span>

                    <h2>{chapterName}</h2>

                    <p>
                      {cardCount} flashcard
                      {cardCount === 1 ? "" : "s"} ·{" "}
                      {noteCount} note
                      {noteCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <span className="learn-card-arrow">→</span>
                </button>
              );
            })}
          </section>
        )}
      </div>
    );
  }

  /*
    LEVEL 3 — CHAPTER CONTENT
  */
  return (
    <div className="page learn-page">
      <div className="learn-breadcrumbs">
        <button
          type="button"
          onClick={goBackToChapters}
          className="learn-back-button"
        >
          ← Chapters
        </button>

        <button
          type="button"
          onClick={goBackToSubjects}
          className="learn-back-button"
        >
          All Subjects
        </button>
      </div>

      <section className="learn-hero">
        <div>
          <p className="eyebrow">
            {selectedSubject.toUpperCase()}
          </p>

          <h1>{selectedChapter}</h1>

          <p>
            Study the notes, then practice the flashcards.
          </p>
        </div>

        <div className="learn-hero-stat">
          <span>Mastery</span>
          <strong>{chapterMastery}%</strong>
        </div>
      </section>

      <section className="card learn-mastery-card">
        <div className="learn-mastery-top">
          <span>Chapter mastery</span>
          <strong>{chapterMastery}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill mastery-fill"
            style={{
              width: `${chapterMastery}%`,
            }}
          />
        </div>

        <p>
          {chapterCards.filter((card) => card.mastered).length} of{" "}
          {chapterCards.length} flashcards mastered.
        </p>
      </section>

      {chapterTextbooks.length > 0 && (
        <section className="learn-content-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NCERT TEXTBOOK</p>
              <h2>Official textbook</h2>
            </div>
          </div>

          <div className="learn-content-grid">
            {chapterTextbooks.map((book) => (
              <article
                key={book._id || book.chapterId}
                className="card learn-note-card"
              >
                <span className="learn-card-label">
                  NCERT TEXTBOOK
                </span>

                <h3>{book.chapter}</h3>

                <p className="learn-note-content">
                  {book.title}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href={resolveTextbookUrl(book.sourceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-button"
                  >
                    📖 Open NCERT
                  </a>

                  <button
                    type="button"
                    onClick={generateFlashcards}
                    disabled={
                      generating ||
                      savingCards ||
                      !book.chapterId
                    }
                    className="secondary-button"
                  >
                    {generating
                      ? "Generating..."
                      : "✨ Generate Flashcards"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {generationError && (
        <section className="card learn-error">
          <p>{generationError}</p>
        </section>
      )}

      {generatedCards.length > 0 && (
        <section className="learn-content-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AI GENERATED</p>
              <h2>Review before saving</h2>
              <p>
                Select the cards you want to keep in your
                {` ${selectedSubject}`} deck.
              </p>
            </div>

            <button
              type="button"
              onClick={saveGeneratedCards}
              disabled={
                savingCards ||
                !generatedCards.some((card) => card.selected)
              }
              className="primary-button"
            >
              {savingCards
                ? "Saving..."
                : `Save ${
                    generatedCards.filter((card) => card.selected).length
                  } Cards`}
            </button>
          </div>

          <div className="learn-content-grid">
            {generatedCards.map((card) => (
              <article
                key={card._tempId}
                className={`card learn-flashcard ${
                  card.selected ? "" : "generated-card-disabled"
                }`}
                style={{
                  cursor: "pointer",
                  opacity: card.selected ? 1 : 0.5,
                }}
                onClick={() =>
                  toggleGeneratedCard(card._tempId)
                }
              >
                <div className="learn-flashcard-top">
                  <span className="learn-card-label">
                    {card.selected
                      ? "✓ SELECTED"
                      : "NOT SELECTED"}
                  </span>
                </div>

                <h3>{card.question}</h3>

                <div className="learn-answer">
                  {card.answer}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="learn-content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FLASHCARDS</p>
            <h2>Practice this chapter</h2>
          </div>

          {chapterCards.length > 0 && (
            <button
              type="button"
              onClick={() =>
                navigate("/review", {
                  state: {
                    subject: selectedSubject,
                    chapter: selectedChapter,
                  },
                })
              }
              className="primary-button"
            >
              Start Review →
            </button>
          )}
        </div>

        {chapterCards.length === 0 ? (
          <section className="card learn-empty">
            <div className="learn-empty-icon">??</div>

            <h3>No flashcards yet</h3>

            <p>
              Generate flashcards from the official NCERT
              chapter above.
            </p>

            {chapterTextbooks.length === 0 && (
              <Link
                to="/upload"
                className="primary-button"
              >
                Upload Material
              </Link>
            )}
          </section>
        ) : (
          <div className="learn-content-grid">
            {chapterCards.map((card) => (
              <article
                key={card._id}
                className="card learn-flashcard"
              >
                <div className="learn-flashcard-top">
                  <span className="learn-card-label">
                    FLASHCARD
                  </span>

                  {card.mastered && (
                    <span className="learn-mastered-badge">
                      ✓ Mastered
                    </span>
                  )}
                </div>

                <h3>{card.question}</h3>

                <div className="learn-answer">
                  {card.answer}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
