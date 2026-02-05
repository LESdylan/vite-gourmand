import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";
import ordersRouter from "./orders.ts";
import { initializeDemoData } from "./init-demo-data.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase clients as singletons
let serviceClient: any = null;
let anonClient: any = null;

const getServiceClient = () => {
  if (!serviceClient) {
    serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  }
  return serviceClient;
};

const getAnonClient = () => {
  if (!anonClient) {
    anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
  }
  return anonClient;
};

// Helper to verify user authentication
const verifyAuth = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No token provided', user: null };
  }
  
  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { error: 'Invalid token', user: null };
  }
  
  return { user, error: null };
};

// Helper to get user role
const getUserRole = async (userId: string) => {
  const roles = await kv.get('user_roles') || {};
  return roles[userId] || 'user';
};

// Health check endpoint
app.get("/make-server-e87bab51/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize demo data endpoint (à appeler une fois)
app.post("/make-server-e87bab51/init-demo", async (c) => {
  try {
    const stats = await initializeDemoData();
    return c.json({ 
      success: true, 
      message: 'Données de démo initialisées avec succès',
      stats 
    });
  } catch (error) {
    console.error('[INIT] Error:', error);
    return c.json({ error: 'Erreur lors de l\'initialisation' }, 500);
  }
});

// ===== AUTH ROUTES =====

// Sign up new user
app.post("/make-server-e87bab51/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, firstName, lastName, phone, address } = body;

    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (!passwordRegex.test(password)) {
      return c.json({ 
        error: 'Le mot de passe doit contenir au minimum 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial' 
      }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        firstName, 
        lastName, 
        phone, 
        address,
        role: 'user'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Sign up error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user role
    const roles = await kv.get('user_roles') || {};
    roles[data.user.id] = 'user';
    await kv.set('user_roles', roles);

    // Note: In production, a welcome email would be sent here automatically via Supabase email templates
    console.log(`New user registered: ${email} with role: user`);

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Sign up error: ${error}`);
    return c.json({ error: 'Erreur lors de la création du compte' }, 500);
  }
});

// Request password reset
app.post("/make-server-e87bab51/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    const supabase = getAnonClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.log(`Password reset error for ${email}: ${error.message}`);
      // Don't reveal if email exists or not for security
    }

    // Always return success to prevent email enumeration
    return c.json({ success: true, message: 'Si votre email existe, vous recevrez un lien de réinitialisation' });
  } catch (error) {
    console.log(`Password reset request error: ${error}`);
    return c.json({ error: 'Erreur lors de la demande de réinitialisation' }, 500);
  }
});

// ===== MENU ROUTES =====

// Get all menus
app.get("/make-server-e87bab51/menus", async (c) => {
  try {
    const menus = await kv.get('menus') || [];
    return c.json({ menus });
  } catch (error) {
    console.log(`Error fetching menus: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des menus' }, 500);
  }
});

// Get menu by ID
app.get("/make-server-e87bab51/menus/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const menus = await kv.get('menus') || [];
    const menu = menus.find((m: any) => m.id === id);
    
    if (!menu) {
      return c.json({ error: 'Menu non trouvé' }, 404);
    }
    
    return c.json({ menu });
  } catch (error) {
    console.log(`Error fetching menu ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération du menu' }, 500);
  }
});

// Create menu (admin/employee only)
app.post("/make-server-e87bab51/menus", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin' && role !== 'employee') {
      return c.json({ error: 'Accès refusé - rôle insuffisant' }, 403);
    }

    const body = await c.req.json();
    const menus = await kv.get('menus') || [];
    
    const newMenu = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...body
    };
    
    menus.push(newMenu);
    await kv.set('menus', menus);

    console.log(`Menu created by user ${user.id}: ${newMenu.title}`);
    return c.json({ menu: newMenu });
  } catch (error) {
    console.log(`Error creating menu: ${error}`);
    return c.json({ error: 'Erreur lors de la création du menu' }, 500);
  }
});

// Update menu (admin/employee only)
app.put("/make-server-e87bab51/menus/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin' && role !== 'employee') {
      return c.json({ error: 'Accès refusé - rôle insuffisant' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const menus = await kv.get('menus') || [];
    
    const menuIndex = menus.findIndex((m: any) => m.id === id);
    if (menuIndex === -1) {
      return c.json({ error: 'Menu non trouvé' }, 404);
    }
    
    menus[menuIndex] = { ...menus[menuIndex], ...body, updatedAt: new Date().toISOString() };
    await kv.set('menus', menus);

    console.log(`Menu updated by user ${user.id}: ${id}`);
    return c.json({ menu: menus[menuIndex] });
  } catch (error) {
    console.log(`Error updating menu ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de la mise à jour du menu' }, 500);
  }
});

// Delete menu (admin only)
app.delete("/make-server-e87bab51/menus/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé - seuls les administrateurs peuvent supprimer' }, 403);
    }

    const id = c.req.param('id');
    const menus = await kv.get('menus') || [];
    
    const filteredMenus = menus.filter((m: any) => m.id !== id);
    if (filteredMenus.length === menus.length) {
      return c.json({ error: 'Menu non trouvé' }, 404);
    }
    
    await kv.set('menus', filteredMenus);

    console.log(`Menu deleted by admin ${user.id}: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting menu ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de la suppression du menu' }, 500);
  }
});

// ===== REVIEW ROUTES =====

// Get validated reviews
app.get("/make-server-e87bab51/reviews", async (c) => {
  try {
    const reviews = await kv.get('reviews') || [];
    const validatedReviews = reviews.filter((r: any) => r.validated);
    return c.json({ reviews: validatedReviews });
  } catch (error) {
    console.log(`Error fetching reviews: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des avis' }, 500);
  }
});

// Get user's reviews
app.get("/make-server-e87bab51/reviews/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const reviews = await kv.get('reviews') || [];
    const userReviews = reviews.filter((r: any) => r.userId === userId);
    
    console.log(`[GET] Reviews for user ${userId}: ${userReviews.length} reviews`);
    return c.json({ reviews: userReviews });
  } catch (error) {
    console.log(`Error fetching user reviews: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des avis' }, 500);
  }
});

// Get all reviews (admin only)
app.get("/make-server-e87bab51/reviews/all", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const reviews = await kv.get('reviews') || [];
    return c.json({ reviews });
  } catch (error) {
    console.log(`Error fetching all reviews: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des avis' }, 500);
  }
});

