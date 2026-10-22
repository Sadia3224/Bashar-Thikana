import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../data/options";
import { initials } from "../utils/format";

// Shared shell for the client, owner and admin areas. `variant="admin"` switches to the darker console styling.
export default function DashboardLayout({ nav, variant = "user", caption }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={`dash-shell ${variant === "admin" ? "dash-admin" : ""} ${open ? "nav-open" : ""}`}>
      <a href="#dash-main" className="skip-link">Skip to content</a>
      <aside className="dash-sidebar" aria-label={`${caption} navigation`}>
        <div className="dash-brand">
          <Logo light={variant === "admin"} caption={caption} />
          <button type="button" className="icon-button dash-close" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        <nav className="dash-nav">
          {nav.map((group) => (
            <div key={group.title} className="dash-nav-group">
              <p className="dash-nav-title">{group.title}</p>
              {group.items.map(({ to, label, icon: Icon, end, badge }) => (
                <NavLink key={to} to={to} end={end}>
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                  {badge > 0 && <span className="nav-badge">{badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="dash-sidebar-foot">
          <div className="dash-user">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{ROLES[user.role].label}</span>
            </div>
          </div>
          <button type="button" className="dash-logout" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" /> Logout
          </button>
        </div>
      </aside>
      <div className="dash-overlay" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="dash-main-wrap">
        <header className="dash-topbar">
          <button type="button" className="icon-button dash-menu" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={22} />
          </button>
          <span className="dash-topbar-title">{caption}</span>
          <div className="dash-topbar-actions">
            <Link to="/" className="btn btn-ghost btn-sm">
              <ExternalLink size={16} aria-hidden="true" /> <span className="hide-sm">Back to website</span>
            </Link>
            <span className="avatar avatar-sm" title={user.name}>{initials(user.name)}</span>
          </div>
        </header>
        <main id="dash-main" className="dash-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
