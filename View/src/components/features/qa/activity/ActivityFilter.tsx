/**
 * ActivityFilter - Filter buttons for activity types
 * Allows filtering by activity category
 */

import type { ActivityType } from './types';
import './ActivityFilter.css';

interface ActivityFilterProps {
  activeFilters: ActivityType[];
  onFilterChange: (types: ActivityType[]) => void;
}

const FILTER_OPTIONS: { type: ActivityType; label: string; icon: string }[] = [
  { type: 'order', label: 'Commandes', icon: '🍽️' },
  { type: 'user', label: 'Utilisateurs', icon: '👤' },
  { type: 'menu', label: 'Menu', icon: '📋' },
  { type: 'system', label: 'Système', icon: '⚙️' },
  { type: 'alert', label: 'Alertes', icon: '🚨' },
];

export function ActivityFilter({ activeFilters, onFilterChange }: ActivityFilterProps) {
  const handleToggle = (type: ActivityType) => {
    const newFilters = activeFilters.includes(type)
      ? activeFilters.filter((t) => t !== type)
      : [...activeFilters, type];
    onFilterChange(newFilters);
  };

  return (
    <div className="activity-filter">
      {FILTER_OPTIONS.map(({ type, label, icon }) => (
        <button
          key={type}
          className={`activity-filter__btn ${activeFilters.includes(type) ? 'active' : ''}`}
          onClick={() => handleToggle(type)}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
