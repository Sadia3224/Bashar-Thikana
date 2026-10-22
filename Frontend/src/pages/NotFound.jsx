import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container page-pad not-found">
      <Compass size={48} aria-hidden="true" />
      <p className="not-found-code">404</p>
      <h1>This page has moved out</h1>
      <p className="muted">The page you are looking for does not exist or may have been removed.</p>
      <div className="about-actions">
        <Link to="/" className="btn btn-primary">Go to home</Link>
        <Link to="/properties" className="btn btn-outline">Browse properties</Link>
      </div>
    </div>
  );
}
