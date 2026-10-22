import { Link } from "react-router-dom";
import { Bath, BadgeCheck, BedDouble, CalendarDays, Fence, MapPin, Sofa, UsersRound } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import PropertyImage from "./PropertyImage";
import { FURNISHING_LABELS, GENDER_LABELS, TYPE_LABELS, WASHROOM_LABELS } from "../data/options";
import { availabilityText, capacityText, formatBDT } from "../utils/format";

export default function PropertyCard({ property }) {
  const url = `/properties/${property.id}`;
  const occupied = property.occupancy === "occupied";

  return (
    <article className="property-card">
      <div className="card-media">
        <Link to={url} tabIndex={-1} aria-hidden="true">
          <PropertyImage src={property.images[0]} alt={property.title} />
        </Link>
        <div className="card-badges">
          <span className="pill pill-dark">{TYPE_LABELS[property.type]}</span>
          {property.verified && (
            <span className="pill pill-verified">
              <BadgeCheck size={14} aria-hidden="true" /> Verified
            </span>
          )}
        </div>
        <div className="card-fav">
          <FavoriteButton propertyId={property.id} />
        </div>
        {occupied && <span className="card-occupied">Occupied</span>}
      </div>
      <div className="card-body">
        <p className="card-price">
          <strong>{formatBDT(property.rent)}</strong>
          <span>/ month</span>
        </p>
        <h3 className="card-title">
          <Link to={url}>{property.title}</Link>
        </h3>
        <p className="card-location">
          <MapPin size={15} aria-hidden="true" /> {property.area}, {property.district}
        </p>
        <ul className="card-features">
          <li className={`gender-tag gender-${property.gender}`}>
            <UsersRound size={15} aria-hidden="true" /> {GENDER_LABELS[property.gender]}
          </li>
          <li>
            <BedDouble size={15} aria-hidden="true" /> {capacityText(property)}
          </li>
          <li>
            <Fence size={15} aria-hidden="true" /> {property.balcony ? "Balcony" : "No balcony"}
          </li>
          <li>
            <Bath size={15} aria-hidden="true" /> {WASHROOM_LABELS[property.washroom]}
          </li>
          <li>
            <Sofa size={15} aria-hidden="true" /> {FURNISHING_LABELS[property.furnishing]}
          </li>
        </ul>
        <div className="card-footer">
          <span className={`card-availability ${occupied ? "is-occupied" : ""}`}>
            <CalendarDays size={15} aria-hidden="true" /> {availabilityText(property)}
          </span>
          <Link to={url} className="btn btn-outline btn-sm">View Details</Link>
        </div>
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="property-card skeleton-card" aria-hidden="true">
      <div className="card-media skeleton" />
      <div className="card-body">
        <div className="skeleton skeleton-line w-40" />
        <div className="skeleton skeleton-line w-80" />
        <div className="skeleton skeleton-line w-60" />
        <div className="skeleton skeleton-line w-90" />
      </div>
    </div>
  );
}
