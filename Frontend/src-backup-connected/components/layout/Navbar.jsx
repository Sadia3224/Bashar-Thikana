import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

export default function Navbar() {
  const { user, logout } = useAuth();
  return <header className="site-nav">
    <Link className="wordmark" to="/"><span>Bashar</span><strong>Thikana</strong></Link>
    <nav className="site-links">
      <NavLink to="/search-setup">Find a place</NavLink>
      {user?.role === "consumer" && <NavLink to="/my-bookings">My requests</NavLink>}
      {user?.role === "user" && <NavLink to="/owner/dashboard">Owner panel</NavLink>}
      {user?.role === "admin" && <NavLink to="/admin/dashboard">Admin</NavLink>}
    </nav>
    <div className="nav-actions">
      {!user ? <><Link className="quiet-link" to="/login">Sign in</Link><Button to="/register" variant="outline">Create account</Button></> : <><span className="nav-user">{user.name}</span><button className="quiet-link button-reset" onClick={logout}>Sign out</button></>}
    </div>
  </header>;
}