// Create review (authenticated users)
app.post("/make-server-e87bab51/reviews", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé - vous devez être connecté' }, 401);
    }

    const body = await c.req.json();
    const reviews = await kv.get('reviews') || [];
    
    const newReview = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: `${user.user_metadata.firstName} ${user.user_metadata.lastName}`,
      rating: body.rating,
      text: body.text,
      createdAt: new Date().toISOString(),
      validated: false
    };
    
    reviews.push(newReview);
    await kv.set('reviews', reviews);

    console.log(`Review created by user ${user.id}`);
    return c.json({ review: newReview });
  } catch (error) {
    console.log(`Error creating review: ${error}`);
    return c.json({ error: 'Erreur lors de la création de l\'avis' }, 500);
  }
});

// Validate review (admin only)
app.put("/make-server-e87bab51/reviews/:id/validate", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin' && role !== 'employee') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const id = c.req.param('id');
    const reviews = await kv.get('reviews') || [];
    
    const reviewIndex = reviews.findIndex((r: any) => r.id === id);
    if (reviewIndex === -1) {
      return c.json({ error: 'Avis non trouvé' }, 404);
    }
    
    reviews[reviewIndex].validated = true;
    reviews[reviewIndex].validatedBy = user.id;
    reviews[reviewIndex].validatedAt = new Date().toISOString();
    await kv.set('reviews', reviews);

    console.log(`Review validated by ${role} ${user.id}: ${id}`);
    return c.json({ review: reviews[reviewIndex] });
  } catch (error) {
    console.log(`Error validating review ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de la validation de l\'avis' }, 500);
  }
});

// ===== ORDER ROUTES =====
// Note: Order routes are now handled by the mounted orders router below at line ~1326

// ===== USER MANAGEMENT ROUTES =====

// Get user profile
app.get("/make-server-e87bab51/profile", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);

    return c.json({ 
      user: {
        id: user.id,
        email: user.email,
        ...user.user_metadata,
        role
      }
    });
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération du profil' }, 500);
  }
});

// Update user role (admin only)
app.put("/make-server-e87bab51/users/:id/role", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé - seuls les administrateurs peuvent modifier les rôles' }, 403);
    }

    const userId = c.req.param('id');
    const body = await c.req.json();
    const { newRole } = body;

    if (!['user', 'employee', 'admin'].includes(newRole)) {
      return c.json({ error: 'Rôle invalide' }, 400);
    }

    const roles = await kv.get('user_roles') || {};
    roles[userId] = newRole;
    await kv.set('user_roles', roles);

    console.log(`User role updated by admin ${user.id}: ${userId} -> ${newRole}`);
    return c.json({ success: true, role: newRole });
  } catch (error) {
    console.log(`Error updating user role: ${error}`);
    return c.json({ error: 'Erreur lors de la mise à jour du rôle' }, 500);
  }
});

// ===== INITIALIZATION ROUTE =====

// Initialize sample data (for demo purposes)
app.post("/make-server-e87bab51/initialize", async (c) => {
  try {
    // Check if already initialized
    const existingMenus = await kv.get('menus');
    if (existingMenus && existingMenus.length > 0) {
      return c.json({ message: 'Data already initialized' });
    }

    // Sample menus
    const sampleMenus = [
      {
        id: crypto.randomUUID(),
        title: 'Menu de Noël Traditionnel',
        description: 'Un menu festif pour célébrer Noël en famille avec des plats traditionnels français revisités. Foie gras, dinde aux marrons et bûche de Noël pour ravir vos convives.',
        images: ['https://images.unsplash.com/photo-1641147942314-49d96e8a639a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RtYXMlMjBkaW5uZXIlMjBwYXJ0eXxlbnwxfHx8fDE3NzAxMjY5NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
        theme: 'Noël',
        regime: 'Classique',
        minPeople: 8,
        price: 280,
        allergens: ['Gluten', 'Lactose', 'Fruits à coque'],
        conditions: 'Commande minimum 2 semaines avant la date de l\'événement.\nConservation au réfrigérateur.\nRéchauffage selon nos instructions fournies.',
        stock: 15,
        dishes: [
          { id: 'dish-1', name: 'Foie gras mi-cuit et son chutney de figues', type: 'entrée', allergens: [] },
          { id: 'dish-2', name: 'Velouté de châtaignes à la truffe', type: 'entrée', allergens: ['Lactose'] },
          { id: 'dish-3', name: 'Dinde fermière farcie aux marrons', type: 'plat', allergens: ['Gluten'] },
          { id: 'dish-4', name: 'Gratin dauphinois', type: 'plat', allergens: ['Lactose'] },
          { id: 'dish-5', name: 'Bûche de Noël chocolat-praliné', type: 'dessert', allergens: ['Gluten', 'Lactose', 'Fruits à coque'] }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: 'Brunch de Pâques Gourmand',
        description: 'Un brunch festif et coloré pour célébrer le printemps. Œufs pochés, saumon fumé, viennoiseries maison et desserts aux fruits de saison.',
        images: ['https://images.unsplash.com/photo-1681326395986-220c8112cd87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlYXN0ZXIlMjBicnVuY2glMjB0YWJsZXxlbnwxfHx8fDE3NzAxMjY5NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
        theme: 'Pâques',
        regime: 'Classique',
        minPeople: 6,
        price: 180,
        allergens: ['Gluten', 'Lactose', 'Poisson'],
        conditions: 'Commande minimum 1 semaine avant.\nLivraison le matin de votre événement.\nÀ consommer dans les 24 heures.',
        stock: 20,
        dishes: [
          { id: 'dish-6', name: 'Assortiment de viennoiseries maison', type: 'entrée', allergens: ['Gluten', 'Lactose'] },
          { id: 'dish-7', name: 'Œufs pochés sur toasts d\'avocat', type: 'plat', allergens: ['Gluten'] },
          { id: 'dish-8', name: 'Saumon fumé et blinis', type: 'plat', allergens: ['Gluten', 'Poisson'] },
          { id: 'dish-9', name: 'Salade de fruits frais de saison', type: 'dessert', allergens: [] },
          { id: 'dish-10', name: 'Gâteau au chocolat moelleux', type: 'dessert', allergens: ['Gluten', 'Lactose'] }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: 'Menu Végétarien Raffiné',
        description: 'Une expérience gastronomique végétarienne avec des légumes de saison, céréales anciennes et fromages affinés. Parfait pour tous les événements.',
        images: ['https://images.unsplash.com/photo-1642486574545-509db153db60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBjdWlzaW5lJTIwYm9yZGVhdXh8ZW58MXx8fHwxNzcwMTI2OTYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
        theme: 'Classique',
        regime: 'Végétarien',
        minPeople: 10,
        price: 220,
        allergens: ['Gluten', 'Lactose', 'Fruits à coque'],
        conditions: 'Commande minimum 10 jours avant.\nProduits frais et de saison.',
        stock: 10,
        dishes: [
          { id: 'dish-11', name: 'Tartare de betterave et chèvre frais', type: 'entrée', allergens: ['Lactose'] },
          { id: 'dish-12', name: 'Risotto aux champignons et parmesan', type: 'plat', allergens: ['Lactose'] },
          { id: 'dish-13', name: 'Tarte tatin aux légumes d\'automne', type: 'plat', allergens: ['Gluten'] },
          { id: 'dish-14', name: 'Crème brûlée à la vanille', type: 'dessert', allergens: ['Lactose'] }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: 'Menu Vegan Créatif',
        description: 'Une cuisine végane inventive et savoureuse, sans produits d\'origine animale. Des saveurs audacieuses pour surprendre vos invités.',
        images: ['https://images.unsplash.com/photo-1751651054934-3fbdf1d54d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRlcmluZyUyMGVsZWdhbnQlMjBmb29kfGVufDF8fHx8MTc3MDExMzI3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
        theme: 'Classique',
        regime: 'Vegan',
        minPeople: 8,
        price: 200,
        allergens: ['Gluten', 'Soja', 'Fruits à coque'],
        conditions: 'Commande minimum 1 semaine avant.\nTous nos produits sont 100% végétaux.',
        stock: 12,
        dishes: [
          { id: 'dish-15', name: 'Houmous de betterave et légumes croquants', type: 'entrée', allergens: [] },
          { id: 'dish-16', name: 'Buddha bowl quinoa et tofu mariné', type: 'plat', allergens: ['Soja'] },
          { id: 'dish-17', name: 'Curry de légumes au lait de coco', type: 'plat', allergens: [] },
          { id: 'dish-18', name: 'Mousse au chocolat vegan', type: 'dessert', allergens: ['Soja'] }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    // Sample reviews
    const sampleReviews = [
      {
        id: crypto.randomUUID(),
        userName: 'Marie Dubois',
        rating: 5,
        text: 'Excellent service ! Le menu de Noël était absolument délicieux. Tous nos invités ont été ravis. Julie et José sont des professionnels passionnés.',
        validated: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        userName: 'Pierre Martin',
        rating: 5,
        text: 'Nous avons commandé le brunch de Pâques pour notre famille. La qualité des produits et la présentation étaient impeccables. Je recommande vivement !',
        validated: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        userName: 'Sophie Leclerc',
        rating: 5,
        text: 'Le menu végétarien a dépassé toutes nos attentes. Même les non-végétariens ont adoré ! Merci pour cette belle découverte culinaire.',
        validated: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        userName: 'Thomas Bernard',
        rating: 4,
        text: 'Très bon rapport qualité-prix. Le service client est réactif et à l\'écoute. Quelques petits ajustements possibles mais dans l\'ensemble très satisfait.',
        validated: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        userName: 'Isabelle Rousseau',
        rating: 5,
        text: 'Nous faisons appel à Vite & Gourmand depuis plusieurs années pour nos événements d\'entreprise. Toujours un régal et un service impeccable.',
        validated: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        userName: 'Laurent Petit',
        rating: 5,
        text: 'Le menu vegan était une révélation ! Créatif, savoureux et parfaitement équilibré. Bravo à l\'équipe pour leur talent.',
        validated: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    await kv.set('menus', sampleMenus);
    await kv.set('reviews', sampleReviews);
    await kv.set('orders', []);
    await kv.set('user_roles', {});
    await kv.set('system_logs', []);

    console.log('Sample data initialized successfully');
    return c.json({ success: true, message: 'Sample data initialized' });
  } catch (error) {
    console.log(`Error initializing data: ${error}`);
    return c.json({ error: 'Erreur lors de l\'initialisation' }, 500);
  }
});

// ===== DEMO ACCOUNTS INITIALIZATION =====

// Initialize demo accounts
app.post("/make-server-e87bab51/init-demo-accounts", async (c) => {
  try {
    const supabase = getServiceClient();
    
    const demoAccounts = [
      {
        email: 'admin@demo.app',
        password: 'Admin123!@#',
        firstName: 'José',
        lastName: 'Martinez',
        phone: '+33 6 12 34 56 78',
        address: '15 Rue Sainte-Catherine, 33000 Bordeaux',
        role: 'admin'
      },
      {
        email: 'employee@demo.app',
        password: 'Employee123!@#',
        firstName: 'Pierre',
        lastName: 'Laurent',
        phone: '+33 6 55 44 33 22',
        address: '8 Place de la Bourse, 33000 Bordeaux',
        role: 'employee'
      },
      {
        email: 'user@demo.app',
        password: 'User123!@#',
        firstName: 'Julie',
        lastName: 'Dubois',
        phone: '+33 6 98 76 54 32',
        address: '42 Quai des Chartrons, 33000 Bordeaux',
        role: 'user'
      }
    ];

    const roles = await kv.get('user_roles') || {};

    for (const account of demoAccounts) {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users.some(u => u.email === account.email);

      if (!userExists) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          user_metadata: {
            firstName: account.firstName,
            lastName: account.lastName,
            phone: account.phone,
            address: account.address,
            role: account.role
          },
          email_confirm: true
        });

        if (error) {
          console.log(`Error creating demo account ${account.email}: ${error.message}`);
        } else {
          roles[data.user.id] = account.role;
          console.log(`Demo account created: ${account.email} with role ${account.role}`);
        }
      } else {
        console.log(`Demo account already exists: ${account.email}`);
      }
    }

    await kv.set('user_roles', roles);

    // Log the initialization
    const logs = await kv.get('system_logs') || [];
    logs.push({
      id: crypto.randomUUID(),
      type: 'system',
      action: 'demo_accounts_initialized',
      timestamp: new Date().toISOString(),
      details: 'Demo accounts created successfully'
    });
    await kv.set('system_logs', logs);

    return c.json({ success: true, message: 'Demo accounts initialized' });
  } catch (error) {
    console.log(`Error initializing demo accounts: ${error}`);
    return c.json({ error: 'Erreur lors de l\'initialisation des comptes de démo' }, 500);
  }
});

// ===== USER SPACE ROUTES =====

// Get user's orders
app.get("/make-server-e87bab51/user/orders", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const orders = await kv.get('orders') || [];
    const userOrders = orders.filter((o: any) => o.userId === user.id);
    
    // Sort by creation date, newest first
    userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ orders: userOrders });
  } catch (error) {
    console.log(`Error fetching user orders: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des commandes' }, 500);
  }
});

