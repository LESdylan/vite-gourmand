/**
 * CategoryItem - Single navigation item in sidebar
 * Displays category with icon and count
 */

import type { CategoryData } from './types';
import './CategoryItem.css';

interface CategoryItemProps {
  category: CategoryData;
  isActive: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

export function CategoryItem({ category, isActive, collapsed = false, onClick }: CategoryItemProps) {
  const classes = buildClasses(isActive);
  
  return (
    <button type="button" className={classes} onClick={onClick}>
      <CategoryIcon icon={category.icon} />
      {!collapsed && <CategoryLabel label={category.label} />}
      {!collapsed && category.count > 0 && <CategoryCount count={category.count} />}
    </button>
  );
}

function buildClasses(isActive: boolean): string {
  const classes = ['category-item'];
  if (isActive) classes.push('category-item-active');
  return classes.join(' ');
}

function CategoryIcon({ icon }: { icon: string }) {
  return <span className="category-icon">{icon}</span>;
}

function CategoryLabel({ label }: { label: string }) {
  return <span className="category-label">{label}</span>;
}

function CategoryCount({ count }: { count: number }) {
  return <span className="category-count">{count}</span>;
}
