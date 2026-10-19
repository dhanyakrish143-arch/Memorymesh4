import { useEffect, useState } from "react";
import client from "../api/client";
import "./Admin.css";

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [overviewResponse, studentsResponse] = await Promise.all([
          client.get("/admin/overview"),
          client.get("/admin/students"),
        ]);

        if (!cancelled) {
          setOverview(overviewResponse.data);
          setStudents(studentsResponse.data.students || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              "Could not load the dashboard. Please sign in again if your session expired."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      student.name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">MEMORYMESH CONTROL CENTER</span>
          <h1>Admin Dashboard</h1>
          <p>Monitor student activity and learning progress.</p>
        </div>
        <div className="admin-status">
          <span className="admin-status-dot" />
          Administrator
        </div>
      </header>

      {error && <div className="admin-error" role="alert">{error}</div>}

      <section className="admin-stats" aria-label="Student statistics">
        <article className="admin-stat-card">
          <span className="admin-stat-icon">👩‍🎓</span>
          <p>Total students</p>
          <strong>{loading ? "—" : overview?.totalStudents ?? 0}</strong>
          <span className="admin-stat-note">Registered student accounts</span>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">⚡</span>
          <p>Active this week</p>
          <strong>{loading ? "—" : overview?.activeStudents ?? 0}</strong>
          <span className="admin-stat-note">Activity recorded in the last 7 days</span>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon">✨</span>
          <p>Total XP earned</p>
          <strong>
            {loading ? "—" : (overview?.totalXp ?? 0).toLocaleString()}
          </strong>
          <span className="admin-stat-note">Combined student experience points</span>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Student Management</h2>
            <p>Review registered students and their learning progress.</p>
          </div>
          <span className="admin-count">{filteredStudents.length} students</span>
        </div>

        <div className="admin-search-wrap">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student name or email..."
            aria-label="Search students"
          />
        </div>

        {loading ? (
          <div className="admin-empty">Loading student data...</div>
        ) : error ? (
          <div className="admin-empty">Student information is unavailable.</div>
        ) : filteredStudents.length === 0 ? (
          <div className="admin-empty">
            {students.length ? "No students match your search." : "No students registered yet."}
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
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="admin-student">
                        <span className="admin-avatar">
                          {(student.name || "?").trim().charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{student.name || "Unnamed student"}</strong>
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{student.class ? `Class ${student.class}` : "—"}</td>
                    <td>{student.board || "—"}</td>
                    <td>{(student.xp || 0).toLocaleString()}</td>
                    <td>{student.streak || 0} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="admin-footnote">The table displays up to 100 registered students.</p>
      </section>
    </main>
  );
}
