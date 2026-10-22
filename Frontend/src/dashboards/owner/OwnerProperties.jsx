import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import PageHeader, { Tabs } from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import PropertyImage from "../../components/PropertyImage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import { TYPE_LABELS } from "../../data/options";
import { capacityText, formatBDT } from "../../utils/format";

export default function OwnerProperties() {
  const { user } = useAuth();
  const { properties, setOccupancy, deleteProperty } = useProperties();
  const { notify } = useToast();
  const [tab, setTab] = useState("all");
  const [deleting, setDeleting] = useState(null);

  // Owners only ever see their own listings.
  const mine = properties.filter((p) => p.ownerId === user.id);
  const shown = tab === "all" ? mine : mine.filter((p) => p.status === tab);
  const tabs = [
    { value: "all", label: "All", count: mine.length },
    { value: "approved", label: "Approved", count: mine.filter((p) => p.status === "approved").length },
    { value: "pending", label: "Pending", count: mine.filter((p) => p.status === "pending").length },
    { value: "rejected", label: "Rejected", count: mine.filter((p) => p.status === "rejected").length },
  ];

  const toggleOccupancy = (property) => {
    const next = property.occupancy === "available" ? "occupied" : "available";
    setOccupancy(property.id, next);
    notify(`Marked as ${next}.`, "info");
  };

  return (
    <>
      <PageHeader title="My properties" description="Edit details, update availability or remove listings.">
        <Link to="/owner/properties/new" className="btn btn-primary">
          <Plus size={18} /> Add new property
        </Link>
      </PageHeader>

      {mine.length === 0 ? (
        <EmptyState icon={Building2} title="No properties yet" message="Your listings will appear here once you add them.">
          <Link to="/owner/properties/new" className="btn btn-primary">Add your first property</Link>
        </EmptyState>
      ) : (
        <>
          <Tabs tabs={tabs} value={tab} onChange={setTab} label="Filter listings by status" />
          {shown.length === 0 ? (
            <EmptyState compact title="No listings with this status" />
          ) : (
            <ul className="listing-rows">
              {shown.map((p) => (
                <li key={p.id} className="listing-row">
                  <PropertyImage src={p.images[0]} alt="" className="listing-thumb" />
                  <div className="listing-info">
                    <div className="listing-badges">
                      <StatusBadge status={p.status} />
                      {p.verified && (
                        <span className="pill pill-verified pill-sm">
                          <BadgeCheck size={13} aria-hidden="true" /> Verified
                        </span>
                      )}
                    </div>
                    <h3>{p.title}</h3>
                    <p className="muted small">
                      {TYPE_LABELS[p.type]} · {p.area}, {p.district} · {capacityText(p)}
                    </p>
                    <p className="listing-rent">{formatBDT(p.rent)} <span className="muted">/ month</span></p>
                    {p.status === "rejected" && p.rejectionReason && <p className="listing-reason">Admin note: {p.rejectionReason}</p>}
                  </div>
                  <div className="listing-controls">
                    <label className="switch">
                      <input type="checkbox" checked={p.occupancy === "available"} onChange={() => toggleOccupancy(p)} />
                      <span className="switch-track" aria-hidden="true" />
                      <span>{p.occupancy === "available" ? "Available" : "Occupied"}</span>
                    </label>
                    <div className="row-actions">
                      <Link to={`/properties/${p.id}`} className="icon-button" aria-label={`View ${p.title}`} title="View">
                        <Eye size={18} />
                      </Link>
                      <Link to={`/owner/properties/${p.id}/edit`} className="icon-button" aria-label={`Edit ${p.title}`} title="Edit">
                        <Pencil size={18} />
                      </Link>
                      <button type="button" className="icon-button danger" onClick={() => setDeleting(p)} aria-label={`Delete ${p.title}`} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this property?"
        message={deleting ? `“${deleting.title}” will be permanently removed from this demo, including from clients' favourites.` : ""}
        confirmLabel="Delete property"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          deleteProperty(deleting.id);
          setDeleting(null);
          notify("Property deleted.", "info");
        }}
      />
    </>
  );
}
