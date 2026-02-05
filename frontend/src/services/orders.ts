/**
 * Orders Service
 * API calls for order management
 */

import { apiRequest } from './api';

// Re-export icon helper from components
export { getStatusIcon } from '../components/icons/OrderStatusIcons';

export type OrderStatus = 
  | 'pending'
  | 'confirmed' 
  | 'preparing'
  | 'cooking'
  | 'assembling'
  | 'ready'
  | 'delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: number;
  userId: number;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  type: 'dine_in' | 'takeaway' | 'delivery';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: { menuItemId: number; quantity: number; notes?: string }[];
  type: 'dine_in' | 'takeaway' | 'delivery';
  notes?: string;
  deliveryAddress?: string;
}

export interface OrderQuery {
  status?: OrderStatus;
  type?: 'dine_in' | 'takeaway' | 'delivery';
  limit?: number;
  offset?: number;
}

/** Get all orders (filtered) */
export async function getOrders(query?: OrderQuery): Promise<Order[]> {
  const params = new URLSearchParams();
  if (query?.status) params.set('status', query.status);
  if (query?.type) params.set('type', query.type);
  if (query?.limit) params.set('limit', String(query.limit));
  if (query?.offset) params.set('offset', String(query.offset));
  
  const queryString = params.toString();
  return apiRequest(`/api/orders${queryString ? `?${queryString}` : ''}`);
}

/** Get single order */
export async function getOrder(id: number): Promise<Order> {
  return apiRequest(`/api/orders/${id}`);
}

/** Create new order */
export async function createOrder(data: CreateOrderData): Promise<Order> {
  return apiRequest('/api/orders', { method: 'POST', body: data });
}

/** Update order status */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  return apiRequest(`/api/orders/${id}/status`, { 
    method: 'PATCH', 
    body: { status } 
  });
}

/** Cancel order */
export async function cancelOrder(id: number): Promise<void> {
  return apiRequest(`/api/orders/${id}`, { method: 'DELETE' });
}

/** Get status display info */
export function getStatusInfo(status: OrderStatus): { label: string; color: string } {
  const statusMap: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: 'En attente', color: '#6b7280' },
    confirmed: { label: 'Confirmée', color: '#3b82f6' },
    preparing: { label: 'Préparation', color: '#8b5cf6' },
    cooking: { label: 'Cuisson', color: '#f97316' },
    assembling: { label: 'Assemblage', color: '#eab308' },
    ready: { label: 'Prête', color: '#22c55e' },
    delivery: { label: 'Livraison', color: '#06b6d4' },
    delivered: { label: 'Livrée', color: '#10b981' },
    cancelled: { label: 'Annulée', color: '#ef4444' },
  };
  return statusMap[status];
}
