import { Link } from "react-router-dom";

export default function Logo({ to = "/", light = false, caption }) {
  return (
    <Link to={to} className={`logo ${light ? "logo-light" : ""}`} aria-label="Bashar Thikana home">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32">
          <rect width="32" height="32" rx="9" fill="currentColor" />
          <path d="M8 15.5 16 9l8 6.5V24a1 1 0 0 1-1 1h-4.5v-5.5h-5V25H9a1 1 0 0 1-1-1z" fill="#fff" />
          <circle cx="23.5" cy="9.5" r="2.5" fill="var(--color-accent)" />
        </svg>
      </span>
      <span className="logo-text">
        <span>
          Bashar<strong>Thikana</strong>
        </span>
        {caption && <small>{caption}</small>}
      </span>
    </Link>
  );
}
