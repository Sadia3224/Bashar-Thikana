import { LISTING_STATUS_LABELS, REQUEST_STATUS_LABELS } from "../data/options";

const LABELS = {
  ...LISTING_STATUS_LABELS,
  ...REQUEST_STATUS_LABELS,
  open: "Open",
  resolved: "Resolved",
  dismissed: "Dismissed",
  active: "Active",
  inactive: "Inactive",
  available: "Available",
  occupied: "Occupied",
};

const TONES = {
  pending: "warning",
  open: "warning",
  approved: "success",
  accepted: "success",
  replied: "success",
  resolved: "success",
  active: "success",
  available: "success",
  rejected: "danger",
  declined: "danger",
  inactive: "danger",
  cancelled: "neutral",
  dismissed: "neutral",
  occupied: "neutral",
};

export default function StatusBadge({ status, label }) {
  return <span className={`status status-${TONES[status] || "neutral"}`}>{label || LABELS[status] || status}</span>;
}