// Cancel user's order (only if status is pending)
app.post("/make-server-e87bab51/user/orders/:id/cancel", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const orderId = c.req.param('id');
    const orders = await kv.get('orders') || [];
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);

    if (orderIndex === -1) {
      return c.json({ error: 'Commande non trouvée' }, 404);
    }

    const order = orders[orderIndex];

    // Verify user owns this order
    if (order.userId !== user.id) {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    // Can only cancel if status is pending
    if (order.status !== 'pending') {
      return c.json({ error: 'Cette commande ne peut plus être annulée. Elle a déjà été acceptée par notre équipe.' }, 400);
    }

    // Cancel order
    orders[orderIndex].status = 'cancelled';
    orders[orderIndex].cancellationReason = 'Annulée par le client';
    orders[orderIndex].statusHistory.push({
      status: 'Commande annulée par le client',
      date: new Date().toISOString()
    });

    await kv.set('orders', orders);

    console.log(`Order ${orderId} cancelled by user ${user.id}`);
    return c.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.log(`Error cancelling order: ${error}`);
    return c.json({ error: 'Erreur lors de l\'annulation de la commande' }, 500);
  }
});

// Update user profile
app.put("/make-server-e87bab51/user/profile", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const body = await c.req.json();
    const { firstName, lastName, phone, address } = body;

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          firstName,
          lastName,
          phone,
          address
        }
      }
    );

    if (error) {
      console.log(`Error updating user profile ${user.id}: ${error.message}`);
      return c.json({ error: 'Erreur lors de la mise à jour du profil' }, 500);
    }

    console.log(`User profile updated: ${user.id}`);
    return c.json({ success: true, user: data });
  } catch (error) {
    console.log(`Error updating profile: ${error}`);
    return c.json({ error: 'Erreur lors de la mise à jour du profil' }, 500);
  }
});

