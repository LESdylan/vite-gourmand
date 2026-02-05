import type { Order, OrderStatus, OrderPriority, EquipmentStatus } from '../types/order';

// Génère des commandes de simulation avec différents statuts
export const generateSimulationOrders = (): Order[] => {
  const now = new Date();
  
  const statuses: OrderStatus[] = [
    'pending',
    'confirmed', 
    'initiated',
    'prep_ingredients',
    'assembly',
    'cooking',
    'packaging',
    'delivery',
    'delivered'
  ];

  const menus = [
    { id: 'menu-1', title: 'Menu Gourmand', price: 45, cooking: true },
    { id: 'menu-2', title: 'Menu Vegan Délice', price: 38, cooking: true },
    { id: 'menu-3', title: 'Menu Bordeaux Tradition', price: 52, cooking: true },
    { id: 'menu-4', title: 'Menu Apéritif', price: 25, cooking: false },
    { id: 'menu-5', title: 'Menu Brunch', price: 35, cooking: true }
  ];

  const clients = [
    { id: 'demo-user-001', name: 'Julie Dubois', email: 'user@demo.app', phone: '+33 6 98 76 54 32' },
    { id: 'client-002', name: 'Marc Legrand', email: 'marc.legrand@email.fr', phone: '+33 6 12 34 56 78' },
    { id: 'client-003', name: 'Sophie Martin', email: 'sophie.martin@email.fr', phone: '+33 6 23 45 67 89' },
    { id: 'client-004', name: 'Thomas Rousseau', email: 'thomas.rousseau@email.fr', phone: '+33 6 34 56 78 90' },
    { id: 'client-005', name: 'Emma Bernard', email: 'emma.bernard@email.fr', phone: '+33 6 45 67 89 01' },
    { id: 'client-006', name: 'Lucas Petit', email: 'lucas.petit@email.fr', phone: '+33 6 56 78 90 12' }
  ];

  const addresses = [
    { street: '42 Quai des Chartrons', city: 'Bordeaux', postal: '33000' },
    { street: '15 Rue Sainte-Catherine', city: 'Bordeaux', postal: '33000' },
    { street: '8 Place de la Bourse', city: 'Bordeaux', postal: '33000' },
    { street: '23 Cours de l\'Intendance', city: 'Bordeaux', postal: '33000' },
    { street: '56 Avenue Thiers', city: 'Bordeaux', postal: '33100' },
    { street: '12 Rue du Palais Gallien', city: 'Bordeaux', postal: '33000' },
    { street: '89 Rue Judaïque', city: 'Bordeaux', postal: '33000' },
    { street: '34 Place Gambetta', city: 'Bordeaux', postal: '33000' },
    { street: '5 Avenue Jean Jaurès', city: 'Mérignac', postal: '33700' },
    { street: '78 Route de Toulouse', city: 'Pessac', postal: '33600' }
  ];

  const employees = [
    { id: 'demo-employee-001', name: 'Pierre Laurent' },
    { id: 'employee-002', name: 'Marie Durand' },
    { id: 'employee-003', name: 'Antoine Mercier' }
  ];

  const orders: Order[] = [];

  // Générer 12 commandes avec différents statuts
  for (let i = 0; i < 12; i++) {
    const client = clients[i % clients.length];
    const menu = menus[i % menus.length];
    const address = addresses[i % addresses.length];
    const status = statuses[i % statuses.length];
    const employee = employees[i % employees.length];
    
    const numberOfPeople = 10 + (i * 5);
    const menuPrice = menu.price * numberOfPeople;
    const deliveryFee = address.city === 'Bordeaux' ? 0 : 35;
    const discount = numberOfPeople >= 15 ? menuPrice * 0.1 : 0;
    const totalPrice = menuPrice + deliveryFee - discount;

    // Date de livraison (entre aujourd'hui et +7 jours)
    const deliveryDate = new Date(now);
    deliveryDate.setDate(deliveryDate.getDate() + (i % 7));
    const deliveryTime = ['12:00', '13:00', '18:00', '19:00', '20:00'][i % 5];

    // Priorité selon urgence
    const daysUntilDelivery = Math.floor((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let priority: OrderPriority = 'medium';
    if (daysUntilDelivery === 0) priority = 'urgent';
    else if (daysUntilDelivery === 1) priority = 'high';
    else if (daysUntilDelivery > 4) priority = 'low';

    // Équipement
    let equipmentStatus: EquipmentStatus = 'not_applicable';
    let equipmentDeliveredAt: string | undefined;
    let equipmentDueDate: string | undefined;
    let equipmentReturnedAt: string | undefined;
    
    if (numberOfPeople >= 20) {
      // Nécessite équipement (chafing dishes, etc.)
      if (status === 'delivered') {
        equipmentStatus = 'delivered';
        equipmentDeliveredAt = new Date(deliveryDate).toISOString();
        const dueDate = new Date(deliveryDate);
        dueDate.setDate(dueDate.getDate() + 2);
        equipmentDueDate = dueDate.toISOString();
      } else if (status === 'completed') {
        equipmentStatus = 'returned';
        equipmentDeliveredAt = new Date(deliveryDate).toISOString();
        equipmentReturnedAt = new Date(deliveryDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
      } else {
        equipmentStatus = 'pending';
      }
    }

    // Historique des statuts
    const statusHistory = buildStatusHistory(status, employee.name, now);

    // Estimation du temps de complétion
    const estimatedCompletionTime = calculateEstimatedTime(status, deliveryDate, numberOfPeople);

    const order: Order = {
      id: `order-sim-${i + 1}`,
      userId: client.id,
      userName: client.name,
      userEmail: client.email,
      userPhone: client.phone,
      
      menuId: menu.id,
      menuTitle: menu.title,
      numberOfPeople,
      
      deliveryAddress: address.street,
      deliveryCity: address.city,
      deliveryPostalCode: address.postal,
      deliveryDate: deliveryDate.toISOString().split('T')[0],
      deliveryTime,
      
      menuPrice,
      deliveryFee,
      discount,
      totalPrice,
      
      specialRequests: i % 3 === 0 ? 'Sans gluten pour 2 personnes' : '',
      dietaryRestrictions: i % 4 === 0 ? 'Végétarien' : '',
      allergies: i % 5 === 0 ? 'Fruits de mer' : '',
      
      status,
      priority,
      assignedTo: status !== 'pending' ? employee.id : undefined,
      assignedToName: status !== 'pending' ? employee.name : undefined,
      
      equipmentStatus,
      equipmentDeliveredAt,
      equipmentDueDate,
      equipmentReturnedAt,
      equipmentPenalty: 0,
      
      statusHistory,
      estimatedCompletionTime,
      cookingRequired: menu.cooking,
      
      createdAt: new Date(now.getTime() - (12 - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(order);
  }

  return orders;
};

function buildStatusHistory(currentStatus: OrderStatus, employeeName: string, now: Date) {
  const statuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'initiated',
    'prep_ingredients',
    'assembly',
    'cooking',
    'packaging',
    'delivery',
    'delivered',
    'completed'
  ];

  const currentIndex = statuses.indexOf(currentStatus);
  const history = [];

  for (let i = 0; i <= currentIndex && i < statuses.length; i++) {
    const date = new Date(now.getTime() - (currentIndex - i) * 60 * 60 * 1000);
    history.push({
      status: getStatusLabel(statuses[i]),
      date: date.toISOString(),
      employeeName: i > 0 ? employeeName : undefined,
      notes: i === 0 ? 'Commande créée par le client' : undefined
    });
  }

  return history;
}

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    'pending': 'En attente de validation',
    'confirmed': 'Commande confirmée',
    'initiated': 'Initiation',
    'prep_ingredients': 'Préparation des ingrédients',
    'assembly': 'Assemblage',
    'cooking': 'Cuisson',
    'packaging': 'Emballage',
    'delivery': 'En cours de livraison',
    'delivered': 'Livré',
    'completed': 'Terminé',
    'cancelled': 'Annulée',
    'late_equipment': 'Équipement non retourné'
  };
  return labels[status];
}

function calculateEstimatedTime(status: OrderStatus, deliveryDate: Date, people: number): string {
  if (status === 'delivered' || status === 'completed') {
    return 'Livraison terminée';
  }

  const now = new Date();
  const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDelivery < 0) {
    return 'Livraison prévue';
  }

  // Estimer le temps restant selon le statut
  const statusProgress: Record<OrderStatus, number> = {
    'pending': 0,
    'confirmed': 10,
    'initiated': 20,
    'prep_ingredients': 40,
    'assembly': 60,
    'cooking': 75,
    'packaging': 90,
    'delivery': 95,
    'delivered': 100,
    'completed': 100,
    'cancelled': 100,
    'late_equipment': 100
  };

  const progress = statusProgress[status] || 0;
  const remainingHours = Math.max(1, Math.floor(hoursUntilDelivery * (100 - progress) / 100));

  if (remainingHours < 24) {
    return `Environ ${remainingHours}h restantes`;
  } else {
    const days = Math.floor(remainingHours / 24);
    return `Environ ${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
  }
}

// Statut de la commande de Julie (pour la démo)
export const getJulieOrder = (): Order => {
  const now = new Date();
  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + 2); // Dans 2 jours

  return {
    id: 'order-julie-demo',
    userId: 'demo-user-001',
    userName: 'Julie Dubois',
    userEmail: 'user@demo.app',
    userPhone: '+33 6 98 76 54 32',
    
    menuId: 'menu-1',
    menuTitle: 'Menu Gourmand',
    numberOfPeople: 25,
    
    deliveryAddress: '42 Quai des Chartrons',
    deliveryCity: 'Bordeaux',
    deliveryPostalCode: '33000',
    deliveryDate: deliveryDate.toISOString().split('T')[0],
    deliveryTime: '19:00',
    
    menuPrice: 1125, // 45€ x 25
    deliveryFee: 0, // Bordeaux
    discount: 112.5, // 10% car 25 >= 15
    totalPrice: 1012.5,
    
    specialRequests: 'Prévoir des options végétariennes pour 3 personnes',
    dietaryRestrictions: '',
    allergies: '',
    
    status: 'prep_ingredients',
    priority: 'high',
    assignedTo: 'demo-employee-001',
    assignedToName: 'Pierre Laurent',
    
    equipmentStatus: 'pending',
    equipmentDeliveredAt: undefined,
    equipmentDueDate: undefined,
    equipmentReturnedAt: undefined,
    equipmentPenalty: 0,
    
    statusHistory: [
      {
        status: 'En attente de validation',
        date: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        notes: 'Commande créée par le client'
      },
      {
        status: 'Commande confirmée',
        date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        employeeName: 'Pierre Laurent',
        notes: 'Commande validée'
      },
      {
        status: 'Initiation',
        date: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        employeeName: 'Pierre Laurent',
        notes: 'Assignée à Pierre Laurent'
      },
      {
        status: 'Préparation des ingrédients',
        date: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        employeeName: 'Pierre Laurent',
        notes: 'Début de la préparation'
      }
    ],
    estimatedCompletionTime: 'Environ 2 jours restants',
    cookingRequired: true,
    
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };
};
