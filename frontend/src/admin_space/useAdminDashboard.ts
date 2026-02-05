/**
 * useAdminDashboard Hook
 * Manages admin dashboard state
 */

import { useState, useCallback } from 'react';
import type { AdminStats, AdminCategoryId } from './types';

export function useAdminDashboard() {
  const [activeCategory, setActiveCategory] = useState<AdminCategoryId>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    revenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
  });

  const selectCategory = useCallback((category: AdminCategoryId) => {
    setActiveCategory(category);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  // TODO: Fetch real stats from API
  const refreshStats = useCallback(async () => {
    setStats({
      totalOrders: 156,
      revenue: 12450,
      activeUsers: 42,
      pendingOrders: 8,
    });
  }, []);

  return {
    activeCategory,
    isSidebarCollapsed,
    stats,
    selectCategory,
    toggleSidebar,
    refreshStats,
  };
}
