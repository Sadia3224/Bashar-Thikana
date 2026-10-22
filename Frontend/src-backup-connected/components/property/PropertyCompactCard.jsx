import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import AvailabilityBadge from "./AvailabilityBadge";
export default function PropertyCompactCard({ property, active = false, onHover }) {
  return <article className={`compact-property ${active?"is-active":""}`} onMouseEnter={onHover}>
    <Link className="compact-image" to={`/property/${property._id}`}>
      {property.images?.[0] ? <img src={property.images[0]} alt={property.title}/> : <div className="image-fallback">No image</div>}
    </Link>
    <div className="compact-content"><div className="card-topline"><span>{property.area || property.city || "Chattogram"}</span><button className="icon-button" aria-label="Save property"><Icon name="heart"/></button></div>
      <Link to={`/property/${property._id}`}><h3>{property.title}</h3></Link><p className="address-line"><Icon name="pin" size={15}/>{property.address}</p>
      <div className="card-bottom"><div><strong>৳{Number(property.monthlyRent).toLocaleString()}</strong><small>/ month</small></div><AvailabilityBadge count={property.availableUnits}/></div>
    </div>
  </article>
}
