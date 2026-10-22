import AdminTextbookUpload from "./AdminTextbookUpload.jsx";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import client from "../api/client";
import AdminContentLibrary from "./AdminContentLibrary";
import "./AdminSection.css";

const sectionInfo = {
  students: ["Students", "Review student accounts and learning activity."],
  analytics: ["Analytics", "Understand engagement and learning progress."],
  notes: ["Notes management", "Create and maintain shared study notes."],
  textbooks: ["Textbook management", "Organize textbooks and chapter resources."],
  flashcards: ["Flashcard management", "Prepare shared revision cards for students."],
  quizzes: ["Quiz management", "Organize shared quizzes and question banks."],
  content: ["Content library", "Manage learning resources in one place."],
  settings: ["Admin settings", "Manage administrator preferences."],
  profile: ["Admin profile", "View your administrator account."],
};

function MetricCard({ label, value, detail, symbol }) {
  return (
    <article className="analytics-metric">
      <div className="analytics-metric-top">
        <span>{label}</span>
        <span className="analytics-metric-icon">{symbol}</span>
      </div>
      <div className="analytics-metric-value">{value}</div>
      <div className="analytics-metric-detail">{detail}</div>
    </article>
  );
}

function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const response = await client.get("/admin/analytics");
        if (!cancelled) setData(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              "Could not load analytics. Check your admin session and backend."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const overview = data?.overview;
  const activity = data?.weeklyActivity || [];
  const topics = data?.weakTopics || [];
  const maxReviews = Math.max(1, ...activity.map((day) => day.reviews || 0));

  return (
    <main className="admin-section-page analytics-page">
      <div className="admin-section-kicker">ADMINISTRATION / INSIGHTS</div>
      <div className="analytics-heading-row">
        <div>
          <h1>Learning Analytics</h1>
          <p className="admin-section-description">
            Monitor engagement, review activity, and learning progress.
          </p>
        </div>
        <button
          type="button"
          className="analytics-refresh"
          onClick={() => setReloadKey((key) => key + 1)}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh data"}
        </button>
      </div>

      {error && (
        <div className="analytics-error" role="alert">
          <strong>Analytics unavailable</strong>
          <p>{error}</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </div>
      )}

      {loading && !data ? (
        <div className="analytics-message" role="status">
          Loading analytics from your database...
        </div>
      ) : data ? (
        <>
          <section className="analytics-metrics" aria-label="Overview metrics">
            <MetricCard
              label="Total students"
              value={overview?.totalStudents ?? 0}
              detail="Registered student accounts"
              symbol="♙"
            />
            <MetricCard
              label="Active students"
              value={overview?.activeStudents ?? 0}
              detail="Active in the last 7 days"
              symbol="↗"
            />
            <MetricCard
              label="Flashcards"
              value={overview?.totalCards ?? 0}
              detail="Cards across student accounts"
              symbol="▤"
            />
            <MetricCard
              label="Total reviews"
              value={overview?.totalReviews ?? 0}
              detail="Recorded card reviews"
              symbol="✓"
            />
          </section>

          <section className="analytics-panel">
            <div className="analytics-panel-heading">
              <div>
                <h2>Weekly review activity</h2>
                <p>Reviews recorded each day over the last seven days</p>
              </div>
              <span className="analytics-pill">Last 7 days</span>
            </div>

            {activity.length ? (
              <div className="analytics-chart" role="img" aria-label="Bar chart showing daily review counts">
                {activity.map((day) => {
                  const height = day.reviews
                    ? Math.max(5, (day.reviews / maxReviews) * 100)
                    : 0;

                  return (
                    <div className="analytics-chart-day" key={day.date}>
                      <span className="analytics-chart-value">{day.reviews}</span>
                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar"
                          style={{ height: `${height}%` }}
                          title={`${day.reviews} reviews`}
                        />
                      </div>
                      <span className="analytics-chart-label">
                        {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                          undefined,
                          { weekday: "short" }
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="analytics-empty">No weekly activity data is available yet.</p>
            )}
          </section>

          <section className="analytics-progress-grid">
            <article className="analytics-panel analytics-progress-card">
              <h2>Review accuracy</h2>
              <div className="analytics-progress-number">{overview?.accuracy ?? 0}%</div>
              <div
                className="analytics-progress-track"
                role="progressbar"
                aria-label="Review accuracy"
                aria-valuenow={overview?.accuracy ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="analytics-progress-fill"
                  style={{ width: `${Math.max(0, Math.min(100, overview?.accuracy ?? 0))}%` }}
                />
              </div>
              <p>Correct answers out of all recorded reviews</p>
              <div className="analytics-small-stat">
                {overview?.totalCorrect ?? 0} correct answers
              </div>
            </article>

            <article className="analytics-panel analytics-progress-card">
              <h2>Card mastery</h2>
              <div className="analytics-progress-number">{overview?.mastery ?? 0}%</div>
              <div
                className="analytics-progress-track mastery-track"
                role="progressbar"
                aria-label="Card mastery"
                aria-valuenow={overview?.mastery ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="analytics-progress-fill mastery-fill"
                  style={{ width: `${Math.max(0, Math.min(100, overview?.mastery ?? 0))}%` }}
                />
              </div>
              <p>Share of cards marked as mastered</p>
              <div className="analytics-small-stat">
                {overview?.masteredCards ?? 0} mastered cards
              </div>
            </article>
          </section>

          <section className="analytics-panel analytics-topics-panel">
            <div className="analytics-panel-heading">
              <div>
                <h2>Topics needing attention</h2>
                <p>Topics with mastery below 70%, ordered by lowest mastery</p>
              </div>
              <span className="analytics-pill">
                {topics.length} {topics.length === 1 ? "topic" : "topics"}
              </span>
            </div>

            {topics.length ? (
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Chapter</th>
                      <th>Mastery</th>
                      <th>Accuracy</th>
                      <th>Reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((topic, index) => (
                      <tr key={`${topic.subject}-${topic.chapter}-${index}`}>
                        <td>{topic.subject}</td>
                        <td>{topic.chapter}</td>
                        <td>
                          <span className="analytics-mastery-badge">
                            {topic.mastery}%
                          </span>
                        </td>
                        <td>{topic.accuracy}%</td>
                        <td>{topic.reviews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="analytics-empty">
                No weak topics found, or there are not enough cards to calculate topic mastery.
              </div>
            )}
          </section>
          <p className="analytics-footnote">
            Metrics reflect the data currently recorded in MemoryMesh.
          </p>
        </>
      ) : !error ? (
        <div className="analytics-message">No analytics data was returned.</div>
      ) : null}
    </main>
  );
}


function StudentPerformanceDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      setLoading(true);
      setError("");
      try {
        const response = await client.get("/admin/students-performance");
        if (!cancelled) setStudents(response.data?.students || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
            "Could not load students. Check your admin session and backend."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStudents();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const filteredStudents = students
    .filter((student) => {
      const query = search.trim().toLowerCase();
      return !query ||
        [student.name, student.email, String(student.class), student.board]
          .some((value) => String(value || "").toLowerCase().includes(query));
    })
    .sort((a, b) => {
      if (sortBy === "accuracy") return b.accuracy - a.accuracy;
      if (sortBy === "mastery") return b.mastery - a.mastery;
      if (sortBy === "cards") return b.totalCards - a.totalCards;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const dateA = a.lastActiveDate ? new Date(a.lastActiveDate).getTime() : 0;
      const dateB = b.lastActiveDate ? new Date(b.lastActiveDate).getTime() : 0;
      return dateB - dateA;
    });

  const activeCount = students.filter((student) =>
    student.lastActiveDate &&
    Date.now() - new Date(student.lastActiveDate).getTime() <= 7 * 86400000
  ).length;

  const formatDate = (value) => value
    ? new Date(value).toLocaleDateString()
    : "No activity recorded";

  const average = (field) => students.length
    ? Math.round(students.reduce((sum, student) => sum + (student[field] || 0), 0) / students.length)
    : 0;

  return (
    <main className="admin-section-page student-performance-page">
      <div className="admin-section-kicker">ADMINISTRATION / STUDENTS</div>
      <div className="analytics-heading-row">
        <div>
          <h1>Student Performance</h1>
          <p className="admin-section-description">
            Review learning activity, flashcard progress, and quiz results for each student.
          </p>
        </div>
        <button
          type="button"
          className="analytics-refresh"
          onClick={() => setReloadKey((key) => key + 1)}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh data"}
        </button>
      </div>

      {error && (
        <div className="analytics-error" role="alert">
          <strong>Student data unavailable</strong>
          <p>{error}</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </div>
      )}

      <section className="analytics-metrics" aria-label="Student summary">
        <MetricCard label="Total students" value={students.length} detail="Student accounts" symbol="♙" />
        <MetricCard label="Active this week" value={activeCount} detail="Activity in the last 7 days" symbol="↗" />
        <MetricCard label="Average accuracy" value={`${average("accuracy")}%`} detail="Across students' recorded reviews" symbol="✓" />
        <MetricCard label="Average mastery" value={`${average("mastery")}%`} detail="Cards marked as mastered" symbol="▤" />
      </section>

      <section className="analytics-panel">
        <div className="student-tools">
          <input
            className="student-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, class, or board..."
            aria-label="Search students"
          />
          <select
            className="student-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort students"
          >
            <option value="recent">Sort: Recent activity</option>
            <option value="name">Sort: Name A–Z</option>
            <option value="accuracy">Sort: Highest accuracy</option>
            <option value="mastery">Sort: Highest mastery</option>
            <option value="cards">Sort: Most flashcards</option>
          </select>
        </div>

        {loading && students.length === 0 ? (
          <p className="analytics-message">Loading student records...</p>
        ) : (
          <div className="analytics-table-wrap">
            <table className="analytics-table student-performance-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class / Board</th>
                  <th>Flashcards</th>
                  <th>Review accuracy</th>
                  <th>Mastery</th>
                  <th>Quiz average</th>
                  <th>XP / Streak</th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                      <div className="student-email">{student.email}</div>
                    </td>
                    <td>{student.class ?? "—"} / {student.board || "—"}</td>
                    <td>
                      <strong>{student.totalCards}</strong>
                      <div className="student-substat">{student.masteredCards} mastered</div>
                    </td>
                    <td>
                      <span className="analytics-mastery-badge">{student.accuracy}%</span>
                      <div className="student-substat">{student.totalReviews} reviews</div>
                    </td>
                    <td>
                      <span className="analytics-mastery-badge">{student.mastery}%</span>
                    </td>
                    <td>
                      {student.quizAverage == null ? "—" : `${student.quizAverage}%`}
                      <div className="student-substat">{student.quizCount} quizzes</div>
                    </td>
                    <td>{student.xp} XP / {student.streak} days</td>
                    <td>{formatDate(student.lastActiveDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <p className="analytics-empty">
                {students.length ? "No students match your search." : "No student accounts were found."}
              </p>
            )}
          </div>
        )}
        <p className="analytics-footnote">
          Showing {filteredStudents.length} of {students.length} students. Values reflect data currently stored in MemoryMesh.
        </p>
      </section>
    </main>
  );
}
export default function AdminSection() {
  const location = useLocation();
  const section = location.pathname.split("/").filter(Boolean).at(-1);
  const [title, description] = sectionInfo[section] || [
    "Admin workspace",
    "Choose a section from the sidebar.",
  ];

  if (section === "analytics") return <AnalyticsDashboard />;
  if (section === "content") return <AdminContentLibrary />;
  if (section === "students") return <StudentPerformanceDashboard />;
  if (section === "textbooks") return <AdminTextbookUpload />;

  return (
    <main className="admin-section-page">
      <div className="admin-section-kicker">ADMINISTRATION</div>
      <h1>{title}</h1>
      <p className="admin-section-description">{description}</p>
      <section className="admin-section-placeholder">
        <div className="admin-section-symbol">✦</div>
        <h2>{title} workspace</h2>
        <p>
          This page is part of the admin dashboard roadmap. Its management
          functions will be connected in the next implementation steps.
        </p>
        <span className="admin-section-status">Layout ready · Features pending</span>
      </section>
    </main>
  );
}



