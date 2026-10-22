import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Check, ClipboardCheck, Eye, ShieldAlert, X } from "lucide-react";
import PageHeader, { Tabs } from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import PropertyImage from "../../components/PropertyImage";
import { Field, fieldProps } from "../../components/Field";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import { FURNISHING_LABELS, GENDER_LABELS, TYPE_LABELS, WASHROOM_LABELS } from "../../data/options";
import { capacityText, formatBDT, formatDate } from "../../utils/format";

function RejectForm({ property, onDone, onCancel }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (reason.trim().length < 10) return setError("Explain the reason in at least 10 characters so the owner can fix it.");
    onDone(reason.trim());
  };
  return (
    <form onSubmit={submit} noValidate className="form-grid">
      <p className="muted">“{property.title}” will be hidden from search and the owner will see your note.</p>
      <Field label="Reason for rejection" htmlFor="reason" error={error} required>
        <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} {...fieldProps("reason", error)} />
      </Field>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-danger">Reject listing</button>
      </div>
    </form>
  );
}

export default function AdminVerification() {
  const { properties, getUser, reviewProperty, setVerified } = useProperties();
  const { notify } = useToast();
  const [tab, setTab] = useState("pending");
  const [rejecting, setRejecting] = useState(null);

  const byStatus = (status) => properties.filter((p) => p.status === status);
  const shown = byStatus(tab).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const approve = (p, verify) => {
    reviewProperty(p.id, "approved");
    if (verify) setVerified(p.id, true);
    notify(verify ? "Listing approved and marked verified." : "Listing approved and now public.");
  };

  return (
    <>
      <PageHeader title="Listing verification" description="Approve listings to publish them, or reject them with a note for the owner." />
      <Tabs
        label="Review status"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "pending", label: "Pending", count: byStatus("pending").length },
          { value: "rejected", label: "Rejected", count: byStatus("rejected").length },
        ]}
      />

      {shown.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title={tab === "pending" ? "No listings waiting for review" : "No rejected listings"} message={tab === "pending" ? "New and edited listings from owners will appear here." : undefined} />
      ) : (
        <ul className="review-list">
          {shown.map((p) => {
            const owner = getUser(p.ownerId);
            return (
              <li key={p.id} className="review-card panel">
                <div className="review-images">
                  {p.images.slice(0, 3).map((src, i) => (
                    <PropertyImage key={`${i}-${src.slice(-20)}`} src={src} alt={`${p.title} photo ${i + 1}`} />
                  ))}
                </div>
                <div className="review-body">
                  <div className="review-head">
                    <div>
                      <h3>{p.title}</h3>
                      <p className="muted small">
                        {p.address}, {p.area}, {p.district} · submitted {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <p className="review-rent">{formatBDT(p.rent)}<span className="muted"> / month</span></p>
                  </div>
                  <ul className="spec-tags">
                    <li>{TYPE_LABELS[p.type]}</li>
                    <li>{GENDER_LABELS[p.gender]}</li>
                    <li>{capacityText(p)}</li>
                    <li>{p.balcony ? "Balcony" : "No balcony"}</li>
                    <li>{WASHROOM_LABELS[p.washroom]}</li>
                    <li>{FURNISHING_LABELS[p.furnishing]}</li>
                    <li>From {formatDate(p.availableFrom)}</li>
                  </ul>
                  <p className="review-desc">{p.description}</p>
                  <p className="review-owner">
                    {owner?.verified ? <BadgeCheck size={16} /> : <ShieldAlert size={16} />}
                    {owner ? `${owner.name} · ${owner.phone} · ${owner.verified ? "verified owner" : "unverified owner"}` : "Unknown owner"}
                  </p>
                  {p.status === "rejected" && p.rejectionReason && <p className="listing-reason">Rejection note: {p.rejectionReason}</p>}
                  <div className="review-actions">
                    <Link to={`/properties/${p.id}`} className="btn btn-ghost btn-sm">
                      <Eye size={16} /> Preview
                    </Link>
                    {p.status === "pending" && (
                      <button type="button" className="btn btn-outline btn-sm danger-text" onClick={() => setRejecting(p)}>
                        <X size={16} /> Reject
                      </button>
                    )}
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => approve(p, false)}>
                      <Check size={16} /> Approve
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => approve(p, true)}>
                      <BadgeCheck size={16} /> Approve &amp; verify
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Reject listing" size="sm">
        {rejecting && (
          <RejectForm
            property={rejecting}
            onCancel={() => setRejecting(null)}
            onDone={(reason) => {
              reviewProperty(rejecting.id, "rejected", reason);
              setRejecting(null);
              notify("Listing rejected. The owner can see your note.", "info");
            }}
          />
        )}
      </Modal>
    </>
  );
}
