import { useState } from "react";
import { Link } from "react-router-dom";
import { Flag, Trash2 } from "lucide-react";
import PageHeader, { Tabs } from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/format";

export default function AdminReports() {
  const { reports, getProperty, getUser, updateReportStatus, deleteProperty } = useProperties();
  const { notify } = useToast();
  const [tab, setTab] = useState("open");
  const [removing, setRemoving] = useState(null);

  const count = (status) => reports.filter((r) => r.status === status).length;
  const shown = (tab === "all" ? reports : reports.filter((r) => r.status === tab)).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const setStatus = (report, status) => {
    updateReportStatus(report.id, status);
    notify(status === "resolved" ? "Report marked as resolved." : "Report dismissed.", "info");
  };

  return (
    <>
      <PageHeader title="Reports" description="Problems flagged by users on listings." />
      <Tabs
        label="Report status"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "open", label: "Open", count: count("open") },
          { value: "resolved", label: "Resolved", count: count("resolved") },
          { value: "dismissed", label: "Dismissed", count: count("dismissed") },
          { value: "all", label: "All", count: reports.length },
        ]}
      />

      {shown.length === 0 ? (
        <EmptyState icon={Flag} title="No reports here" message={tab === "open" ? "There are no open reports right now." : undefined} />
      ) : (
        <ul className="request-list">
          {shown.map((report) => {
            const property = getProperty(report.propertyId);
            const reporter = getUser(report.reporterId);
            return (
              <li key={report.id} className="request-card">
                <div className="request-property">
                  <Flag size={20} className="report-icon" aria-hidden="true" />
                  <div>
                    {property ? (
                      <Link to={`/properties/${property.id}`} className="request-title">{property.title}</Link>
                    ) : (
                      <span className="request-title muted">Listing removed</span>
                    )}
                    <p className="muted small">
                      Reported by {reporter?.name || "a user"} · {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <div className="request-details">
                  <p><strong>{report.reason}</strong></p>
                  {report.details && <p className="request-message">“{report.details}”</p>}
                </div>
                {report.status === "open" && (
                  <div className="request-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus(report, "dismissed")}>Dismiss</button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatus(report, "resolved")}>Mark resolved</button>
                    {property && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setRemoving(report)}>
                        <Trash2 size={16} /> Remove listing
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove the reported listing?"
        message="The listing will be deleted from the demo data and the report marked as resolved."
        confirmLabel="Remove listing"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          deleteProperty(removing.propertyId);
          updateReportStatus(removing.id, "resolved");
          setRemoving(null);
          notify("Listing removed and report resolved.", "info");
        }}
      />
    </>
  );
}
