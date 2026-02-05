// Système de menus composés à partir de plats individuels

import { DietaryType } from './dishes';
import { menuImages } from '../utils/menuImages';

export interface MenuComposition {
  entreeDishes: string[]; // IDs des entrées
  mainDishes: string[]; // IDs des plats principaux
  dessertDishes: string[]; // IDs des desserts
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
  stockQuantity: number; // Nombre de menus complets disponibles
}

// Base de données des menus (environ 50 menus variés)
export const menus: Menu[] = [
  // MENUS GASTRONOMIQUES
  {
    id: 'm001',
    name: 'Excellence Gastronomique',
    theme: 'Gastronomie',
    description: 'Menu d\'exception pour vos événements les plus prestigieux',
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
    description: 'Les saveurs authentiques de la gastronomie bordelaise',
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
    description: 'Menu raffiné autour des produits de la mer',
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
    description: 'Menu élégant pour célébrer votre union',
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
    description: 'Menu authentique pour un mariage à la campagne',
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
  {
    id: 'm006',
    name: 'Élégance Printanière',
    theme: 'Mariage',
    description: 'Menu léger et raffiné pour un mariage de printemps',
    composition: {
      entreeDishes: ['e005', 'e008'],
      mainDishes: ['p003', 'p006'],
      dessertDishes: ['d004', 'd011']
    },
    dietary: ['classique'],
    minPersons: 30,
    maxPersons: 120,
    pricePerPerson: 72.50,
    image: menuImages['m006'],
    allergens: ['poisson', 'lait', 'sulfites'],
    stockQuantity: 12
  },

  // MENUS ENTREPRISE
  {
    id: 'm007',
    name: 'Business Premium',
    theme: 'Entreprise',
    description: 'Menu professionnel pour vos réunions importantes',
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
    description: 'Menu équilibré pour déjeuner professionnel',
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
    description: 'Assortiment de bouchées pour événement networking',
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
    description: 'Menu convivial pour célébrer un anniversaire',
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
    description: 'Menu adapté pour anniversaire d\'enfants',
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
  {
    id: 'm012',
    name: 'Anniversaire Surprise',
    theme: 'Anniversaire',
    description: 'Menu raffiné pour surprise réussie',
    composition: {
      entreeDishes: ['e001', 'e005'],
      mainDishes: ['p001', 'p003'],
      dessertDishes: ['d005', 'd007']
    },
    dietary: ['classique'],
    minPersons: 15,
    maxPersons: 60,
    pricePerPerson: 68.00,
    image: menuImages['m012'],
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'sulfites'],
    stockQuantity: 16
  },

  // MENUS VÉGÉTARIENS
  {
    id: 'm013',
    name: 'Jardin Gourmand',
    theme: 'Végétarien',
    description: 'Menu 100% végétarien raffiné et savoureux',
    composition: {
      entreeDishes: ['e002', 'e004'],
      mainDishes: ['p008', 'p009'],
      dessertDishes: ['d001', 'd004']
    },
    dietary: ['végétarien'],
    minPersons: 8,
    maxPersons: 50,
    pricePerPerson: 48.00,
    image: menuImages['m013'],
    allergens: ['gluten', 'lait', 'œuf', 'céleri'],
    stockQuantity: 28
  },
  {
    id: 'm014',
    name: 'Saveurs Végétales',
    theme: 'Végétarien',
    description: 'Découverte des légumes de saison sublimés',
    composition: {
      entreeDishes: ['e004', 'e007'],
      mainDishes: ['p010', 'p008'],
      dessertDishes: ['d003', 'd006']
    },
    dietary: ['végétarien'],
    minPersons: 10,
    maxPersons: 45,
    pricePerPerson: 44.00,
    image: menuImages['m014'],
    allergens: ['gluten', 'lait', 'œuf', 'soja'],
    stockQuantity: 25
  },
  {
    id: 'm015',
    name: 'Harmonie Verte',
    theme: 'Végétarien',
    description: 'Menu végétarien équilibré et gourmand',
    composition: {
      entreeDishes: ['e002', 'e007'],
      mainDishes: ['p009', 'p010'],
      dessertDishes: ['d004', 'd011']
    },
    dietary: ['végétarien'],
    minPersons: 12,
    maxPersons: 55,
    pricePerPerson: 46.50,
    image: menuImages['m015'],
    allergens: ['gluten', 'lait', 'œuf', 'céleri', 'soja'],
    stockQuantity: 24
  },

  // MENUS VEGAN
  {
    id: 'm016',
    name: 'Plant-Based Délice',
    theme: 'Vegan',
    description: 'Menu 100% végétal gastronomique',
    composition: {
      entreeDishes: ['e006', 'e008'],
      mainDishes: ['p011', 'p012'],
      dessertDishes: ['d008', 'd009']
    },
    dietary: ['vegan', 'végétarien'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 42.00,
    image: menuImages['m016'],
    allergens: ['gluten', 'sésame', 'fruits à coque'],
    stockQuantity: 30
  },
  {
    id: 'm017',
    name: 'Évasion Végétale',
    theme: 'Vegan',
    description: 'Voyage culinaire 100% végétal',
    composition: {
      entreeDishes: ['e006', 'e007'],
      mainDishes: ['p012', 'p013'],
      dessertDishes: ['d010', 'd011']
    },
    dietary: ['vegan', 'végétarien'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 39.00,
    image: menuImages['m017'],
    allergens: ['gluten', 'sésame', 'soja', 'fruits à coque'],
    stockQuantity: 28
  },
  {
    id: 'm018',
    name: 'Green Gourmet',
    theme: 'Vegan',
    description: 'Menu vegan créatif et coloré',
    composition: {
      entreeDishes: ['e008', 'e007'],
      mainDishes: ['p011', 'p013'],
      dessertDishes: ['d008', 'd012']
    },
    dietary: ['vegan', 'végétarien'],
    minPersons: 6,
    maxPersons: 35,
    pricePerPerson: 41.50,
    image: menuImages['m018'],
    allergens: ['gluten', 'sésame', 'soja', 'fruits à coque'],
    stockQuantity: 32
  },

  // MENUS THÉMATIQUES - TERROIR
  {
    id: 'm019',
    name: 'Traditions du Sud-Ouest',
    theme: 'Terroir',
    description: 'Authentiques saveurs du terroir aquitain',
    composition: {
      entreeDishes: ['e001', 'e002'],
      mainDishes: ['p001', 'p007'],
      dessertDishes: ['d003', 'd005']
    },
    dietary: ['classique'],
    minPersons: 12,
    maxPersons: 60,
    pricePerPerson: 64.00,
    image: menuImages['m019'],
    allergens: ['gluten', 'lait', 'œuf', 'sulfites', 'céleri'],
    stockQuantity: 20
  },
  {
    id: 'm020',
    name: 'Escapade Périgourdine',
    theme: 'Terroir',
    description: 'Les délices du Périgord à votre table',
    composition: {
      entreeDishes: ['e001', 'e002'],
      mainDishes: ['p002', 'p004'],
      dessertDishes: ['d001', 'd003']
    },
    dietary: ['classique'],
    minPersons: 10,
    maxPersons: 45,
    pricePerPerson: 72.00,
    image: menuImages['m020'],
    allergens: ['gluten', 'lait', 'œuf', 'sulfites', 'céleri'],
    stockQuantity: 15
  },

  // MENUS THÉMATIQUES - MER
  {
    id: 'm021',
    name: 'Trésors de l\'Océan',
    theme: 'Mer',
    description: 'Menu marin avec les meilleurs produits de la mer',
    composition: {
      entreeDishes: ['e003', 'e005'],
      mainDishes: ['p003', 'p006'],
      dessertDishes: ['d004', 'd011']
    },
    dietary: ['classique'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 76.00,
    image: menuImages['m021'],
    allergens: ['poisson', 'mollusques', 'lait', 'sulfites'],
    stockQuantity: 14
  },
  {
    id: 'm022',
    name: 'Pêcheur Gourmand',
    theme: 'Mer',
    description: 'Poissons nobles et fruits de mer d\'exception',
    composition: {
      entreeDishes: ['e003', 'e005'],
      mainDishes: ['p003', 'p006'],
      dessertDishes: ['d006', 'd012']
    },
    dietary: ['classique'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 69.50,
    image: 'fisherman gourmet menu',
    allergens: ['poisson', 'mollusques', 'lait', 'œuf', 'sulfites'],
    stockQuantity: 18
  },

  // MENUS THÉMATIQUES - SAISONS
  {
    id: 'm023',
    name: 'Printemps Gourmand',
    theme: 'Saisons',
    description: 'Fraîcheur et légèreté des produits printaniers',
    composition: {
      entreeDishes: ['e005', 'e008'],
      mainDishes: ['p003', 'p011'],
      dessertDishes: ['d011', 'd012']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 8,
    maxPersons: 50,
    pricePerPerson: 54.00,
    image: 'spring seasonal menu',
    allergens: ['poisson', 'lait', 'sésame', 'sulfites'],
    stockQuantity: 26
  },
  {
    id: 'm024',
    name: 'Été Méditerranéen',
    theme: 'Saisons',
    description: 'Saveurs ensoleillées de la Méditerranée',
    composition: {
      entreeDishes: ['e004', 'e008'],
      mainDishes: ['p003', 'p009'],
      dessertDishes: ['d011', 'd012']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 10,
    maxPersons: 55,
    pricePerPerson: 52.00,
    image: 'summer mediterranean menu',
    allergens: ['gluten', 'lait', 'œuf', 'poisson'],
    stockQuantity: 24
  },
  {
    id: 'm025',
    name: 'Automne Gourmand',
    theme: 'Saisons',
    description: 'Richesse et générosité des saveurs automnales',
    composition: {
      entreeDishes: ['e002', 'e004'],
      mainDishes: ['p001', 'p008'],
      dessertDishes: ['d003', 'd005']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 12,
    maxPersons: 60,
    pricePerPerson: 58.00,
    image: 'autumn seasonal menu',
    allergens: ['gluten', 'lait', 'œuf', 'céleri', 'sulfites'],
    stockQuantity: 22
  },
  {
    id: 'm026',
    name: 'Hiver Réconfortant',
    theme: 'Saisons',
    description: 'Plats chaleureux pour les soirées d\'hiver',
    composition: {
      entreeDishes: ['e001', 'e002'],
      mainDishes: ['p007', 'p004'],
      dessertDishes: ['d002', 'd006']
    },
    dietary: ['classique'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 62.00,
    image: 'winter comfort menu',
    allergens: ['gluten', 'lait', 'œuf', 'sulfites', 'céleri'],
    stockQuantity: 20
  },

  // MENUS COCKTAIL/APÉRITIF
  {
    id: 'm027',
    name: 'Cocktail Chic',
    theme: 'Cocktail',
    description: 'Assortiment raffiné pour cocktail dinatoire',
    composition: {
      entreeDishes: ['e005', 'e006', 'e003'],
      mainDishes: [],
      dessertDishes: ['d010', 'd012']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 20,
    maxPersons: 100,
    pricePerPerson: 35.00,
    image: 'chic cocktail party',
    allergens: ['poisson', 'mollusques', 'sésame', 'fruits à coque'],
    deliveryNotes: 'Format bouchées et verrines',
    stockQuantity: 30
  },
  {
    id: 'm028',
    name: 'Apéro Gourmand',
    theme: 'Cocktail',
    description: 'Sélection de mets pour apéritif dînatoire',
    composition: {
      entreeDishes: ['e006', 'e007', 'e008'],
      mainDishes: [],
      dessertDishes: ['d011', 'd012']
    },
    dietary: ['végétarien', 'vegan'],
    minPersons: 15,
    maxPersons: 80,
    pricePerPerson: 32.00,
    image: 'gourmet aperitif',
    allergens: ['gluten', 'sésame', 'soja'],
    deliveryNotes: 'Service en plateaux',
    stockQuantity: 35
  },

  // MENUS BRUNCH
  {
    id: 'm029',
    name: 'Brunch Bordelais',
    theme: 'Brunch',
    description: 'Brunch copieux aux saveurs locales',
    composition: {
      entreeDishes: ['e006', 'e007'],
      mainDishes: ['p009'],
      dessertDishes: ['d001', 'd003', 'd007']
    },
    dietary: ['végétarien'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 38.00,
    image: 'bordeaux brunch menu',
    allergens: ['gluten', 'lait', 'œuf', 'sésame', 'soja'],
    deliveryNotes: 'Service 10h-14h',
    stockQuantity: 25
  },
  {
    id: 'm030',
    name: 'Brunch Healthy',
    theme: 'Brunch',
    description: 'Brunch équilibré et nutritif',
    composition: {
      entreeDishes: ['e006', 'e008'],
      mainDishes: ['p011'],
      dessertDishes: ['d010', 'd011']
    },
    dietary: ['vegan', 'végétarien'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 34.00,
    image: 'healthy brunch menu',
    allergens: ['gluten', 'sésame', 'fruits à coque'],
    stockQuantity: 30
  },

  // MENUS BUFFET
  {
    id: 'm031',
    name: 'Buffet Prestige',
    theme: 'Buffet',
    description: 'Grand buffet varié pour tous les goûts',
    composition: {
      entreeDishes: ['e001', 'e003', 'e004', 'e005'],
      mainDishes: ['p001', 'p003', 'p004', 'p009'],
      dessertDishes: ['d001', 'd002', 'd004', 'd011']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 30,
    maxPersons: 150,
    pricePerPerson: 58.00,
    image: 'prestige buffet catering',
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'mollusques', 'sulfites'],
    deliveryNotes: 'Installation buffet incluse',
    stockQuantity: 12
  },
  {
    id: 'm032',
    name: 'Buffet Campagnard',
    theme: 'Buffet',
    description: 'Buffet généreux aux saveurs authentiques',
    composition: {
      entreeDishes: ['e002', 'e004', 'e006'],
      mainDishes: ['p001', 'p007', 'p009', 'p010'],
      dessertDishes: ['d003', 'd005', 'd006']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 25,
    maxPersons: 120,
    pricePerPerson: 48.00,
    image: 'country buffet rustic',
    allergens: ['gluten', 'lait', 'œuf', 'sulfites', 'céleri', 'sésame'],
    stockQuantity: 15
  },

  // MENUS DÉJEUNER
  {
    id: 'm033',
    name: 'Déjeuner Express',
    theme: 'Déjeuner',
    description: 'Menu du midi rapide et savoureux',
    composition: {
      entreeDishes: ['e007'],
      mainDishes: ['p004', 'p011'],
      dessertDishes: ['d011']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 28.00,
    image: 'express lunch menu',
    allergens: ['gluten', 'lait', 'œuf', 'soja', 'sésame'],
    deliveryNotes: 'Livraison 11h30-13h30',
    stockQuantity: 40
  },
  {
    id: 'm034',
    name: 'Déjeuner Gourmand',
    theme: 'Déjeuner',
    description: 'Menu du midi complet et raffiné',
    composition: {
      entreeDishes: ['e002', 'e005'],
      mainDishes: ['p003', 'p008'],
      dessertDishes: ['d004', 'd006']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 42.00,
    image: 'gourmet lunch menu',
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'céleri'],
    stockQuantity: 28
  },

  // MENUS DÎNER
  {
    id: 'm035',
    name: 'Dîner Romance',
    theme: 'Dîner',
    description: 'Dîner intime aux chandelles',
    composition: {
      entreeDishes: ['e001', 'e005'],
      mainDishes: ['p002', 'p003'],
      dessertDishes: ['d005', 'd007']
    },
    dietary: ['classique'],
    minPersons: 2,
    maxPersons: 20,
    pricePerPerson: 85.00,
    image: 'romantic dinner menu',
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'mollusques', 'sulfites'],
    deliveryNotes: 'Décoration de table disponible',
    stockQuantity: 20
  },
  {
    id: 'm036',
    name: 'Dîner Entre Amis',
    theme: 'Dîner',
    description: 'Dîner convivial pour soirée entre amis',
    composition: {
      entreeDishes: ['e006', 'e007'],
      mainDishes: ['p009', 'p004'],
      dessertDishes: ['d002', 'd001']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 6,
    maxPersons: 30,
    pricePerPerson: 48.00,
    image: 'friends dinner party',
    allergens: ['gluten', 'lait', 'œuf', 'sésame', 'soja'],
    stockQuantity: 30
  },

  // MENUS DÉCOUVERTE
  {
    id: 'm037',
    name: 'Voyage Culinaire',
    theme: 'Découverte',
    description: 'Menu surprise conçu par le chef',
    composition: {
      entreeDishes: ['e002', 'e005', 'e006'],
      mainDishes: ['p012', 'p006'],
      dessertDishes: ['d009', 'd010']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 62.00,
    image: 'culinary journey tasting',
    allergens: ['gluten', 'lait', 'poisson', 'sésame', 'céleri', 'sulfites'],
    deliveryNotes: 'Menu adapté selon saison',
    stockQuantity: 18
  },
  {
    id: 'm038',
    name: 'Saveurs du Monde',
    theme: 'Découverte',
    description: 'Tour du monde gastronomique',
    composition: {
      entreeDishes: ['e006', 'e008'],
      mainDishes: ['p012', 'p013'],
      dessertDishes: ['d008', 'd010']
    },
    dietary: ['vegan', 'végétarien'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 45.00,
    image: 'world flavors menu',
    allergens: ['gluten', 'sésame', 'fruits à coque'],
    stockQuantity: 22
  },

  // MENUS FÊTES
  {
    id: 'm039',
    name: 'Réveillon Prestige',
    theme: 'Fêtes',
    description: 'Menu festif pour célébrer la nouvelle année',
    composition: {
      entreeDishes: ['e001', 'e003'],
      mainDishes: ['p002', 'p005'],
      dessertDishes: ['d002', 'd005', 'd007']
    },
    dietary: ['classique'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 125.00,
    image: 'new year celebration menu',
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'mollusques', 'sulfites', 'moutarde'],
    deliveryNotes: 'Service 31 décembre uniquement',
    stockQuantity: 10
  },
  {
    id: 'm040',
    name: 'Menu de Noël Traditionnel',
    theme: 'Fêtes',
    description: 'Saveurs traditionnelles des fêtes de fin d\'année',
    composition: {
      entreeDishes: ['e001', 'e002'],
      mainDishes: ['p001', 'p005'],
      dessertDishes: ['d001', 'd003']
    },
    dietary: ['classique'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 95.00,
    image: 'christmas traditional menu',
    allergens: ['gluten', 'lait', 'œuf', 'sulfites', 'céleri', 'moutarde'],
    deliveryNotes: 'Réservation avant le 15 décembre',
    stockQuantity: 12
  },

  // MENUS SANTÉ/BIEN-ÊTRE
  {
    id: 'm041',
    name: 'Menu Détox',
    theme: 'Bien-être',
    description: 'Menu léger et équilibré pour se ressourcer',
    composition: {
      entreeDishes: ['e008'],
      mainDishes: ['p011', 'p012'],
      dessertDishes: ['d011', 'd012']
    },
    dietary: ['vegan', 'végétarien', 'sans-gluten'],
    minPersons: 6,
    maxPersons: 30,
    pricePerPerson: 38.00,
    image: 'detox healthy menu',
    allergens: ['sésame'],
    stockQuantity: 28
  },
  {
    id: 'm042',
    name: 'Menu Sportif',
    theme: 'Bien-être',
    description: 'Menu protéiné pour sportifs',
    composition: {
      entreeDishes: ['e005', 'e007'],
      mainDishes: ['p003', 'p011'],
      dessertDishes: ['d010', 'd011']
    },
    dietary: ['classique', 'végétarien'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 44.00,
    image: 'sport protein menu',
    allergens: ['poisson', 'gluten', 'soja', 'sésame', 'fruits à coque'],
    stockQuantity: 25
  },

  // MENUS ALLERGÈNES CONTRÔLÉS
  {
    id: 'm043',
    name: 'Menu Sans Gluten',
    theme: 'Allergènes',
    description: 'Menu 100% sans gluten certifié',
    composition: {
      entreeDishes: ['e008'],
      mainDishes: ['p001', 'p011'],
      dessertDishes: ['d004', 'd012']
    },
    dietary: ['classique', 'végétarien', 'sans-gluten'],
    minPersons: 6,
    maxPersons: 35,
    pricePerPerson: 52.00,
    image: 'gluten free menu',
    allergens: ['lait', 'œuf', 'sésame'],
    stockQuantity: 22
  },
  {
    id: 'm044',
    name: 'Menu Sans Lactose',
    theme: 'Allergènes',
    description: 'Menu délicieux sans produits laitiers',
    composition: {
      entreeDishes: ['e005', 'e008'],
      mainDishes: ['p001', 'p012'],
      dessertDishes: ['d011', 'd012']
    },
    dietary: ['classique', 'végétarien', 'sans-lactose'],
    minPersons: 6,
    maxPersons: 35,
    pricePerPerson: 48.00,
    image: 'lactose free menu',
    allergens: ['poisson', 'gluten'],
    stockQuantity: 24
  },

  // MENUS PETITS BUDGETS
  {
    id: 'm045',
    name: 'Menu Étudiant',
    theme: 'Petit Budget',
    description: 'Menu complet à prix accessible',
    composition: {
      entreeDishes: ['e007'],
      mainDishes: ['p009'],
      dessertDishes: ['d011']
    },
    dietary: ['végétarien'],
    minPersons: 6,
    maxPersons: 30,
    pricePerPerson: 22.00,
    image: 'student budget menu',
    allergens: ['gluten', 'lait', 'œuf', 'soja'],
    stockQuantity: 45
  },
  {
    id: 'm046',
    name: 'Menu Famille',
    theme: 'Petit Budget',
    description: 'Menu généreux pour toute la famille',
    composition: {
      entreeDishes: ['e006', 'e007'],
      mainDishes: ['p009', 'p010'],
      dessertDishes: ['d006', 'd011']
    },
    dietary: ['végétarien'],
    minPersons: 8,
    maxPersons: 40,
    pricePerPerson: 32.00,
    image: 'family budget menu',
    allergens: ['gluten', 'lait', 'œuf', 'sésame', 'soja'],
    stockQuantity: 35
  },

  // MENUS PREMIUM
  {
    id: 'm047',
    name: 'Excellence Absolue',
    theme: 'Premium',
    description: 'Le summum de la gastronomie française',
    composition: {
      entreeDishes: ['e001', 'e003'],
      mainDishes: ['p002', 'p005'],
      dessertDishes: ['d005', 'd007']
    },
    dietary: ['classique'],
    minPersons: 6,
    maxPersons: 30,
    pricePerPerson: 135.00,
    image: 'absolute excellence premium',
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'mollusques', 'sulfites', 'moutarde'],
    deliveryNotes: 'Chef à domicile disponible',
    stockQuantity: 8
  },
  {
    id: 'm048',
    name: 'Luxe & Raffinement',
    theme: 'Premium',
    description: 'Expérience culinaire d\'exception',
    composition: {
      entreeDishes: ['e001', 'e003', 'e005'],
      mainDishes: ['p002', 'p003', 'p005'],
      dessertDishes: ['d002', 'd005', 'd007']
    },
    dietary: ['classique'],
    minPersons: 10,
    maxPersons: 40,
    pricePerPerson: 145.00,
    image: 'luxury refined dining',
    allergens: ['gluten', 'lait', 'œuf', 'poisson', 'mollusques', 'sulfites', 'moutarde'],
    deliveryNotes: 'Service à l\'assiette et sommelier disponibles',
    stockQuantity: 6
  },

  // MENUS SPÉCIAUX
  {
    id: 'm049',
    name: 'Menu Halal Gourmand',
    theme: 'Spécial',
    description: 'Menu halal raffiné et savoureux',
    composition: {
      entreeDishes: ['e002', 'e006'],
      mainDishes: ['p001', 'p004'],
      dessertDishes: ['d003', 'd004']
    },
    dietary: ['halal', 'classique'],
    minPersons: 10,
    maxPersons: 60,
    pricePerPerson: 56.00,
    image: 'halal gourmet menu',
    allergens: ['gluten', 'lait', 'œuf', 'sésame', 'céleri'],
    stockQuantity: 20
  },
  {
    id: 'm050',
    name: 'Menu Casher Élégant',
    theme: 'Spécial',
    description: 'Menu casher respectant toutes les traditions',
    composition: {
      entreeDishes: ['e002', 'e008'],
      mainDishes: ['p001', 'p011'],
      dessertDishes: ['d011', 'd012']
    },
    dietary: ['casher', 'classique', 'végétarien'],
    minPersons: 10,
    maxPersons: 50,
    pricePerPerson: 58.00,
    image: 'kosher elegant menu',
    allergens: ['céleri', 'sésame'],
    stockQuantity: 18
  }
];

// Fonctions utilitaires
export const getMenuById = (id: string): Menu | undefined => {
  return menus.find(menu => menu.id === id);
};

export const getMenusByTheme = (theme: string): Menu[] => {
  return menus.filter(menu => menu.theme === theme);
};

export const getMenusByDietary = (dietary: DietaryType): Menu[] => {
  return menus.filter(menu => menu.dietary.includes(dietary));
};

export const getMenusByPriceRange = (minPrice: number, maxPrice: number): Menu[] => {
  return menus.filter(menu => menu.pricePerPerson >= minPrice && menu.pricePerPerson <= maxPrice);
};

export const getAllThemes = (): string[] => {
  return Array.from(new Set(menus.map(menu => menu.theme)));
};

export const isMenuAvailable = (menuId: string): boolean => {
  const menu = getMenuById(menuId);
  return menu ? menu.stockQuantity > 0 : false;
};
