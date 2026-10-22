import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Search } from "lucide-react";
import { useProperties } from "../context/PropertyContext";
import { DISTRICTS, areasFor, isAreaInDistrict } from "../data/locations";
import { BED_OPTIONS, GENDER_OPTIONS } from "../data/options";
import { DEFAULT_FILTERS, applyFilters, filtersToQuery, hasRentError } from "../utils/filters";

// The home page search panel uses the three headline accommodation types; the full list lives in the filter sidebar.
const SEARCH_TYPES = [
  { value: "single-room", label: "Single Room" },
  { value: "shared", label: "Shared Room / Bed" },
  { value: "full-flat", label: "Full Flat" },
];

export default function SearchBar() {
  const { publicProperties, recordSearch } = useProperties();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const resultCount = useMemo(() => applyFilters(publicProperties, filters).length, [publicProperties, filters]);

  const rentError = hasRentError(filters);
  const update = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  const handleDistrict = (district) => update({ district, area: isAreaInDistrict(district, filters.area) ? filters.area : "" });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (rentError) return;
    recordSearch(filters);
    navigate(`/properties${filtersToQuery(filters)}`);
  };

  return (
    <form className="search-panel" onSubmit={handleSubmit} aria-label="Search properties">
      <div className="search-grid">
        <div className="search-field">
          <label htmlFor="s-district">District</label>
          <select id="s-district" value={filters.district} onChange={(e) => handleDistrict(e.target.value)}>
            <option value="">All districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label htmlFor="s-area">Area</label>
          <select id="s-area" value={filters.area} onChange={(e) => update({ area: e.target.value })} disabled={!filters.district}>
            <option value="">{filters.district ? "All areas" : "Select a district first"}</option>
            {areasFor(filters.district).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label htmlFor="s-type">Accommodation type</label>
          <select id="s-type" value={filters.type} onChange={(e) => update({ type: e.target.value })}>
            <option value="">Any type</option>
            {SEARCH_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label htmlFor="s-gender">Gender preference</label>
          <select id="s-gender" value={filters.gender} onChange={(e) => update({ gender: e.target.value })}>
            <option value="">No preference</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label htmlFor="s-min">Min rent (৳)</label>
          <input id="s-min" type="number" min="0" step="500" inputMode="numeric" placeholder="0" value={filters.minRent} onChange={(e) => update({ minRent: e.target.value })} aria-invalid={rentError || undefined} />
        </div>
        <div className="search-field">
          <label htmlFor="s-max">Max rent (৳)</label>
          <input id="s-max" type="number" min="0" step="500" inputMode="numeric" placeholder="Any" value={filters.maxRent} onChange={(e) => update({ maxRent: e.target.value })} aria-invalid={rentError || undefined} />
        </div>
        <div className="search-field">
          <label htmlFor="s-beds">{filters.type === "full-flat" ? "Bedrooms" : "Beds needed"}</label>
          <select id="s-beds" value={filters.beds} onChange={(e) => update({ beds: e.target.value })}>
            <option value="">Any</option>
            {BED_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>{filters.type === "full-flat" ? b.label.replace("bed", "bedroom") : b.label}</option>
            ))}
          </select>
        </div>
        <div className="search-submit">
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={rentError}>
            <Search size={18} /> Search
          </button>
        </div>
      </div>
      <div className="search-meta">
        {rentError ? (
          <span className="text-danger" role="alert">Minimum rent cannot be higher than maximum rent.</span>
        ) : (
          <span aria-live="polite">
            <strong>{resultCount}</strong> {resultCount === 1 ? "property matches" : "properties match"} your search
          </span>
        )}
        <button type="button" className="link-button" onClick={() => setFilters(DEFAULT_FILTERS)}>
          <RotateCcw size={14} /> Clear all filters
        </button>
      </div>
    </form>
  );
}
