import { useState } from "react";
import { Link } from "react-router-dom";
import { History, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useProperties } from "../../context/PropertyContext";
import { applyFilters, describeFilters, filtersFromParams } from "../../utils/filters";
import { formatDate } from "../../utils/format";

export default function ClientSearches() {
  const { recentSearches, removeSearch, clearSearches, publicProperties } = useProperties();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <PageHeader title="Recent searches" description="Your last 10 searches. Run one again to see the latest matching listings.">
        {recentSearches.length > 0 && (
          <button type="button" className="btn btn-outline" onClick={() => setConfirming(true)}>
            <Trash2 size={17} /> Clear history
          </button>
        )}
      </PageHeader>

      {recentSearches.length ? (
        <ul className="search-history">
          {recentSearches.map((search) => {
            const filters = filtersFromParams(new URLSearchParams(search.query));
            const count = applyFilters(publicProperties, filters).length;
            return (
              <li key={search.id} className="panel">
                <div>
                  <div className="chip-row">
                    {describeFilters(filters).map((chip) => (
                      <span key={chip.key} className="chip chip-static">{chip.label}</span>
                    ))}
                  </div>
                  <p className="muted small">
                    Searched {formatDate(search.createdAt)} · {count} {count === 1 ? "match" : "matches"} now
                  </p>
                </div>
                <div className="row-actions">
                  <Link to={`/properties?${search.query}`} className="btn btn-primary btn-sm">Run search</Link>
                  <button type="button" className="icon-button" onClick={() => removeSearch(search.id)} aria-label="Delete this search">
                    <Trash2 size={17} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={History} title="No recent searches" message="Use the search panel or filters while logged in and your searches will show up here.">
          <Link to="/properties" className="btn btn-primary">Start searching</Link>
        </EmptyState>
      )}

      <ConfirmDialog
        open={confirming}
        title="Clear search history?"
        message="All saved searches will be removed from this browser."
        confirmLabel="Clear history"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          clearSearches();
          setConfirming(false);
        }}
      />
    </>
  );
}
