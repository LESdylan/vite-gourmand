// Routes pour la gestion des commandes
import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const ordersRouter = new Hono();

// Créer une commande
ordersRouter.post('/', async (c) => {
  try {
    const order = await c.req.json();
    
    console.log(`[ORDERS] Creating new order for user: ${order.userId || 'unknown'}`);
    
    // Générer un ID si non fourni
    if (!order.id) {
      order.id = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Ajouter des métadonnées
    if (!order.createdAt) {
      order.createdAt = new Date().toISOString();
    }
    if (!order.status) {
      order.status = 'pending';
    }
    if (!order.statusHistory) {
      order.statusHistory = [{
        status: 'pending',
        timestamp: new Date().toISOString(),
        message: 'Commande reçue'
      }];
    }

    // Sauvegarder la commande
    console.log(`[ORDERS] Saving order ${order.id} to KV store`);
    await kv.set(`order:${order.id}`, order);
    
    // Ajouter à la liste des commandes
    const allOrders = await kv.get('orders:list') || [];
    console.log(`[ORDERS] Current orders list has ${allOrders.length} orders`);
    allOrders.push(order.id);
    await kv.set('orders:list', allOrders);
    console.log(`[ORDERS] Updated orders list now has ${allOrders.length} orders`);

    // Si userId fourni, ajouter à la liste des commandes de l'utilisateur
    if (order.userId) {
      const userOrders = await kv.get(`user:${order.userId}:orders`) || [];
      userOrders.push(order.id);
      await kv.set(`user:${order.userId}:orders`, userOrders);
      console.log(`[ORDERS] Added order to user ${order.userId} orders list`);
    }

    console.log(`[ORDERS] ✅ Order created successfully: ${order.id}`);
    return c.json({ success: true, orderId: order.id, order });
  } catch (error) {
    console.error('[ORDERS] ❌ Error creating order:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Récupérer toutes les commandes (avec filtres optionnels)
ordersRouter.get('/', async (c) => {
  try {
    const statusFilter = c.req.query('status');
    const customerFilter = c.req.query('customer');
    
    console.log(`[ORDERS] Fetching orders with filters - status: ${statusFilter}, customer: ${customerFilter}`);
    
    const orderIds = await kv.get('orders:list') || [];
    console.log(`[ORDERS] Found ${orderIds.length} order IDs in orders:list`);
    
    const orders = [];

    for (const orderId of orderIds) {
      const order = await kv.get(`order:${orderId}`);
      if (order) {
        // Appliquer les filtres
        let include = true;
        
        if (statusFilter && order.status !== statusFilter) {
          include = false;
        }
        
        if (customerFilter && order.customerName) {
          const searchTerm = customerFilter.toLowerCase();
          const customerName = order.customerName.toLowerCase();
          const customerEmail = (order.customerEmail || '').toLowerCase();
          if (!customerName.includes(searchTerm) && !customerEmail.includes(searchTerm)) {
            include = false;
          }
        }
        
        if (include) {
          orders.push(order);
        }
      } else {
        console.log(`[ORDERS] Warning: Order ${orderId} not found in KV store`);
      }
    }

    // Trier par date de création (plus récent en premier)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`[ORDERS] Returning ${orders.length} orders after filters`);
    return c.json(orders);
  } catch (error) {
    console.error('[ORDERS] Error fetching orders:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Récupérer les commandes d'un utilisateur
ordersRouter.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const userOrderIds = await kv.get(`user:${userId}:orders`) || [];
    const orders = [];

    for (const orderId of userOrderIds) {
      const order = await kv.get(`order:${orderId}`);
      if (order) {
        orders.push(order);
      }
    }

    // Trier par date de création
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Récupérer une commande spécifique
ordersRouter.get('/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    return c.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mettre à jour le statut d'une commande
ordersRouter.patch('/:orderId/status', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { status } = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Mettre à jour le statut
    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Ajouter à l'historique des statuts
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString()
    });

    await kv.set(`order:${orderId}`, order);

    // TODO: Notifier le client via WebSocket/Realtime
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Assigner une commande
ordersRouter.patch('/:orderId/assign', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { assignedTo } = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    order.assignedTo = assignedTo;
    order.updatedAt = new Date().toISOString();

    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error('Error assigning order:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mettre à jour la progression des plats
ordersRouter.patch('/:orderId/dishes', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { dishes } = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    order.dishes = dishes;
    order.updatedAt = new Date().toISOString();

    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error('Error updating dish progress:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Annuler ou modifier une commande (avec contact client obligatoire pour employés)
ordersRouter.patch('/:orderId/cancel', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { contactMethod, contactReason, cancelReason } = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Enregistrer le contact client
    if (!order.clientContacts) {
      order.clientContacts = [];
    }
    
    order.clientContacts.push({
      method: contactMethod, // 'phone' ou 'email'
      reason: contactReason,
      timestamp: new Date().toISOString()
    });

    // Annuler la commande
    order.status = 'cancelled';
    order.cancellationReason = cancelReason;
    order.updatedAt = new Date().toISOString();

    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      reason: cancelReason
    });

    await kv.set(`order:${orderId}`, order);
    
    console.log(`Order ${orderId} cancelled after client contact via ${contactMethod}`);
    return c.json({ success: true, order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default ordersRouter;
