/**
 * DevBoard constants
 * Fly.io-inspired category structure
 */

import type { CategoryData } from '../features/qa/sidebar';

/** Main navigation categories - Fly.io style grouping */
export const CATEGORIES: CategoryData[] = [
  // Main sections
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: 'overview', 
    count: 0, 
    group: 'main',
    description: 'Dashboard overview and summary'
  },
  { 
    id: 'test-automatics', 
    label: 'Tests Auto', 
    icon: 'tests', 
    count: 96, 
    group: 'main',
    description: 'Automated test suites and results'
  },
  { 
    id: 'scenarios', 
    label: 'Scénarios', 
    icon: 'scenarios', 
    count: 6, 
    group: 'main',
    description: 'Interactive test scenarios'
  },
  { 
    id: 'database', 
    label: 'Database', 
    icon: 'database', 
    group: 'main',
    description: 'PostgreSQL tables viewer & CRUD'
  },
  
  // Utility sections
  { 
    id: 'metrics', 
    label: 'Metrics', 
    icon: 'metrics', 
    group: 'utility',
    description: 'Performance and health metrics'
  },
  { 
    id: 'logs', 
    label: 'Logs & Errors', 
    icon: 'logs', 
    group: 'utility',
    description: 'Application logs and error tracking'
  },
  { 
    id: 'activity', 
    label: 'Activity', 
    icon: 'activity', 
    group: 'utility',
    description: 'Recent activity and events'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: 'settings', 
    group: 'utility',
    description: 'Configuration and preferences'
  },
];

/** Get categories by group */
export const getMainCategories = () => CATEGORIES.filter(c => c.group === 'main');
export const getUtilityCategories = () => CATEGORIES.filter(c => c.group === 'utility');

export const DEFAULT_METRICS = {
  responseTime: { avgMs: 145, trend: 'down' as const, changePercent: 12 },
  errorRate: { errorPercent: 0.8, trend: 'stable' as const },
  dbLatency: { avgMs: 23, trend: 'up' as const, changePercent: 5 },
  coverage: { coveragePercent: 78, trend: 'up' as const, changePercent: 3 },
};
