/**
 * Orders Service
 * CRUD operations against the orders table via PostgREST / Supabase client.
 */

import { supabase } from '../lib/supabase';

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

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  delivery_date: string;
  delivery_hour: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_distance_km: number | null;
  person_number: number;
  menu_price: number;
  delivery_price: number | null;
  discount_percent: number | null;
  discount_amount: number | null;
  total_price: number;
  status: OrderStatus | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { email: string; first_name: string | null };
  order_menus?: { order_id: string; menu_id: string; quantity: number | null }[];
}

/** Matches the create-order payload */
export interface CreateOrderData {
  delivery_date: string;
  delivery_hour: string;
  delivery_address: string;
  person_number: number;
  menu_price: number;
  total_price: number;
  special_instructions?: string;
  menu_id?: string;
}

export interface OrderQuery {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}

interface PaginatedOrders {
  items: Order[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const ORDER_SELECT = '*, profiles(email, first_name), order_menus(*)';

/** Get all orders (admin / staff) */
export async function getOrders(query?: OrderQuery): Promise<PaginatedOrders> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase
    .from('orders')
    .select(ORDER_SELECT, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (query?.status) q = q.eq('status', query.status);
  if (query?.fromDate) q = q.gte('delivery_date', query.fromDate);
  if (query?.toDate) q = q.lte('delivery_date', query.toDate);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    items: data as Order[],
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/** Get my orders (current user) */
export async function getMyOrders(query?: OrderQuery): Promise<PaginatedOrders> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('orders')
    .select(ORDER_SELECT, { count: 'exact' })
    .eq('user_id', user.id)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    items: data as Order[],
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/** Get single order */
export async function getOrder(id: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Order;
}

/** Create new order */
export async function createOrder(input: CreateOrderData): Promise<Order> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      delivery_date: input.delivery_date,
      delivery_hour: input.delivery_hour,
      delivery_address: input.delivery_address,
      person_number: input.person_number,
      menu_price: input.menu_price,
      total_price: input.total_price,
      special_instructions: input.special_instructions,
      status: 'pending',
    })
    .select(ORDER_SELECT)
    .single();

  if (error) throw new Error(error.message);

  // Link menu if provided
  if (input.menu_id && data) {
    await supabase.from('order_menus').insert({
      order_id: data.id,
      menu_id: input.menu_id,
      quantity: 1,
    });
  }

  return data as Order;
}

/** Update order */
export async function updateOrder(
  id: string,
  updates: Partial<Pick<CreateOrderData, 'delivery_address' | 'delivery_hour' | 'special_instructions'>>,
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select(ORDER_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as Order;
}

/** Cancel order */
export async function cancelOrder(id: string, _reason: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/** Get status display info */
export function getStatusInfo(status: OrderStatus | null): { label: string; color: string } {
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
  return statusMap[status ?? 'pending'];
}

