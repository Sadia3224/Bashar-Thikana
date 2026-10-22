import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Eye, Search, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import PropertyImage from "../../components/PropertyImage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import { DISTRICTS } from "../../data/locations";
import { TYPE_LABELS } from "../../data/options";
import { formatBDT } from "../../utils/format";

export default function AdminProperties() {
  const { properties, getUser, setVerified, deleteProperty, reports } = useProperties();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [district, setDistrict] = useState("");
  const [removing, setRemoving] = useState(null);

  const openReportCount = (id) => reports.filter((r) => r.propertyId === id && r.status === "open").length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || getUser(p.ownerId)?.name.toLowerCase().includes(q))
      .filter((p) => !district || p.district === district)
      .filter((p) => {
        if (!status) return true;
        if (status === "verified") return p.verified;
        if (status === "reported") return reports.some((r) => r.propertyId === p.id && r.status === "open");
        return p.status === status;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [properties, query, status, district, getUser, reports]);

  const toggleVerified = (p) => {
    setVerified(p.id, !p.verified);
    notify(p.verified ? "Listing marked as unverified." : "Listing marked as verified.", "info");
  };

  return (
    <>
      <PageHeader title="Property management" description={`${properties.length} listings across all owners.`}>
        <Link to="/admin/verification" className="btn btn-primary">Open verification queue</Link>
      </PageHeader>

      <div className="toolbar">
        <div className="input-icon grow">
          <Search size={17} aria-hidden="true" />
          <label htmlFor="prop-q" className="sr-only">Search listings</label>
          <input id="prop-q" type="search" placeholder="Search title, area or owner" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label htmlFor="prop-district" className="sr-only">District</label>
        <select id="prop-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">All districts</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <label htmlFor="prop-status" className="sr-only">Status</label>
        <select id="prop-status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="verified">Verified</option>
          <option value="reported">Reported</option>
        </select>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Building2} title="No listings found" message="Try a different search or filter." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Listing</th>
                <th scope="col">Owner</th>
                <th scope="col">Rent</th>
                <th scope="col">Status</th>
                <th scope="col">Verified</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const reportsOpen = openReportCount(p.id);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="cell-listing">
                        <PropertyImage src={p.images[0]} alt="" className="table-thumb" />
                        <div>
                          <strong>{p.title}</strong>
                          <span className="muted small">
                            {TYPE_LABELS[p.type]} · {p.area}, {p.district}
                          </span>
                          {reportsOpen > 0 && <span className="report-flag">{reportsOpen} open report{reportsOpen > 1 ? "s" : ""}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{getUser(p.ownerId)?.name || "Unknown"}</td>
                    <td>{formatBDT(p.rent)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`verify-toggle ${p.verified ? "is-on" : ""}`}
                        onClick={() => toggleVerified(p)}
                        disabled={p.status !== "approved"}
                        aria-pressed={p.verified}
                        title={p.status !== "approved" ? "Only approved listings can be verified" : undefined}
                      >
                        <BadgeCheck size={16} aria-hidden="true" /> {p.verified ? "Verified" : "Unverified"}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link to={`/properties/${p.id}`} className="icon-button" aria-label={`View ${p.title}`} title="View">
                          <Eye size={18} />
                        </Link>
                        <button type="button" className="icon-button danger" onClick={() => setRemoving(p)} aria-label={`Remove ${p.title}`} title="Remove">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this listing?"
        message={removing ? `“${removing.title}” will be deleted from the demo data for everyone using this browser.` : ""}
        confirmLabel="Remove listing"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          deleteProperty(removing.id);
          setRemoving(null);
          notify("Listing removed.", "info");
        }}
      />
    </>
  );
}
