import Icon from "../common/Icon";
export default function RouteSummary({ destination = "Your selected destination" }) {return <div className="route-summary"><div className="route-icon"><Icon name="route"/></div><div><strong>Route to {destination}</strong><p>Live travel time appears here after Google Routes is connected.</p></div></div>}
