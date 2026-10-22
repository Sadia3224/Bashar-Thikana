import { Heart } from "lucide-react";
import { useProperties } from "../context/PropertyContext";
import { useToast } from "../context/ToastContext";

export default function FavoriteButton({ propertyId, variant = "icon" }) {
  const { isFavorite, toggleFavorite } = useProperties();
  const { notify } = useToast();
  const saved = isFavorite(propertyId);

  const handleClick = (event) => {
    event.preventDefault();
    const nowSaved = toggleFavorite(propertyId);
    notify(nowSaved ? "Saved to your favourites." : "Removed from your favourites.", nowSaved ? "success" : "info");
  };

  if (variant === "button") {
    return (
      <button type="button" className={`btn btn-outline btn-block ${saved ? "is-saved" : ""}`} aria-pressed={saved} onClick={handleClick}>
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved to Favourites" : "Save to Favourites"}
      </button>
    );
  }

  return (
    <button type="button" className={`fav-button ${saved ? "is-saved" : ""}`} aria-pressed={saved} aria-label={saved ? "Remove from favourites" : "Save to favourites"} onClick={handleClick}>
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
