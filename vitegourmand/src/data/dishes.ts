// Système de plats individuels avec gestion des stocks

export type DietaryType = 
  | 'classique' 
  | 'végétarien' 
  | 'vegan' 
  | 'sans-gluten' 
  | 'sans-lactose' 
  | 'halal' 
  | 'casher'
  | 'bio';

export type DishCategory = 'entrée' | 'plat' | 'dessert' | 'accompagnement';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  description: string;
  dietary: DietaryType[];
  allergens: string[];
  image: string;
  stockQuantity: number; // Quantité en stock (portions)
  preparationTime: number; // en minutes
  portionSize: string; // ex: "150g", "1 pièce"
}

// Base de données des plats
export const dishes: Dish[] = [
  // ENTRÉES CLASSIQUES
  {
    id: 'e001',
    name: 'Foie Gras Maison au Sauternes',
    category: 'entrée',
    description: 'Foie gras mi-cuit maison, accompagné de confiture de figues et pain brioché toasté',
    dietary: ['classique'],
    allergens: ['gluten', 'sulfites'],
    image: 'french foie gras sauternes',
    stockQuantity: 120,
    preparationTime: 30,
    portionSize: '80g'
  },
  {
    id: 'e002',
    name: 'Velouté de Cèpes aux Châtaignes',
    category: 'entrée',
    description: 'Velouté onctueux de cèpes frais, émulsion de châtaignes et copeaux de parmesan',
    dietary: ['classique', 'végétarien'],
    allergens: ['lait', 'céleri'],
    image: 'mushroom soup chestnuts',
    stockQuantity: 150,
    preparationTime: 25,
    portionSize: '200ml'
  },
  {
    id: 'e003',
    name: 'Carpaccio de Saint-Jacques',
    category: 'entrée',
    description: 'Saint-Jacques fraîches en carpaccio, vinaigrette aux agrumes et herbes fraîches',
    dietary: ['classique'],
    allergens: ['mollusques', 'sulfites'],
    image: 'scallops carpaccio citrus',
    stockQuantity: 80,
    preparationTime: 20,
    portionSize: '4 pièces'
  },
  {
    id: 'e004',
    name: 'Tarte Fine aux Légumes du Soleil',
    category: 'entrée',
    description: 'Tarte feuilletée fine aux légumes méditerranéens confits, crème de chèvre frais',
    dietary: ['végétarien'],
    allergens: ['gluten', 'lait'],
    image: 'vegetable tart goat cheese',
    stockQuantity: 100,
    preparationTime: 30,
    portionSize: '1 part'
  },
  {
    id: 'e005',
    name: 'Tartare de Saumon à l\'Avocat',
    category: 'entrée',
    description: 'Saumon frais en tartare, avocat crémeux, coriandre et citron vert',
    dietary: ['classique'],
    allergens: ['poisson'],
    image: 'salmon tartare avocado',
    stockQuantity: 90,
    preparationTime: 15,
    portionSize: '120g'
  },

  // ENTRÉES VÉGÉTARIENNES/VEGAN
  {
    id: 'e006',
    name: 'Houmous Maison Trio de Saveurs',
    category: 'entrée',
    description: 'Trois houmous maison : nature, betterave, épinard-coriandre avec crudités',
    dietary: ['vegan', 'végétarien', 'sans-gluten'],
    allergens: ['sésame'],
    image: 'hummus trio colorful',
    stockQuantity: 200,
    preparationTime: 20,
    portionSize: '150g'
  },
  {
    id: 'e007',
    name: 'Salade Caesar Revisitée Végétale',
    category: 'entrée',
    description: 'Salade romaine, croûtons, parmesan végétal, sauce caesar vegan',
    dietary: ['vegan', 'végétarien'],
    allergens: ['gluten', 'soja'],
    image: 'vegan caesar salad',
    stockQuantity: 110,
    preparationTime: 15,
    portionSize: '250g'
  },
  {
    id: 'e008',
    name: 'Gazpacho Andalou',
    category: 'entrée',
    description: 'Soupe froide de tomates, poivrons et concombre aux herbes fraîches',
    dietary: ['vegan', 'végétarien', 'sans-gluten'],
    allergens: [],
    image: 'gazpacho andalusian cold soup',
    stockQuantity: 130,
    preparationTime: 10,
    portionSize: '200ml'
  },

  // PLATS PRINCIPAUX CLASSIQUES
  {
    id: 'p001',
    name: 'Magret de Canard au Miel et Épices',
    category: 'plat',
    description: 'Magret de canard rôti, sauce miel-épices douces, pommes de terre grenailles confites',
    dietary: ['classique', 'sans-gluten'],
    allergens: [],
    image: 'duck breast honey spices',
    stockQuantity: 100,
    preparationTime: 45,
    portionSize: '250g'
  },
  {
    id: 'p002',
    name: 'Pavé de Bœuf Rossini',
    category: 'plat',
    description: 'Pavé de bœuf, escalope de foie gras poêlée, sauce aux truffes, gratin dauphinois',
    dietary: ['classique'],
    allergens: ['lait', 'sulfites'],
    image: 'beef rossini truffle foie gras',
    stockQuantity: 80,
    preparationTime: 50,
    portionSize: '280g'
  },
  {
    id: 'p003',
    name: 'Filet de Bar en Croûte d\'Herbes',
    category: 'plat',
    description: 'Bar de ligne, croûte d\'herbes fraîches, beurre blanc au citron, légumes de saison',
    dietary: ['classique'],
    allergens: ['poisson', 'lait'],
    image: 'sea bass herb crust',
    stockQuantity: 95,
    preparationTime: 40,
    portionSize: '200g'
  },
  {
    id: 'p004',
    name: 'Suprême de Volaille Fermière aux Morilles',
    category: 'plat',
    description: 'Poulet fermier, sauce crémeuse aux morilles, tagliatelles fraîches',
    dietary: ['classique'],
    allergens: ['gluten', 'lait', 'œuf'],
    image: 'chicken morel mushroom cream',
    stockQuantity: 120,
    preparationTime: 45,
    portionSize: '250g'
  },
  {
    id: 'p005',
    name: 'Carré d\'Agneau en Croûte d\'Herbes',
    category: 'plat',
    description: 'Carré d\'agneau rôti, croûte de moutarde et herbes, jus au thym, légumes primeurs',
    dietary: ['classique', 'sans-gluten'],
    allergens: ['moutarde'],
    image: 'lamb rack herb crust',
    stockQuantity: 70,
    preparationTime: 55,
    portionSize: '300g'
  },
  {
    id: 'p006',
    name: 'Filet de Saumon Sauce Champagne',
    category: 'plat',
    description: 'Saumon sauvage, sauce au champagne et échalotes, riz basmati aux légumes',
    dietary: ['classique'],
    allergens: ['poisson', 'lait', 'sulfites'],
    image: 'salmon champagne sauce',
    stockQuantity: 110,
    preparationTime: 35,
    portionSize: '220g'
  },
  {
    id: 'p007',
    name: 'Joue de Bœuf Confite au Vin Rouge',
    category: 'plat',
    description: 'Joue de bœuf confite 12h, sauce vin rouge et épices, purée de pommes de terre',
    dietary: ['classique', 'sans-gluten'],
    allergens: ['sulfites'],
    image: 'beef cheek red wine',
    stockQuantity: 85,
    preparationTime: 60,
    portionSize: '280g'
  },

  // PLATS VÉGÉTARIENS
  {
    id: 'p008',
    name: 'Risotto aux Champignons Sauvages',
    category: 'plat',
    description: 'Risotto crémeux aux cèpes, girolles et pleurotes, parmesan et truffe',
    dietary: ['végétarien'],
    allergens: ['lait'],
    image: 'wild mushroom risotto truffle',
    stockQuantity: 130,
    preparationTime: 40,
    portionSize: '300g'
  },
  {
    id: 'p009',
    name: 'Lasagnes Végétariennes Maison',
    category: 'plat',
    description: 'Lasagnes aux légumes du soleil, ricotta, sauce tomate maison, mozzarella',
    dietary: ['végétarien'],
    allergens: ['gluten', 'lait', 'œuf'],
    image: 'vegetarian lasagna',
    stockQuantity: 140,
    preparationTime: 50,
    portionSize: '350g'
  },
  {
    id: 'p010',
    name: 'Gratin de Légumes d\'Automne',
    category: 'plat',
    description: 'Légumes d\'automne gratinés, béchamel maison, emmental râpé, herbes de Provence',
    dietary: ['végétarien'],
    allergens: ['lait', 'gluten'],
    image: 'autumn vegetable gratin',
    stockQuantity: 120,
    preparationTime: 45,
    portionSize: '320g'
  },

  // PLATS VEGAN
  {
    id: 'p011',
    name: 'Buddha Bowl Complet',
    category: 'plat',
    description: 'Quinoa, patate douce rôtie, avocat, pois chiches épicés, sauce tahini',
    dietary: ['vegan', 'végétarien', 'sans-gluten'],
    allergens: ['sésame'],
    image: 'buddha bowl quinoa chickpeas',
    stockQuantity: 150,
    preparationTime: 30,
    portionSize: '400g'
  },
  {
    id: 'p012',
    name: 'Curry de Légumes Thaï',
    category: 'plat',
    description: 'Curry rouge de légumes, lait de coco, riz jasmin, herbes thaï',
    dietary: ['vegan', 'végétarien', 'sans-gluten'],
    allergens: [],
    image: 'thai red curry vegetables',
    stockQuantity: 160,
    preparationTime: 35,
    portionSize: '380g'
  },
  {
    id: 'p013',
    name: 'Tajine de Légumes aux Épices',
    category: 'plat',
    description: 'Tajine traditionnel de légumes, épices douces, couscous complet, fruits secs',
    dietary: ['vegan', 'végétarien'],
    allergens: ['gluten'],
    image: 'vegetable tajine moroccan',
    stockQuantity: 135,
    preparationTime: 50,
    portionSize: '400g'
  },

  // DESSERTS CLASSIQUES
  {
    id: 'd001',
    name: 'Tiramisu Traditionnel',
    category: 'dessert',
    description: 'Tiramisu maison au mascarpone, biscuits imbibés de café italien',
    dietary: ['classique', 'végétarien'],
    allergens: ['gluten', 'lait', 'œuf'],
    image: 'tiramisu italian dessert',
    stockQuantity: 150,
    preparationTime: 20,
    portionSize: '120g'
  },
  {
    id: 'd002',
    name: 'Fondant au Chocolat Cœur Coulant',
    category: 'dessert',
    description: 'Fondant au chocolat Valrhona 70%, cœur coulant, glace vanille',
    dietary: ['classique', 'végétarien'],
    allergens: ['gluten', 'lait', 'œuf'],
    image: 'chocolate lava cake',
    stockQuantity: 180,
    preparationTime: 25,
    portionSize: '1 pièce'
  },
  {
    id: 'd003',
    name: 'Tarte Tatin aux Pommes',
    category: 'dessert',
    description: 'Tarte Tatin caramélisée, pommes fondantes, crème fraîche épaisse',
    dietary: ['classique', 'végétarien'],
    allergens: ['gluten', 'lait'],
    image: 'apple tart tatin',
    stockQuantity: 120,
    preparationTime: 35,
    portionSize: '1 part'
  },
  {
    id: 'd004',
    name: 'Panna Cotta Fruits Rouges',
    category: 'dessert',
    description: 'Panna cotta vanille bourbon, coulis de fruits rouges maison',
    dietary: ['classique', 'végétarien', 'sans-gluten'],
    allergens: ['lait'],
    image: 'panna cotta red berries',
    stockQuantity: 160,
    preparationTime: 15,
    portionSize: '120ml'
  },
  {
    id: 'd005',
    name: 'Crème Brûlée à la Vanille',
    category: 'dessert',
    description: 'Crème brûlée traditionnelle à la vanille de Madagascar, caramel craquant',
    dietary: ['classique', 'végétarien', 'sans-gluten'],
    allergens: ['lait', 'œuf'],
    image: 'creme brulee vanilla',
    stockQuantity: 140,
    preparationTime: 30,
    portionSize: '130ml'
  },
  {
    id: 'd006',
    name: 'Mousse au Chocolat Noir',
    category: 'dessert',
    description: 'Mousse aérienne au chocolat noir 75%, copeaux de chocolat',
    dietary: ['classique', 'végétarien', 'sans-gluten'],
    allergens: ['lait', 'œuf'],
    image: 'dark chocolate mousse',
    stockQuantity: 170,
    preparationTime: 20,
    portionSize: '110g'
  },
  {
    id: 'd007',
    name: 'Cheese Cake New-Yorkais',
    category: 'dessert',
    description: 'Cheese cake crémeux sur base biscuitée, coulis fruits de la passion',
    dietary: ['classique', 'végétarien'],
    allergens: ['gluten', 'lait', 'œuf'],
    image: 'new york cheesecake',
    stockQuantity: 130,
    preparationTime: 25,
    portionSize: '1 part'
  },

  // DESSERTS VEGAN
  {
    id: 'd008',
    name: 'Brownie Vegan au Chocolat',
    category: 'dessert',
    description: 'Brownie fondant 100% végétal, noix de pécan, glace coco',
    dietary: ['vegan', 'végétarien'],
    allergens: ['gluten', 'fruits à coque'],
    image: 'vegan brownie chocolate',
    stockQuantity: 155,
    preparationTime: 30,
    portionSize: '1 pièce'
  },
  {
    id: 'd009',
    name: 'Tarte Citron Meringuée Vegan',
    category: 'dessert',
    description: 'Tarte au citron 100% végétale, meringue aquafaba, zestes confits',
    dietary: ['vegan', 'végétarien'],
    allergens: ['gluten'],
    image: 'vegan lemon meringue pie',
    stockQuantity: 100,
    preparationTime: 40,
    portionSize: '1 part'
  },
  {
    id: 'd010',
    name: 'Chia Pudding Mangue-Coco',
    category: 'dessert',
    description: 'Pudding de graines de chia, lait de coco, mangue fraîche, granola',
    dietary: ['vegan', 'végétarien', 'sans-gluten'],
    allergens: ['fruits à coque'],
    image: 'chia pudding mango coconut',
    stockQuantity: 140,
    preparationTime: 10,
    portionSize: '150ml'
  },

  // DESSERTS LÉGERS
  {
    id: 'd011',
    name: 'Salade de Fruits Exotiques',
    category: 'dessert',
    description: 'Fruits exotiques frais, sirop passion-citron vert, menthe fraîche',
    dietary: ['vegan', 'végétarien', 'sans-gluten'],
    allergens: [],
    image: 'exotic fruit salad',
    stockQuantity: 180,
    preparationTime: 15,
    portionSize: '200g'
  },
  {
    id: 'd012',
    name: 'Sorbet Maison Trio',
    category: 'dessert',
    description: 'Trois boules de sorbet maison : framboise, citron, mangue',
    dietary: ['vegan', 'végétarien', 'sans-gluten'],
    allergens: [],
    image: 'homemade sorbet trio',
    stockQuantity: 200,
    preparationTime: 5,
    portionSize: '3 boules'
  }
];

// Fonction pour obtenir un plat par ID
export const getDishById = (id: string): Dish | undefined => {
  return dishes.find(dish => dish.id === id);
};

// Fonction pour filtrer par catégorie
export const getDishesByCategory = (category: DishCategory): Dish[] => {
  return dishes.filter(dish => dish.category === category);
};

// Fonction pour filtrer par régime alimentaire
export const getDishesByDietary = (dietary: DietaryType): Dish[] => {
  return dishes.filter(dish => dish.dietary.includes(dietary));
};

// Fonction pour vérifier la disponibilité
export const isDishAvailable = (dishId: string, quantity: number): boolean => {
  const dish = getDishById(dishId);
  return dish ? dish.stockQuantity >= quantity : false;
};
