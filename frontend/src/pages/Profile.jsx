import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import "./Profile.css";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [userClass, setUserClass] = useState(10);
  const [board, setBoard] = useState("State");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await client.get("/auth/me");

        if (active) {
          setName(data.name || "");
          setUserClass(data.class || 10);
          setBoard(data.board || "State");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (active) {
          setError(
            err.response?.data?.error ||
              "Unable to load your profile details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await client.put("/auth/profile", {
        name,
        class: Number(userClass),
        board: "State",
      });

      if (data?.user) {
        updateUser(data.user);
        setName(data.user.name);
        setUserClass(data.user.class);
        setBoard(data.user.board || "State");
      }

      setSuccess("Profile settings successfully updated.");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(
        err.response?.data?.error || "Unable to save your profile changes."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-studio-wrapper">
        <div className="profile-loading-state">
          <div className="profile-spinner" />
          <p>Retrieving student credentials...</p>
        </div>
      </div>
    );
  }

  const initial = name ? name.trim().charAt(0).toUpperCase() : "S";

  return (
    <div className="profile-studio-wrapper">
      {/* Header */}
      <div className="profile-header-pane">
        <div>
          <span className="profile-tagline">Student Account Administration</span>
          <h1 className="profile-main-title">Profile Settings</h1>
          <p className="profile-main-subtitle">
            Manage your verified identity, educational grade tier, and curriculum board parameters.
          </p>
        </div>

        <div className="profile-status-badge">
          <span className="status-grade-text">Class {userClass}</span>
          <span className="status-board-text">{board} Board</span>
        </div>
      </div>

      {/* Profile Card Console */}
      <div className="profile-console-card">
        {/* User Identity Mini-Bar */}
        <div className="profile-avatar-bar">
          <div className="profile-avatar-circle">{initial}</div>
          <div className="profile-avatar-details">
            <h3>{name || "Enrolled Student"}</h3>
            <p>{user?.email || "student@memorymesh.internal"}</p>
          </div>
          <div className="profile-verified-chip">
            <span className="chip-dot" /> Verified Academic Account
          </div>
        </div>

        {error && (
          <div className="profile-alert-banner alert-error" role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div className="profile-alert-banner alert-success" role="alert">
            <span>✓ {success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="profile-form-grid">
          <div className="profile-field-group">
            <label className="field-label">Student Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="profile-input"
            />
          </div>

          <div className="profile-field-group">
            <label className="field-label">
              Academic Email Address <span className="field-locked-tag">🔒 Read-Only</span>
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="profile-input input-disabled"
            />
            <span className="field-hint-text">
              Institutional email identifiers are permanently bound to your study logs.
            </span>
          </div>

          <div className="profile-row-split">
            <div className="profile-field-group">
              <label className="field-label">Academic Class Tier</label>
              <select
                value={userClass}
                onChange={(e) => setUserClass(Number(e.target.value))}
                className="profile-select"
              >
                {[5, 6, 7, 8, 9, 10].map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
              <span className="field-hint-text">Active range: Class 5 to Class 10.</span>
            </div>

            <div className="profile-field-group">
              <label className="field-label">Education Board</label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="profile-select"
              >
                <option value="State">State Board</option>
              </select>
              <span className="field-hint-text">Strictly isolated to State syllabus.</span>
            </div>
          </div>

          <div className="profile-actions-bar">
            <button
              type="submit"
              disabled={saving}
              className="profile-submit-btn"
            >
              {saving ? "Saving Changes..." : "Save Profile Changes →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
