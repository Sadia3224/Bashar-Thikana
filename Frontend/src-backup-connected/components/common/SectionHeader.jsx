export default function SectionHeader({ eyebrow, title, text, action }) {
  return <div className="section-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{text && <p>{text}</p>}</div>{action}</div>;
}