// Submit review for completed order
app.post("/make-server-e87bab51/user/orders/:id/review", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const orderId = c.req.param('id');
    const body = await c.req.json();
    const { rating, comment } = body;

    if (rating < 1 || rating > 5) {
      return c.json({ error: 'La note doit être entre 1 et 5' }, 400);
    }

    const orders = await kv.get('orders') || [];
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);

    if (orderIndex === -1) {
      return c.json({ error: 'Commande non trouvée' }, 404);
    }

    const order = orders[orderIndex];

    // Verify user owns this order
    if (order.userId !== user.id) {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    // Can only review completed orders
    if (order.status !== 'completed') {
      return c.json({ error: 'Vous ne pouvez donner un avis que pour une commande terminée' }, 400);
    }

    // Check if review already exists
    if (order.review) {
      return c.json({ error: 'Vous avez déjà donné un avis pour cette commande' }, 400);
    }

    // Add review to order
    orders[orderIndex].review = {
      rating,
      comment,
      submittedAt: new Date().toISOString()
    };

    await kv.set('orders', orders);

    // Create review for validation
    const reviews = await kv.get('reviews') || [];
    const newReview = {
      id: crypto.randomUUID(),
      orderId,
      userId: user.id,
      userName: order.userName,
      menuTitle: order.menuTitle,
      rating,
      text: comment,
      validated: false,
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    await kv.set('reviews', reviews);

    console.log(`Review submitted for order ${orderId} by user ${user.id}`);
    return c.json({ success: true, review: newReview });
  } catch (error) {
    console.log(`Error submitting review: ${error}`);
    return c.json({ error: 'Erreur lors de l\'envoi de l\'avis' }, 500);
  }
});

// ===== EMPLOYEE/ADMIN ENHANCED ROUTES =====

// Update order status with history tracking (admin/employee only)
app.put("/make-server-e87bab51/admin/orders/:id/status", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin' && role !== 'employee') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const orderId = c.req.param('id');
    const body = await c.req.json();
    const { status, cancellationReason, contactMethod } = body;

    const validStatuses = ['accepted', 'preparing', 'delivering', 'delivered', 'awaiting_equipment', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Statut invalide' }, 400);
    }

    const orders = await kv.get('orders') || [];
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);

    if (orderIndex === -1) {
      return c.json({ error: 'Commande non trouvée' }, 404);
    }

    const order = orders[orderIndex];

    // If cancelling, require reason and contact method
    if (status === 'cancelled' && (!cancellationReason || !contactMethod)) {
      return c.json({ error: 'Un motif d\'annulation et le mode de contact sont requis' }, 400);
    }

    // Update order status
    const statusLabels: { [key: string]: string } = {
      accepted: 'Commande acceptée',
      preparing: 'En préparation',
      delivering: 'En cours de livraison',
      delivered: 'Livrée',
      awaiting_equipment: 'En attente du retour de matériel',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };

    orders[orderIndex].status = status;
    orders[orderIndex].statusHistory = orders[orderIndex].statusHistory || [];
    orders[orderIndex].statusHistory.push({
      status: statusLabels[status],
      date: new Date().toISOString()
    });

    if (status === 'cancelled') {
      orders[orderIndex].cancellationReason = `${cancellationReason} (Contact: ${contactMethod})`;
    }

    await kv.set('orders', orders);

    console.log(`Order ${orderId} status updated to ${status} by ${role} ${user.id}`);
    
    // Note: In production, emails would be sent based on status:
    // - awaiting_equipment: Send email about equipment return deadline
    // - completed: Send email to leave a review
    
    return c.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.log(`Error updating order status: ${error}`);
    return c.json({ error: 'Erreur lors de la mise à jour du statut' }, 500);
  }
});

// Validate or reject review (employee/admin only)
app.put("/make-server-e87bab51/admin/reviews/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin' && role !== 'employee') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const reviewId = c.req.param('id');
    const body = await c.req.json();
    const { action } = body; // 'validate' or 'reject'

    if (!['validate', 'reject'].includes(action)) {
      return c.json({ error: 'Action invalide' }, 400);
    }

    const reviews = await kv.get('reviews') || [];
    const reviewIndex = reviews.findIndex((r: any) => r.id === reviewId);

    if (reviewIndex === -1) {
      return c.json({ error: 'Avis non trouvé' }, 404);
    }

    if (action === 'validate') {
      reviews[reviewIndex].validated = true;
      reviews[reviewIndex].validatedAt = new Date().toISOString();
      reviews[reviewIndex].validatedBy = user.id;
    } else {
      // Remove rejected review
      reviews.splice(reviewIndex, 1);
    }

    await kv.set('reviews', reviews);

    console.log(`Review ${reviewId} ${action}d by ${role} ${user.id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error managing review: ${error}`);
    return c.json({ error: 'Erreur lors de la gestion de l\'avis' }, 500);
  }
});

// Create employee account (admin only)
app.post("/make-server-e87bab51/admin/employees", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé - seuls les administrateurs peuvent créer des comptes employés' }, 403);
    }

    const body = await c.req.json();
    const { email, password, firstName, lastName } = body;

    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,}$/;
    if (!passwordRegex.test(password)) {
      return c.json({ 
        error: 'Le mot de passe doit contenir au minimum 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial' 
      }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        firstName, 
        lastName,
        phone: '',
        address: '',
        role: 'employee'
      },
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating employee ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store employee role
    const roles = await kv.get('user_roles') || {};
    roles[data.user.id] = 'employee';
    await kv.set('user_roles', roles);

    console.log(`Employee account created: ${email} by admin ${user.id}`);
    
    // Note: In production, an email would be sent to the employee informing them
    // of their account creation (without the password)

    return c.json({ success: true, employee: { id: data.user.id, email, firstName, lastName } });
  } catch (error) {
    console.log(`Error creating employee: ${error}`);
    return c.json({ error: 'Erreur lors de la création du compte employé' }, 500);
  }
});

