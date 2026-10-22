import Badge from "../common/Badge";
export default function AvailabilityBadge({ count = 0 }) {
  return count > 0 ? <Badge tone="sage">{count} {count === 1 ? "space" : "spaces"} available</Badge> : <Badge tone="muted">Availability unconfirmed</Badge>;
}
