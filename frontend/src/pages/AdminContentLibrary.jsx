import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import "./AdminContentLibrary.css";

const TYPES = ["All types", "Note", "Textbook", "Flashcard Set", "Quiz"];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default function AdminContentLibrary() {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({});
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All types");
  const [status, setStatus] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadLibrary() {
      setLoading(true);
      setError("");

      try {
        const response = await client.get("/admin/content-library");
        if (cancelled) return;

        setItems(response.data?.items || []);
        setTotals(response.data?.totals || {});
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              "Could not load the content library. Check your admin session and backend."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLibrary();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const statuses = useMemo(
    () => ["All statuses", ...new Set(items.map((item) => item.status).filter(Boolean))],
    [items]
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesType = type === "All types" || item.type === type;
      const matchesStatus = status === "All statuses" || item.status === status;
      const searchable = [
        item.title,
        item.type,
        item.subject,
        item.chapter,
        item.board,
        item.classNumber,
        item.status,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return matchesType && matchesStatus && (!query || searchable.includes(query));
    });
  }, [items, search, type, status]);

  return (
    <main className="admin-section-page content-library-page">
      <div className="admin-section-kicker">ADMINISTRATION / RESOURCES</div>
      <div className="content-library-heading">
        <div>
          <h1>Content library</h1>
          <p className="admin-section-description">
            Search and review shared learning resources in one place.
          </p>
        </div>
        <button
          className="content-library-refresh"
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <section className="content-library-metrics" aria-label="Resource totals">
        {[
          ["All resources", totals.all],
          ["Notes", totals.notes],
          ["Textbooks", totals.textbooks],
          ["Flashcard sets", totals.flashcardSets],
          ["Quizzes", totals.quizzes],
        ].map(([label, value]) => (
          <article className="content-library-metric" key={label}>
            <span>{label}</span>
            <strong>{loading ? "…" : value ?? 0}</strong>
          </article>
        ))}
      </section>

      <section className="content-library-panel">
        <div className="content-library-toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, subject, chapter, class…"
            aria-label="Search content"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="Filter by resource type"
          >
            {TYPES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            {statuses.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="content-library-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <p className="content-library-message">Loading learning resources…</p>
        ) : !error && filteredItems.length === 0 ? (
          <p className="content-library-message">
            {items.length
              ? "No resources match your search and filters."
              : "No shared learning resources were found yet."}
          </p>
        ) : !error ? (
          <>
            <div className="content-library-table-wrap">
              <table className="content-library-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Type</th>
                    <th>Class / Board</th>
                    <th>Status</th>
                    <th>Details</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`}>
                      <td>
                        <strong>{item.title || "Untitled resource"}</strong>
                        <span className="content-library-subtitle">
                          {[item.subject, item.chapter].filter(Boolean).join(" · ") || "No subject details"}
                        </span>
                      </td>
                      <td>{item.type}</td>
                      <td>
                        {item.classNumber ? `Class ${item.classNumber}` : "—"}
                        <span className="content-library-subtitle">{item.board || "—"}</span>
                      </td>
                      <td>
                        <span className={`content-library-status ${item.status === "Published" || item.status === "Active" || item.status === "Shared" ? "is-live" : "is-draft"}`}>
                          {item.status || "Unknown"}
                        </span>
                      </td>
                      <td>{item.count || "—"}</td>
                      <td>{formatDate(item.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="content-library-footer">
              Showing {filteredItems.length} of {items.length} resources
            </div>
          </>
        ) : null}
      </section>

      <section className="content-library-shortcuts">
        <h2>Manage resources</h2>
        <p>Open the existing tools to create, edit, publish, or remove resource sets.</p>
        <div className="content-library-links">
          <Link to="/admin/notes">Notes management</Link>
          <Link to="/admin/textbooks">Textbook management</Link>
          <Link to="/admin/flashcards">Flashcard management</Link>
          <Link to="/admin/quizzes">Quiz management</Link>
        </div>
        <p className="content-library-note">
          This library is a searchable overview. Existing Flashcards and Quizzes pages
          remain the editing tools; Notes and Textbooks management pages are not yet
          connected to editing forms.
        </p>
      </section>
    </main>
  );
}
