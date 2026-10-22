import { useState } from "react";
import { RotateCcw } from "lucide-react";
import ProfilePage from "../ProfilePage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useProperties } from "../../context/PropertyContext";

export default function AdminProfile() {
  const { resetDemoData } = useProperties();
  const [confirming, setConfirming] = useState(false);

  return (
    <ProfilePage>
      <section className="panel danger-zone">
        <div>
          <h2 className="panel-title">Demo data</h2>
          <p className="muted">
            Restore the original sample listings, users and reports. This also deletes every account, request and favourite created in this
            browser, including this admin account.
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
          <RotateCcw size={17} /> Reset demo data
        </button>
      </section>
      <ConfirmDialog
        open={confirming}
        title="Reset all demo data?"
        message="Everything stored by Bashar Thikana in this browser will be cleared and you will be signed out."
        confirmLabel="Reset everything"
        onCancel={() => setConfirming(false)}
        onConfirm={resetDemoData}
      />
    </ProfilePage>
  );
}
