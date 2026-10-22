import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Building2, Clock, Flag, Info, Search, UserRound, UsersRound } from "lucide-react";
import PageHeader, { StatCard } from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import PropertyImage from "../../components/PropertyImage";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { ROLES } from "../../data/options";
import { formatBDT, formatDate } from "../../utils/format";

export default function AdminOverview() {
  const { users } = useAuth();
  const { properties, reports, getProperty, getUser } = useProperties();

  const openReports = reports.filter((r) => r.status === "open");
  const reportedListings = new Set(openReports.map((r) => r.propertyId).filter((id) => getProperty(id))).size;
  const pending = properties.filter((p) => p.status === "pending");
  const newestUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <>
      <PageHeader title="Overview" description="Platform activity at a glance." />
      <div className="alert alert-info">
        <Info size={18} aria-hidden="true" />
        <span>Admin actions here change sample data in this browser only. They do not affect any real server or real users.</span>
      </div>

      <div className="stat-grid stat-grid-admin">
        <StatCard icon={UsersRound} label="Total users" value={users.length} hint={`${users.filter((u) => !u.active).length} inactive`} />
        <StatCard icon={Search} label="Clients" value={users.filter((u) => u.role === "client").length} tone="blue" />
        <StatCard icon={UserRound} label="Owners" value={users.filter((u) => u.role === "owner").length} tone="slate" />
        <StatCard icon={Building2} label="Total properties" value={properties.length} tone="green" />
        <StatCard icon={Clock} label="Pending listings" value={pending.length} tone="amber" />
        <StatCard icon={BadgeCheck} label="Verified listings" value={properties.filter((p) => p.verified).length} tone="blue" />
        <StatCard icon={Flag} label="Reported listings" value={reportedListings} hint={`${openReports.length} open reports`} tone="rose" />
      </div>

      <div className="dash-columns">
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Awaiting verification</h2>
            <Link to="/admin/verification" className="link-arrow">Review queue <ArrowRight size={15} /></Link>
          </div>
          {pending.length ? (
            <ul className="mini-list">
              {pending.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <PropertyImage src={p.images[0]} alt="" className="mini-thumb" />
                  <div>
                    <strong>{p.title}</strong>
                    <span className="muted small">{p.area}, {p.district} · {formatBDT(p.rent)} · by {getUser(p.ownerId)?.name || "Unknown"}</span>
                  </div>
                  <StatusBadge status="pending" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact icon={BadgeCheck} title="Queue is clear" message="No listings are waiting for review." />
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Open reports</h2>
            <Link to="/admin/reports" className="link-arrow">All reports <ArrowRight size={15} /></Link>
          </div>
          {openReports.length ? (
            <ul className="mini-list">
              {openReports.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Flag size={17} aria-hidden="true" />
                  <div>
                    <strong>{getProperty(r.propertyId)?.title || "Listing removed"}</strong>
                    <span className="muted small">{r.reason} · {formatDate(r.createdAt)}</span>
                  </div>
                  <StatusBadge status="open" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact title="No open reports" />
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Newest users</h2>
          <Link to="/admin/users" className="link-arrow">Manage users <ArrowRight size={15} /></Link>
        </div>
        <ul className="mini-list">
          {newestUsers.map((u) => (
            <li key={u.id}>
              <UserRound size={17} aria-hidden="true" />
              <div>
                <strong>{u.name}</strong>
                <span className="muted small">{ROLES[u.role].label} · joined {formatDate(u.createdAt)}</span>
              </div>
              <StatusBadge status={u.active ? "active" : "inactive"} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
