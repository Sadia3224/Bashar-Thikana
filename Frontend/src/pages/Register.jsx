import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Building2, Loader2, Search, ShieldCheck } from "lucide-react";
import AuthShell from "./AuthShell";
import { Field, PasswordInput, fieldProps, focusFirstError } from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ROLES } from "../data/options";
import { passwordProblem, validateContact } from "../utils/validation";

const ROLE_CHOICES = [
  { value: "client", label: "Client", icon: Search, text: "I'm looking for a room, bed or flat." },
  { value: "owner", label: "Owner", icon: Building2, text: "I want to list and manage properties." },
  { value: "admin", label: "Admin", icon: ShieldCheck, text: "Review listings and manage users." },
];

export default function Register() {
  const { user, register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const initialRole = ROLE_CHOICES.some((r) => r.value === params.get("role")) ? params.get("role") : "client";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", role: initialRole });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) return <Navigate to={ROLES[user.role].home} replace />;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const next = validateContact(form);
    const problem = passwordProblem(form.password);
    if (problem) next.password = problem;
    if (!form.confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return focusFirstError(next, ["name", "email", "phone", "password", "confirmPassword"]);

    setSubmitting(true);
    try {
      const account = await register(form);
      notify(`Account created. Welcome, ${account.name.split(" ")[0]}!`);
      const from = account.role === "client" ? location.state?.from : null;
      navigate(from || ROLES[account.role].home, { replace: true });
    } catch (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Choose how you will use Bashar Thikana.">
      <form onSubmit={handleSubmit} noValidate className="form-grid">
        {formError && <div className="alert alert-danger" role="alert">{formError}</div>}
        <fieldset className="role-picker">
          <legend>I am registering as</legend>
          <div className="role-options">
            {ROLE_CHOICES.map(({ value, label, icon: Icon, text }) => (
              <label key={value} className={`role-option ${form.role === value ? "is-active" : ""}`}>
                <input type="radio" name="role" value={value} checked={form.role === value} onChange={set("role")} />
                <Icon size={22} aria-hidden="true" />
                <strong>{label}</strong>
                <span>{text}</span>
              </label>
            ))}
          </div>
          {form.role === "admin" && (
            <p className="alert alert-warning small">
              Admin self-registration exists only so this demo can be explored. A real platform would never let anyone choose the admin role.
            </p>
          )}
        </fieldset>
        <Field label="Full name" htmlFor="name" error={errors.name} required>
          <input autoComplete="name" value={form.name} onChange={set("name")} {...fieldProps("name", errors.name)} />
        </Field>
        <div className="form-row">
          <Field label="Email" htmlFor="email" error={errors.email} required>
            <input type="email" autoComplete="email" value={form.email} onChange={set("email")} {...fieldProps("email", errors.email)} />
          </Field>
          <Field label="Phone number" htmlFor="phone" error={errors.phone} required>
            <input type="tel" autoComplete="tel" placeholder="01712-345678" value={form.phone} onChange={set("phone")} {...fieldProps("phone", errors.phone)} />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters with a letter and a number." required>
            <PasswordInput id="password" value={form.password} onChange={set("password")} error={errors.password} hint autoComplete="new-password" />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword} required>
            <PasswordInput id="confirmPassword" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} autoComplete="new-password" />
          </Field>
        </div>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
          {submitting && <Loader2 size={18} className="spin" aria-hidden="true" />}
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login" state={location.state}>Log in</Link>
      </p>
    </AuthShell>
  );
}
