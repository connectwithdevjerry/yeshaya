// server/helpers/contactValidator.js

// ─── Normalisers ──────────────────────────────────────────────────────────────
const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

// Strip everything except digits and a leading +
const normalizePhone = (phone) => {
  if (typeof phone !== "string") return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  // remove any '+' that isn't at the very start
  return cleaned.replace(/(?!^)\+/g, "");
};

// ─── Format checks ────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => EMAIL_RE.test(normalizeEmail(email));

const isValidPhone = (phone) => {
  const p = normalizePhone(phone);
  const digits = p.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

// ─── Main validator ───────────────────────────────────────────────────────────
// Returns { valid: Boolean, errors: { field: message }, cleaned: {...} }
const validateContact = (data = {}, { partial = false } = {}) => {
  const errors = {};
  const cleaned = { ...data };

  // Normalise email & phone if present
  if (data.email !== undefined) cleaned.email = normalizeEmail(data.email);
  if (data.phone !== undefined) cleaned.phone = normalizePhone(data.phone);

  // Email format (only if provided)
  if (cleaned.email && !isValidEmail(cleaned.email)) {
    errors.email = "Invalid email format";
  }

  // Phone format (only if provided)
  if (cleaned.phone && !isValidPhone(cleaned.phone)) {
    errors.phone = "Phone must be 7–15 digits";
  }

  // For a full create (not partial update), require at least one identifier
  if (!partial) {
    const hasIdentity =
      (cleaned.firstName && cleaned.firstName.trim()) ||
      cleaned.email ||
      cleaned.phone;
    if (!hasIdentity) {
      errors.identity = "A contact needs at least a first name, email, or phone";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors, cleaned };
};

// ─── Duplicate detection ──────────────────────────────────────────────────────
// Finds an existing contact in savedContacts matching by normalized phone OR email
const findDuplicateContact = (savedContacts = [], { email, phone } = {}) => {
  const e = normalizeEmail(email);
  const p = normalizePhone(phone);
  if (!e && !p) return null;

  return savedContacts.find((c) => {
    const ce = normalizeEmail(c.email);
    const cp = normalizePhone(c.phone);
    return (e && ce && ce === e) || (p && cp && cp === p);
  }) || null;
};

// ─── Merge: fill empty fields on existing contact with incoming data ──────────
const mergeContactData = (existing, incoming) => {
  const fields = ["firstName", "lastName", "email", "phone", "linkedIn", "linkedin", "company", "title"];
  const changes = {};
  fields.forEach((f) => {
    const cur = existing[f];
    const inc = incoming[f];
    if ((cur === undefined || cur === null || cur === "") && inc) {
      changes[f] = inc;
    }
  });
  return changes;
};

module.exports = {
  normalizeEmail,
  normalizePhone,
  isValidEmail,
  isValidPhone,
  validateContact,
  findDuplicateContact,
  mergeContactData,
};
