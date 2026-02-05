// Base de données utilisateurs réels accessible par défaut
export const mockUsers = [
  // ADMINS
  {
    id: 'u001',
    firstName: 'Julie',
    lastName: 'Mercier',
    email: 'julie@vitegourmand.com',
    password: 'demo123',
    phone: '06 12 34 56 78',
    role: 'admin' as const,
    address: '15 Rue Sainte-Catherine',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2001-01-01',
    loyaltyPoints: 0,
    totalOrders: 0,
    totalSpent: 0
  },
  {
    id: 'u002',
    firstName: 'José',
    lastName: 'Mercier',
    email: 'jose@vitegourmand.com',
    password: 'demo123',
    phone: '06 12 34 56 79',
    role: 'admin' as const,
    address: '15 Rue Sainte-Catherine',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2001-01-01',
    loyaltyPoints: 0,
    totalOrders: 0,
    totalSpent: 0
  },
  
  // EMPLOYÉS
  {
    id: 'u003',
    firstName: 'Sophie',
    lastName: 'Laurent',
    email: 'sophie.laurent@vitegourmand.com',
    password: 'demo123',
    phone: '06 23 45 67 89',
    role: 'employee' as const,
    address: '28 Rue Judaïque',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2020-03-15',
    loyaltyPoints: 0,
    totalOrders: 0,
    totalSpent: 0
  },
  {
    id: 'u004',
    firstName: 'Marc',
    lastName: 'Petit',
    email: 'marc.petit@vitegourmand.com',
    password: 'demo123',
    phone: '06 34 56 78 90',
    role: 'employee' as const,
    address: '42 Rue des Remparts',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2021-06-20',
    loyaltyPoints: 0,
    totalOrders: 0,
    totalSpent: 0
  },
  
  // CLIENTS
  {
    id: 'u005',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@email.com',
    password: 'demo123',
    phone: '06 45 67 89 01',
    role: 'customer' as const,
    address: '45 Rue Victor Hugo',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2024-01-10',
    loyaltyPoints: 845,
    totalOrders: 12,
    totalSpent: 8450.00,
    lastOrder: '2026-01-20'
  },
  {
    id: 'u006',
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@email.com',
    password: 'demo123',
    phone: '06 56 78 90 12',
    role: 'customer' as const,
    address: '23 Cours de l\'Intendance',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2023-08-05',
    loyaltyPoints: 1520,
    totalOrders: 8,
    totalSpent: 15200.00,
    lastOrder: '2025-12-15'
  },
  {
    id: 'u007',
    firstName: 'Claire',
    lastName: 'Bernard',
    email: 'claire.bernard@email.com',
    password: 'demo123',
    phone: '06 67 89 01 23',
    role: 'customer' as const,
    address: '78 Allées de Tourny',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2024-05-20',
    loyaltyPoints: 320,
    totalOrders: 5,
    totalSpent: 3200.00,
    lastOrder: '2026-01-05'
  },
  {
    id: 'u008',
    firstName: 'Thomas',
    lastName: 'Rousseau',
    email: 'thomas.rousseau@email.com',
    password: 'demo123',
    phone: '06 78 90 12 34',
    role: 'customer' as const,
    address: '12 Place des Quinconces',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2025-11-10',
    loyaltyPoints: 50,
    totalOrders: 1,
    totalSpent: 450.00,
    lastOrder: '2025-11-15'
  },
  {
    id: 'u009',
    firstName: 'Isabelle',
    lastName: 'Leroy',
    email: 'isabelle.leroy@email.com',
    password: 'demo123',
    phone: '06 89 01 23 45',
    role: 'customer' as const,
    address: '56 Rue Fondaudège',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2023-06-22',
    loyaltyPoints: 2340,
    totalOrders: 18,
    totalSpent: 23400.00,
    lastOrder: '2026-01-28'
  },
  {
    id: 'u010',
    firstName: 'Paul',
    lastName: 'Girard',
    email: 'paul.girard@email.com',
    password: 'demo123',
    phone: '06 90 12 34 56',
    role: 'customer' as const,
    address: '89 Cours Pasteur',
    city: 'Bordeaux',
    postalCode: '33000',
    createdAt: '2024-09-05',
    loyaltyPoints: 670,
    totalOrders: 7,
    totalSpent: 6700.00,
    lastOrder: '2025-12-30'
  }
];

export type MockUser = typeof mockUsers[0];

// Fonction pour trouver un utilisateur par email
export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Fonction pour authentifier un utilisateur
export function authenticateUser(email: string, password: string) {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

// Fonction pour récupérer un utilisateur par ID
export function getUserById(id: string) {
  const user = mockUsers.find(u => u.id === id);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

// Fonction pour récupérer tous les utilisateurs (sans mots de passe)
export function getAllUsers() {
  return mockUsers.map(({ password, ...user }) => user);
}

// Fonction pour récupérer les utilisateurs par rôle
export function getUsersByRole(role: 'admin' | 'employee' | 'customer') {
  return mockUsers
    .filter(u => u.role === role)
    .map(({ password, ...user }) => user);
}
