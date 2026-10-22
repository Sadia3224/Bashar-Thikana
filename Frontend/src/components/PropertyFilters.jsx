import { useEffect, useRef, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { DISTRICTS, areasFor, isAreaInDistrict } from "../data/locations";
import { BED_OPTIONS, FURNISHING_OPTIONS, GENDER_OPTIONS } from "../data/options";
import { TYPE_FILTER_LABELS, hasRentError } from "../utils/filters";

const TYPE_CHOICES = ["single-room", "shared-room", "bed", "full-flat", "shared"];

const QUICK_PICKS = [
  { label: "Balcony + attached washroom", patch: { balcony: "yes", washroom: "attached" } },
  { label: "Balcony + shared washroom", patch: { balcony: "yes", washroom: "shared" } },
  { label: "No balcony", patch: { balcony: "no", washroom: "" } },
  { label: "No balcony + attached washroom", patch: { balcony: "no", washroom: "attached" } },
];

// Typed filters keep their own state and commit after a short pause. Writing every keystroke to the URL
// drops characters, because router updates land a render behind fast typing.
function DebouncedInput({ value, onCommit, ...props }) {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [committed, setCommitted] = useState(value);
  const commitRef = useRef(onCommit);

  useEffect(() => {
    commitRef.current = onCommit;
  });

  // Follow outside changes (e.g. "Clear all"), but not the echo of our own commit.
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== committed) setLocal(value);
  }

  useEffect(() => {
    if (local === value) return undefined;
    const timer = setTimeout(() => {
      setCommitted(local);
      commitRef.current(local);
    }, 300);
    return () => clearTimeout(timer);
    // Only a new keystroke should restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return <input {...props} value={local} onChange={(e) => setLocal(e.target.value)} />;
}

function ChoiceGroup({ legend, name, value, options, onChange, hint }) {
  return (
    <fieldset className="filter-group">
      <legend>{legend}</legend>
      <div className="choice-pills">
        {options.map((option) => (
          <label key={option.value} className={`choice-pill ${value === option.value ? "is-active" : ""}`}>
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </fieldset>
  );
}

export default function PropertyFilters({ filters, onChange, onClear, idPrefix = "f" }) {
  const rentError = hasRentError(filters);
  const isFlat = filters.type === "full-flat";

  const handleDistrict = (district) => onChange({ district, area: isAreaInDistrict(district, filters.area) ? filters.area : "" });

  return (
    <div className="filters">
      <div className="filter-group">
        <label htmlFor={`${idPrefix}-q`} className="filter-label">Keyword</label>
        <div className="input-icon">
          <Search size={17} aria-hidden="true" />
          <DebouncedInput id={`${idPrefix}-q`} type="search" placeholder="Title, area or road" value={filters.q} onCommit={(q) => onChange({ q })} />
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Location</span>
        <div className="filter-stack">
          <label className="sr-only" htmlFor={`${idPrefix}-district`}>District</label>
          <select id={`${idPrefix}-district`} value={filters.district} onChange={(e) => handleDistrict(e.target.value)}>
            <option value="">All districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${idPrefix}-area`}>Area</label>
          <select id={`${idPrefix}-area`} value={filters.area} onChange={(e) => onChange({ area: e.target.value })} disabled={!filters.district}>
            <option value="">{filters.district ? `All areas in ${filters.district}` : "Choose a district for areas"}</option>
            {areasFor(filters.district).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <ChoiceGroup
        legend="Accommodation type"
        name={`${idPrefix}-type`}
        value={filters.type}
        onChange={(type) => onChange({ type })}
        options={[{ value: "", label: "Any" }, ...TYPE_CHOICES.map((value) => ({ value, label: TYPE_FILTER_LABELS[value] }))]}
      />

      <ChoiceGroup
        legend="Gender eligibility"
        name={`${idPrefix}-gender`}
        value={filters.gender}
        onChange={(gender) => onChange({ gender })}
        options={[{ value: "", label: "All" }, ...GENDER_OPTIONS]}
        hint="Who will live there. Male or Female also include listings open to any gender."
      />

      <fieldset className="filter-group">
        <legend>Monthly rent (৳)</legend>
        <div className="filter-row">
          <div>
            <label className="sr-only" htmlFor={`${idPrefix}-min`}>Minimum rent</label>
            <DebouncedInput id={`${idPrefix}-min`} type="number" min="0" step="500" inputMode="numeric" placeholder="Min" value={filters.minRent} onCommit={(minRent) => onChange({ minRent })} aria-invalid={rentError || undefined} />
          </div>
          <span aria-hidden="true">–</span>
          <div>
            <label className="sr-only" htmlFor={`${idPrefix}-max`}>Maximum rent</label>
            <DebouncedInput id={`${idPrefix}-max`} type="number" min="0" step="500" inputMode="numeric" placeholder="Max" value={filters.maxRent} onCommit={(maxRent) => onChange({ maxRent })} aria-invalid={rentError || undefined} />
          </div>
        </div>
        {rentError && <p className="field-error" role="alert">Minimum rent is higher than maximum rent.</p>}
      </fieldset>

      <ChoiceGroup
        legend={isFlat ? "Bedrooms" : "Beds needed"}
        name={`${idPrefix}-beds`}
        value={filters.beds}
        onChange={(beds) => onChange({ beds })}
        options={[{ value: "", label: "Any" }, ...BED_OPTIONS.map((b) => ({ ...b, label: isFlat ? b.label.replace("bed", "bedroom") : b.label }))]}
        hint={isFlat ? "Minimum number of bedrooms in the flat." : "Free beds for shared rooms and bed rentals, beds in the room for single rooms, bedrooms for flats."}
      />

      <div className="filter-group">
        <span className="filter-label">Quick picks</span>
        <div className="quick-picks">
          {QUICK_PICKS.map((pick) => {
            const active = filters.balcony === pick.patch.balcony && filters.washroom === pick.patch.washroom;
            return (
              <button key={pick.label} type="button" className={`quick-pick ${active ? "is-active" : ""}`} aria-pressed={active} onClick={() => onChange(active ? { balcony: "", washroom: "" } : pick.patch)}>
                {pick.label}
              </button>
            );
          })}
        </div>
      </div>

      <ChoiceGroup
        legend="Balcony"
        name={`${idPrefix}-balcony`}
        value={filters.balcony}
        onChange={(balcony) => onChange({ balcony })}
        options={[
          { value: "", label: "Either" },
          { value: "yes", label: "With balcony" },
          { value: "no", label: "Without balcony" },
        ]}
      />

      <ChoiceGroup
        legend="Washroom"
        name={`${idPrefix}-washroom`}
        value={filters.washroom}
        onChange={(washroom) => onChange({ washroom })}
        options={[
          { value: "", label: "Either" },
          { value: "attached", label: "Attached" },
          { value: "shared", label: "Shared" },
        ]}
      />

      <ChoiceGroup
        legend="Furnishing"
        name={`${idPrefix}-furnishing`}
        value={filters.furnishing}
        onChange={(furnishing) => onChange({ furnishing })}
        options={[{ value: "", label: "Any" }, ...FURNISHING_OPTIONS]}
      />

      <div className="filter-group">
        <label htmlFor={`${idPrefix}-date`} className="filter-label">Available by</label>
        <input id={`${idPrefix}-date`} type="date" value={filters.availableBy} onChange={(e) => onChange({ availableBy: e.target.value })} />
        <p className="field-hint">Shows places you can move into on or before this date.</p>
      </div>

      <label className="check-row">
        <input type="checkbox" checked={filters.verified} onChange={(e) => onChange({ verified: e.target.checked })} />
        <span>Verified listings only</span>
      </label>

      <button type="button" className="btn btn-outline btn-block" onClick={onClear}>
        <RotateCcw size={16} /> Clear all filters
      </button>
    </div>
  );
}
