export default function MapMarker({ label, active, x, y, onClick }) {
  return <button type="button" className={`map-price-marker ${active?"active":""}`} style={{left:`${x}%`,top:`${y}%`}} onClick={onClick}>{label}</button>;
}