// Disable employee account (admin only)
app.post("/make-server-e87bab51/admin/employees/:id/disable", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const employeeId = c.req.param('id');

    const supabase = getServiceClient();
    const { error } = await supabase.auth.admin.updateUserById(employeeId, {
      ban_duration: '876000h' // ~100 years = effectively permanent
    });

    if (error) {
      console.log(`Error disabling employee ${employeeId}: ${error.message}`);
      return c.json({ error: 'Erreur lors de la désactivation du compte' }, 500);
    }

    console.log(`Employee ${employeeId} disabled by admin ${user.id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error disabling employee: ${error}`);
    return c.json({ error: 'Erreur lors de la désactivation du compte' }, 500);
  }
});

// Get system logs (simulating MongoDB analytics)
app.get("/make-server-e87bab51/admin/logs", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const logs = await kv.get('system_logs') || [];
    
    // Return logs sorted by timestamp, most recent first
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ logs: logs.slice(0, 100) }); // Return last 100 logs
  } catch (error) {
    console.log(`Error fetching logs: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des logs' }, 500);
  }
});

// Log user action (simulating MongoDB analytics)
const logUserAction = async (userId: string, action: string, details: any = {}) => {
  try {
    const logs = await kv.get('system_logs') || [];
    logs.push({
      id: crypto.randomUUID(),
      userId,
      type: 'user_action',
      action,
      details,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 1000 logs to prevent unlimited growth
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    await kv.set('system_logs', logs);
  } catch (error) {
    console.log(`Error logging action: ${error}`);
  }
};

// Get statistics for admin dashboard
app.get("/make-server-e87bab51/admin/statistics", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const orders = await kv.get('orders') || [];
    const menus = await kv.get('menus') || [];

    // Count orders per menu
    const ordersByMenu: { [key: string]: number } = {};
    const revenueByMenu: { [key: string]: number } = {};

    orders.forEach((order: any) => {
      if (order.status !== 'cancelled') {
        ordersByMenu[order.menuTitle] = (ordersByMenu[order.menuTitle] || 0) + 1;
        revenueByMenu[order.menuTitle] = (revenueByMenu[order.menuTitle] || 0) + (order.totalPrice || 0);
      }
    });

    // Format for charts
    const orderStats = Object.entries(ordersByMenu).map(([menu, count]) => ({
      menu,
      count
    }));

    const revenueStats = Object.entries(revenueByMenu).map(([menu, revenue]) => ({
      menu,
      revenue: Math.round(revenue * 100) / 100
    }));

    return c.json({ 
      ordersByMenu: orderStats,
      revenueByMenu: revenueStats,
      totalOrders: orders.filter((o: any) => o.status !== 'cancelled').length,
      totalRevenue: Math.round(orders.filter((o: any) => o.status !== 'cancelled').reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) * 100) / 100
    });
  } catch (error) {
    console.log(`Error fetching statistics: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500);
  }
});

// ===== MIGRATION ROUTE (temporary) =====
// Migrate old orders format to new KV store format
app.post("/make-server-e87bab51/migrate-orders", async (c) => {
  try {
    console.log('[MIGRATION] Starting orders migration...');
    
    // Get old orders from direct kv.get('orders')
    const oldOrders = await kv.get('orders') || [];
    console.log(`[MIGRATION] Found ${oldOrders.length} orders in old format`);
    
    if (oldOrders.length === 0) {
      return c.json({ message: 'No orders to migrate' });
    }
    
    // Get existing new format orders
    const existingOrderIds = await kv.get('orders:list') || [];
    console.log(`[MIGRATION] Found ${existingOrderIds.length} orders in new format`);
    
    let migratedCount = 0;
    const newOrderIds = [...existingOrderIds];
    
    for (const order of oldOrders) {
      // Check if already migrated
      if (!existingOrderIds.includes(order.id)) {
        // Save in new format
        await kv.set(`order:${order.id}`, order);
        newOrderIds.push(order.id);
        
        // Add to user's orders if userId exists
        if (order.userId) {
          const userOrders = await kv.get(`user:${order.userId}:orders`) || [];
          if (!userOrders.includes(order.id)) {
            userOrders.push(order.id);
            await kv.set(`user:${order.userId}:orders`, userOrders);
          }
        }
        
        migratedCount++;
        console.log(`[MIGRATION] Migrated order ${order.id}`);
      }
    }
    
    // Update orders list
    await kv.set('orders:list', newOrderIds);
    
    console.log(`[MIGRATION] ✅ Migration complete: ${migratedCount} orders migrated`);
    return c.json({ 
      success: true, 
      migratedCount,
      totalOrders: newOrderIds.length
    });
  } catch (error) {
    console.error('[MIGRATION] ❌ Error migrating orders:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== DISHES MANAGEMENT ROUTES =====

// Get all dishes
app.get("/make-server-e87bab51/dishes", async (c) => {
  try {
    const dishes = await kv.get('dishes') || [];
    return c.json({ dishes });
  } catch (error) {
    console.log(`Error fetching dishes: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des plats' }, 500);
  }
});

// Get dish by ID
app.get("/make-server-e87bab51/dishes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const dishes = await kv.get('dishes') || [];
    const dish = dishes.find((d: any) => d.id === id);
    
    if (!dish) {
      return c.json({ error: 'Plat non trouvé' }, 404);
    }
    
    return c.json({ dish });
  } catch (error) {
    console.log(`Error fetching dish ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération du plat' }, 500);
  }
});

// Create dish (admin/employee only)
app.post("/make-server-e87bab51/dishes", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin' && role !== 'employee') {
      return c.json({ error: 'Accès refusé - rôle insuffisant' }, 403);
    }

    const body = await c.req.json();
    const dishes = await kv.get('dishes') || [];
    
    const newDish = {
      id: 'd-' + crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      ...body
    };
    
    dishes.push(newDish);
    await kv.set('dishes', dishes);

    console.log(`Dish created by user ${user.id}: ${newDish.name}`);
    return c.json({ dish: newDish });
  } catch (error) {
    console.log(`Error creating dish: ${error}`);
    return c.json({ error: 'Erreur lors de la création du plat' }, 500);
  }
});

// Update dish (admin/employee only)
app.put("/make-server-e87bab51/dishes/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin' && role !== 'employee') {
      return c.json({ error: 'Accès refusé - rôle insuffisant' }, 403);
    }

    const id = c.req.param('id');
    const body = await c.req.json();
    const dishes = await kv.get('dishes') || [];
    
    const dishIndex = dishes.findIndex((d: any) => d.id === id);
    if (dishIndex === -1) {
      return c.json({ error: 'Plat non trouvé' }, 404);
    }
    
    dishes[dishIndex] = { 
      ...dishes[dishIndex], 
      ...body, 
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };
    await kv.set('dishes', dishes);

    console.log(`Dish updated by user ${user.id}: ${id}`);
    return c.json({ dish: dishes[dishIndex] });
  } catch (error) {
    console.log(`Error updating dish ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de la mise à jour du plat' }, 500);
  }
});

// Delete dish (admin/employee only)
app.delete("/make-server-e87bab51/dishes/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin' && role !== 'employee') {
      return c.json({ error: 'Accès refusé - rôle insuffisant' }, 403);
    }

    const id = c.req.param('id');
    const dishes = await kv.get('dishes') || [];
    
    const filteredDishes = dishes.filter((d: any) => d.id !== id);
    if (filteredDishes.length === dishes.length) {
      return c.json({ error: 'Plat non trouvé' }, 404);
    }
    
    await kv.set('dishes', filteredDishes);

    console.log(`Dish deleted by user ${user.id}: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting dish ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de la suppression du plat' }, 500);
  }
});

