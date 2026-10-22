import React, { useEffect, useState } from "react";
import "./Settings.css";

const DEFAULT_SETTINGS = {
  sessionSize: 10,
  dailyGoal: 10,
  startWeak: true,
  showTips: true,
  studyLanguage: "English",
};

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("memorymesh_settings");
      if (stored) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(stored),
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }, []);

  const updateSetting = (key, value) => {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    localStorage.setItem("memorymesh_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="settings-studio-wrapper">
      {/* Configuration Header */}
      <div className="settings-header-pane">
        <div>
          <span className="settings-tagline">Cognitive Engine Configuration</span>
          <h1 className="settings-main-title">Learning Preferences</h1>
          <p className="settings-main-subtitle">
            Configure default interval session sizes, priority ordering algorithms, and multilingual study prompts.
          </p>
        </div>

        <div className="settings-status-badge">
          <span className="badge-status-dot" />
          <span className="badge-status-text">Client Preferences Synced</span>
        </div>
      </div>

      <div className="settings-console-card">
        {/* SECTION 1: COGNITIVE RECALL ENGINE */}
        <div className="settings-block">
          <div className="settings-block-header">
            <div>
              <h3>Spaced Repetition Engine</h3>
              <p>Tailor how active recall sessions are prioritized and batched.</p>
            </div>
            <span className="section-pill">Algorithm</span>
          </div>

          <div className="settings-items-list">
            <div className="settings-tile">
              <div className="tile-info">
                <strong>Default Session Batch Size</strong>
                <span>The maximum number of scheduled cards queued when launching a review cycle.</span>
              </div>
              <div className="tile-control">
                <select
                  value={settings.sessionSize}
                  onChange={(e) => updateSetting("sessionSize", Number(e.target.value))}
                  className="settings-select"
                >
                  <option value={10}>10 Cards (Recommended)</option>
                  <option value={20}>20 Cards</option>
                  <option value={30}>30 Cards</option>
                </select>
              </div>
            </div>

            <div className="settings-tile">
              <div className="tile-info">
                <strong>Prioritize Low-Mastery Cards</strong>
                <span>Position difficult and forgotten concepts at the beginning of each queue.</span>
              </div>
              <div className="tile-control">
                <button
                  type="button"
                  className={`toggle-switch-track ${settings.startWeak ? "active" : ""}`}
                  onClick={() => updateSetting("startWeak", !settings.startWeak)}
                  aria-pressed={settings.startWeak}
                >
                  <span className="toggle-switch-thumb" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-block-divider" />

        {/* SECTION 2: STUDY EXPERIENCE & GOALS */}
        <div className="settings-block">
          <div className="settings-block-header">
            <div>
              <h3>Study Workspace & Goals</h3>
              <p>Personalize translation prompts, daily targets, and heuristic assistance.</p>
            </div>
            <span className="section-pill">Workspace</span>
          </div>

          <div className="settings-items-list">
            <div className="settings-tile">
              <div className="tile-info">
                <strong>Study Language</strong>
                <span>AI explanations and chapter aids will display in your selected language alongside English.</span>
              </div>
              <div className="tile-control">
                <select
                  value={settings.studyLanguage}
                  onChange={(e) => updateSetting("studyLanguage", e.target.value)}
                  className="settings-select"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Malayalam">Malayalam (മലയാളം)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                  <option value="Urdu">Urdu (اردو)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Portuguese">Portuguese (Português)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="Chinese">Chinese (中文)</option>
                  <option value="Korean">Korean (한국어)</option>
                  <option value="Arabic">Arabic (العربية)</option>
                </select>
              </div>
            </div>

            <div className="settings-tile">
              <div className="tile-info">
                <strong>Daily Target Volume</strong>
                <span>Target completed cards per day to maintain active learning streaks.</span>
              </div>
              <div className="tile-control">
                <select
                  value={settings.dailyGoal}
                  onChange={(e) => updateSetting("dailyGoal", Number(e.target.value))}
                  className="settings-select"
                >
                  <option value={5}>5 Reviews / Day</option>
                  <option value={10}>10 Reviews / Day (Standard)</option>
                  <option value={20}>20 Reviews / Day</option>
                  <option value={30}>30 Reviews / Day</option>
                </select>
              </div>
            </div>

            <div className="settings-tile">
              <div className="tile-info">
                <strong>Contextual Recall Hints</strong>
                <span>Provide mnemonic clues and memory prompts when lingering on a question.</span>
              </div>
              <div className="tile-control">
                <button
                  type="button"
                  className={`toggle-switch-track ${settings.showTips ? "active" : ""}`}
                  onClick={() => updateSetting("showTips", !settings.showTips)}
                  aria-pressed={settings.showTips}
                >
                  <span className="toggle-switch-thumb" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Console Action Footer */}
        <div className="settings-actions-footer">
          {saved && (
            <span className="settings-saved-indicator">
              ✓ Preferences saved to local profile
            </span>
          )}
          <button
            type="button"
            className="settings-save-button"
            onClick={saveSettings}
          >
            Save Preferences →
          </button>
        </div>
      </div>
    </div>
  );
}
