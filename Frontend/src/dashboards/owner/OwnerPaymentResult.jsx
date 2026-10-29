import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { useProperties } from "../../context/PropertyContext";
import { formatBDT } from "../../utils/format";

// Stripe redirects here with ?session_id=...; the server confirms the payment with Stripe before marking the listing paid.
export default function OwnerPaymentResult() {
  const [params] = useSearchParams();
  const { confirmListingPayment } = useProperties();
  const [state, setState] = useState({ status: "checking" });
  const started = useRef(false);
  const sessionId = params.get("session_id");

  useEffect(() => {
    // React's dev mode runs effects twice; one confirmation request is enough.
    if (started.current) return;
    started.current = true;
    if (!sessionId) {
      setState({ status: "error", message: "No payment session was found in the link." });
      return;
    }
    confirmListingPayment(sessionId)
      .then((property) => setState({ status: "paid", property }))
      .catch((error) => setState({ status: "error", message: error.message }));
  }, [sessionId, confirmListingPayment]);

  if (state.status === "checking") {
    return <EmptyState icon={Loader2} title="Confirming your payment…" message="This only takes a moment." />;
  }

  if (state.status === "error") {
    return (
      <EmptyState icon={TriangleAlert} title="We couldn't confirm the payment" message={state.message}>
        <Link to="/owner/properties" className="btn btn-primary">Back to my properties</Link>
      </EmptyState>
    );
  }

  const { property } = state;
  return (
    <EmptyState
      icon={CheckCircle2}
      title="Payment successful"
      message={`${formatBDT(property.payment.amount)} paid for “${property.title}”. Your listing is now waiting for admin review.`}
    >
      <Link to="/owner/properties" className="btn btn-primary">Go to my properties</Link>
    </EmptyState>
  );
}
