/**
 * Minitalk Types
 * Real-time communication between client and professional
 */

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  icon: string;
  color: string;
}

export const ORDER_STATUSES: OrderStatusInfo[] = [
  { status: 'pending', label: 'En attente', icon: '⏳', color: '#8a827a' },
  { status: 'confirmed', label: 'Confirmée', icon: '✅', color: '#6b8e23' },
  { status: 'preparing', label: 'En préparation', icon: '👨‍🍳', color: '#c9a227' },
  { status: 'ready', label: 'Prête', icon: '🍽️', color: '#3b82f6' },
  { status: 'delivering', label: 'En livraison', icon: '🚚', color: '#8b5cf6' },
  { status: 'delivered', label: 'Livrée', icon: '📦', color: '#22c55e' },
  { status: 'cancelled', label: 'Annulée', icon: '❌', color: '#a91e2c' },
];

export interface MinitalkMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: 'client' | 'professional';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'status_update' | 'return_request';
}

export interface MinitalkOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  messages: MinitalkMessage[];
  unreadCount: number;
  hasReturnRequest: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin' | 'employee';
  avatar?: string;
}

export interface MinitalkState {
  orders: MinitalkOrder[];
  selectedOrder: MinitalkOrder | null;
  selectedUser: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
}
