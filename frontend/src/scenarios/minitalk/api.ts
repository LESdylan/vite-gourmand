/**
 * API Service for Minitalk
 * Connects to backend for real user and order data
 */

import type { User, MinitalkOrder, OrderStatus } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

/**
 * Fetch users from admin endpoint
 */
export async function fetchUsers(): Promise<ApiResponse<User[]>> {
  try {
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if available
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend data to our User type
    const users: User[] = data.map((u: any) => ({
      id: String(u.id),
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      role: u.role || 'client',
    }));

    return { data: users };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { data: [], error: String(error) };
  }
}

/**
 * Fetch orders from orders endpoint
 */
export async function fetchOrders(): Promise<ApiResponse<MinitalkOrder[]>> {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend orders to MinitalkOrder
    const orders: MinitalkOrder[] = data.map((o: any) => ({
      id: String(o.id),
      orderNumber: `#${o.id}`,
      clientId: String(o.userId),
      clientName: o.user?.firstName 
        ? `${o.user.firstName} ${o.user.lastName || ''}`.trim()
        : 'Client',
      clientEmail: o.user?.email || '',
      status: mapBackendStatus(o.status),
      items: (o.items || []).map((item: any) => ({
        id: String(item.id),
        name: item.dish?.name || item.name || 'Article',
        quantity: item.quantity || 1,
        price: item.price || 0,
        notes: item.notes,
      })),
      total: o.total || 0,
      createdAt: o.createdAt || new Date().toISOString(),
      updatedAt: o.updatedAt || new Date().toISOString(),
      messages: [], // Messages would come from a separate endpoint
      unreadCount: 0,
      hasReturnRequest: false,
    }));

    return { data: orders };
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return { data: [], error: String(error) };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
      body: JSON.stringify({ status: mapToBackendStatus(status) }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { data: true };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return { data: false, error: String(error) };
  }
}

/**
 * Map backend status to our OrderStatus
 */
function mapBackendStatus(backendStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'DELIVERING': 'delivering',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
  };
  return statusMap[backendStatus?.toUpperCase()] || 'pending';
}

/**
 * Map our OrderStatus to backend format
 */
function mapToBackendStatus(status: OrderStatus): string {
  return status.toUpperCase();
}

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Set auth token (for login)
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Clear auth token (for logout)
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}
