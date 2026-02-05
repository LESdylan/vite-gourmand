/**
 * Employee Dashboard Types
 */

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export type EmployeeCategoryId = 'tasks' | 'orders' | 'activity';

export interface EmployeeCategory {
  id: EmployeeCategoryId;
  label: string;
  icon: string;
  description: string;
}

export const EMPLOYEE_CATEGORIES: EmployeeCategory[] = [
  { id: 'tasks', label: 'Mes Tâches', icon: '📋', description: 'Tâches assignées' },
  { id: 'orders', label: 'Commandes', icon: '📦', description: 'Commandes en cours' },
  { id: 'activity', label: 'Activité', icon: '📈', description: 'Activité récente' },
];
