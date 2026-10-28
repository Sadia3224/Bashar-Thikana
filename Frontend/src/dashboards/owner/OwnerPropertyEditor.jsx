import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, Info } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import PropertyForm from "../../components/PropertyForm";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";

export default function OwnerPropertyEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getProperty, addProperty, updateProperty, loading } = useProperties();
  const { notify } = useToast();
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
      await updateProperty(id, data);
      notify("Changes saved and sent for admin review.");
    } else {
      await addProperty(data);
      notify("Property submitted for admin review.");
    }
    navigate("/owner/properties");
  };

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
            ? "Saving changes sends this listing back to the admin review queue; it is hidden from search until approved again."
            : "New listings stay hidden from search until an admin approves them."}
        </span>
      </div>
      <PropertyForm key={id || "new"} property={property} onSubmit={handleSubmit} onCancel={() => navigate("/owner/properties")} submitLabel={editing ? "Save changes" : "Submit for review"} />
    </>
  );
}
