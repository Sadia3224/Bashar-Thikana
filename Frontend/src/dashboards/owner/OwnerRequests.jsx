import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import RequestList from "../RequestList";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";

const COPY = {
  visit: { title: "Visit requests", description: "Clients who want to see your properties. Accept or decline each request." },
  contact: { title: "Client messages", description: "Questions from clients. Reply by phone or email, then mark the message as replied." },
};

export default function OwnerRequests({ kind }) {
  const { user } = useAuth();
  const { requests, updateRequestStatus } = useProperties();
  const { notify } = useToast();
  const mine = requests.filter((r) => r.ownerId === user.id && r.kind === kind);

  const setStatus = (request, status, message) => {
    updateRequestStatus(request.id, status);
    notify(message, status === "declined" ? "info" : "success");
  };

  return (
    <>
      <PageHeader title={COPY[kind].title} description={COPY[kind].description} />
      <RequestList
        requests={mine}
        kind={kind}
        perspective="owner"
        emptyAction={<Link to="/owner/properties" className="btn btn-outline">View my properties</Link>}
        renderActions={(request) => {
          if (request.status !== "pending") return null;
          if (kind === "contact") {
            return (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(request, "replied", "Marked as replied.")}>
                <Check size={16} /> Mark as replied
              </button>
            );
          }
          return (
            <>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatus(request, "declined", "Visit declined.")}>
                <X size={16} /> Decline
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(request, "accepted", "Visit accepted.")}>
                <Check size={16} /> Accept
              </button>
            </>
          );
        }}
      />
    </>
  );
}
