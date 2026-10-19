import { useState } from "react";
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
  const [board, setBoard] = useState("CBSE");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, adminLogin, register } = useAuth();
  const navigate = useNavigate();

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
          class: userClass,
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
          "Unable to continue. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister((current) => !current);
    setError("");
  };

  return (
    <main className="mm-auth-page">
      <section className="mm-auth-shell">
        <aside className="mm-auth-visual">
          <a className="mm-brand" href="/" aria-label="MemoryMesh home">
            <span className="mm-brand-mark">M</span>
            <span>MemoryMesh</span>
          </a>

          <div className="mm-visual-content">
            <span className="mm-eyebrow">
              YOUR LEARNING JOURNEY STARTS HERE
            </span>

            <h1>
              Learn smarter.
              <br />
              <span>Remember longer.</span>
            </h1>

            <p>
              Build better study habits, strengthen your memory, and make
              every learning session count.
            </p>

            <div className="mm-learning-card">
              <div className="mm-card-top">
                <span className="mm-card-icon">âœ¦</span>
                <span className="mm-card-label">YOUR NEXT BIG IDEA</span>
                <span className="mm-live-dot" />
              </div>

              <div className="mm-memory-visual" aria-hidden="true">
                <div className="mm-orbit mm-orbit-one" />
                <div className="mm-orbit mm-orbit-two" />
                <div className="mm-orbit mm-orbit-three" />
                <div className="mm-orbit-core">M</div>
                <span className="mm-node mm-node-one">âœ¦</span>
                <span className="mm-node mm-node-two">+</span>
                <span className="mm-node mm-node-three">â—Ž</span>
                <span className="mm-node mm-node-four">âŒ˜</span>
              </div>

              <div className="mm-card-caption">
                <div>
                  <strong>Connect the dots.</strong>
                  <span>Turn knowledge into lasting memories.</span>
                </div>
                <span className="mm-arrow">â†—</span>
              </div>
            </div>
          </div>

          <div className="mm-visual-footer">
            <span>Curiosity today. Confidence tomorrow.</span>
            <span>MEMORYMESH Â©</span>
          </div>
        </aside>

        <section className="mm-auth-form-side">
          <div className="mm-mobile-brand">
            <span className="mm-brand-mark">M</span>
            <span>MemoryMesh</span>
          </div>

          <div className="mm-form-wrap">
            <div className="mm-form-heading">
              <span className="mm-form-eyebrow">
                {isRegister ? "GET STARTED" : isAdminLogin ? "ADMINISTRATOR ACCESS" : "WELCOME BACK"}
              </span>

              <h2>
                {isRegister ? "Create your account" : isAdminLogin ? "Admin sign in." : "Good to see you."}
              </h2>

              <p>
                {isRegister
                  ? "Set up your account and start learning your way."
                  : "Sign in to continue your learning journey."}
              </p>
            </div>

            <div className="mm-mode-switch" aria-label="Account options" style={{ display: isAdminLogin ? "none" : undefined }}>
              <button
                type="button"
                className={!isRegister ? "active" : ""}
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                }}
              >
                Sign in
              </button>

              <button
                type="button"
                className={isRegister ? "active" : ""}
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                }}
              >
                Create account
              </button>
            </div>

            <form className="mm-auth-form" onSubmit={handleSubmit}>
              {isRegister && (
                <>
                  <div className="mm-field">
                    <label htmlFor="mm-name">Full name</label>
                    <input
                      id="mm-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="mm-form-row">
                    <div className="mm-field">
                      <label htmlFor="mm-class">Class</label>
                      <select
                        id="mm-class"
                        value={userClass}
                        onChange={(e) =>
                          setUserClass(Number(e.target.value))
                        }
                        required
                      >
                        {[5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                          <option key={grade} value={grade}>
                            Class {grade}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mm-field">
                      <label htmlFor="mm-board">Board</label>
                      <select
                        id="mm-board"
                        value={board}
                        onChange={(e) => setBoard(e.target.value)}
                        required
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State">State</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="mm-field">
                <label htmlFor="mm-email">Email address</label>
                <input
                  id="mm-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mm-field">
                <label htmlFor="mm-password">Password</label>

                <div className="mm-password-wrap">
                  <input
                    id="mm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    required
                  />

                  <button
                    className="mm-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mm-error" role="alert">
                  <span aria-hidden="true">!</span>
                  {error}
                </div>
              )}

              <button
                className="mm-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                    ? "Create my account"
                    : "Sign in to MemoryMesh"}
                {!loading && <span aria-hidden="true">â†’</span>}
              </button>
            </form>

            <button type="button" onClick={() => { setIsAdminLogin(value => !value); setIsRegister(false); setError(""); }} style={{ display: "block", margin: "16px auto", background: "none", border: 0, color: "#269d18", cursor: "pointer", fontWeight: 700 }}>{isAdminLogin ? "← Back to student login" : "Admin Login"}</button>
<p className="mm-switch-copy" style={{ display: isAdminLogin ? "none" : undefined }}> 
              {isRegister
                ? "Already have an account?"
                : "New to MemoryMesh?"}{" "}
              <button type="button" onClick={toggleMode}>
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </p>

            <div className="mm-form-bottom">
              <span className="mm-security-icon">âœ“</span>
              Your learning journey, securely connected.
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}



