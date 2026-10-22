import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import PropertyCard from "../../components/PropertyCard";
import EmptyState from "../../components/EmptyState";
import { useProperties } from "../../context/PropertyContext";

export default function ClientFavorites() {
  const { favoriteIds, getProperty } = useProperties();
  // Listings that were removed or taken down by an admin drop out of the list.
  const saved = favoriteIds.map(getProperty).filter((p) => p?.status === "approved");

  return (
    <>
      <PageHeader title="Saved properties" description="Tap the heart on a card to remove it. Favourites are kept after you refresh the page." />
      {saved.length ? (
        <div className="property-grid">
          {saved.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Heart} title="You haven't saved any properties" message="Save places you like while browsing so you can compare them later.">
          <Link to="/properties" className="btn btn-primary">Browse properties</Link>
        </EmptyState>
      )}
    </>
  );
}
