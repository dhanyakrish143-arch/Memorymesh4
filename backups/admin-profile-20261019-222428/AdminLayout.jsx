import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AdminLayout.css";

const sections = [
  { path: "/admin", label: "Dashboard", icon: "▦", end: true },
  { path: "/admin/students", label: "Students", icon: "♙" },
  { path: "/admin/analytics", label: "Analytics", icon: "▥" },
  { path: "/admin/notes", label: "Notes", icon: "▤" },
  { path: "/admin/textbooks", label: "Textbooks", icon: "▣" },
  { path: "/admin/flashcards", label: "Flashcards", icon: "◇" },
  { path: "/admin/quizzes", label: "Quizzes", icon: "✓" },
  { path: "/admin/content", label: "Content library", icon: "▧" },
  { path: "/admin/settings", label: "Settings", icon: "⚙" },
  { path: "/admin/profile", label: "Admin profile", icon: "◎" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">M</span>
          <span>
            <strong>MemoryMesh</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </div>

        <div className="admin-nav-caption">WORKSPACE</div>
        <nav className="admin-navigation">
          {sections.map((section) => (
            <NavLink
              key={section.path}
              to={section.path}
              end={section.end}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " is-active" : ""}`
              }
            >
              <span className="admin-nav-icon">{section.icon}</span>
              <span>{section.label}</span>
              {section.end && <span className="admin-nav-indicator" />}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-account">
            <span className="admin-account-avatar">
              {(user?.name || "A").trim().charAt(0).toUpperCase()}
            </span>
            <span className="admin-account-info">
              <strong>{user?.name || "Administrator"}</strong>
              <small>Administrator access</small>
            </span>
          </div>
          <button
            className="admin-signout"
            type="button"
            onClick={() => {
              logout();
              navigate("/admin-login", { replace: true });
            }}
          >
            ↪ Sign out
          </button>
          <a className="admin-student-link" href="/">
            Student site
          </a>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-label">MEMORYMESH / ADMIN</span>
            <strong>Administration workspace</strong>
          </div>
          <span className="admin-secure-badge">
            <span /> Secure admin session
          </span>
        </header>

        <div className="admin-outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
