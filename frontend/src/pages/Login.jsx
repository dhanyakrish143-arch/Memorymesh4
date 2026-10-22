import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userClass, setUserClass] = useState(10);
  const [board, setBoard] = useState("State");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, adminLogin, register } = useAuth();
  const navigate = useNavigate();

  const handleRoleToggle = (adminMode) => {
    setIsAdminLogin(adminMode);
    if (adminMode) setIsRegister(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          class: Number(userClass),
          board,
        });
      } else {
        if (isAdminLogin) {
          await adminLogin(email, password);
        } else {
          await login(email, password);
        }
      }

      const savedUser = JSON.parse(localStorage.getItem("user") || "null");
      navigate(savedUser?.role === "admin" ? "/admin" : "/learn", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-stage-root">
      <div className="mesh-gradient-1" />
      <div className="mesh-gradient-2" />
      <div className="mesh-grid" />

      <div className="login-frame-container">
        {/* LEFT COLUMN: ARCHITECTURAL PLATFORM VALUE */}
        <div className="stage-left">
          <div className="brand-badge-group">
            <div className="brand-cube">M</div>
            <div>
              <span className="brand-logo-text">MemoryMesh</span>
              <span className="brand-tagline-text">Curriculum & Recall Studio</span>
            </div>
          </div>

          <div className="hero-text-block">
            <h1 className="hero-heading">
              Smarter syllabus retention through spaced repetition.
            </h1>
            <p className="hero-subheading">
              Automated cognitive recall intervals and verified learning materials
              strictly organized for your board curriculum.
            </p>
          </div>

          {/* Clean Metric Highlights (Replaced the fake flashcard) */}
          <div className="platform-highlights-grid">
            <div className="highlight-metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-info">
                <strong>Curriculum Isolation</strong>
                <span>Only published textbooks & notes matching your exact class & board.</span>
              </div>
            </div>

            <div className="highlight-metric-card">
              <div className="metric-icon">⚡</div>
              <div className="metric-info">
                <strong>Spaced Interval Scheduling</strong>
                <span>Scientific 1d, 3d, and 7d review queues to prevent forgetting curves.</span>
              </div>
            </div>

            <div className="highlight-metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-info">
                <strong>Active Progress Analytics</strong>
                <span>Live accuracy scoring, streak records, and completion insights.</span>
              </div>
            </div>
          </div>

          <div className="stage-proof-pills">
            <div className="proof-pill">
              <span className="pill-dot" /> Class 5 to 10 Supported
            </div>
            <div className="proof-pill">
              <span>🔒</span> Session Encrypted
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MODERN FROSTED CONSOLE */}
        <div className="stage-right">
          <div className="auth-glass-box">
            {/* Segmented Switcher */}
            <div className="auth-tab-segment">
              <button
                type="button"
                className={`tab-segment-btn ${!isAdminLogin ? "active" : ""}`}
                onClick={() => handleRoleToggle(false)}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className={`tab-segment-btn ${isAdminLogin ? "active" : ""}`}
                onClick={() => handleRoleToggle(true)}
              >
                ⚡ Admin
              </button>
            </div>

            <div className="auth-box-header">
              <h2>{isAdminLogin ? "Admin Sign In" : isRegister ? "Create Account" : "Sign In"}</h2>
              <p>
                {isAdminLogin
                  ? "Access administrative console and curriculum publishing."
                  : isRegister
                  ? "Select your class and board to unlock syllabus notes."
                  : "Welcome back! Enter your details to continue."}
              </p>
            </div>

            {error && (
              <div className="auth-alert-banner">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-inputs-stack">
              {isRegister && (
                <div className="auth-input-item">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input-field"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="auth-input-item">
                <label>Academic Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input-field"
                  autoComplete="email"
                />
              </div>

              <div className="auth-input-item">
                <div className="label-row-between">
                  <label>Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn-text-reveal"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input-field"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </div>

              {isRegister && (
                <div className="auth-grid-split">
                  <div className="auth-input-item">
                    <label>Grade / Class</label>
                    <select
                      value={userClass}
                      onChange={(e) => setUserClass(Number(e.target.value))}
                      className="auth-select-field"
                    >
                      {[5, 6, 7, 8, 9, 10].map((cls) => (
                        <option key={cls} value={cls}>
                          Class {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="auth-input-item">
                    <label>Board</label>
                    <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="auth-select-field"
                  >
                    <option value="State">State</option>
                  </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`auth-action-btn ${isAdminLogin ? "admin-action" : ""}`}
              >
                {loading
                  ? "Authenticating..."
                  : isAdminLogin
                  ? "Authorize Console Access →"
                  : isRegister
                  ? "Complete Registration →"
                  : "Sign In →"}
              </button>
            </form>

            {!isAdminLogin && (
              <div className="auth-switch-caption">
                {isRegister ? (
                  <p>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(false);
                        setError("");
                      }}
                      className="btn-switch-link"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    New to MemoryMesh?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(true);
                        setError("");
                      }}
                      className="btn-switch-link"
                    >
                      Create student account
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