// ===== OPENING HOURS MANAGEMENT =====

// Get opening hours
app.get("/make-server-e87bab51/opening-hours", async (c) => {
  try {
    const hours = await kv.get('opening_hours') || {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    };
    return c.json({ hours });
  } catch (error) {
    console.log(`Error fetching opening hours: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des horaires' }, 500);
  }
});

// Update opening hours (admin only)
app.put("/make-server-e87bab51/opening-hours", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé - seuls les administrateurs peuvent modifier les horaires' }, 403);
    }

    const body = await c.req.json();
    await kv.set('opening_hours', body.hours);

    console.log(`Opening hours updated by admin ${user.id}`);
    return c.json({ success: true, hours: body.hours });
  } catch (error) {
    console.log(`Error updating opening hours: ${error}`);
    return c.json({ error: 'Erreur lors de la mise à jour des horaires' }, 500);
  }
});

// ===== USERS MANAGEMENT (ADMIN) =====

// Get all users (admin only) - COMMENTED OUT - Using demo data version below instead
// app.get("/make-server-e87bab51/admin/users", async (c) => {
//   try {
//     const { user, error: authError } = await verifyAuth(c.req.raw);
//     if (authError || !user) {
//       return c.json({ error: 'Non autorisé' }, 401);
//     }
//
//     const role = await getUserRole(user.id);
//     if (role !== 'admin') {
//       return c.json({ error: 'Accès refusé' }, 403);
//     }
//
//     const supabase = getServiceClient();
//     const { data: { users }, error } = await supabase.auth.admin.listUsers();
//
//     if (error) {
//       console.log(`Error fetching users: ${error.message}`);
//       return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500);
//     }
//
//     const roles = await kv.get('user_roles') || {};
//     
//     const usersWithRoles = users.map(u => ({
//       id: u.id,
//       email: u.email,
//       ...u.user_metadata,
//       role: roles[u.id] || 'user',
//       created_at: u.created_at,
//       last_sign_in_at: u.last_sign_in_at
//     }));
//
//     return c.json({ users: usersWithRoles });
//   } catch (error) {
//     console.log(`Error fetching users: ${error}`);
//     return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500);
//   }
// });

// Create user (admin only)
app.post("/make-server-e87bab51/admin/users", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const body = await c.req.json();
    const { email, password, firstName, lastName, phone, address, userRole } = body;

    // Validate password
    if (!password || password.length < 8) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        firstName,
        lastName,
        phone,
        address
      },
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Set user role
    const roles = await kv.get('user_roles') || {};
    roles[data.user.id] = userRole || 'user';
    await kv.set('user_roles', roles);

    console.log(`User created by admin ${user.id}: ${email} with role ${userRole}`);
    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        ...data.user.user_metadata,
        role: userRole || 'user'
      }
    });
  } catch (error) {
    console.log(`Error creating user: ${error}`);
    return c.json({ error: 'Erreur lors de la création de l\'utilisateur' }, 500);
  }
});

// Update user (admin only)
app.put("/make-server-e87bab51/admin/users/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const userId = c.req.param('id');
    const body = await c.req.json();
    const { email, firstName, lastName, phone, address, userRole } = body;

    const supabase = getServiceClient();
    const updateData: any = {
      user_metadata: {
        firstName,
        lastName,
        phone,
        address
      }
    };

    if (email) {
      updateData.email = email;
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (error) {
      console.log(`Error updating user ${userId}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Update role if provided
    if (userRole) {
      const roles = await kv.get('user_roles') || {};
      roles[userId] = userRole;
      await kv.set('user_roles', roles);
    }

    console.log(`User updated by admin ${user.id}: ${userId}`);
    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        ...data.user.user_metadata,
        role: userRole
      }
    });
  } catch (error) {
    console.log(`Error updating user: ${error}`);
    return c.json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' }, 500);
  }
});

// Delete user (admin only)
app.delete("/make-server-e87bab51/admin/users/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const userId = c.req.param('id');

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return c.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, 400);
    }

    const supabase = getServiceClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.log(`Error deleting user ${userId}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Remove role
    const roles = await kv.get('user_roles') || {};
    delete roles[userId];
    await kv.set('user_roles', roles);

    console.log(`User deleted by admin ${user.id}: ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting user: ${error}`);
    return c.json({ error: 'Erreur lors de la suppression de l\'utilisateur' }, 500);
  }
});

// Delete review (admin only)
app.delete("/make-server-e87bab51/reviews/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const id = c.req.param('id');
    const reviews = await kv.get('reviews') || [];
    
    const filteredReviews = reviews.filter((r: any) => r.id !== id);
    if (filteredReviews.length === reviews.length) {
      return c.json({ error: 'Avis non trouvé' }, 404);
    }
    
    await kv.set('reviews', filteredReviews);

    console.log(`Review deleted by admin ${user.id}: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting review ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de la suppression de l\'avis' }, 500);
  }
});

// Invalidate review (admin only) - Mark as not validated
app.put("/make-server-e87bab51/reviews/:id/invalidate", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const id = c.req.param('id');
    const reviews = await kv.get('reviews') || [];
    
    const reviewIndex = reviews.findIndex((r: any) => r.id === id);
    if (reviewIndex === -1) {
      return c.json({ error: 'Avis non trouvé' }, 404);
    }
    
    reviews[reviewIndex].validated = false;
    reviews[reviewIndex].invalidatedBy = user.id;
    reviews[reviewIndex].invalidatedAt = new Date().toISOString();
    await kv.set('reviews', reviews);

    console.log(`Review invalidated by admin ${user.id}: ${id}`);
    return c.json({ review: reviews[reviewIndex] });
  } catch (error) {
    console.log(`Error invalidating review ${c.req.param('id')}: ${error}`);
    return c.json({ error: 'Erreur lors de l\'invalidation de l\'avis' }, 500);
  }
});

