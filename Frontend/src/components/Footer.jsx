import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

export const CONTACT_INFO = {
  address: "House 12, Road 3, Nasirabad Housing Society, Chattogram 4209",
  phone: "+880 1700-000000",
  email: "hello@basharthikana.example",
  hours: "Saturday – Thursday, 9:00 AM – 7:00 PM",
};

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>Rooms, beds and family flats across Bangladesh, with clear rent, eligibility and availability before you visit.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <ul>
            <li><Link to="/properties">All properties</Link></li>
            <li><Link to="/properties?type=single-room">Single rooms</Link></li>
            <li><Link to="/properties?type=shared-room">Shared rooms</Link></li>
            <li><Link to="/properties?type=bed">Bed-wise rentals</Link></li>
            <li><Link to="/properties?type=full-flat">Full flats</Link></li>
          </ul>
        </div>
        <div>
          <h3>Company</h3>
          <ul>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
            <li><Link to="/register?role=owner">List your property</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
        <div>
          <h3>Get in touch</h3>
          <ul className="footer-contact">
            <li><MapPin size={16} aria-hidden="true" /> {CONTACT_INFO.address}</li>
            <li><Phone size={16} aria-hidden="true" /> {CONTACT_INFO.phone}</li>
            <li><Mail size={16} aria-hidden="true" /> {CONTACT_INFO.email}</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Bashar Thikana</span>
        <span>Frontend demo. Listings, accounts and requests are sample data stored only in this browser.</span>
      </div>
    </footer>
  );
}
