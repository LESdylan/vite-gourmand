/**
 * Search Bar - Simple controlled search input
 */

import type { TableColumn } from './types';
import './FilterBar.css';

interface Props {
  columns: TableColumn[];
  searchTerm: string;
  onSearch: (term: string) => void;
  onClear: () => void;
}

export function FilterBar({ columns, searchTerm, onSearch, onClear }: Props) {
  return (
    <div className="filter-bar">
      <div className="filter-bar-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher dans les données..."
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-search" onClick={onClear} title="Effacer">
            ×
          </button>
        )}
      </div>

      <div className="filter-bar-info">
        <span className="columns-count">📊 {columns.length} colonnes</span>
        {searchTerm && <span className="active-filter">Recherche: "{searchTerm}"</span>}
      </div>
    </div>
  );
}
