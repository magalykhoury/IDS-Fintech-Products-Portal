import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  IconBuildingCommunity,
  IconBell,
  IconChartBar,
  IconCode,
  IconCube,
  IconLayoutDashboard,
  IconLogout,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { canWritePortalData } from "../services/permissions";
import { apiFetch } from "../services/api";
import { NOTIFICATIONS_CHANGED_EVENT } from "../services/notifications";

export default function AppLayout() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const [unreadCount, setUnreadCount] = useState(0);
  const [globalQuery, setGlobalQuery] = useState("");

  const loadUnreadCount = useCallback(async () => {
    try {
      const result = await apiFetch("/notifications/unread-count");
      setUnreadCount(result.count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadUnreadCount);

    const refresh = () => void loadUnreadCount();
    const intervalId = window.setInterval(refresh, 60_000);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [loadUnreadCount]);

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function handleGlobalSearch(event: FormEvent) {
    event.preventDefault();
    const query = globalQuery.trim();
    navigate(query ? `/intelligence?q=${encodeURIComponent(query)}` : "/intelligence");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark"><IconBuildingCommunity size={18} stroke={2} /></span>
          <span><strong>IDS Fintech</strong><small>Products Portal</small></span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard"><IconLayoutDashboard size={18} stroke={1.8} /><span>Dashboard</span>
          </NavLink>

          <NavLink to="/intelligence"><IconSparkles size={18} stroke={1.8} /><span>Intelligence</span>
          </NavLink>

          <NavLink to="/products"><IconCube size={18} stroke={1.8} /><span>Products</span>
          </NavLink>

          <NavLink to="/clients"><IconBuildingCommunity size={18} stroke={1.8} /><span>Clients</span>
          </NavLink>

          <NavLink to="/deployments"><IconChartBar size={18} stroke={1.8} /><span>Deployments</span>
          </NavLink>

          <NavLink to="/approvals"><IconBell size={18} stroke={1.8} /><span>Approvals</span>
          </NavLink>

          <NavLink to="/team"><IconUsers size={18} stroke={1.8} /><span>Team</span>
          </NavLink>

          {canWritePortalData() && (
            <NavLink to="/technologies"><IconCode size={18} stroke={1.8} /><span>Technologies</span>
            </NavLink>
          )}

          {role === "Admin" && (
            <NavLink to="/users"><IconSettings size={18} stroke={1.8} /><span>Users</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-account">
          <span className="account-avatar" aria-hidden="true">{username?.slice(0, 1).toUpperCase()}</span>
          <span><strong>{username}</strong><small>{role}</small></span>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <form className="global-search" onSubmit={handleGlobalSearch}>
            <IconSearch size={19} stroke={2} aria-hidden="true" />
            <input
              type="search"
              placeholder="Ask about products, clients, or deployments"
              aria-label="Portal intelligence search"
              value={globalQuery}
              onChange={(event) => setGlobalQuery(event.target.value)}
            />
          </form>
          <div className="topbar-actions">
            <NavLink to="/notifications" className="notification-link" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}>
              <IconBell size={18} stroke={1.9} />
              {unreadCount > 0 && <span className="notification-count" aria-live="polite">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </NavLink>
            <span className="topbar-role">{role}</span>
            <button className="logout-button" onClick={handleLogout} aria-label="Log out">
              <IconLogout size={17} stroke={1.9} /> <span>Log out</span>
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
