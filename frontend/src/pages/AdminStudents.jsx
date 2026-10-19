
import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import "./Admin.css";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      try {
        setLoading(true);
        setError("");

        const response = await client.get("/admin/students");

        if (!cancelled) {
          setStudents(response.data.students || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              "Could not load student accounts. Please check your admin session."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, []);

  const classes = useMemo(
    () =>
      [...new Set(students.map((student) => student.class).filter(
        (value) => value !== undefined && value !== null && value !== ""
      ))].sort((a, b) => Number(a) - Number(b)),
    [students]
  );

  const boards = useMemo(
    () =>
      [...new Set(students.map((student) => student.board).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b))),
    [students]
  );

  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      student.name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query);

    const matchesClass =
      classFilter === "all" || String(student.class) === classFilter;

    const matchesBoard =
      boardFilter === "all" || student.board === boardFilter;

    return matchesSearch && matchesClass && matchesBoard;
  });

  function formatDate(value) {
    if (!value) return "Never recorded";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">MEMORYMESH CONTROL CENTER</span>
          <h1>Students</h1>
          <p>Review registered accounts and their learning activity.</p>
        </div>

        <div className="admin-status">
          <span className="admin-status-dot" />
          Administrator
        </div>
      </header>

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-stats" aria-label="Student account statistics">
        <article className="admin-stat-card">
          <span className="admin-stat-icon">👩‍🎓</span>
          <p>Accounts loaded</p>
          <strong>{loading ? "—" : students.length}</strong>
          <span className="admin-stat-note">
            Up to 100 accounts returned by the API
          </span>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">🔎</span>
          <p>Matching students</p>
          <strong>{loading ? "—" : filteredStudents.length}</strong>
          <span className="admin-stat-note">
            Based on the current search and filters
          </span>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">⚡</span>
          <p>XP in loaded accounts</p>
          <strong>
            {loading
              ? "—"
              : students
                  .reduce((total, student) => total + (Number(student.xp) || 0), 0)
                  .toLocaleString()}
          </strong>
          <span className="admin-stat-note">
            Combined experience points for these accounts
          </span>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Student accounts</h2>
            <p>Search and filter the registered student list.</p>
          </div>
          <span className="admin-count">
            {filteredStudents.length} shown
          </span>
        </div>

        <div className="admin-student-filters">
          <label className="admin-search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              aria-label="Search students by name or email"
            />
          </label>

          <label className="admin-filter">
            <span>Class</span>
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
            >
              <option value="all">All classes</option>
              {classes.map((value) => (
                <option key={value} value={String(value)}>
                  Class {value}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-filter">
            <span>Board</span>
            <select
              value={boardFilter}
              onChange={(event) => setBoardFilter(event.target.value)}
            >
              <option value="all">All boards</option>
              {boards.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <button
            className="admin-reset-filters"
            type="button"
            onClick={() => {
              setSearch("");
              setClassFilter("all");
              setBoardFilter("all");
            }}
          >
            Reset filters
          </button>
        </div>

        {loading ? (
          <div className="admin-empty">Loading student accounts...</div>
        ) : error ? (
          <div className="admin-empty">
            Student information is currently unavailable.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="admin-empty">
            {students.length
              ? "No students match these filters."
              : "No student accounts were returned by the API."}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Board</th>
                  <th>XP</th>
                  <th>Streak</th>
                  <th>Registered</th>
                  <th>Last active</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="admin-student">
                        <span className="admin-avatar">
                          {(student.name || "?")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <div>
                          <strong>{student.name || "Unnamed student"}</strong>
                          <span>{student.email || "No email recorded"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {student.class ? `Class ${student.class}` : "—"}
                    </td>
                    <td>{student.board || "—"}</td>
                    <td>{(Number(student.xp) || 0).toLocaleString()}</td>
                    <td>{Number(student.streak) || 0} days</td>
                    <td>{formatDate(student.createdAt)}</td>
                    <td>{formatDate(student.lastActiveDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="admin-footnote">
          This page displays the student accounts returned by the existing
          API, which is currently limited to 100 accounts.
        </p>
      </section>
    </main>
  );
}