// ===== SITE CONTENT MANAGEMENT (ADMIN) =====

// Get site content
app.get("/make-server-e87bab51/site-content", async (c) => {
  try {
    const content = await kv.get('site_content') || {
      companyName: 'Vite & Gourmand',
      tagline: 'Traiteur d\'excellence depuis 25 ans',
      aboutText: 'Julie et José vous accueillent...',
      contactEmail: 'contact@vitegourmand.fr',
      contactPhone: '+33 5 56 XX XX XX',
      address: 'Bordeaux, France'
    };
    return c.json({ content });
  } catch (error) {
    console.log(`Error fetching site content: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération du contenu' }, 500);
  }
});

// Update site content (admin only)
app.put("/make-server-e87bab51/site-content", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const role = await getUserRole(user.id);
    if (role !== 'admin') {
      return c.json({ error: 'Accès refusé' }, 403);
    }

    const body = await c.req.json();
    await kv.set('site_content', body.content);

    console.log(`Site content updated by admin ${user.id}`);
    return c.json({ success: true, content: body.content });
  } catch (error) {
    console.log(`Error updating site content: ${error}`);
    return c.json({ error: 'Erreur lors de la mise à jour du contenu' }, 500);
  }
});

// ===== ADMIN STATS & ANALYTICS =====

// Get all users with their profiles (alias for admin)
app.get("/make-server-e87bab51/admin/users", async (c) => {
  try {
    // Get all users from KV
    const usersData = await kv.get('demo_users') || {};
    const userProfiles = await kv.get('user_profiles') || {};
    const orders = await kv.get('orders') || [];

    const users = Object.entries(usersData).map(([userId, userData]: [string, any]) => {
      const profile = userProfiles[userId] || {
        points: 0,
        totalOrders: 0,
        isAffiliate: false,
        affiliateCode: '',
        totalSavings: 0
      };

      // Count user orders
      const userOrders = orders.filter((o: any) => o.userId === userId);
      const completedOrders = userOrders.filter((o: any) => o.status === 'completed');

      return {
        id: userId,
        userId: userId,
        email: userData.email,
        firstName: userData.firstName || userData.metadata?.firstName || '',
        lastName: userData.lastName || userData.metadata?.lastName || '',
        phone: userData.phone || userData.metadata?.phone || '',
        address: userData.address || userData.metadata?.address || '',
        role: userData.role,
        points: profile.points || 0,
        totalOrders: completedOrders.length,
        affiliateCode: profile.affiliateCode || '',
        isAffiliate: profile.isAffiliate || false,
        totalSavings: profile.totalSavings || 0,
        createdAt: userData.createdAt || new Date().toISOString(),
        created_at: userData.createdAt || new Date().toISOString()
      };
    });

    console.log(`[GET] All users fetched: ${users.length} users`);
    return c.json({ users });
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500);
  }
});

// Get all users with their profiles
app.get("/make-server-e87bab51/users", async (c) => {
  try {
    // Get all users from KV
    const usersData = await kv.get('demo_users') || {};
    const userProfiles = await kv.get('user_profiles') || {};
    const orders = await kv.get('orders') || [];

    const users = Object.entries(usersData).map(([userId, userData]: [string, any]) => {
      const profile = userProfiles[userId] || {
        points: 0,
        totalOrders: 0,
        isAffiliate: false,
        affiliateCode: '',
        totalSavings: 0
      };

      // Count user orders
      const userOrders = orders.filter((o: any) => o.userId === userId);
      const completedOrders = userOrders.filter((o: any) => o.status === 'completed');

      return {
        userId: userId,
        email: userData.email,
        firstName: userData.firstName || userData.metadata?.firstName || '',
        lastName: userData.lastName || userData.metadata?.lastName || '',
        role: userData.role,
        points: profile.points || 0,
        totalOrders: completedOrders.length,
        affiliateCode: profile.affiliateCode || '',
        isAffiliate: profile.isAffiliate || false,
        totalSavings: profile.totalSavings || 0,
        createdAt: userData.createdAt || new Date().toISOString()
      };
    });

    console.log(`[GET] All users fetched: ${users.length} users`);
    return c.json({ users });
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500);
  }
});

// Get admin statistics
app.get("/make-server-e87bab51/admin/stats", async (c) => {
  try {
    const orders = await kv.get('orders') || [];
    const userProfiles = await kv.get('user_profiles') || {};
    const usersData = await kv.get('demo_users') || {};

    // Calculate stats
    const completedOrders = orders.filter((o: any) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const totalUsers = Object.keys(usersData).length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    // Points stats
    const totalPoints = Object.values(userProfiles).reduce((sum: number, p: any) => sum + (p.points || 0), 0);
    
    // Affiliate stats
    const activeAffiliates = Object.values(userProfiles).filter((p: any) => p.isAffiliate).length;

    const stats = {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalUsers,
      avgOrderValue,
      totalPoints,
      activeAffiliates
    };

    console.log('[GET] Admin stats:', stats);
    return c.json({ stats });
  } catch (error) {
    console.log(`Error fetching stats: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500);
  }
});

// ===== USER PROFILE & POINTS SYSTEM =====

// Get user profile with points and affiliate info
app.get("/make-server-e87bab51/user/:userId/profile", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Get user points and affiliate data
    const userProfiles = await kv.get('user_profiles') || {};
    const profile = userProfiles[userId] || {
      points: 0,
      totalOrders: 0,
      affiliateCode: '',
      isAffiliate: false,
      totalSavings: 0,
      nextRewardAt: 500,
      referredBy: null
    };

    // Count total orders
    const orders = await kv.get('orders') || [];
    const userOrders = orders.filter((o: any) => o.userId === userId);
    profile.totalOrders = userOrders.filter((o: any) => o.status === 'completed').length;

    return c.json({ profile });
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération du profil' }, 500);
  }
});

// Join affiliate program
app.post("/make-server-e87bab51/user/:userId/join-affiliate", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const userProfiles = await kv.get('user_profiles') || {};
    
    if (!userProfiles[userId]) {
      userProfiles[userId] = {
        points: 0,
        totalOrders: 0,
        totalSavings: 0,
        nextRewardAt: 500
      };
    }

    // Generate unique affiliate code
    const affiliateCode = `VG${userId.slice(0, 6).toUpperCase()}`;
    
    userProfiles[userId].isAffiliate = true;
    userProfiles[userId].affiliateCode = affiliateCode;
    
    await kv.set('user_profiles', userProfiles);

    console.log(`User ${userId} joined affiliate program with code ${affiliateCode}`);
    return c.json({ 
      success: true, 
      affiliateCode,
      profile: userProfiles[userId]
    });
  } catch (error) {
    console.log(`Error joining affiliate: ${error}`);
    return c.json({ error: 'Erreur lors de l\'inscription' }, 500);
  }
});

