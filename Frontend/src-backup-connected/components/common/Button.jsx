import { Link } from "react-router-dom";
export default function Button({ to, children, variant = "primary", className = "", ...props }) {
  const cn = `button button-${variant} ${className}`.trim();
  return to ? <Link className={cn} to={to}>{children}</Link> : <button className={cn} {...props}>{children}</button>;
}
