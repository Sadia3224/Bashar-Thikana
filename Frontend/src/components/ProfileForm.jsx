import { useState } from "react";
import { BadgeCheck, Loader2, ShieldAlert } from "lucide-react";
import { Field, PasswordInput, fieldProps, focusFirstError } from "./Field";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ROLES } from "../data/options";
import { formatDate, initials } from "../utils/format";
import { passwordProblem, validateContact } from "../utils/validation";

export default function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone, about: user.about || "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const next = validateContact(form);
    if (form.newPassword) {
      const problem = passwordProblem(form.newPassword);
      if (problem) next.newPassword = problem;
      else if (form.newPassword !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    }
    setErrors(next);
    if (Object.keys(next).length) return focusFirstError(next, ["name", "email", "phone", "newPassword", "confirmPassword"]);
    setSaving(true);
    try {
      await updateProfile(user.id, form);
      setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
      notify("Profile updated.");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-layout">
      <aside className="panel profile-summary">
        <span className="avatar avatar-lg">{initials(user.name)}</span>
        <h2>{user.name}</h2>
        <p className="muted">{ROLES[user.role].label} account</p>
        <dl className="detail-list">
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Phone</dt><dd>{user.phone || "Not provided"}</dd></div>
          <div><dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd></div>
        </dl>
        {user.role === "owner" && (
          <p className={`verify-note ${user.verified ? "is-verified" : ""}`}>
            {user.verified ? <BadgeCheck size={18} /> : <ShieldAlert size={18} />}
            {user.verified ? "Your owner identity is verified." : "Not yet verified. An admin can verify owner accounts from User Management."}
          </p>
        )}
      </aside>

      <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
        <h2 className="panel-title">Edit profile</h2>
        {formError && <div className="alert alert-danger" role="alert">{formError}</div>}
        <Field label="Full name" htmlFor="name" error={errors.name} required>
          <input value={form.name} onChange={set("name")} autoComplete="name" {...fieldProps("name", errors.name)} />
        </Field>
        <div className="form-row">
          <Field label="Email" htmlFor="email" error={errors.email} required>
            <input type="email" value={form.email} onChange={set("email")} autoComplete="email" {...fieldProps("email", errors.email)} />
          </Field>
          <Field label="Phone number" htmlFor="phone" error={errors.phone} required>
            <input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" {...fieldProps("phone", errors.phone)} />
          </Field>
        </div>
        <Field label="About" htmlFor="about" hint={user.role === "owner" ? "Shown to clients on your listings." : "Optional."}>
          <textarea rows={3} value={form.about} onChange={set("about")} {...fieldProps("about", null, true)} />
        </Field>
        <h3 className="form-subtitle">Change password</h3>
        <div className="form-row">
          <Field label="New password" htmlFor="newPassword" error={errors.newPassword} hint="Leave blank to keep your current password.">
            <PasswordInput id="newPassword" value={form.newPassword} onChange={set("newPassword")} error={errors.newPassword} hint autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <PasswordInput id="confirmPassword" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} autoComplete="new-password" />
          </Field>
        </div>
        <div className="form-footer">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <Loader2 size={18} className="spin" aria-hidden="true" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
