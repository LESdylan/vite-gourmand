/**
 * Admin Dashboard Types
 */

export interface AdminStats {
  totalOrders: number;
  revenue: number;
  activeUsers: number;
  pendingOrders: number;
}

export type AdminCategoryId = 'overview' | 'orders' | 'users' | 'metrics' | 'settings';

export interface AdminCategory {
  id: AdminCategoryId;
  label: string;
  icon: string;
  description: string;
}

export const ADMIN_CATEGORIES: AdminCategory[] = [
  { id: 'overview', label: 'Aperçu', icon: '📊', description: 'Vue d\'ensemble' },
  { id: 'orders', label: 'Commandes', icon: '📦', description: 'Gestion des commandes' },
  { id: 'users', label: 'Utilisateurs', icon: '👥', description: 'Gestion des utilisateurs' },
  { id: 'metrics', label: 'Métriques', icon: '📈', description: 'Statistiques business' },
  { id: 'settings', label: 'Paramètres', icon: '⚙️', description: 'Configuration' },
];
