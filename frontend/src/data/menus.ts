// Menu images mapping using Unsplash
export const menuImages: Record<string, string> = {
  'm001': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format',
  'm002': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format',
  'm003': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format',
  'm004': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format',
  'm005': 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format',
  'm006': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format',
  'm007': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format',
  'm008': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format',
  'm009': 'https://images.unsplash.com/photo-1536392706976-e486e2ba97af?w=800&auto=format',
  'm010': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format',
  'm011': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format',
  'm012': 'https://images.unsplash.com/photo-1482049016gy-ed3-13b6-b99f-8b7f97c5bc31e?w=800&auto=format',
  'm013': 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&auto=format',
  'm014': 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&auto=format',
  'm015': 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format',
  'default': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format',
};

export type DietaryType = 
  | 'classique' 
  | 'végétarien' 
  | 'vegan' 
  | 'sans-gluten' 
  | 'sans-lactose' 
  | 'halal' 
  | 'casher'
  | 'bio';

export interface MenuComposition {
  entreeDishes: string[];
  mainDishes: string[];
  dessertDishes: string[];
}

export interface Menu {
  id: string;
  name: string;
  theme: string;
  description: string;
  composition: MenuComposition;
  dietary: DietaryType[];
  minPersons: number;
  maxPersons: number;
  pricePerPerson: number;
  image: string;
  allergens: string[];
  deliveryNotes?: string;
  stockQuantity: number;
}

