import { useRef, useState } from "react";
import { ArrowUp, ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { Field, fieldProps, focusFirstError } from "./Field";
import PropertyImage from "./PropertyImage";
import { DISTRICTS, areasFor, isAreaInDistrict } from "../data/locations";
import { FACILITIES, FURNISHING_OPTIONS, GENDER_OPTIONS, PROPERTY_TYPES } from "../data/options";
import { uploadPropertyImages } from "../api/propertyApi";
import { todayISO } from "../utils/format";

const MAX_IMAGES = 8;

const FIELD_ORDER = ["title", "description", "district", "area", "address", "type", "gender", "rent", "rooms", "bathrooms", "totalBeds", "availableBeds", "washroom", "balcony", "furnishing", "availableFrom", "images"];

function toForm(property) {
  if (!property) {
    return {
      title: "", description: "", district: "", area: "", address: "", type: "", gender: "", rent: "",
      rooms: "1", bathrooms: "1", totalBeds: "1", availableBeds: "1", washroom: "", balcony: "", furnishing: "",
      availableFrom: todayISO(), facilities: [], images: [],
    };
  }
  return {
    ...property,
    rent: String(property.rent),
    rooms: String(property.rooms),
    bathrooms: String(property.bathrooms),
    totalBeds: String(property.totalBeds),
    availableBeds: String(property.availableBeds),
    balcony: property.balcony ? "yes" : "no",
    facilities: [...property.facilities],
    images: [...property.images],
  };
}

const int = (value) => Number.parseInt(value, 10);
const isWhole = (value, min, max = Infinity) => Number.isInteger(Number(value)) && value !== "" && int(value) >= min && int(value) <= max;

function validate(form) {
  const errors = {};
  if (form.title.trim().length < 10) errors.title = "Use a descriptive title of at least 10 characters.";
  if (form.description.trim().length < 40) errors.description = "Describe the place in at least 40 characters.";
  if (!form.district) errors.district = "Choose a district.";
  if (!form.area) errors.area = "Choose an area.";
  if (form.address.trim().length < 4) errors.address = "Add an approximate address or landmark.";
  if (!form.type) errors.type = "Choose the property type.";
  if (!form.gender) errors.gender = "Choose who can live here.";
  if (!isWhole(form.rent, 500)) errors.rent = "Enter the monthly rent in Taka (at least ৳500).";
  if (form.type === "full-flat") {
    if (!isWhole(form.rooms, 1, 20)) errors.rooms = "Enter 1–20 bedrooms.";
    if (!isWhole(form.bathrooms, 1, 20)) errors.bathrooms = "Enter 1–20 bathrooms.";
  }
  if (form.type === "bed") {
    if (!isWhole(form.rooms, 1, 50)) errors.rooms = "Enter the number of rooms (1–50).";
    if (!isWhole(form.bathrooms, 1, 30)) errors.bathrooms = "Enter 1–30 bathrooms.";
  }
  if (form.type === "shared-room" || form.type === "bed") {
    const minBeds = form.type === "shared-room" ? 2 : 1;
    if (!isWhole(form.totalBeds, minBeds, 200)) errors.totalBeds = `Enter at least ${minBeds} total bed${minBeds > 1 ? "s" : ""}.`;
    if (!isWhole(form.availableBeds, 0, 200)) errors.availableBeds = "Enter the number of free beds.";
    else if (!errors.totalBeds && int(form.availableBeds) > int(form.totalBeds)) errors.availableBeds = "Available beds cannot exceed total beds.";
  }
  if (!form.washroom) errors.washroom = "Choose the washroom type.";
  if (!form.balcony) errors.balcony = "Say whether there is a balcony.";
  if (!form.furnishing) errors.furnishing = "Choose the furnishing status.";
  if (!form.availableFrom) errors.availableFrom = "Choose when tenants can move in.";
  if (!form.images.length) errors.images = "Add at least one photo (URL or upload).";
  return errors;
}

// Normalise type-dependent numbers so cards and filters read consistent values.
function toProperty(form) {
  const rooms = int(form.rooms);
  const totalBeds = int(form.totalBeds);
  const base = {
    title: form.title.trim(),
    description: form.description.trim(),
    district: form.district,
    area: form.area,
    address: form.address.trim(),
    type: form.type,
    gender: form.gender,
    rent: int(form.rent),
    washroom: form.washroom,
    balcony: form.balcony === "yes",
    furnishing: form.furnishing,
    availableFrom: form.availableFrom,
    facilities: form.facilities,
    images: form.images,
  };
  switch (form.type) {
    case "full-flat":
      return { ...base, rooms, bathrooms: int(form.bathrooms), totalBeds: rooms, availableBeds: rooms };
    case "bed":
      return { ...base, rooms, bathrooms: int(form.bathrooms), totalBeds, availableBeds: int(form.availableBeds) };
    case "shared-room":
      return { ...base, rooms: 1, bathrooms: 1, totalBeds, availableBeds: int(form.availableBeds) };
    default:
      return { ...base, rooms: 1, bathrooms: 1, totalBeds, availableBeds: totalBeds };
  }
}

function RadioCards({ name, value, onChange, options, error }) {
  return (
    <div className={`radio-cards ${error ? "has-error" : ""}`} role="radiogroup" aria-invalid={error ? true : undefined}>
      {options.map((option) => (
        <label key={option.value} className={`radio-card ${value === option.value ? "is-active" : ""}`}>
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
          <strong>{option.label}</strong>
          {option.description && <span>{option.description}</span>}
        </label>
      ))}
    </div>
  );
}

export default function PropertyForm({ property, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(() => toForm(property));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  const update = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };
  const set = (key) => (e) => update({ [key]: e.target.value });

  const handleType = (type) => {
    const patch = { type };
    if (type === "single-room" && !["1", "2"].includes(form.totalBeds)) patch.totalBeds = "1";
    if (type === "shared-room" && int(form.totalBeds) < 2) Object.assign(patch, { totalBeds: "2", availableBeds: "1" });
    update(patch);
  };

  const toggleFacility = (facility) =>
    update({ facilities: form.facilities.includes(facility) ? form.facilities.filter((f) => f !== facility) : [...form.facilities, facility] });

  const addImages = (urls) => update({ images: [...form.images, ...urls].slice(0, MAX_IMAGES) });

  const handleAddUrl = () => {
    setImageError("");
    try {
      const url = new URL(imageUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      setImageError("Enter a full image link starting with http:// or https://");
      return;
    }
    if (form.images.length >= MAX_IMAGES) return setImageError(`You can add up to ${MAX_IMAGES} photos.`);
    addImages([imageUrl.trim()]);
    setImageUrl("");
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, MAX_IMAGES - form.images.length);
    event.target.value = "";
    if (!files.length) return;
    setImageError("");
    setUploading(true);
    try {
      addImages(await uploadPropertyImages(files));
    } catch (error) {
      setImageError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => update({ images: form.images.filter((_, i) => i !== index) });
  const makeCover = (index) => update({ images: [form.images[index], ...form.images.filter((_, i) => i !== index)] });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) {
      focusFirstError(next, FIELD_ORDER);
      if (next.images && Object.keys(next).length === 1) document.getElementById("image-url")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(toProperty(form));
    } finally {
      setSubmitting(false);
    }
  };

  const isFlat = form.type === "full-flat";
  const isBedBased = form.type === "shared-room" || form.type === "bed";
  const errorCount = Object.keys(errors).length;

  return (
    <form className="property-form" onSubmit={handleSubmit} noValidate>
      {errorCount > 0 && (
        <div className="alert alert-danger" role="alert">
          Please fix {errorCount} {errorCount === 1 ? "field" : "fields"} highlighted below.
        </div>
      )}

      <section className="form-section">
        <h2>Basic information</h2>
        <Field label="Property title" htmlFor="title" error={errors.title} required hint="e.g. Furnished room with balcony near GEC Circle">
          <input value={form.title} onChange={set("title")} maxLength={90} {...fieldProps("title", errors.title, true)} />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description} required hint={`${form.description.trim().length} characters. Mention the floor, light, nearby transport and house rules.`}>
          <textarea rows={5} value={form.description} onChange={set("description")} {...fieldProps("description", errors.description, true)} />
        </Field>
      </section>

      <section className="form-section">
        <h2>Location</h2>
        <div className="form-row">
          <Field label="District" htmlFor="district" error={errors.district} required>
            <select value={form.district} onChange={(e) => update({ district: e.target.value, area: isAreaInDistrict(e.target.value, form.area) ? form.area : "" })} {...fieldProps("district", errors.district)}>
              <option value="">Select district</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Area" htmlFor="area" error={errors.area} required>
            <select value={form.area} onChange={set("area")} disabled={!form.district} {...fieldProps("area", errors.area)}>
              <option value="">{form.district ? "Select area" : "Select a district first"}</option>
              {areasFor(form.district).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Approximate address" htmlFor="address" error={errors.address} required hint="Road or landmark only. The exact house number is shared after contact.">
          <input value={form.address} onChange={set("address")} {...fieldProps("address", errors.address, true)} />
        </Field>
      </section>

      <section className="form-section">
        <h2>Property type and eligibility</h2>
        <Field label="Property type" htmlFor="type" error={errors.type} required>
          <span id="type" tabIndex={-1} />
          <RadioCards name="type" value={form.type} onChange={handleType} options={PROPERTY_TYPES} error={errors.type} />
        </Field>
        <div className="form-row">
          <Field label="Gender eligibility" htmlFor="gender" error={errors.gender} required>
            <select value={form.gender} onChange={set("gender")} {...fieldProps("gender", errors.gender)}>
              <option value="">Select</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>{g.value === "any" ? "Any gender" : `${g.label} only`}</option>
              ))}
            </select>
          </Field>
          <Field label="Monthly rent (৳)" htmlFor="rent" error={errors.rent} required>
            <input type="number" min="500" step="100" inputMode="numeric" value={form.rent} onChange={set("rent")} {...fieldProps("rent", errors.rent)} />
          </Field>
        </div>
      </section>

      <section className="form-section">
        <h2>Rooms and beds</h2>
        {!form.type && <p className="muted">Choose a property type above to see the relevant room and bed fields.</p>}
        {(isFlat || form.type === "bed") && (
          <div className="form-row">
            <Field label={isFlat ? "Bedrooms" : "Rooms in the unit"} htmlFor="rooms" error={errors.rooms} required>
              <input type="number" min="1" inputMode="numeric" value={form.rooms} onChange={set("rooms")} {...fieldProps("rooms", errors.rooms)} />
            </Field>
            <Field label="Bathrooms" htmlFor="bathrooms" error={errors.bathrooms} required>
              <input type="number" min="1" inputMode="numeric" value={form.bathrooms} onChange={set("bathrooms")} {...fieldProps("bathrooms", errors.bathrooms)} />
            </Field>
          </div>
        )}
        {form.type === "single-room" && (
          <Field label="Beds in the room" htmlFor="totalBeds" hint="A single room holds one bed, or two for a couple / siblings.">
            <select value={form.totalBeds} onChange={set("totalBeds")} {...fieldProps("totalBeds", null, true)}>
              <option value="1">1 bed</option>
              <option value="2">2 beds</option>
            </select>
          </Field>
        )}
        {isBedBased && (
          <div className="form-row">
            <Field label="Total beds" htmlFor="totalBeds" error={errors.totalBeds} required>
              <input type="number" min="1" inputMode="numeric" value={form.totalBeds} onChange={set("totalBeds")} {...fieldProps("totalBeds", errors.totalBeds)} />
            </Field>
            <Field label="Available beds" htmlFor="availableBeds" error={errors.availableBeds} required>
              <input type="number" min="0" inputMode="numeric" value={form.availableBeds} onChange={set("availableBeds")} {...fieldProps("availableBeds", errors.availableBeds)} />
            </Field>
          </div>
        )}
        <div className="form-row form-row-3">
          <Field label="Washroom" htmlFor="washroom" error={errors.washroom} required>
            <select value={form.washroom} onChange={set("washroom")} {...fieldProps("washroom", errors.washroom)}>
              <option value="">Select</option>
              <option value="attached">Attached</option>
              <option value="shared">Shared</option>
            </select>
          </Field>
          <Field label="Balcony" htmlFor="balcony" error={errors.balcony} required>
            <select value={form.balcony} onChange={set("balcony")} {...fieldProps("balcony", errors.balcony)}>
              <option value="">Select</option>
              <option value="yes">Has a balcony</option>
              <option value="no">No balcony</option>
            </select>
          </Field>
          <Field label="Furnishing" htmlFor="furnishing" error={errors.furnishing} required>
            <select value={form.furnishing} onChange={set("furnishing")} {...fieldProps("furnishing", errors.furnishing)}>
              <option value="">Select</option>
              {FURNISHING_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Available from" htmlFor="availableFrom" error={errors.availableFrom} required>
          <input type="date" value={form.availableFrom} onChange={set("availableFrom")} {...fieldProps("availableFrom", errors.availableFrom)} />
        </Field>
      </section>

      <section className="form-section">
        <h2>Facilities</h2>
        <div className="checkbox-grid">
          {FACILITIES.map((facility) => (
            <label key={facility} className="check-row">
              <input type="checkbox" checked={form.facilities.includes(facility)} onChange={() => toggleFacility(facility)} />
              <span>{facility}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="form-section">
        <h2>Photos</h2>
        <p className="muted small">Add up to {MAX_IMAGES} photos. The first photo is used as the cover. Uploads must be JPG, PNG or WebP, up to 5 MB each.</p>
        <div className="image-inputs">
          <div className="input-icon grow">
            <Link2 size={17} aria-hidden="true" />
            <label htmlFor="image-url" className="sr-only">Image URL</label>
            <input
              id="image-url"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              aria-invalid={errors.images ? true : undefined}
            />
          </div>
          <button type="button" className="btn btn-outline" onClick={handleAddUrl}>
            <ImagePlus size={18} /> Add URL
          </button>
          <button type="button" className="btn btn-outline" onClick={() => fileInput.current?.click()} disabled={uploading || form.images.length >= MAX_IMAGES}>
            {uploading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />} Upload
          </button>
          <input ref={fileInput} type="file" accept="image/png, image/jpeg, image/webp" multiple hidden onChange={handleFiles} />
        </div>
        {(imageError || errors.images) && <p className="field-error" role="alert">{imageError || errors.images}</p>}
        {form.images.length > 0 && (
          <ul className="image-previews">
            {form.images.map((src, index) => (
              <li key={`${index}-${src.slice(-24)}`}>
                <PropertyImage src={src} alt={`Photo ${index + 1}`} />
                {index === 0 && <span className="cover-tag">Cover</span>}
                <div className="image-preview-actions">
                  {index > 0 && (
                    <button type="button" className="icon-button" onClick={() => makeCover(index)} aria-label={`Make photo ${index + 1} the cover`}>
                      <ArrowUp size={16} />
                    </button>
                  )}
                  <button type="button" className="icon-button" onClick={() => removeImage(index)} aria-label={`Remove photo ${index + 1}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="form-footer">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
          {submitting && <Loader2 size={18} className="spin" aria-hidden="true" />}
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
