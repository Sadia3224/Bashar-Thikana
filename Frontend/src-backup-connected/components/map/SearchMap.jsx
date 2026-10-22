import MapMarker from "./MapMarker";
import Icon from "../common/Icon";
export default function SearchMap({ properties=[], activeId, onSelect, destination="GEC Circle, Chattogram" }) {
  const spots=[[31,32],[63,25],[51,58],[76,67],[22,72],[43,18]];
  return <div className="search-map"><div className="map-grid map-road-a"/><div className="map-grid map-road-b"/><div className="destination-pin"><Icon name="pin" size={16}/><span>{destination}</span></div>{properties.map((p,i)=><MapMarker key={p._id} x={spots[i%spots.length][0]} y={spots[i%spots.length][1]} label={`৳${Math.round(p.monthlyRent/1000)}k`} active={p._id===activeId} onClick={()=>onSelect?.(p._id)}/>) }<div className="map-legend"><strong>Map preview</strong><span>Connect Google Maps key later for live geocoding and routes.</span></div></div>
}
