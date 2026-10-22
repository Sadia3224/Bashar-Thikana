import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Label + control + error/hint. Pass the control's id as `htmlFor` so the label and messages are linked.
export function Field({ label, htmlFor, error, hint, required, className = "", children }) {
  return (
    <div className={`field ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label htmlFor={htmlFor}>
          {label}
          {required && <span className="required" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="field-error" id={`${htmlFor}-msg`} role="alert">{error}</p>
      ) : (
        hint && <p className="field-hint" id={`${htmlFor}-msg`}>{hint}</p>
      )}
    </div>
  );
}

// Accessibility props for a control rendered inside <Field>.
export const fieldProps = (id, error, hint) => ({
  id,
  name: id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error || hint ? `${id}-msg` : undefined,
});

export function PasswordInput({ id, value, onChange, error, hint, autoComplete = "current-password", ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-with-action">
      <input type={visible ? "text" : "password"} value={value} onChange={onChange} autoComplete={autoComplete} {...fieldProps(id, error, hint)} {...rest} />
      <button type="button" className="input-action" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

// Focus the first invalid control after a failed submit.
export function focusFirstError(errors, order) {
  const first = order.find((key) => errors[key]);
  if (first) document.getElementById(first)?.focus();
}
