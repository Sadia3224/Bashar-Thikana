import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Heart, History, MessageSquare, Search } from "lucide-react";
import PageHeader, { StatCard } from "../../components/PageHeader";
import PropertyCard from "../../components/PropertyCard";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { describeFilters, filtersFromParams } from "../../utils/filters";
import { formatDate, initials } from "../../utils/format";

export default function ClientOverview() {
  const { user } = useAuth();
  const { requests, favoriteIds, getProperty, recentSearches } = useProperties();
  const mine = requests.filter((r) => r.clientId === user.id);
  const visits = mine.filter((r) => r.kind === "visit");
  const contacts = mine.filter((r) => r.kind === "contact");
  const saved = favoriteIds.map(getProperty).filter((p) => p?.status === "approved");

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Your saved homes, searches and requests in one place.">
        <Link to="/properties" className="btn btn-primary">
          <Search size={18} /> Find a home
        </Link>
      </PageHeader>

      <div className="stat-grid">
        <StatCard icon={Heart} label="Saved properties" value={saved.length} tone="rose" />
        <StatCard icon={CalendarDays} label="Visit requests" value={visits.length} hint={`${visits.filter((v) => v.status === "pending").length} pending`} />
        <StatCard icon={MessageSquare} label="Contact requests" value={contacts.length} tone="amber" />
        <StatCard icon={History} label="Recent searches" value={recentSearches.length} tone="blue" />
      </div>

      <div className="dash-columns">
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Profile</h2>
            <Link to="/client/profile" className="link-arrow">Edit <ArrowRight size={15} /></Link>
          </div>
          <div className="profile-mini">
            <span className="avatar avatar-lg">{initials(user.name)}</span>
            <dl className="detail-list">
              <div><dt>Name</dt><dd>{user.name}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Phone</dt><dd>{user.phone || "Not provided"}</dd></div>
              <div><dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd></div>
            </dl>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Latest requests</h2>
            <Link to="/client/visits" className="link-arrow">All visits <ArrowRight size={15} /></Link>
          </div>
          {mine.length ? (
            <ul className="mini-list">
              {mine.slice(0, 5).map((r) => {
                const property = getProperty(r.propertyId);
                return (
                  <li key={r.id}>
                    {r.kind === "visit" ? <CalendarDays size={17} aria-hidden="true" /> : <MessageSquare size={17} aria-hidden="true" />}
                    <div>
                      <strong>{property?.title || "Listing removed"}</strong>
                      <span className="muted small">{r.kind === "visit" ? `Visit on ${formatDate(r.date)}` : "Message"} · {formatDate(r.createdAt)}</span>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState compact title="No requests yet" message="Open a property and use Request a Visit or Contact Owner." />
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Recent searches</h2>
          <Link to="/client/searches" className="link-arrow">Manage <ArrowRight size={15} /></Link>
        </div>
        {recentSearches.length ? (
          <ul className="search-history compact">
            {recentSearches.slice(0, 3).map((s) => (
              <li key={s.id}>
                <div className="chip-row">
                  {describeFilters(filtersFromParams(new URLSearchParams(s.query))).map((chip) => (
                    <span key={chip.key} className="chip chip-static">{chip.label}</span>
                  ))}
                </div>
                <Link to={`/properties?${s.query}`} className="btn btn-outline btn-sm">Run again</Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState compact title="No searches yet" message="Searches you make while logged in are remembered here." />
        )}
      </section>

      <section>
        <div className="section-head">
          <h2 className="panel-title">Saved properties</h2>
          {saved.length > 0 && <Link to="/client/favorites" className="link-arrow">View all <ArrowRight size={15} /></Link>}
        </div>
        {saved.length ? (
          <div className="property-grid">
            {saved.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Heart} title="No saved properties" message="Tap the heart on any listing to save it here.">
            <Link to="/properties" className="btn btn-primary">Browse properties</Link>
          </EmptyState>
        )}
      </section>
    </>
  );
}
