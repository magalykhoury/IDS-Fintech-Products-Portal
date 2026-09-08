import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { announceNotificationsChanged } from "../services/notifications";

interface Notification {
  id: number;
  type: string;
  category: string;
  title: string;
  message: string;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readFilter, setReadFilter] = useState<"All" | "Unread">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setNotifications(await apiFetch("/notifications"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function markRead(notification: Notification) {
    if (notification.isRead) return;

    try {
      await apiFetch(`/notifications/${notification.id}/read`, { method: "PUT" });
      announceNotificationsChanged();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not mark notification as read.");
    }
  }

  async function markAllRead() {
    try {
      setError("");
      await apiFetch("/notifications/read-all", { method: "PUT" });
      announceNotificationsChanged();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not mark notifications as read.");
    }
  }

  async function openNotification(notification: Notification) {
    await markRead(notification);
    if (notification.link) navigate(notification.link);
  }

  const categories = useMemo(
    () => Array.from(new Set(notifications.map((notification) => notification.category))).sort(),
    [notifications]
  );

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) =>
      (readFilter === "All" || !notification.isRead)
      && (categoryFilter === "All" || notification.category === categoryFilter)),
    [categoryFilter, notifications, readFilter]
  );

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Phase 2</p>
          <h1>Notifications</h1>
          <p className="page-subtitle">Approval activity and other updates assigned to your account.</p>
        </div>
        {notifications.some((notification) => !notification.isRead) && <button type="button" className="secondary-button" onClick={markAllRead}>Mark all as read</button>}
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="filter-bar notification-toolbar" aria-label="Notification filters">
        <label>
          <span>Status</span>
          <select value={readFilter} onChange={(event) => setReadFilter(event.target.value as "All" | "Unread")}>
            <option value="All">All notifications</option>
            <option value="Unread">Unread only</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="All">All categories</option>
            {categories.map((category) => <option value={category} key={category}>{category}</option>)}
          </select>
        </label>
        <span className="notification-result-count">{visibleNotifications.length} result{visibleNotifications.length === 1 ? "" : "s"}</span>
      </div>
      {notifications.length === 0 ? (
        <div className="detail-card"><p className="empty-text">No notifications yet.</p></div>
      ) : visibleNotifications.length === 0 ? (
        <div className="detail-card"><p className="empty-text">No notifications match these filters.</p></div>
      ) : (
        <section className="detail-card notification-list">
          {visibleNotifications.map((notification) => (
            <article className={`notification-item${notification.isRead ? "" : " notification-unread"}`} key={notification.id}>
              <div>
                <div className="notification-heading">
                  <strong>{notification.title}</strong>
                  <span className="small-badge">{notification.category}</span>
                  {!notification.isRead && <span className="notification-unread-label">Unread</span>}
                </div>
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                  {notification.relatedEntityType && ` · ${notification.relatedEntityType}`}
                </small>
              </div>
              <div className="notification-actions">
                {!notification.isRead && <button type="button" className="secondary-button" onClick={() => void markRead(notification)}>Mark as read</button>}
                {notification.link && <button type="button" className="detail-link notification-open" onClick={() => void openNotification(notification)}>Open</button>}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
