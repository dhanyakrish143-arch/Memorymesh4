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

  // Strict Class 5 - 10 Platform Curriculum Scope
  const classes = [5, 6, 7, 8, 9, 10];

  const boards = useMemo(
    () =>
      [...new Set(students.map((student) => student.board).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b))),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const name = String(student.name || "").toLowerCase();
      const email = String(student.email || "").toLowerCase();
      const studentClass = String(student.class ?? "");
      const studentBoard = String(student.board || "");

      const matchesSearch = !term || name.includes(term) || email.includes(term);
      const matchesClass = classFilter === "all" || studentClass === classFilter;
      const matchesBoard = boardFilter === "all" || studentBoard === boardFilter;

      return matchesSearch && matchesClass && matchesBoard;
    });
  }, [students, search, classFilter, boardFilter]);

  const resetFilters = () => {
    setSearch("");
    setClassFilter("all");
    setBoardFilter("all");
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">MemoryMesh Control Center</span>
          <h1>Students</h1>
          <p>Review registered accounts and their learning activity.</p>
        </div>
        <div className="admin-status">
          <span className="admin-status-dot" />
          <span>Administrator</span>
        </div>
      </header>

      {error && (
        <div className="admin-error-banner" role="alert">
          <strong>Unable to load students:</strong> {error}
        </div>
      )}

      <section className="admin-stats" aria-label="Student directory metrics">
        <article className="admin-stat-card">
          <span className="admin-stat-icon">👥</span>
          <p>Accounts loaded</p>
          <strong>{loading ? "—" : students.length}</strong>
          <span className="admin-stat-note">Up to 100 accounts returned by the API</span>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">🔍</span>
          <p>Matching students</p>
          <strong>{loading ? "—" : filteredStudents.length}</strong>
          <span className="admin-stat-note">Based on the current search and filters</span>
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
          <span className="admin-stat-note">Combined experience points for these accounts</span>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Student accounts</h2>
            <p>Search and filter the registered student list.</p>
          </div>
          <span className="admin-count">{filteredStudents.length} shown</span>
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

          {(search || classFilter !== "all" || boardFilter !== "all") && (
            <button
              type="button"
              className="admin-reset-btn"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="admin-table-loading">Loading student records...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="admin-table-empty">
            <p>No student accounts matched your query.</p>
            <button type="button" onClick={resetFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Board</th>
                  <th>XP</th>
                  <th>Streak</th>
                  <th>Registered</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id || student._id}>
                    <td>
                      <div className="admin-student">
                        <span className="admin-avatar">
                          {(student.name || "S").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{student.name || "Unnamed student"}</strong>
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>Class {student.class ?? "—"}</td>
                    <td>{student.board || "State"}</td>
                    <td>{student.xp ?? 0}</td>
                    <td>{student.streak ?? 0} days</td>
                    <td>
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>
                      {student.lastActive
                        ? new Date(student.lastActive).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="admin-footnote">
          This page displays the student accounts returned by the existing API, which is currently limited to 100 accounts.
        </p>
      </section>
    </div>
  );
}
