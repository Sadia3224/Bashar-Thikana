export default function Input({ label, hint, ...props }) {
  return <label className="field"><span>{label}</span><input {...props}/>{hint && <small>{hint}</small>}</label>;
}
