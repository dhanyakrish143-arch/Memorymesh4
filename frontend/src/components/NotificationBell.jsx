import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import client from "../api/client";

export default function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const response = await client.get("/notifications");
      setUnreadCount(response.data.unreadCount || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  const isActive = location.pathname === "/notifications";

  return (
    <div className="notification-wrap" style={{ padding: "0 0 10px 0" }}>
      <button
        type="button"
        className={`sidebar-link ${isActive ? "active" : ""}`}
        onClick={() => navigate("/notifications")}
        style={{ width: "100%", border: "none", cursor: "pointer", background: isActive ? "#ecfdf5" : "transparent" }}
      >
        <span className="sidebar-link-icon" style={{ color: isActive ? "#10b981" : "#64748b" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </span>
        <span style={{ flex: 1, textAlign: "left", color: isActive ? "#047857" : "#475569", fontWeight: isActive ? 700 : 600 }}>
          Notifications
        </span>
        {unreadCount > 0 && (
          <span
            style={{
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "10.5px",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "999px",
              lineHeight: 1.2,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
