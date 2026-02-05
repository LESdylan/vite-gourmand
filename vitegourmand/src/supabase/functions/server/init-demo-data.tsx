// Script d'initialisation des données de démo
import * as kv from './kv_store.tsx';

export async function initializeDemoData() {
  console.log('[INIT] Initializing demo data...');
  
  // 1. Créer les utilisateurs de démo
  const demoUsers = {
    'user-isabelle': {
      id: 'user-isabelle',
      email: 'isabelle.martin@email.com',
      firstName: 'Isabelle',
      lastName: 'Martin',
      phone: '06 12 34 56 78',
      address: '15 rue Sainte-Catherine, 33000 Bordeaux',
      role: 'customer',
      createdAt: '2025-12-01T10:00:00.000Z'
    },
    'user-marie': {
      id: 'user-marie',
      email: 'marie.dubois@email.com',
      firstName: 'Marie',
      lastName: 'Dubois',
      phone: '06 23 45 67 89',
      address: '28 cours de l\'Intendance, 33000 Bordeaux',
      role: 'customer',
      createdAt: '2025-11-15T14:30:00.000Z'
    },
    'user-julie': {
      id: 'user-julie',
      email: 'julie.admin@vitegourmand.fr',
      firstName: 'Julie',
      lastName: 'Renard',
      phone: '06 98 76 54 32',
      address: '5 place de la Bourse, 33000 Bordeaux',
      role: 'admin',
      createdAt: '2025-01-10T09:00:00.000Z'
    },
    'user-thomas': {
      id: 'user-thomas',
      email: 'thomas.chef@vitegourmand.fr',
      firstName: 'Thomas',
      lastName: 'Moreau',
      phone: '06 45 67 89 01',
      address: '12 rue du Palais, 33000 Bordeaux',
      role: 'employee',
      createdAt: '2025-03-05T08:00:00.000Z'
    }
  };

  // 2. Créer les profils utilisateurs avec points
  const userProfiles = {
    'user-isabelle': {
      points: 450,
      totalOrders: 5,
      affiliateCode: 'VGISA123',
      isAffiliate: true,
      referredBy: null,
      totalSavings: 23.50,
      nextRewardAt: 500
    },
    'user-marie': {
      points: 189,
      totalOrders: 2,
      affiliateCode: 'VGMAR456',
      isAffiliate: false,
      referredBy: 'user-isabelle',
      totalSavings: 0,
      nextRewardAt: 500
    },
    'user-julie': {
      points: 0,
      totalOrders: 0,
      affiliateCode: '',
      isAffiliate: false,
      referredBy: null,
      totalSavings: 0,
      nextRewardAt: 500
    },
    'user-thomas': {
      points: 0,
      totalOrders: 0,
      affiliateCode: '',
      isAffiliate: false,
      referredBy: null,
      totalSavings: 0,
      nextRewardAt: 500
    }
  };

  // 3. Créer des commandes de démo
  const orders = [
    // Commandes d'Isabelle
    {
      id: 'ord-isabelle-1',
      userId: 'user-isabelle',
      customerName: 'Isabelle Martin',
      customerEmail: 'isabelle.martin@email.com',
      customerPhone: '06 12 34 56 78',
      deliveryAddress: '15 rue Sainte-Catherine, 33000 Bordeaux',
      menuId: 'menu-1',
      menuTitle: 'Menu Bordeaux Prestige',
      numberOfPeople: 8,
      deliveryDate: '2026-02-10T19:00:00.000Z',
      totalPrice: 320,
      deliveryFee: 5,
      status: 'preparing',
      specialRequests: 'Pas d\'allergies',
      createdAt: '2026-01-25T10:00:00.000Z',
      statusHistory: [
        { status: 'Commande confirmée', date: '2026-01-25T10:00:00.000Z' },
        { status: 'Préparation des ingrédients', date: '2026-02-01T08:00:00.000Z' }
      ],
      reviewId: null,
      pointsEarned: 0
    },
    {
      id: 'ord-isabelle-2',
      userId: 'user-isabelle',
      customerName: 'Isabelle Martin',
      customerEmail: 'isabelle.martin@email.com',
      customerPhone: '06 12 34 56 78',
      deliveryAddress: '15 rue Sainte-Catherine, 33000 Bordeaux',
      menuId: 'menu-2',
      menuTitle: 'Menu Végétarien Bio',
      numberOfPeople: 6,
      deliveryDate: '2026-01-15T19:00:00.000Z',
      totalPrice: 180,
      deliveryFee: 5,
      status: 'completed',
      specialRequests: '',
      createdAt: '2026-01-05T14:00:00.000Z',
      completedAt: '2026-01-15T20:00:00.000Z',
      statusHistory: [
        { status: 'Commande confirmée', date: '2026-01-05T14:00:00.000Z' },
        { status: 'Préparation des ingrédients', date: '2026-01-14T08:00:00.000Z' },
        { status: 'En cours de livraison', date: '2026-01-15T17:00:00.000Z' },
        { status: 'Livré', date: '2026-01-15T19:30:00.000Z' }
      ],
      reviewId: null,
      pointsEarned: 180
    },
    {
      id: 'ord-isabelle-3',
      userId: 'user-isabelle',
      customerName: 'Isabelle Martin',
      customerEmail: 'isabelle.martin@email.com',
      customerPhone: '06 12 34 56 78',
      deliveryAddress: '15 rue Sainte-Catherine, 33000 Bordeaux',
      menuId: 'menu-3',
      menuTitle: 'Menu Fruits de Mer',
      numberOfPeople: 10,
      deliveryDate: '2025-12-20T19:00:00.000Z',
      totalPrice: 450,
      deliveryFee: 5,
      status: 'completed',
      specialRequests: 'Anniversaire',
      createdAt: '2025-12-10T10:00:00.000Z',
      completedAt: '2025-12-20T20:00:00.000Z',
      statusHistory: [
        { status: 'Commande confirmée', date: '2025-12-10T10:00:00.000Z' },
        { status: 'Livré', date: '2025-12-20T19:30:00.000Z' }
      ],
      reviewId: 'rev-isabelle-1',
      pointsEarned: 450
    },

    // Commandes de Marie
    {
      id: 'ord-marie-1',
      userId: 'user-marie',
      customerName: 'Marie Dubois',
      customerEmail: 'marie.dubois@email.com',
      customerPhone: '06 23 45 67 89',
      deliveryAddress: '28 cours de l\'Intendance, 33000 Bordeaux',
      menuId: 'menu-1',
      menuTitle: 'Menu Bordeaux Prestige',
      numberOfPeople: 12,
      deliveryDate: '2026-02-20T19:00:00.000Z',
      totalPrice: 480,
      deliveryFee: 5,
      status: 'delivery',
      specialRequests: 'Appeler avant de livrer',
      createdAt: '2026-02-01T11:00:00.000Z',
      statusHistory: [
        { status: 'Commande confirmée', date: '2026-02-01T11:00:00.000Z' },
        { status: 'Préparation', date: '2026-02-18T08:00:00.000Z' },
        { status: 'En cours de livraison', date: '2026-02-20T17:00:00.000Z' }
      ],
      reviewId: null,
      pointsEarned: 0
    },
    {
      id: 'ord-marie-2',
      userId: 'user-marie',
      customerName: 'Marie Dubois',
      customerEmail: 'marie.dubois@email.com',
      customerPhone: '06 23 45 67 89',
      deliveryAddress: '28 cours de l\'Intendance, 33000 Bordeaux',
      menuId: 'menu-4',
      menuTitle: 'Menu Terroir Aquitain',
      numberOfPeople: 8,
      deliveryDate: '2026-01-10T19:00:00.000Z',
      totalPrice: 280,
      deliveryFee: 5,
      status: 'completed',
      specialRequests: '',
      createdAt: '2025-12-28T15:00:00.000Z',
      completedAt: '2026-01-10T20:00:00.000Z',
      statusHistory: [
        { status: 'Commande confirmée', date: '2025-12-28T15:00:00.000Z' },
        { status: 'Livré', date: '2026-01-10T19:30:00.000Z' }
      ],
      reviewId: null,
      pointsEarned: 280
    }
  ];

  // 4. Créer les avis
  const reviews = [
    {
      id: 'rev-isabelle-1',
      orderId: 'ord-isabelle-3',
      userId: 'user-isabelle',
      userName: 'Isabelle Martin',
      rating: 5,
      text: 'Absolument délicieux ! Les fruits de mer étaient d\'une fraîcheur exceptionnelle. Mes invités ont adoré. Service impeccable.',
      validated: true,
      createdAt: '2025-12-21T10:00:00.000Z'
    }
  ];

  // Sauvegarder dans KV
  await kv.set('demo_users', demoUsers);
  await kv.set('user_profiles', userProfiles);
  await kv.set('orders', orders);
  await kv.set('reviews', reviews);

  console.log('[INIT] Demo data initialized successfully!');
  console.log(`[INIT] - ${Object.keys(demoUsers).length} users`);
  console.log(`[INIT] - ${orders.length} orders`);
  console.log(`[INIT] - ${reviews.length} reviews`);

  return {
    users: Object.keys(demoUsers).length,
    orders: orders.length,
    reviews: reviews.length
  };
}
