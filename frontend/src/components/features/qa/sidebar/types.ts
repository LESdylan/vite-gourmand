/**
 * QA Test Category Types
 */

export type TestCategory = 
  | 'performance'
  | 'api'
  | 'database'
  | 'security'
  | 'regression'
  | 'manual';

export interface CategoryData {
  id: TestCategory;
  label: string;
  icon: string;
  count: number;
}
