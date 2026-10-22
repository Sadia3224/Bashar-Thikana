export default function Badge({ children, tone = "sage" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
