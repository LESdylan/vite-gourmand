/**
 * useEmployeeDashboard Hook
 * Manages employee dashboard state
 */

import { useState, useCallback } from 'react';
import type { Task, EmployeeCategoryId } from './types';

export function useEmployeeDashboard() {
  const [activeCategory, setActiveCategory] = useState<EmployeeCategoryId>('tasks');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Préparer table 5', status: 'todo', priority: 'high' },
    { id: '2', title: 'Vérifier stock desserts', status: 'in-progress', priority: 'medium' },
    { id: '3', title: 'Nettoyer zone bar', status: 'done', priority: 'low' },
  ]);

  const selectCategory = useCallback((category: EmployeeCategoryId) => {
    setActiveCategory(category);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  }, []);

  return {
    activeCategory,
    isSidebarCollapsed,
    tasks,
    selectCategory,
    toggleSidebar,
    updateTaskStatus,
  };
}
