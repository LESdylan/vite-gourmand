/**
 * CategoryList - Navigation list of test categories
 * Renders all category items
 */

import type { CategoryData, TestCategory } from './types';
import { CategoryItem } from './CategoryItem';
import './CategoryList.css';

interface CategoryListProps {
  categories: CategoryData[];
  activeCategory: TestCategory;
  collapsed?: boolean;
  onSelect: (category: TestCategory) => void;
}

export function CategoryList({ categories, activeCategory, collapsed, onSelect }: CategoryListProps) {
  return (
    <nav className="category-list" aria-label="Test categories">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          isActive={activeCategory === category.id}
          collapsed={collapsed}
          onClick={() => onSelect(category.id)}
        />
      ))}
    </nav>
  );
}
