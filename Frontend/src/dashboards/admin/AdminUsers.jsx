import { useMemo, useState } from "react";
import { BadgeCheck, Search, UsersRound } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import { ROLES } from "../../data/options";
import { formatDate, initials } from "../../utils/format";

export default function AdminUsers() {
  const { user: me, users, setUserActive, setUserVerified } = useAuth();
  const { properties } = useProperties();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [deactivating, setDeactivating] = useState(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q) || u.phone.includes(q))
      .filter((u) => !role || u.role === role)
      .filter((u) => !status || (status === "active" ? u.active : !u.active))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [users, query, role, status]);

  const activate = (u) => {
    setUserActive(u.id, true);
    notify(`${u.name} activated.`);
  };

  return (
    <>
      <PageHeader title="User management" description={`${users.length} accounts · deactivated users cannot log in to this demo.`} />

      <div className="toolbar">
        <div className="input-icon grow">
          <Search size={17} aria-hidden="true" />
          <label htmlFor="user-q" className="sr-only">Search users</label>
          <input id="user-q" type="search" placeholder="Search name, email or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label htmlFor="user-role" className="sr-only">Role</label>
        <select id="user-role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {Object.entries(ROLES).map(([value, r]) => (
            <option key={value} value={value}>{r.label}s</option>
          ))}
        </select>
        <label htmlFor="user-status" className="sr-only">Status</label>
        <select id="user-status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={UsersRound} title="No users found" message="Try a different search or filter." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Phone</th>
                <th scope="col">Joined</th>
                <th scope="col">Listings</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => {
                const isMe = u.id === me.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-user">
                        <span className="avatar avatar-sm">{initials(u.name)}</span>
                        <div>
                          <strong>
                            {u.name} {isMe && <span className="muted">(you)</span>}
                          </strong>
                          <span className="muted small">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-tag role-${u.role}`}>{ROLES[u.role].label}</span>
                      {u.role === "owner" && u.verified && <BadgeCheck size={16} className="inline-verified" aria-label="Verified owner" />}
                    </td>
                    <td>{u.phone || "Not provided"}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>{u.role === "owner" ? properties.filter((p) => p.ownerId === u.id).length : "N/A"}</td>
                    <td><StatusBadge status={u.active ? "active" : "inactive"} /></td>
                    <td>
                      <div className="row-actions">
                        {u.role === "owner" && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setUserVerified(u.id, !u.verified);
                              notify(u.verified ? `${u.name} is no longer verified.` : `${u.name} is now a verified owner.`, "info");
                            }}
                          >
                            {u.verified ? "Unverify" : "Verify"}
                          </button>
                        )}
                        {u.active ? (
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeactivating(u)} disabled={isMe} title={isMe ? "You cannot deactivate yourself" : undefined}>
                            Deactivate
                          </button>
                        ) : (
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => activate(u)}>Activate</button>
                        )}
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
        open={Boolean(deactivating)}
        title="Deactivate this user?"
        message={deactivating ? `${deactivating.name} will be signed out and unable to log in until reactivated. (Demo data only.)` : ""}
        confirmLabel="Deactivate"
        onCancel={() => setDeactivating(null)}
        onConfirm={() => {
          setUserActive(deactivating.id, false);
          notify(`${deactivating.name} deactivated.`, "info");
          setDeactivating(null);
        }}
      />
    </>
  );
}
