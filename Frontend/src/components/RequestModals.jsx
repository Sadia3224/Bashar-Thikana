import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, LogIn, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { Field, fieldProps, focusFirstError } from "./Field";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertyContext";
import { useToast } from "../context/ToastContext";
import { REPORT_REASONS, ROLES, VISIT_TIME_SLOTS } from "../data/options";
import { formatDate, todayISO } from "../utils/format";
import { validateContact } from "../utils/validation";

// Requests can only be sent from a client account; everyone else sees why and where to go.
function ClientGate({ user, action, onClose, children }) {
  const location = useLocation();
  if (!user) {
    return (
      <div className="gate">
        <LogIn size={28} aria-hidden="true" />
        <p>Please log in or create a client account to {action}.</p>
        <div className="modal-actions">
          <Link to="/register?role=client" state={{ from: location.pathname }} className="btn btn-outline" onClick={onClose}>Create account</Link>
          <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary" onClick={onClose}>Log in</Link>
        </div>
      </div>
    );
  }
  if (user.role !== "client") {
    return (
      <div className="gate">
        <p>
          You are signed in as an <strong>{ROLES[user.role].label}</strong>. Only client accounts can {action}.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  return children;
}

function SuccessView({ title, children, link, linkLabel, onClose }) {
  return (
    <div className="success-view">
      <CheckCircle2 size={44} aria-hidden="true" />
      <h3>{title}</h3>
      {children}
      <div className="modal-actions">
        {link && <Link to={link} className="btn btn-outline" onClick={onClose}>{linkLabel}</Link>}
        <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function SubmitButton({ submitting, children }) {
  return (
    <button type="submit" className="btn btn-primary" disabled={submitting}>
      {submitting && <Loader2 size={18} className="spin" aria-hidden="true" />}
      {submitting ? "Sending…" : children}
    </button>
  );
}

const DEMO_NOTE = "This is a frontend demo: the request is saved in this browser only and the owner is not actually notified.";

function ContactForm({ property, user, onClose }) {
  const { createRequest } = useProperties();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    message: `Hello, I am interested in "${property.title}". Is it still available?`,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validateContact(form);
    if (form.message.trim().length < 10) next.message = "Write a short message (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length) return focusFirstError(next, ["name", "email", "phone", "message"]);
    setSubmitting(true);
    await createRequest({ kind: "contact", propertyId: property.id, clientId: user.id, ...form });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <SuccessView title="Message saved" link="/client/contacts" linkLabel="View my contact requests" onClose={onClose}>
        <p>Your message about <strong>{property.title}</strong> has been added to your contact requests.</p>
        <p className="muted small">{DEMO_NOTE}</p>
      </SuccessView>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form-grid">
      <Field label="Full name" htmlFor="name" error={errors.name} required>
        <input value={form.name} onChange={set("name")} autoComplete="name" {...fieldProps("name", errors.name)} />
      </Field>
      <div className="form-row">
        <Field label="Email" htmlFor="email" error={errors.email} required>
          <input type="email" value={form.email} onChange={set("email")} autoComplete="email" {...fieldProps("email", errors.email)} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone} required>
          <input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" {...fieldProps("phone", errors.phone)} />
        </Field>
      </div>
      <Field label="Message" htmlFor="message" error={errors.message} required>
        <textarea rows={4} value={form.message} onChange={set("message")} {...fieldProps("message", errors.message)} />
      </Field>
      <p className="muted small">{DEMO_NOTE}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <SubmitButton submitting={submitting}>Send message</SubmitButton>
      </div>
    </form>
  );
}

function VisitForm({ property, user, onClose }) {
  const { createRequest } = useProperties();
  const [form, setForm] = useState({ date: "", timeSlot: "", visitors: "1", phone: user.phone, message: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const today = todayISO();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.date) next.date = "Choose a date for the visit.";
    else if (form.date < today) next.date = "The visit date cannot be in the past.";
    if (!form.timeSlot) next.timeSlot = "Choose a time slot.";
    const phoneError = validateContact({ name: user.name, email: user.email, phone: form.phone }).phone;
    if (phoneError) next.phone = phoneError;
    setErrors(next);
    if (Object.keys(next).length) return focusFirstError(next, ["date", "timeSlot", "phone"]);
    setSubmitting(true);
    await createRequest({ kind: "visit", propertyId: property.id, clientId: user.id, name: user.name, email: user.email, ...form });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <SuccessView title="Visit request saved" link="/client/visits" linkLabel="View my visit requests" onClose={onClose}>
        <p>
          You asked to visit on <strong>{formatDate(form.date)}</strong>, {form.timeSlot}. The request shows as <em>Pending</em> in your dashboard. This is not a booking.
        </p>
        <p className="muted small">{DEMO_NOTE}</p>
      </SuccessView>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form-grid">
      <div className="form-row">
        <Field label="Preferred date" htmlFor="date" error={errors.date} required>
          <input type="date" min={today} value={form.date} onChange={set("date")} {...fieldProps("date", errors.date)} />
        </Field>
        <Field label="Time slot" htmlFor="timeSlot" error={errors.timeSlot} required>
          <select value={form.timeSlot} onChange={set("timeSlot")} {...fieldProps("timeSlot", errors.timeSlot)}>
            <option value="">Select a slot</option>
            {VISIT_TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-row">
        <Field label="Number of visitors" htmlFor="visitors">
          <select value={form.visitors} onChange={set("visitors")} {...fieldProps("visitors")}>
            {["1", "2", "3", "4"].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Contact phone" htmlFor="phone" error={errors.phone} required>
          <input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" {...fieldProps("phone", errors.phone)} />
        </Field>
      </div>
      <Field label="Note for the owner" htmlFor="message" hint="Optional, e.g. who will be living there.">
        <textarea rows={3} value={form.message} onChange={set("message")} {...fieldProps("message", null, "hint")} />
      </Field>
      <p className="muted small">{DEMO_NOTE}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <SubmitButton submitting={submitting}>Request visit</SubmitButton>
      </div>
    </form>
  );
}

function ReportForm({ property, user, onClose }) {
  const { createReport } = useProperties();
  const { notify } = useToast();
  const [form, setForm] = useState({ reason: "", details: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.reason) next.reason = "Choose a reason.";
    if (form.details.trim().length < 10) next.details = "Add a few details (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length) return focusFirstError(next, ["reason", "details"]);
    setSubmitting(true);
    await createReport({ propertyId: property.id, reporterId: user.id, ...form });
    setSubmitting(false);
    notify("Report submitted for admin review (demo).");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form-grid">
      <Field label="Reason" htmlFor="reason" error={errors.reason} required>
        <select value={form.reason} onChange={set("reason")} {...fieldProps("reason", errors.reason)}>
          <option value="">Select a reason</option>
          {REPORT_REASONS.map((reason) => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </Field>
      <Field label="Details" htmlFor="details" error={errors.details} required>
        <textarea rows={4} value={form.details} onChange={set("details")} {...fieldProps("details", errors.details)} />
      </Field>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <SubmitButton submitting={submitting}>Submit report</SubmitButton>
      </div>
    </form>
  );
}

export function ContactOwnerModal({ open, onClose, property }) {
  const { user } = useAuth();
  return (
    <Modal open={open} onClose={onClose} title="Contact the owner" description={property.title}>
      <ClientGate user={user} action="contact owners" onClose={onClose}>
        <ContactForm property={property} user={user} onClose={onClose} />
      </ClientGate>
    </Modal>
  );
}

export function VisitRequestModal({ open, onClose, property }) {
  const { user } = useAuth();
  return (
    <Modal open={open} onClose={onClose} title="Request a visit" description={`${property.title} · ${property.area}, ${property.district}`}>
      <ClientGate user={user} action="request visits" onClose={onClose}>
        <VisitForm property={property} user={user} onClose={onClose} />
      </ClientGate>
    </Modal>
  );
}

export function ReportModal({ open, onClose, property }) {
  const { user } = useAuth();
  return (
    <Modal open={open} onClose={onClose} title="Report this listing" description="Reports are reviewed by the admin team in the dashboard.">
      <ClientGate user={user} action="report listings" onClose={onClose}>
        <ReportForm property={property} user={user} onClose={onClose} />
      </ClientGate>
    </Modal>
  );
}