// Sample menus database
export const menus: Menu[] = [
  // MENUS GASTRONOMIQUES
  {
    id: 'm001',
    name: 'Excellence Gastronomique',
    theme: 'Gastronomie',
    description: 'Menu d\'exception pour vos événements les plus prestigieux. Une sélection raffinée de plats élaborés avec les meilleurs produits de saison.',
    composition: {
      entreeDishes: ['e001', 'e003'],
      mainDishes: ['p002', 'p005'],
      dessertDishes: ['d003', 'd005']
    },
    dietary: ['classique'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 89.90,
    image: menuImages['m001'],
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'mollusques', 'sulfites', 'moutarde'],
    deliveryNotes: 'Service à l\'assiette recommandé',
    stockQuantity: 15
  },
  {
    id: 'm002',
    name: 'Prestige Bordelais',
    theme: 'Gastronomie',
    description: 'Les saveurs authentiques de la gastronomie bordelaise. Un voyage culinaire au cœur du Sud-Ouest.',
    composition: {
      entreeDishes: ['e001', 'e002'],
      mainDishes: ['p001', 'p007'],
      dessertDishes: ['d001', 'd002']
    },
    dietary: ['classique'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 82.50,
    image: menuImages['m002'],
    allergens: ['gluten', 'lait', 'œuf', 'sulfites'],
    deliveryNotes: 'Accord mets-vins disponible sur demande',
    stockQuantity: 18
  },
  {
    id: 'm003',
    name: 'Délice de la Mer',
    theme: 'Gastronomie',
    description: 'Menu raffiné autour des produits de la mer. Fraîcheur et finesse garanties.',
    composition: {
      entreeDishes: ['e003', 'e005'],
      mainDishes: ['p003', 'p006'],
      dessertDishes: ['d004', 'd006']
    },
    dietary: ['classique'],
    minPersons: 10,
    maxPersons: 45,
    pricePerPerson: 79.90,
    image: menuImages['m003'],
    allergens: ['poisson', 'mollusques', 'lait', 'œuf', 'sulfites'],
    stockQuantity: 12
  },

  // MENUS MARIAGE
  {
    id: 'm004',
    name: 'Mariage de Rêve',
    theme: 'Mariage',
    description: 'Menu élégant pour célébrer votre union. Une expérience gastronomique inoubliable pour le plus beau jour de votre vie.',
    composition: {
      entreeDishes: ['e001', 'e003', 'e005'],
      mainDishes: ['p002', 'p003'],
      dessertDishes: ['d002', 'd005', 'd007']
    },
    dietary: ['classique'],
    minPersons: 50,
    maxPersons: 200,
    pricePerPerson: 95.00,
    image: menuImages['m004'],
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'mollusques', 'sulfites'],
    deliveryNotes: 'Coordination avec wedding planner possible',
    stockQuantity: 8
  },
  {
    id: 'm005',
    name: 'Romance Champêtre',
    theme: 'Mariage',
    description: 'Menu authentique pour un mariage à la campagne. Des saveurs généreuses et conviviales.',
    composition: {
      entreeDishes: ['e002', 'e004'],
      mainDishes: ['p001', 'p004'],
      dessertDishes: ['d001', 'd003']
    },
    dietary: ['classique'],
    minPersons: 40,
    maxPersons: 150,
    pricePerPerson: 78.00,
    image: menuImages['m005'],
    allergens: ['gluten', 'lait', 'œuf', 'sulfites', 'céleri'],
    stockQuantity: 10
  },

  // MENUS ENTREPRISE
  {
    id: 'm007',
    name: 'Business Premium',
    theme: 'Entreprise',
    description: 'Menu professionnel pour vos réunions importantes. Élégance et praticité.',
    composition: {
      entreeDishes: ['e005', 'e002'],
      mainDishes: ['p006', 'p004'],
      dessertDishes: ['d001', 'd004']
    },
    dietary: ['classique'],
    minPersons: 15,
    maxPersons: 80,
    pricePerPerson: 58.00,
    image: menuImages['m007'],
    allergens: ['poisson', 'gluten', 'lait', 'œuf', 'sulfites', 'céleri'],
    deliveryNotes: 'Service en continu possible',
    stockQuantity: 25
  },
  {
    id: 'm008',
    name: 'Déjeuner d\'Affaires',
    theme: 'Entreprise',
    description: 'Menu équilibré pour déjeuner professionnel. Qualité et rapidité de service.',
    composition: {
      entreeDishes: ['e004', 'e007'],
      mainDishes: ['p004', 'p008'],
      dessertDishes: ['d006', 'd011']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 10,
    maxPersons: 60,
    pricePerPerson: 45.00,
    image: menuImages['m008'],
    allergens: ['gluten', 'lait', 'œuf', 'soja'],
    stockQuantity: 30
  },
  {
    id: 'm009',
    name: 'Cocktail Networking',
    theme: 'Entreprise',
    description: 'Assortiment de bouchées pour événement networking. Parfait pour faciliter les échanges.',
    composition: {
      entreeDishes: ['e005', 'e006', 'e008'],
      mainDishes: ['p011'],
      dessertDishes: ['d010', 'd012']
    },
    dietary: ['classique', 'végétarien', 'vegan'],
    minPersons: 20,
    maxPersons: 100,
    pricePerPerson: 38.00,
    image: menuImages['m009'],
    allergens: ['poisson', 'sésame', 'fruits à coque'],
    deliveryNotes: 'Format finger food',
    stockQuantity: 20
  },

  // MENUS ANNIVERSAIRE
  {
    id: 'm010',
    name: 'Anniversaire Festif',
    theme: 'Anniversaire',
    description: 'Menu convivial pour célébrer un anniversaire. Joie et gourmandise garanties.',
    composition: {
      entreeDishes: ['e006', 'e007'],
      mainDishes: ['p009', 'p004'],
      dessertDishes: ['d002', 'd007']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 12,
    maxPersons: 50,
    pricePerPerson: 52.00,
    image: menuImages['m010'],
    allergens: ['gluten', 'lait', 'œuf', 'sésame', 'soja'],
    stockQuantity: 22
  },
  {
    id: 'm011',
    name: 'Celebration Kids',
    theme: 'Anniversaire',
    description: 'Menu adapté pour anniversaire d\'enfants. Des saveurs que les petits adorent.',
    composition: {
      entreeDishes: ['e006'],
      mainDishes: ['p009'],
      dessertDishes: ['d002', 'd012']
    },
    dietary: ['végétarien'],
    minPersons: 8,
    maxPersons: 30,
    pricePerPerson: 28.00,
    image: menuImages['m011'],
    allergens: ['gluten', 'lait', 'œuf', 'sésame'],
    deliveryNotes: 'Options sans allergènes disponibles',
    stockQuantity: 35
  },

  // MENUS VÉGÉTARIENS
  {
    id: 'm013',
    name: 'Végétarien Délice',
    theme: 'Végétarien',
    description: 'Menu 100% végétarien gourmand. Saveurs végétales et créativité.',
    composition: {
      entreeDishes: ['e004', 'e006'],
      mainDishes: ['p010', 'p012'],
      dessertDishes: ['d008', 'd011']
    },
    dietary: ['végétarien'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 48.00,
    image: menuImages['m013'],
    allergens: ['gluten', 'lait', 'œuf', 'sésame', 'fruits à coque'],
    stockQuantity: 20
  },
  {
    id: 'm014',
    name: 'Vegan Gourmet',
    theme: 'Vegan',
    description: 'Menu vegan gastronomique. Excellence culinaire 100% végétale.',
    composition: {
      entreeDishes: ['e006', 'e008'],
      mainDishes: ['p013', 'p014'],
      dessertDishes: ['d009', 'd010']
    },
    dietary: ['vegan'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 55.00,
    image: menuImages['m014'],
    allergens: ['sésame', 'fruits à coque', 'soja'],
    stockQuantity: 15
  },

  // MENUS FÊTES
  {
    id: 'm015',
    name: 'Noël Traditionnel',
    theme: 'Fêtes',
    description: 'Menu de fêtes classique et généreux. L\'esprit de Noël dans l\'assiette.',
    composition: {
      entreeDishes: ['e001', 'e003'],
      mainDishes: ['p002', 'p007'],
      dessertDishes: ['d003', 'd005']
    },
    dietary: ['classique'],
    minPersons: 6,
    maxPersons: 30,
    pricePerPerson: 75.00,
    image: menuImages['m015'],
    allergens: ['gluten', 'lait', 'œuf', 'mollusques', 'sulfites'],
    deliveryNotes: 'Commande 15 jours à l\'avance minimum',
    stockQuantity: 25
  }
];

// Helper functions
export function getMenuById(id: string): Menu | undefined {
  return menus.find(menu => menu.id === id);
}

export function getAllThemes(): string[] {
  return Array.from(new Set(menus.map(m => m.theme)));
}

export function getAllDietaryTypes(): DietaryType[] {
  const dietarySet = new Set<DietaryType>();
  menus.forEach(menu => menu.dietary.forEach(d => dietarySet.add(d)));
  return Array.from(dietarySet);
}

export function getMenusByTheme(theme: string): Menu[] {
  return menus.filter(menu => menu.theme === theme);
}

export function getMenusByDietary(dietary: DietaryType): Menu[] {
  return menus.filter(menu => menu.dietary.includes(dietary));
}
