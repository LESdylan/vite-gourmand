/**
 * DevBoard constants
 * Static data and configuration
 */

import type { CategoryData } from '../features/qa/sidebar';

export const CATEGORIES: CategoryData[] = [
  { id: 'performance', label: 'Performance', icon: '⚡', count: 12 },
  { id: 'api', label: 'API Tests', icon: '🔌', count: 34 },
  { id: 'database', label: 'Database', icon: '🗄️', count: 8 },
  { id: 'security', label: 'Security', icon: '🔒', count: 15 },
  { id: 'regression', label: 'Regression', icon: '🔄', count: 27 },
  { id: 'manual', label: 'Manual', icon: '✋', count: 6 },
];

export const DEFAULT_METRICS = {
  responseTime: { avgMs: 145, trend: 'down' as const, changePercent: 12 },
  errorRate: { errorPercent: 0.8, trend: 'stable' as const },
  dbLatency: { avgMs: 23, trend: 'up' as const, changePercent: 5 },
  coverage: { coveragePercent: 78, trend: 'up' as const, changePercent: 3 },
};
