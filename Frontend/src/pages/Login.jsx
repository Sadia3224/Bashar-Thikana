import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthShell from "./AuthShell";
import { Field, PasswordInput, fieldProps, focusFirstError } from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ROLES } from "../data/options";
import { EMAIL_RE } from "../utils/validation";

export default function Login() {
  const { user, login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) return <Navigate to={ROLES[user.role].home} replace />;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const next = {};
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return focusFirstError(next, ["email", "password"]);

    setSubmitting(true);
    try {
      const account = await login(form.email, form.password);
      notify(`Welcome back, ${account.name.split(" ")[0]}!`);
      navigate(location.state?.from || ROLES[account.role].home, { replace: true });
    } catch (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Log in" subtitle="Welcome back. Log in to manage your favourites, listings or requests.">
      <form onSubmit={handleSubmit} noValidate className="form-grid">
        {formError && <div className="alert alert-danger" role="alert">{formError}</div>}
        <Field label="Email" htmlFor="email" error={errors.email} required>
          <input type="email" autoComplete="email" value={form.email} onChange={set("email")} {...fieldProps("email", errors.email)} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password} required>
          <PasswordInput id="password" value={form.password} onChange={set("password")} error={errors.password} />
        </Field>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
          {submitting && <Loader2 size={18} className="spin" aria-hidden="true" />}
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="auth-switch">
        New to Bashar Thikana? <Link to="/register" state={location.state}>Create an account</Link>
      </p>
    </AuthShell>
  );
}
