export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Bangladeshi mobile numbers: 01XXXXXXXXX, optionally prefixed with +88 / 88; spaces and dashes allowed.
export const isValidPhone = (phone) => /^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""));

export function passwordProblem(password) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Include at least one letter and one number.";
  return "";
}

export function validateContact({ name, email, phone }) {
  const errors = {};
  if (!name?.trim() || name.trim().length < 2) errors.name = "Enter your full name.";
  if (!EMAIL_RE.test(email?.trim() || "")) errors.email = "Enter a valid email address.";
  if (phone !== undefined && !isValidPhone(phone || "")) errors.phone = "Enter a valid Bangladeshi mobile number, e.g. 01712-345678.";
  return errors;
}
