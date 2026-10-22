import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Mail, MessageSquare, Phone, UsersRound } from "lucide-react";
import EmptyState from "../components/EmptyState";
import PropertyImage from "../components/PropertyImage";
import StatusBadge from "../components/StatusBadge";
import { Tabs } from "../components/PageHeader";
import { useProperties } from "../context/PropertyContext";
import { formatDate } from "../utils/format";

// Visit and contact requests, shared by the client view (`perspective="client"`) and the owner view.
export default function RequestList({ requests, kind, perspective, renderActions, emptyAction }) {
  const { getProperty, getUser } = useProperties();
  const [status, setStatus] = useState("all");

  const statuses = kind === "visit" ? ["pending", "accepted", "declined", "cancelled"] : ["pending", "replied", "cancelled"];
  const tabs = [
    { value: "all", label: "All", count: requests.length },
    ...statuses.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1), count: requests.filter((r) => r.status === s).length })),
  ];
  const shown = useMemo(() => (status === "all" ? requests : requests.filter((r) => r.status === status)), [requests, status]);

  if (!requests.length) {
    return (
      <EmptyState
        icon={kind === "visit" ? CalendarDays : MessageSquare}
        title={kind === "visit" ? "No visit requests yet" : "No contact requests yet"}
        message={
          perspective === "client"
            ? `When you ${kind === "visit" ? "request a visit" : "message an owner"} from a property page, it will appear here.`
            : `When clients ${kind === "visit" ? "ask to visit" : "message you about"} your listings, you'll see it here.`
        }
      >
        {emptyAction}
      </EmptyState>
    );
  }

  return (
    <>
      <Tabs tabs={tabs} value={status} onChange={setStatus} label="Filter by status" />
      {shown.length === 0 ? (
        <EmptyState compact title="Nothing here" message="No requests with this status." />
      ) : (
        <ul className="request-list">
          {shown.map((request) => {
            const property = getProperty(request.propertyId);
            const owner = getUser(request.ownerId);
            return (
              <li key={request.id} className="request-card">
                <div className="request-property">
                  <PropertyImage src={property?.images[0]} alt="" className="request-thumb" />
                  <div>
                    {property ? (
                      <Link to={`/properties/${property.id}`} className="request-title">{property.title}</Link>
                    ) : (
                      <span className="request-title muted">Listing removed</span>
                    )}
                    <p className="muted small">
                      {property ? `${property.area}, ${property.district} · ` : ""}Sent {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <div className="request-details">
                  {kind === "visit" && (
                    <p>
                      <CalendarDays size={16} aria-hidden="true" /> <strong>{formatDate(request.date)}</strong>, {request.timeSlot}
                      <span className="muted"> · {request.visitors} {request.visitors === "1" ? "visitor" : "visitors"}</span>
                    </p>
                  )}
                  {request.message && <p className="request-message">“{request.message}”</p>}
                  {perspective === "owner" ? (
                    <p className="request-people">
                      <span><UsersRound size={15} aria-hidden="true" /> {request.name}</span>
                      <span><Phone size={15} aria-hidden="true" /> {request.phone}</span>
                      {request.email && <span><Mail size={15} aria-hidden="true" /> {request.email}</span>}
                    </p>
                  ) : (
                    owner && <p className="request-people"><span><UsersRound size={15} aria-hidden="true" /> Owner: {owner.name}</span></p>
                  )}
                </div>

                {renderActions && <div className="request-actions">{renderActions(request)}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
