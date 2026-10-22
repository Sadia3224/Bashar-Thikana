import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import PropertyCard, { PropertyCardSkeleton } from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import EmptyState from "../components/EmptyState";
import { useProperties } from "../context/PropertyContext";
import { SORT_OPTIONS } from "../data/options";
import { DEFAULT_FILTERS, applyFilters, countActiveFilters, describeFilters, filtersFromParams, filtersToParams } from "../utils/filters";

const PAGE_SIZE = 9;

export default function BrowseProperties() {
  const { publicProperties, recordSearch } = useProperties();
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState({ key: "", size: PAGE_SIZE });

  const filters = useMemo(() => filtersFromParams(params), [params]);
  const results = useMemo(() => applyFilters(publicProperties, filters), [publicProperties, filters]);
  const activeCount = countActiveFilters(filters);
  const chips = describeFilters(filters);
  const queryKey = params.toString();
  const visibleCount = page.key === queryKey ? page.size : PAGE_SIZE;

  // Brief simulated fetch so the loading state is visible, as it would be with a real API.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  // Remember a client's search once they stop adjusting filters.
  useEffect(() => {
    const timer = setTimeout(() => recordSearch(filters), 1500);
    return () => clearTimeout(timer);
  }, [filters, recordSearch]);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", drawerOpen);
    return () => document.body.classList.remove("drawer-open");
  }, [drawerOpen]);

  const update = (patch) => setParams(filtersToParams({ ...filters, ...patch }), { replace: true });
  const clearAll = () => setParams(filtersToParams({ ...DEFAULT_FILTERS, sort: filters.sort }), { replace: true });
  const removeChip = (key) => update(key === "district" ? { district: "", area: "" } : { [key]: DEFAULT_FILTERS[key] });

  return (
    <div className="browse-page">
      <div className="browse-hero">
        <div className="container">
          <h1>Find a Home</h1>
          <p>Rooms, shared beds and full flats from verified and reviewed owners across Bangladesh.</p>
        </div>
      </div>

      <div className="container browse-layout">
        <aside className={`filter-sidebar ${drawerOpen ? "is-open" : ""}`} aria-label="Filters">
          <div className="filter-drawer-head">
            <h2>Filters {activeCount > 0 && <span className="tab-count">{activeCount}</span>}</h2>
            <button type="button" className="icon-button" onClick={() => setDrawerOpen(false)} aria-label="Close filters">
              <X size={20} />
            </button>
          </div>
          <PropertyFilters filters={filters} onChange={update} onClear={clearAll} />
          <div className="filter-drawer-foot">
            <button type="button" className="btn btn-primary btn-block" onClick={() => setDrawerOpen(false)}>
              Show {results.length} {results.length === 1 ? "result" : "results"}
            </button>
          </div>
        </aside>
        {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

        <section className="browse-results" aria-labelledby="results-heading">
          <div className="results-toolbar">
            <div>
              <h2 id="results-heading" aria-live="polite">
                {loading ? "Loading properties…" : `${results.length} ${results.length === 1 ? "property" : "properties"} found`}
              </h2>
              {filters.district && <p className="muted">in {filters.area ? `${filters.area}, ` : ""}{filters.district}</p>}
            </div>
            <div className="results-controls">
              <button type="button" className="btn btn-outline filter-toggle" onClick={() => setDrawerOpen(true)}>
                <SlidersHorizontal size={18} /> Filters {activeCount > 0 && <span className="tab-count">{activeCount}</span>}
              </button>
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select id="sort" className="sort-select" value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>Sort: {option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="chip-row">
              {chips.map((chip) => (
                <button key={chip.key} type="button" className="chip" onClick={() => removeChip(chip.key)} aria-label={`Remove filter ${chip.label}`}>
                  {chip.label} <X size={14} aria-hidden="true" />
                </button>
              ))}
              <button type="button" className="link-button" onClick={clearAll}>Clear all</button>
            </div>
          )}

          {loading ? (
            <div className="property-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState icon={SearchX} title="No properties match these filters" message="Try a wider rent range, another area, or remove a few filters to see more places.">
              <button type="button" className="btn btn-primary" onClick={clearAll}>Clear all filters</button>
            </EmptyState>
          ) : (
            <>
              <div className="property-grid">
                {results.slice(0, visibleCount).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              {visibleCount < results.length && (
                <div className="load-more">
                  <p className="muted">Showing {visibleCount} of {results.length}</p>
                  <button type="button" className="btn btn-outline" onClick={() => setPage({ key: queryKey, size: visibleCount + PAGE_SIZE })}>
                    Show more properties
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
