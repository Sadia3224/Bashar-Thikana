import { NavLink } from "react-router-dom";
import Icon from "../common/Icon";
const links = [
  ["/owner/dashboard","Overview","home"], ["/owner/properties","My properties","home"], ["/owner/property/new","Add property","plus"], ["/owner/rooms","Units & availability","users"], ["/owner/requests","Requests","clock"]
];
export default function OwnerSidebar(){return <aside className="app-sidebar"><div className="sidebar-wordmark"><span>Bashar</span><strong>Thikana</strong></div><div className="sidebar-kicker">USER / PROPERTY OWNER</div><nav>{links.map(([to,label,icon])=><NavLink key={to} to={to} className={({isActive})=>isActive?"side-link active":"side-link"}><Icon name={icon}/><span>{label}</span></NavLink>)}</nav><div className="sidebar-foot"><strong>Need to update vacancy?</strong><p>Keep availability current so consumers can trust the listing.</p></div></aside>}
