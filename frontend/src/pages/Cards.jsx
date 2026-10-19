import { useEffect, useMemo, useState } from "react";
import client from "../api/client";

export default function Cards() {
  const [sets, setSets] = useState([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [revealed, setRevealed] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSets() {
      try {
        setLoading(true);
        setError("");

        const { data } = await client.get("/flashcard-sets");

        if (active) {
          setSets(Array.isArray(data?.sets) ? data.sets : []);
        }
      } catch (err) {
        console.error("Failed to load published flashcards:", err);

        if (active) {
          setError(
            err.response?.data?.error ||
              "Could not load your class flashcards. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSets();

    return () => {
      active = false;
    };
  }, []);

  const allCards = useMemo(
    () =>
      sets.flatMap((set) =>
        (Array.isArray(set.cards) ? set.cards : []).map((card, index) => ({
          ...card,
          _id: `${set._id || set.title}-${index}`,
          setTitle: set.title,
          subject: set.subject,
          chapter: set.chapter,
          classNumber: set.classNumber,
          board: set.board,
        }))
      ),
    [sets]
  );

  const subjects = useMemo(
    () => [...new Set(allCards.map((card) => card.subject).filter(Boolean))].sort(),
    [allCards]
  );

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allCards.filter((card) => {
      const matchesSubject =
        subjectFilter === "all" || card.subject === subjectFilter;

      const matchesSearch =
        !query ||
        card.question?.toLowerCase().includes(query) ||
        card.answer?.toLowerCase().includes(query) ||
        card.subject?.toLowerCase().includes(query) ||
        card.chapter?.toLowerCase().includes(query) ||
        card.setTitle?.toLowerCase().includes(query);

      return matchesSubject && matchesSearch;
    });
  }, [allCards, search, subjectFilter]);

  const toggleAnswer = (id) => {
    setRevealed((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading your class flashcards...</p>
      </div>
    );
  }

  return (
    <div className="page cards-page">
      <div className="cards-header">
        <div>
          <p className="eyebrow">MEMORYMESH</p>
          <h1 className="brand">Class Flashcards</h1>
          <p className="subtitle">
            Study flashcards published by your teacher or administrator.
          </p>
        </div>

        <div className="cards-count">
          <strong>{filteredCards.length}</strong>
          <span>cards</span>
        </div>
      </div>

      <div className="cards-toolbar">
        <input
          type="text"
          placeholder="Search questions, answers, or chapters..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="cards-search"
        />

        <select
          value={subjectFilter}
          onChange={(event) => setSubjectFilter(event.target.value)}
          className="cards-search"
          aria-label="Filter by subject"
        >
          <option value="all">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="card cards-empty">
          <h2>Unable to load flashcards</h2>
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )}

      {!error && filteredCards.length === 0 && (
        <div className="card cards-empty">
          <h2>{allCards.length ? "No cards found" : "No published flashcards yet"}</h2>
          <p>
            {allCards.length
              ? "Try a different search or subject."
              : "Your administrator has not published flashcards for your class and board yet."}
          </p>
        </div>
      )}

      {!error && filteredCards.length > 0 && (
        <>
          <div className="cards-results">
            Showing {filteredCards.length} of {allCards.length} published cards
          </div>

          <div className="cards-list">
            {filteredCards.map((card) => (
              <article className="card library-card" key={card._id}>
                <div className="library-card-top">
                  <div>
                    {card.subject && (
                      <span className="card-subject">{card.subject}</span>
                    )}
                    {card.chapter && (
                      <span className="card-chapter">{card.chapter}</span>
                    )}
                  </div>
                  <span className="card-status learning">
                    {card.board || "School board"}
                  </span>
                </div>

                <p className="subtitle">{card.setTitle}</p>
                <h2>{card.question}</h2>

                {revealed[card._id] && (
                  <div className="library-answer">
                    <strong>Answer</strong>
                    <p>{card.answer}</p>
                  </div>
                )}

                <div className="library-card-footer">
                  <span className="card-chapter">
                    Class {card.classNumber}
                  </span>
                  <button
                    type="button"
                    className="study-card-button"
                    onClick={() => toggleAnswer(card._id)}
                  >
                    {revealed[card._id] ? "Hide answer" : "Reveal answer"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
