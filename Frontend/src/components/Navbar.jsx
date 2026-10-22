import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertyContext";
import { ROLES } from "../data/options";
import { initials } from "../utils/format";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/properties", label: "Find a Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.type === "keydown" ? event.key === "Escape" : !ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const home = ROLES[user.role].home;
  return (
    <div className="user-menu" ref={ref}>
      <button type="button" className="user-menu-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="avatar avatar-sm">{initials(user.name)}</span>
        <span className="user-menu-name">{user.name.split(" ")[0]}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-head">
            <strong>{user.name}</strong>
            <span>{ROLES[user.role].label} account</span>
          </div>
          <Link role="menuitem" to={home} onClick={() => setOpen(false)}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link role="menuitem" to={`${home}/profile`} onClick={() => setOpen(false)}>
            <UserRound size={16} /> Profile
          </Link>
          <button role="menuitem" type="button" onClick={onLogout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { favoriteIds } = useProperties();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Logo />
        <nav className="site-nav" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-actions">
          {user?.role === "client" && (
            <Link to="/client/favorites" className="icon-button nav-fav" aria-label={`Saved properties (${favoriteIds.length})`}>
              <Heart size={20} />
              {favoriteIds.length > 0 && <span className="count-dot">{favoriteIds.length}</span>}
            </Link>
          )}
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
        <button type="button" className="icon-button nav-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-nav" id="mobile-nav">
          <nav aria-label="Mobile">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mobile-nav-actions">
            {user ? (
              <>
                <Link to={ROLES[user.role].home} className="btn btn-primary btn-block">
                  <LayoutDashboard size={18} /> My dashboard
                </Link>
                <button type="button" className="btn btn-outline btn-block" onClick={handleLogout}>
                  <LogOut size={18} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-block">Login</Link>
                <Link to="/register" className="btn btn-primary btn-block">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
