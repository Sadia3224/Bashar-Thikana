import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, CreditCard, Info } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import PropertyForm from "../../components/PropertyForm";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import { PROPERTY_TYPES } from "../../data/options";
import useListingFees from "../../hooks/useListingFees";
import { formatBDT } from "../../utils/format";

export default function OwnerPropertyEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getProperty, addProperty, updateProperty, payListingFee, loading } = useProperties();
  const { notify } = useToast();
  const { fees, testMode } = useListingFees();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const property = editing ? getProperty(id) : null;

  if (editing && loading) return null;

  if (editing && (!property || property.ownerId !== user.id)) {
    return (
      <EmptyState icon={Building2} title="Property not found" message="This listing doesn't exist or belongs to another owner.">
        <Link to="/owner/properties" className="btn btn-primary">Back to my properties</Link>
      </EmptyState>
    );
  }

  const handleSubmit = async (data) => {
    if (editing) {
      try {
        await updateProperty(id, data);
      } catch (error) {
        notify(error.message, "error");
        return;
      }
      notify("Changes saved and sent for admin review.");
      navigate("/owner/properties");
      return;
    }

    let created;
    try {
      created = await addProperty(data);
    } catch (error) {
      notify(error.message, "error");
      return;
    }
    // The listing is saved; if Stripe can't be reached the owner can pay later from My properties.
    try {
      notify("Property saved. Taking you to the secure payment page…", "info");
      await payListingFee(created.id);
    } catch (error) {
      notify(`Property saved, but payment could not start: ${error.message}`, "error");
      navigate("/owner/properties");
    }
  };

  const feeList = PROPERTY_TYPES.filter((t) => fees[t.value]).map((t) => `${t.label} ${formatBDT(fees[t.value])}`).join(" · ");

  return (
    <>
      <PageHeader
        title={editing ? "Edit property" : "Add new property"}
        description={editing ? property.title : "Fill in the details clients look for. Fields change depending on the property type."}
      />
      <div className="alert alert-info">
        <Info size={18} aria-hidden="true" />
        <span>
          {editing
            ? "Saving changes sends this listing back to the admin review queue; it is hidden from search until approved again. Edits are free; the property type can't be changed after the fee is paid."
            : "New listings stay hidden from search until an admin approves them."}
        </span>
      </div>
      {!editing && feeList && (
        <div className="alert alert-warning">
          <CreditCard size={18} aria-hidden="true" />
          <span>
            <strong>One-time listing fee by property type:</strong> {feeList}. After you submit, you'll pay securely with Stripe; the
            listing goes to admin review once the payment is confirmed.
            {testMode && " Test mode: use card 4242 4242 4242 4242, any future date and any CVC."}
          </span>
        </div>
      )}
      <PropertyForm
        key={id || "new"}
        property={property}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/owner/properties")}
        submitLabel={editing ? "Save changes" : "Continue to payment"}
      />
    </>
  );
}
