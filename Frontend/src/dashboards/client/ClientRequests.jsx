import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import RequestList from "../RequestList";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";

const COPY = {
  visit: { title: "Visit requests", description: "Visits you've asked to make. Owners accept or decline them from their dashboard." },
  contact: { title: "Contact requests", description: "Messages you've sent to owners about their listings." },
};

export default function ClientRequests({ kind }) {
  const { user } = useAuth();
  const { requests, updateRequestStatus } = useProperties();
  const { notify } = useToast();
  const [cancelling, setCancelling] = useState(null);
  const mine = requests.filter((r) => r.clientId === user.id && r.kind === kind);

  return (
    <>
      <PageHeader title={COPY[kind].title} description={COPY[kind].description} />
      <RequestList
        requests={mine}
        kind={kind}
        perspective="client"
        emptyAction={<Link to="/properties" className="btn btn-primary">Browse properties</Link>}
        renderActions={(request) =>
          (request.status === "pending" || request.status === "accepted") && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setCancelling(request)}>
              {kind === "visit" ? "Cancel visit" : "Withdraw message"}
            </button>
          )
        }
      />
      <ConfirmDialog
        open={Boolean(cancelling)}
        title={kind === "visit" ? "Cancel this visit request?" : "Withdraw this message?"}
        message="The owner will see it as cancelled. You can send a new request later."
        confirmLabel={kind === "visit" ? "Cancel visit" : "Withdraw"}
        onCancel={() => setCancelling(null)}
        onConfirm={() => {
          updateRequestStatus(cancelling.id, "cancelled");
          setCancelling(null);
          notify("Request cancelled.", "info");
        }}
      />
    </>
  );
}
