import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Building2, CalendarDays, CheckCircle2, Clock, DoorClosed, MessageSquare, Plus, ShieldAlert } from "lucide-react";
import PageHeader, { StatCard } from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import PropertyImage from "../../components/PropertyImage";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { formatBDT, formatDate } from "../../utils/format";

export default function OwnerOverview() {
  const { user } = useAuth();
  const { properties, requests, getProperty } = useProperties();
  const mine = properties.filter((p) => p.ownerId === user.id);
  const myRequests = requests.filter((r) => r.ownerId === user.id);
  const attention = mine.filter((p) => p.status !== "approved");
  const count = (fn) => mine.filter(fn).length;

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(" ")[0]}`} description="Manage your listings, availability and client requests.">
        <Link to="/owner/properties/new" className="btn btn-primary">
          <Plus size={18} /> Add property
        </Link>
      </PageHeader>

      {!user.verified && (
        <div className="alert alert-info">
          <ShieldAlert size={18} aria-hidden="true" />
          <span>Your owner account is not verified yet. Verified owners get a badge on every listing; an admin can verify you from User Management.</span>
        </div>
      )}

      <div className="stat-grid">
        <StatCard icon={Building2} label="Total listings" value={mine.length} />
        <StatCard icon={CheckCircle2} label="Live (approved)" value={count((p) => p.status === "approved")} hint={`${count((p) => p.verified)} verified`} tone="blue" />
        <StatCard icon={Clock} label="Pending review" value={count((p) => p.status === "pending")} tone="amber" />
        <StatCard icon={DoorClosed} label="Occupied" value={count((p) => p.occupancy === "occupied")} hint={`${count((p) => p.occupancy === "available")} available`} tone="slate" />
        <StatCard icon={CalendarDays} label="Visit requests" value={myRequests.filter((r) => r.kind === "visit").length} hint={`${myRequests.filter((r) => r.kind === "visit" && r.status === "pending").length} awaiting reply`} tone="rose" />
        <StatCard icon={MessageSquare} label="Client messages" value={myRequests.filter((r) => r.kind === "contact").length} hint={`${myRequests.filter((r) => r.kind === "contact" && r.status === "pending").length} unanswered`} tone="green" />
      </div>

      {mine.length === 0 ? (
        <EmptyState icon={Building2} title="You have no listings yet" message="Add your first room, bed or flat. It will appear publicly once an admin approves it.">
          <Link to="/owner/properties/new" className="btn btn-primary">Add your first property</Link>
        </EmptyState>
      ) : (
        <div className="dash-columns">
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Needs attention</h2>
              <Link to="/owner/properties" className="link-arrow">All listings <ArrowRight size={15} /></Link>
            </div>
            {attention.length ? (
              <ul className="mini-list">
                {attention.map((p) => (
                  <li key={p.id}>
                    <PropertyImage src={p.images[0]} alt="" className="mini-thumb" />
                    <div>
                      <strong>{p.title}</strong>
                      <span className="muted small">{p.status === "rejected" ? p.rejectionReason || "Rejected by admin" : "Waiting for admin review"}</span>
                    </div>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={BadgeCheck} title="All listings are live" message="Nothing is waiting for review." />
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Latest requests</h2>
              <Link to="/owner/visits" className="link-arrow">Visit requests <ArrowRight size={15} /></Link>
            </div>
            {myRequests.length ? (
              <ul className="mini-list">
                {myRequests.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    {r.kind === "visit" ? <CalendarDays size={17} aria-hidden="true" /> : <MessageSquare size={17} aria-hidden="true" />}
                    <div>
                      <strong>{r.name}</strong>
                      <span className="muted small">
                        {getProperty(r.propertyId)?.title || "Listing removed"} · {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact title="No requests yet" message="Requests from clients will show up here." />
            )}
          </section>
        </div>
      )}

      {mine.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">Rent overview</h2>
          <p className="muted">
            Total listed rent for available listings:{" "}
            <strong>{formatBDT(mine.filter((p) => p.status === "approved" && p.occupancy === "available").reduce((sum, p) => sum + p.rent, 0))}</strong> / month
          </p>
        </section>
      )}
    </>
  );
}
