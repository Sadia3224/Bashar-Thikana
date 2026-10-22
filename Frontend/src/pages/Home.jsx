import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, BedDouble, BedSingle, Building2, CalendarCheck, ClipboardList, DoorOpen, Eye, Filter, Handshake,
  Inbox, MapPin, MessageSquare, SearchCheck, ShieldCheck, UsersRound,
} from "lucide-react";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import PropertyImage from "../components/PropertyImage";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertyContext";
import { HERO_IMAGES } from "../data/properties";
import { DISTRICTS } from "../data/locations";
import { PROPERTY_TYPES } from "../data/options";

const TYPE_ICONS = { "single-room": DoorOpen, "shared-room": UsersRound, bed: BedSingle, "full-flat": Building2 };

const STEPS = [
  { icon: Filter, title: "Search with real filters", text: "Choose district, area, budget, gender eligibility, beds, balcony and washroom type." },
  { icon: Eye, title: "Compare the details", text: "See rent, free beds or bedrooms, facilities and move-in dates on every listing." },
  { icon: CalendarCheck, title: "Request a visit", text: "Pick a date and time slot, or message the owner with your questions." },
  { icon: Handshake, title: "Move in with confidence", text: "Visit in person, agree terms directly with the owner and settle in." },
];

const CLIENT_BENEFITS = [
  { icon: SearchCheck, text: "Filters built for Bangladeshi rentals like mess beds, sublets and family flats." },
  { icon: BadgeCheck, text: "Listings are reviewed by admins before they go public." },
  { icon: UsersRound, text: "Clear gender eligibility so you only see places you can rent." },
  { icon: Inbox, text: "Save favourites and track every visit and message in one dashboard." },
];

const OWNER_BENEFITS = [
  { icon: ClipboardList, text: "List single rooms, shared rooms, beds or entire flats in minutes." },
  { icon: BedDouble, text: "Keep available beds and occupancy up to date with one click." },
  { icon: MessageSquare, text: "Receive visit requests and messages from interested clients." },
  { icon: ShieldCheck, text: "Get a verified badge that builds trust with tenants." },
];

export default function Home() {
  const { publicProperties } = useProperties();
  const { user } = useAuth();

  const featured = useMemo(
    () => publicProperties.filter((p) => p.verified && p.occupancy === "available").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [publicProperties]
  );
  const countBy = (key, value) => publicProperties.filter((p) => p[key] === value).length;
  const ownerCta = user?.role === "owner" ? "/owner/properties/new" : "/register?role=owner";

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <MapPin size={15} aria-hidden="true" /> Rooms, beds and flats across Bangladesh
            </span>
            <h1>Find Your Perfect Place to Call Home.</h1>
            <p>
              From a single bed in a Chattogram student mess to a three-bedroom family flat in Uttara, search reviewed listings with clear rent,
              gender eligibility and move-in dates.
            </p>
            <div className="hero-stats">
              <div><strong>{publicProperties.length}</strong><span>live listings</span></div>
              <div><strong>{DISTRICTS.length}</strong><span>districts</span></div>
              <div><strong>{publicProperties.filter((p) => p.verified).length}</strong><span>verified</span></div>
            </div>
          </div>
          <div className="hero-media" aria-hidden="true">
            <PropertyImage src={HERO_IMAGES[0]} alt="" className="hero-img-main" eager />
            <PropertyImage src={HERO_IMAGES[1]} alt="" className="hero-img-side" eager />
            <div className="hero-badge">
              <BadgeCheck size={20} />
              <div>
                <strong>Admin-reviewed</strong>
                <span>Every listing is checked before it goes live</span>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <SearchBar />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Featured</span>
              <h2>Verified homes available now</h2>
            </div>
            <Link to="/properties?verified=true" className="link-arrow">
              See all verified <ArrowRight size={16} />
            </Link>
          </div>
          <div className="property-grid">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse by type</span>
              <h2>What kind of place do you need?</h2>
            </div>
          </div>
          <div className="type-grid">
            {PROPERTY_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type.value];
              const count = countBy("type", type.value);
              return (
                <Link key={type.value} to={`/properties?type=${type.value}`} className="type-card">
                  <span className="type-icon"><Icon size={26} aria-hidden="true" /></span>
                  <h3>{type.label}</h3>
                  <p>{type.description}</p>
                  <span className="type-count">{count} {count === 1 ? "listing" : "listings"} <ArrowRight size={15} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse by district</span>
              <h2>Homes in every division's main city</h2>
            </div>
          </div>
          <div className="district-grid">
            {DISTRICTS.map((district) => {
              const count = countBy("district", district);
              return (
                <Link key={district} to={`/properties?district=${encodeURIComponent(district)}`} className="district-card">
                  <MapPin size={18} aria-hidden="true" />
                  <span>
                    <strong>{district}</strong>
                    <small>{count} {count === 1 ? "listing" : "listings"}</small>
                  </span>
                  <ArrowRight size={16} className="district-arrow" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head center">
            <div>
              <span className="eyebrow">How it works</span>
              <h2>From search to keys in four steps</h2>
            </div>
          </div>
          <ol className="steps">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="step">
                <span className="step-num">{i + 1}</span>
                <Icon size={24} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container benefits">
          <div className="benefit-card">
            <span className="eyebrow">For clients</span>
            <h2>Search smarter, visit fewer wrong places</h2>
            <ul>
              {CLIENT_BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text}><Icon size={20} aria-hidden="true" /> {text}</li>
              ))}
            </ul>
            <Link to="/properties" className="btn btn-primary">Find a home <ArrowRight size={18} /></Link>
          </div>
          <div className="benefit-card benefit-owner">
            <span className="eyebrow">For property owners</span>
            <h2>Fill rooms and beds faster</h2>
            <ul>
              {OWNER_BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text}><Icon size={20} aria-hidden="true" /> {text}</li>
              ))}
            </ul>
            <Link to={ownerCta} className="btn btn-accent">List your property <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta">
          <div>
            <h2>Have a room, bed or flat to rent out?</h2>
            <p>Create a free owner account, add your listing with photos, and start receiving visit requests once an admin approves it.</p>
          </div>
          <div className="cta-actions">
            <Link to={ownerCta} className="btn btn-accent btn-lg">List your property</Link>
            <Link to="/about" className="btn btn-outline-light btn-lg">Learn more</Link>
          </div>
        </div>
      </section>
    </>
  );
}
