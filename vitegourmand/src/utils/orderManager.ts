// Gestionnaire de commandes avec Supabase
import { supabase } from './supabase/client';
import { projectId, publicAnonKey } from './supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export interface OrderData {
  id?: string;
  menuId: string;
  menuName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  persons: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryDate: string;
  status: string;
  assignedTo?: string;
  createdAt?: string;
  notes?: string;
  userId?: string;
  dishes?: any[];
}

// Créer une commande
export async function createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // Préparer les données pour le KV store
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const order = {
      ...orderData,
      id: orderId,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
    };

    // Sauvegarder dans le KV store
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-e87bab51/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error creating order:', error);
      return { success: false, error: 'Erreur lors de la création de la commande' };
    }

    return { success: true, orderId };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Erreur réseau' };
  }
}

// Récupérer toutes les commandes
export async function getAllOrders(): Promise<OrderData[]> {
  try {
    console.log('[orderManager] Fetching all orders from API...');
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-e87bab51/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[orderManager] Error fetching orders - Status:', response.status, 'Response:', errorText);
      return [];
    }

    const orders = await response.json();
    console.log(`[orderManager] ✅ Successfully fetched ${orders?.length || 0} orders`);
    return orders || [];
  } catch (error) {
    console.error('[orderManager] ❌ Error fetching orders:', error);
    return [];
  }
}

// Récupérer les commandes d'un utilisateur
export async function getUserOrders(userId: string): Promise<OrderData[]> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-e87bab51/orders/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      console.error('Error fetching user orders');
      return [];
    }

    const orders = await response.json();
    return orders || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

// Mettre à jour le statut d'une commande
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-e87bab51/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

// Assigner une commande à un employé
export async function assignOrder(orderId: string, assignedTo: string): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-e87bab51/orders/${orderId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ assignedTo }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error assigning order:', error);
    return false;
  }
}

// Mettre à jour la progression des plats
export async function updateDishProgress(orderId: string, dishes: any[]): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-e87bab51/orders/${orderId}/dishes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ dishes }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating dish progress:', error);
    return false;
  }
}
