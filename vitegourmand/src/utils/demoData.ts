// Données de démonstration pour le mode démo (sans backend)
import { generateSimulationOrders, getJulieOrder } from './orderSimulation';
import type { Order } from '../types/order';

export const demoMenus = [
  {
    id: 'menu-1',
    title: 'Menu Gourmand',
    description: 'Un menu raffiné qui célèbre la gastronomie française avec des produits de saison.',
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    theme: 'mariage',
    regime: 'classique',
    minPeople: 10,
    price: 450,
    conditions: 'Commande 48h à l\'avance. Supplément de 10€/personne au-delà de 50 personnes.',
    stock: 5,
    allergens: ['gluten', 'lactose', 'fruits de mer'],
    dishes: [
      {
        id: 'dish-1',
        name: 'Foie gras mi-cuit',
        description: 'Foie gras du Sud-Ouest, chutney de figues',
        type: 'entrée'
      },
      {
        id: 'dish-2',
        name: 'Saint-Jacques rôties',
        description: 'Noix de Saint-Jacques, purée de céleri, jus de veau',
        type: 'plat'
      },
      {
        id: 'dish-3',
        name: 'Macaron framboise',
        description: 'Macaron maison, crème de framboise',
        type: 'dessert'
      }
    ],
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'menu-2',
    title: 'Menu Vegan Délice',
    description: 'Une explosion de saveurs végétales pour un repas éthique et savoureux.',
    images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'],
    theme: 'anniversaire',
    regime: 'vegan',
    minPeople: 8,
    price: 380,
    conditions: 'Commande 24h à l\'avance.',
    stock: 10,
    allergens: ['fruits à coque'],
    dishes: [
      {
        id: 'dish-4',
        name: 'Tartare d\'avocat',
        description: 'Avocat, tomate, oignon rouge, citron vert',
        type: 'entrée'
      },
      {
        id: 'dish-5',
        name: 'Curry de légumes',
        description: 'Légumes de saison, lait de coco, riz basmati',
        type: 'plat'
      },
      {
        id: 'dish-6',
        name: 'Tiramisu vegan',
        description: 'Crème de cajou, café, cacao',
        type: 'dessert'
      }
    ],
    createdAt: '2026-01-16T10:00:00Z'
  },
  {
    id: 'menu-3',
    title: 'Menu Bordeaux Tradition',
    description: 'Les classiques de la cuisine bordelaise revisités avec modernité.',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
    theme: 'entreprise',
    regime: 'classique',
    minPeople: 15,
    price: 520,
    conditions: 'Commande 72h à l\'avance.',
    stock: 3,
    allergens: ['gluten', 'lactose', 'vin'],
    dishes: [
      {
        id: 'dish-7',
        name: 'Huîtres du bassin',
        description: 'Huîtres d\'Arcachon, citron, vinaigre échalote',
        type: 'entrée'
      },
      {
        id: 'dish-8',
        name: 'Entrecôte bordelaise',
        description: 'Entrecôte de bœuf, sauce bordelaise, gratin dauphinois',
        type: 'plat'
      },
      {
        id: 'dish-9',
        name: 'Canelé',
        description: 'Canelé traditionnel bordelais',
        type: 'dessert'
      }
    ],
    createdAt: '2026-01-17T10:00:00Z'
  }
];

export const demoReviews = [
  {
    id: 'review-1',
    userName: 'Marie Dupont',
    rating: 5,
    text: 'Service exceptionnel ! Les plats étaient délicieux et la présentation impeccable. Je recommande vivement pour vos événements.',
    validated: true,
    createdAt: '2026-01-20T14:30:00Z'
  },
  {
    id: 'review-2',
    userName: 'Thomas Martin',
    rating: 5,
    text: 'Parfait pour notre mariage ! Julie et José ont été à l\'écoute et ont su créer un menu sur-mesure. Nos invités étaient ravis.',
    validated: true,
    createdAt: '2026-01-18T16:45:00Z'
  },
  {
    id: 'review-3',
    userName: 'Sophie Bernard',
    rating: 4,
    text: 'Très bon rapport qualité-prix. Les produits sont frais et de qualité. Petit bémol sur le timing de livraison mais rien de grave.',
    validated: true,
    createdAt: '2026-01-15T11:20:00Z'
  }
];

// Générer les commandes de simulation
export const demoOrders: Order[] = [
  getJulieOrder(), // Commande spéciale de Julie pour la démo
  ...generateSimulationOrders() // 12 autres commandes variées
];

// Fonction pour obtenir les commandes selon le rôle
export const getDemoOrders = (userId: string, role: 'user' | 'employee' | 'admin'): Order[] => {
  if (role === 'user') {
    return demoOrders.filter(order => order.userId === userId);
  }
  // Admin et Employee voient toutes les commandes
  return demoOrders;
};

// Mettre à jour une commande
export const updateDemoOrder = (orderId: string, updates: Partial<Order>): Order | null => {
  const orderIndex = demoOrders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return null;
  
  demoOrders[orderIndex] = {
    ...demoOrders[orderIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return demoOrders[orderIndex];
};

// Fonction pour obtenir les statistiques (pour admin)
export const getDemoStatistics = () => {
  const ordersByMenu = demoMenus.map(menu => ({
    menu: menu.title,
    count: demoOrders.filter(o => o.menuId === menu.id).length
  }));

  const revenueByMenu = demoMenus.map(menu => {
    const menuOrders = demoOrders.filter(o => o.menuId === menu.id);
    const revenue = menuOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    return {
      menu: menu.title,
      revenue
    };
  });

  const totalOrders = demoOrders.length;
  const totalRevenue = demoOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  return {
    ordersByMenu,
    revenueByMenu,
    totalOrders,
    totalRevenue
  };
};
