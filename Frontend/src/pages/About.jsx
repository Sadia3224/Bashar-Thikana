import { Link } from "react-router-dom";
import { BadgeCheck, Eye, HeartHandshake, MapPinned, ShieldCheck, UsersRound } from "lucide-react";
import PropertyImage from "../components/PropertyImage";
import { HERO_IMAGES } from "../data/properties";

const VALUES = [
  { icon: Eye, title: "Clarity first", text: "Rent, eligibility, beds, washroom and balcony are shown up front, so you can rule places in or out before travelling." },
  { icon: ShieldCheck, title: "Reviewed listings", text: "Every new or edited listing goes through an admin review before it appears in search." },
  { icon: UsersRound, title: "Respectful eligibility", text: "Owners state who a place is suitable for, so nobody wastes a trip on a listing they cannot rent." },
  { icon: HeartHandshake, title: "Fair for both sides", text: "Clients compare honestly; owners reach serious tenants without paying brokers." },
];

export default function About() {
  return (
    <div className="page-pad">
      <section className="container about-hero">
        <div>
          <span className="eyebrow">About us</span>
          <h1>Making the search for a thikana less stressful.</h1>
          <p>
            Finding a place to live in Bangladesh still means walking lanes looking for <em>To-Let</em> signs, calling numbers that are no longer
            valid and travelling across the city for a room that was let out last week. Bashar Thikana brings rooms, shared beds and family flats
            into one searchable place, with the details people actually ask about.
          </p>
          <p>
            We focus on the everyday rentals that matter most: student messes near universities, ladies' hostels, sublets for job holders and
            family flats across Chattogram, Dhaka and every divisional city.
          </p>
          <div className="about-actions">
            <Link to="/properties" className="btn btn-primary">Find a home</Link>
            <Link to="/register?role=owner" className="btn btn-outline">List a property</Link>
          </div>
        </div>
        <PropertyImage src={HERO_IMAGES[1]} alt="A tidy bedroom in a rental flat" className="about-img" />
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head center">
            <div>
              <span className="eyebrow">What we believe</span>
              <h2>Our principles</h2>
            </div>
          </div>
          <div className="value-grid">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="value-card">
                <Icon size={26} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-roles">
          <article>
            <MapPinned size={24} aria-hidden="true" />
            <h3>Clients</h3>
            <p>Search and filter listings, save favourites, request visits and message owners, all tracked in a personal dashboard.</p>
          </article>
          <article>
            <BadgeCheck size={24} aria-hidden="true" />
            <h3>Owners</h3>
            <p>Add rooms, beds or entire flats, keep availability up to date and respond to visit requests and messages.</p>
          </article>
          <article>
            <ShieldCheck size={24} aria-hidden="true" />
            <h3>Admins</h3>
            <p>Review and verify listings, handle reports and keep the community safe by managing user accounts.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
