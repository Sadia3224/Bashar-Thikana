import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Bath, BadgeCheck, BedDouble, Building2, CalendarDays, Check, DoorOpen, Fence, Flag, Info, MapPin, MessageSquare,
  ShieldAlert, Sofa, UsersRound,
} from "lucide-react";
import Gallery from "../components/Gallery";
import FavoriteButton from "../components/FavoriteButton";
import PropertyCard from "../components/PropertyCard";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { ContactOwnerModal, ReportModal, VisitRequestModal } from "../components/RequestModals";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertyContext";
import { BED_BASED_TYPES, FURNISHING_LABELS, GENDER_LABELS, TYPE_LABELS, WASHROOM_LABELS } from "../data/options";
import { availabilityText, formatBDT, formatDate, initials } from "../utils/format";

const maskPhone = (phone = "") => (phone ? `${phone.replace(/\D/g, "").slice(0, 3)}••-••••••` : "Not provided");

function roomFacts(property) {
  if (property.type === "full-flat") {
    return [
      { icon: BedDouble, label: "Bedrooms", value: property.rooms },
      { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    ];
  }
  if (BED_BASED_TYPES.includes(property.type)) {
    const facts = [
      { icon: BedDouble, label: "Available beds", value: `${property.availableBeds} of ${property.totalBeds}` },
    ];
    if (property.type === "bed") facts.push({ icon: DoorOpen, label: "Rooms in unit", value: property.rooms }, { icon: Bath, label: "Bathrooms", value: property.bathrooms });
    return facts;
  }
  return [{ icon: BedDouble, label: "Beds in room", value: property.totalBeds }];
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getProperty, getUser, publicProperties } = useProperties();
  const [modal, setModal] = useState(null);

  const property = getProperty(id);
  const owner = property && getUser(property.ownerId);
  const canPreview = property && user && (user.role === "admin" || user.id === property.ownerId);
  const visible = property && (property.status === "approved" || canPreview);

  const similar = useMemo(() => {
    if (!property) return [];
    const score = (p) => (p.district === property.district ? 2 : 0) + (p.type === property.type ? 1 : 0);
    return publicProperties
      .filter((p) => p.id !== property.id && score(p) > 0)
      .sort((a, b) => score(b) - score(a) || Math.abs(a.rent - property.rent) - Math.abs(b.rent - property.rent))
      .slice(0, 3);
  }, [property, publicProperties]);

  if (!visible) {
    return (
      <div className="container page-pad">
        <EmptyState icon={Building2} title="Property not found" message="This listing may have been removed, or it is not public yet.">
          <Link to="/properties" className="btn btn-primary">Browse properties</Link>
        </EmptyState>
      </div>
    );
  }

  const occupied = property.occupancy === "occupied";
  const facts = [
    { icon: Building2, label: "Property type", value: TYPE_LABELS[property.type] },
    ...roomFacts(property),
    { icon: UsersRound, label: "Gender eligibility", value: GENDER_LABELS[property.gender] },
    { icon: Fence, label: "Balcony", value: property.balcony ? "Yes" : "No" },
    { icon: Bath, label: "Washroom", value: WASHROOM_LABELS[property.washroom] },
    { icon: Sofa, label: "Furnishing", value: FURNISHING_LABELS[property.furnishing] },
    { icon: CalendarDays, label: "Available from", value: formatDate(property.availableFrom) },
  ];

  return (
    <div className="details-page">
      <div className="container">
        <Link to="/properties" className="back-link">
          <ArrowLeft size={16} /> Back to search
        </Link>

        {property.status !== "approved" && (
          <div className="alert alert-warning" role="status">
            <Info size={18} aria-hidden="true" />
            <span>
              Preview only. This listing is <strong>{property.status === "pending" ? "pending admin review" : "rejected"}</strong> and is not visible to the public.
              {property.rejectionReason && ` Reason: ${property.rejectionReason}`}
            </span>
          </div>
        )}

        <Gallery key={property.id} images={property.images} title={property.title} />

        <div className="details-layout">
          <div className="details-main">
            <div className="details-heading">
              <div className="details-tags">
                <span className="pill pill-soft">{TYPE_LABELS[property.type]}</span>
                <span className={`pill gender-pill gender-${property.gender}`}>
                  <UsersRound size={14} aria-hidden="true" /> {GENDER_LABELS[property.gender]}
                </span>
                {property.verified && (
                  <span className="pill pill-verified">
                    <BadgeCheck size={14} aria-hidden="true" /> Verified listing
                  </span>
                )}
                {occupied && <StatusBadge status="occupied" label="Currently occupied" />}
              </div>
              <h1>{property.title}</h1>
              <p className="details-location">
                <MapPin size={17} aria-hidden="true" /> {property.address}, {property.area}, {property.district}
              </p>
            </div>

            <section className="details-section">
              <h2>Key details</h2>
              <dl className="fact-grid">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="fact">
                    <Icon size={20} aria-hidden="true" />
                    <div>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            <section className="details-section">
              <h2>About this place</h2>
              <p className="details-description">{property.description}</p>
            </section>

            <section className="details-section">
              <h2>Utilities and facilities</h2>
              {property.facilities.length ? (
                <ul className="facility-list">
                  {property.facilities.map((facility) => (
                    <li key={facility}>
                      <Check size={16} aria-hidden="true" /> {facility}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">The owner has not listed any facilities.</p>
              )}
            </section>

            <section className="details-section">
              <h2>Owner</h2>
              {owner ? (
                <div className="owner-card">
                  <span className="avatar avatar-lg">{initials(owner.name)}</span>
                  <div className="owner-info">
                    <h3>{owner.name}</h3>
                    <p className={`verify-note ${owner.verified ? "is-verified" : ""}`}>
                      {owner.verified ? <BadgeCheck size={17} /> : <ShieldAlert size={17} />}
                      {owner.verified ? "Verified owner" : "Owner not yet verified"}
                    </p>
                    <p className="muted small">Member since {formatDate(owner.createdAt)} · Phone {maskPhone(owner.phone)} (shared after contact)</p>
                    {owner.about && <p>{owner.about}</p>}
                  </div>
                </div>
              ) : (
                <p className="muted">Owner information is unavailable.</p>
              )}
            </section>

            <button type="button" className="link-button report-link" onClick={() => setModal("report")}>
              <Flag size={15} /> Report this listing
            </button>
          </div>

          <aside className="details-aside">
            <div className="price-card">
              <p className="price-line">
                <strong>{formatBDT(property.rent)}</strong> <span>/ month</span>
              </p>
              <p className={`availability-line ${occupied ? "is-occupied" : ""}`}>
                <CalendarDays size={16} aria-hidden="true" /> {availabilityText(property)}
              </p>
              <div className="price-actions">
                <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => setModal("visit")} disabled={occupied}>
                  <CalendarDays size={18} /> Request a Visit
                </button>
                <button type="button" className="btn btn-outline btn-block" onClick={() => setModal("contact")}>
                  <MessageSquare size={18} /> Contact Owner
                </button>
                <FavoriteButton propertyId={property.id} variant="button" />
              </div>
              {occupied && <p className="muted small">Visits are paused while the place is occupied. You can still message the owner.</p>}
              <p className="price-note">
                <Info size={15} aria-hidden="true" /> Never pay an advance before visiting. Requests here are a demo and are not bookings.
              </p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="section similar">
            <div className="section-head">
              <h2>Similar properties</h2>
              <Link to={`/properties?district=${encodeURIComponent(property.district)}`} className="link-arrow">More in {property.district}</Link>
            </div>
            <div className="property-grid">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <ContactOwnerModal open={modal === "contact"} onClose={() => setModal(null)} property={property} />
      <VisitRequestModal open={modal === "visit"} onClose={() => setModal(null)} property={property} />
      <ReportModal open={modal === "report"} onClose={() => setModal(null)} property={property} />
    </div>
  );
}
