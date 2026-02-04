/**
 * useMinitalk - State management for real-time communication scenario
 */

import { useState, useCallback, useEffect } from 'react';
import type { MinitalkOrder, MinitalkMessage, User, OrderStatus } from './types';
import { ORDER_STATUSES } from './types';

// Mock users - will be replaced with API calls
const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Jean Dupont', email: 'jean.dupont@email.com', role: 'client' },
  { id: 'user-2', name: 'Marie Martin', email: 'marie.martin@email.com', role: 'client' },
  { id: 'user-3', name: 'Pierre Bernard', email: 'pierre.bernard@email.com', role: 'client' },
  { id: 'user-4', name: 'Chef Michel', email: 'chef@restaurant.com', role: 'employee' },
  { id: 'user-5', name: 'Admin Restaurant', email: 'admin@restaurant.com', role: 'admin' },
];

// Generate mock orders for demo
const generateMockOrders = (): MinitalkOrder[] => [
  {
    id: 'order-1',
    orderNumber: '#1042',
    clientId: 'user-1',
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@email.com',
    status: 'preparing',
    items: [
      { id: 'item-1', name: 'Menu Dégustation', quantity: 2, price: 65.00 },
      { id: 'item-2', name: 'Bouteille Saint-Émilion', quantity: 1, price: 45.00 },
    ],
    total: 175.00,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    messages: [
      {
        id: 'msg-1',
        orderId: 'order-1',
        senderId: 'user-1',
        senderRole: 'client',
        senderName: 'Jean Dupont',
        content: 'Bonjour, est-ce possible d\'avoir le dessert sans gluten ?',
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
        read: true,
        type: 'message',
      },
      {
        id: 'msg-2',
        orderId: 'order-1',
        senderId: 'user-4',
        senderRole: 'professional',
        senderName: 'Chef Michel',
        content: 'Bien sûr ! Nous avons une option sans gluten pour le fondant au chocolat.',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        read: true,
        type: 'message',
      },
    ],
    unreadCount: 0,
    hasReturnRequest: false,
  },
  {
    id: 'order-2',
    orderNumber: '#1043',
    clientId: 'user-2',
    clientName: 'Marie Martin',
    clientEmail: 'marie.martin@email.com',
    status: 'confirmed',
    items: [
      { id: 'item-3', name: 'Plateau Fruits de Mer', quantity: 1, price: 89.00 },
      { id: 'item-4', name: 'Champagne Brut', quantity: 1, price: 55.00 },
    ],
    total: 144.00,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    messages: [
      {
        id: 'msg-3',
        orderId: 'order-2',
        senderId: 'user-2',
        senderRole: 'client',
        senderName: 'Marie Martin',
        content: 'Allergie aux crustacés, merci de ne pas inclure de crevettes',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        read: false,
        type: 'message',
      },
    ],
    unreadCount: 1,
    hasReturnRequest: false,
  },
  {
    id: 'order-3',
    orderNumber: '#1044',
    clientId: 'user-3',
    clientName: 'Pierre Bernard',
    clientEmail: 'pierre.bernard@email.com',
    status: 'ready',
    items: [
      { id: 'item-5', name: 'Entrecôte Bordelaise', quantity: 1, price: 32.00 },
      { id: 'item-6', name: 'Frites Maison', quantity: 1, price: 6.00 },
      { id: 'item-7', name: 'Café Gourmand', quantity: 1, price: 8.50 },
    ],
    total: 46.50,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    messages: [],
    unreadCount: 0,
    hasReturnRequest: true,
  },
];

export function useMinitalk() {
  const [orders, setOrders] = useState<MinitalkOrder[]>(generateMockOrders);
  const [selectedOrder, setSelectedOrder] = useState<MinitalkOrder | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(MOCK_USERS[0]);
  const [users] = useState<User[]>(MOCK_USERS);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Filter orders for selected client
  const clientOrders = selectedUser
    ? orders.filter(o => o.clientId === selectedUser.id)
    : [];

  // Update order status (professional action)
  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    const statusInfo = ORDER_STATUSES.find(s => s.status === newStatus);
    
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const statusMessage: MinitalkMessage = {
        id: `msg-${Date.now()}`,
        orderId,
        senderId: 'system',
        senderRole: 'professional',
        senderName: 'Système',
        content: `Statut mis à jour: ${statusInfo?.label || newStatus}`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'status_update',
      };

      return {
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        messages: [...order.messages, statusMessage],
        unreadCount: order.unreadCount + 1,
      };
    }));

    // Update selected order if it's the one being modified
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }, [selectedOrder]);

  // Send message
  const sendMessage = useCallback((
    orderId: string,
    content: string,
    senderRole: 'client' | 'professional',
    senderName: string,
    type: MinitalkMessage['type'] = 'message'
  ) => {
    const newMessage: MinitalkMessage = {
      id: `msg-${Date.now()}`,
      orderId,
      senderId: senderRole === 'client' ? selectedUser?.id || 'unknown' : 'professional',
      senderRole,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type,
    };

    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const isReturnRequest = type === 'return_request';
      
      return {
        ...order,
        messages: [...order.messages, newMessage],
        unreadCount: senderRole === 'client' ? order.unreadCount + 1 : order.unreadCount,
        hasReturnRequest: isReturnRequest ? true : order.hasReturnRequest,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [selectedUser]);

  // Mark messages as read
  const markAsRead = useCallback((orderId: string, role: 'client' | 'professional') => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      return {
        ...order,
        messages: order.messages.map(msg =>
          msg.senderRole !== role ? { ...msg, read: true } : msg
        ),
        unreadCount: role === 'professional' ? 0 : order.unreadCount,
      };
    }));
  }, []);

  // Select user (changes client view)
  const selectUser = useCallback((user: User | null) => {
    setSelectedUser(user);
    setSelectedOrder(null);
  }, []);

  // Simulate real-time updates (for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update an order status for demo effect
      const randomIndex = Math.floor(Math.random() * orders.length);
      const order = orders[randomIndex];
      
      if (order && Math.random() > 0.7) {
        const currentStatusIndex = ORDER_STATUSES.findIndex(s => s.status === order.status);
        const nextStatus = ORDER_STATUSES[currentStatusIndex + 1];
        
        if (nextStatus && nextStatus.status !== 'cancelled') {
          // updateOrderStatus(order.id, nextStatus.status);
          // Disabled auto-update for cleaner demo
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orders]);

  return {
    // State
    orders,
    clientOrders,
    selectedOrder,
    selectedUser,
    users,
    isLoading,
    error,

    // Actions
    setSelectedOrder,
    selectUser,
    updateOrderStatus,
    sendMessage,
    markAsRead,
  };
}
