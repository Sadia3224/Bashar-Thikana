import { Link } from "react-router-dom";
import AvailabilityBadge from "./AvailabilityBadge";
import Icon from "../common/Icon";
export default function PropertyFeaturedCard({ property }) { if(!property) return null; return <article className="featured-property">
  <div className="featured-media">{property.images?.[0] ? <img src={property.images[0]} alt={property.title}/> : <div className="image-fallback">Property image</div>}<span className="verified-tag">Owner submitted</span></div>
  <div className="featured-copy"><div className="eyebrow">FEATURED MATCH</div><h2>{property.title}</h2><p className="address-line"><Icon name="pin" size={15}/>{property.address}</p><p>{property.description}</p><div className="facility-line">{(property.facilities||[]).slice(0,4).map(x=><span key={x}>{x}</span>)}</div><div className="featured-foot"><div><strong>৳{Number(property.monthlyRent).toLocaleString()}</strong><small> / month</small></div><AvailabilityBadge count={property.availableUnits}/><Link className="text-arrow" to={`/property/${property._id}`}>View details <Icon name="arrow" size={16}/></Link></div></div>
</article>}
