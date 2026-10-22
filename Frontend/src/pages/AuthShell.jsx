import { Info } from "lucide-react";
import Logo from "../components/Logo";
import PropertyImage from "../components/PropertyImage";
import { HERO_IMAGES } from "../data/properties";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-visual" aria-hidden="true">
        <PropertyImage src={HERO_IMAGES[2]} alt="" eager />
        <div className="auth-visual-copy">
          <Logo light />
          <p>Rooms, beds and family flats across Bangladesh, reviewed before they go live.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-logo-mobile">
            <Logo />
          </div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          {children}
          <p className="demo-note">
            <Info size={16} aria-hidden="true" />
            <span>
              Demo sign-in only. Accounts are stored in this browser and role checks only change what the interface shows. This is not secure
              authentication.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
