import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, message, children, compact = false }) {
  return (
    <div className={`empty-state ${compact ? "empty-compact" : ""}`}>
      <span className="empty-icon" aria-hidden="true">
        <Icon size={compact ? 22 : 28} />
      </span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children && <div className="empty-actions">{children}</div>}
    </div>
  );
}