// Submit review for order and earn points
app.post("/make-server-e87bab51/orders/:orderId/review", async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const body = await c.req.json();
    const { userId, rating, comment } = body;

    if (rating < 1 || rating > 5) {
      return c.json({ error: 'La note doit être entre 1 et 5' }, 400);
    }

    // Get orders
    const orders = await kv.get('orders') || [];
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);

    if (orderIndex === -1) {
      return c.json({ error: 'Commande non trouvée' }, 404);
    }

    const order = orders[orderIndex];

    // Check if order is completed
    if (order.status !== 'completed') {
      return c.json({ error: 'La commande doit être terminée' }, 400);
    }

    // Check if review already exists
    if (order.reviewId) {
      return c.json({ error: 'Avis déjà soumis' }, 400);
    }

    // Create review
    const reviews = await kv.get('reviews') || [];
    const newReview = {
      id: crypto.randomUUID(),
      orderId: orderId,
      userId: userId,
      userName: `${order.customerName}`,
      rating: rating,
      text: comment || '',
      createdAt: new Date().toISOString(),
      validated: false
    };

    reviews.push(newReview);
    await kv.set('reviews', reviews);

    // Update order with review
    orders[orderIndex].reviewId = newReview.id;
    await kv.set('orders', orders);

    // Award points (50 points per review)
    const pointsEarned = 50;
    const userProfiles = await kv.get('user_profiles') || {};
    
    if (!userProfiles[userId]) {
      userProfiles[userId] = {
        points: 0,
        totalOrders: 0,
        totalSavings: 0,
        nextRewardAt: 500,
        isAffiliate: false,
        affiliateCode: ''
      };
    }

    userProfiles[userId].points += pointsEarned;
    orders[orderIndex].pointsEarned = pointsEarned;
    
    await kv.set('user_profiles', userProfiles);
    await kv.set('orders', orders);

    console.log(`Review submitted for order ${orderId}, user ${userId} earned ${pointsEarned} points`);
    return c.json({ 
      success: true, 
      review: newReview,
      pointsEarned,
      totalPoints: userProfiles[userId].points
    });
  } catch (error) {
    console.log(`Error submitting review: ${error}`);
    return c.json({ error: 'Erreur lors de la soumission de l\'avis' }, 500);
  }
});

// Calculate and award points when order is completed
app.post("/make-server-e87bab51/orders/:orderId/complete", async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    const orders = await kv.get('orders') || [];
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);

    if (orderIndex === -1) {
      return c.json({ error: 'Commande non trouvée' }, 404);
    }

    const order = orders[orderIndex];
    
    // Update order status
    orders[orderIndex].status = 'completed';
    orders[orderIndex].completedAt = new Date().toISOString();
    
    if (!orders[orderIndex].statusHistory) {
      orders[orderIndex].statusHistory = [];
    }
    orders[orderIndex].statusHistory.push({
      status: 'Commande terminée',
      date: new Date().toISOString(),
      note: 'Commande livrée avec succès'
    });

    // Calculate base points (1 point per euro spent)
    const basePoints = Math.floor(order.totalPrice);
    
    // Get user profile
    const userProfiles = await kv.get('user_profiles') || {};
    const userId = order.userId;
    
    if (!userProfiles[userId]) {
      userProfiles[userId] = {
        points: 0,
        totalOrders: 0,
        totalSavings: 0,
        nextRewardAt: 500,
        isAffiliate: false,
        affiliateCode: ''
      };
    }

    // Award points
    userProfiles[userId].points += basePoints;
    orders[orderIndex].pointsEarnedOnCompletion = basePoints;
    
    // Handle affiliate bonus if user was referred
    if (userProfiles[userId].referredBy) {
      const referrerId = userProfiles[userId].referredBy;
      if (userProfiles[referrerId] && userProfiles[referrerId].isAffiliate) {
        // Referrer gets 10% of order value as savings credit
        const affiliateBonus = Math.floor(order.totalPrice * 0.1);
        userProfiles[referrerId].totalSavings += affiliateBonus;
        
        console.log(`Affiliate bonus: ${affiliateBonus}€ awarded to ${referrerId} for order ${orderId}`);
      }
    }

    await kv.set('orders', orders);
    await kv.set('user_profiles', userProfiles);

    console.log(`Order ${orderId} completed, ${basePoints} points awarded to user ${userId}`);
    return c.json({ 
      success: true,
      pointsEarned: basePoints,
      totalPoints: userProfiles[userId].points
    });
  } catch (error) {
    console.log(`Error completing order: ${error}`);
    return c.json({ error: 'Erreur lors de la finalisation' }, 500);
  }
});

// Get user's orders with full details
app.get("/make-server-e87bab51/orders/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const orders = await kv.get('orders') || [];
    const userOrders = orders.filter((o: any) => o.userId === userId);
    
    // Sort by creation date, newest first
    userOrders.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(`[GET] User ${userId} orders: ${userOrders.length} found`);
    return c.json({ orders: userOrders });
  } catch (error) {
    console.log(`Error fetching user orders: ${error}`);
    return c.json({ error: 'Erreur lors de la récupération des commandes' }, 500);
  }
});

// Redeem points for discount
app.post("/make-server-e87bab51/user/:userId/redeem-points", async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();
    const { points } = body;

    const userProfiles = await kv.get('user_profiles') || {};
    
    if (!userProfiles[userId]) {
      return c.json({ error: 'Profil utilisateur non trouvé' }, 404);
    }

    if (userProfiles[userId].points < points) {
      return c.json({ error: 'Points insuffisants' }, 400);
    }

    // Convert points to savings (100 points = 10€)
    const savings = Math.floor(points / 100) * 10;
    
    userProfiles[userId].points -= points;
    userProfiles[userId].totalSavings += savings;
    
    await kv.set('user_profiles', userProfiles);

    console.log(`User ${userId} redeemed ${points} points for ${savings}€ discount`);
    return c.json({ 
      success: true,
      pointsRedeemed: points,
      savingsEarned: savings,
      remainingPoints: userProfiles[userId].points,
      totalSavings: userProfiles[userId].totalSavings
    });
  } catch (error) {
    console.log(`Error redeeming points: ${error}`);
    return c.json({ error: 'Erreur lors de l\'échange de points' }, 500);
  }
});

// Mount orders router
app.route('/make-server-e87bab51/orders', ordersRouter);

Deno.serve(app.fetch);