import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await client.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
      setError("");
    } catch (err) {
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (id, link) => {
    try {
      await client.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      if (link) {
        navigate(link);
      }
    } catch {
      setError("Could not update notification status.");
    }
  };

  const markAllRead = async () => {
    try {
      await client.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      setError("Could not mark all as read.");
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      quiz: { label: "Quiz", bg: "#fef3c7", color: "#d97706" },
      flashcard: { label: "Flashcards", bg: "#e0e7ff", color: "#4f46e5" },
      textbook: { label: "Textbook", bg: "#dcfce7", color: "#16a34a" },
      announcement: { label: "Notice", bg: "#fee2e2", color: "#dc2626" },
    };
    return badges[type] || { label: "Update", bg: "#f1f5f9", color: "#475569" };
  };

  return (
    <div style={{ padding: "36px 48px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px 0" }}>
            Notifications
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>
            Stay updated with newly published quizzes, flashcards, and learning materials.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              padding: "10px 18px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontWeight: "600",
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: "14px 18px", background: "#fef2f2", color: "#b91c1c", borderRadius: "12px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div style={{
          background: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #e2e8f0",
          padding: "48px 24px",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}>🎉</span>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>You're all caught up!</h3>
          <p style={{ color: "#64748b", margin: 0 }}>No new notifications at this time.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((item) => {
            const badge = getTypeBadge(item.type);
            const isUnread = !item.isRead;

            return (
              <div
                key={item._id}
                onClick={() => markRead(item._id, item.link)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isUnread ? "#f8fafc" : "#ffffff",
                  border: isUnread ? "1.5px solid #93c5fd" : "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "18px 22px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isUnread ? "0 2px 8px rgba(59, 130, 246, 0.08)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      fontWeight: "700",
                      fontSize: "12px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      textTransform: "uppercase"
                    }}
                  >
                    {badge.label}
                  </span>

                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#1e293b", fontWeight: isUnread ? "700" : "600" }}>
                      {item.title}
                    </h4>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                      {item.message}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: "140px" }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
