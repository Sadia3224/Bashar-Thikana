import { useState } from "react";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Field, fieldProps, focusFirstError } from "../components/Field";
import { CONTACT_INFO } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { wait } from "../utils/storage";
import { validateContact } from "../utils/validation";

const SUBJECTS = ["General question", "Help with my listing", "Report a problem", "Partnership"];

export default function Contact() {
  const { user } = useAuth();
  const empty = { name: user?.name || "", email: user?.email || "", subject: "", message: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validateContact({ name: form.name, email: form.email });
    if (!form.subject) next.subject = "Choose a subject.";
    if (form.message.trim().length < 15) next.message = "Write a message of at least 15 characters.";
    setErrors(next);
    if (Object.keys(next).length) return focusFirstError(next, ["name", "email", "subject", "message"]);
    setStatus("sending");
    await wait(800);
    setStatus("sent");
  };

  return (
    <div className="container page-pad">
      <div className="page-intro">
        <span className="eyebrow">Contact us</span>
        <h1>We're here to help</h1>
        <p>Questions about a listing, your account or partnering with us? Send a message and the team will get back to you.</p>
      </div>
      <div className="contact-layout">
        <div className="contact-info">
          {[
            { icon: MapPin, label: "Office", value: CONTACT_INFO.address },
            { icon: Phone, label: "Phone", value: CONTACT_INFO.phone },
            { icon: Mail, label: "Email", value: CONTACT_INFO.email },
            { icon: Clock, label: "Hours", value: CONTACT_INFO.hours },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="contact-item">
              <span className="contact-icon"><Icon size={20} aria-hidden="true" /></span>
              <div>
                <strong>{label}</strong>
                <p>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          {status === "sent" ? (
            <div className="success-view">
              <CheckCircle2 size={44} aria-hidden="true" />
              <h2>Thanks, {form.name.split(" ")[0]}!</h2>
              <p>Your message has been recorded in this demo. No email was actually sent. In a live system our team would reply to {form.email}.</p>
              <button type="button" className="btn btn-outline" onClick={() => { setForm(empty); setStatus("idle"); }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="form-grid">
              <div className="form-row">
                <Field label="Full name" htmlFor="name" error={errors.name} required>
                  <input autoComplete="name" value={form.name} onChange={set("name")} {...fieldProps("name", errors.name)} />
                </Field>
                <Field label="Email" htmlFor="email" error={errors.email} required>
                  <input type="email" autoComplete="email" value={form.email} onChange={set("email")} {...fieldProps("email", errors.email)} />
                </Field>
              </div>
              <Field label="Subject" htmlFor="subject" error={errors.subject} required>
                <select value={form.subject} onChange={set("subject")} {...fieldProps("subject", errors.subject)}>
                  <option value="">Select a subject</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Message" htmlFor="message" error={errors.message} required>
                <textarea rows={6} value={form.message} onChange={set("message")} {...fieldProps("message", errors.message)} />
              </Field>
              <div className="form-footer">
                <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                  {status === "sending" && <Loader2 size={18} className="spin" aria-hidden="true" />}
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
