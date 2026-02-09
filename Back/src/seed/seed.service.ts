/**
 * Seed Service - Seeds database with menus using Unsplash images
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UnsplashService, UnsplashPhoto } from '../unsplash';

interface MenuData {
  title: string;
  description: string;
  person_min: number;
  price_per_person: number;
  query: string;
  diet?: string;
  theme?: string;
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private prisma: PrismaService,
    private unsplash: UnsplashService,
  ) {}

  async onModuleInit() {
    // Only seed in development if DB is empty
    const menuCount = await this.prisma.menu.count();
    if (menuCount === 0 && process.env.NODE_ENV === 'development') {
      this.logger.log('Database empty, seeding...');
    }
  }

  /**
   * Seed menus with Unsplash images
   */
  async seedMenusWithImages(): Promise<{ created: number; errors: number }> {
    const menus = this.getMenuData();
    let created = 0;
    let errors = 0;

    for (const menuData of menus) {
      try {
        await this.createMenuWithImage(menuData);
        created++;
        this.logger.log(`Created menu: ${menuData.title}`);
      } catch (error) {
        errors++;
        this.logger.error(`Failed to create menu: ${menuData.title}`, error);
      }
    }

    return { created, errors };
  }

  /**
   * Create a single menu with Unsplash image
   */
  private async createMenuWithImage(data: MenuData) {
    const photo = await this.fetchPhotoSafe(data.query);
    const dietId = data.diet ? await this.getDietId(data.diet) : null;
    const themeId = data.theme ? await this.getThemeId(data.theme) : null;

    const menu = await this.prisma.menu.create({
      data: {
        title: data.title,
        description: data.description,
        person_min: data.person_min,
        price_per_person: data.price_per_person,
        remaining_qty: Math.floor(Math.random() * 50) + 10,
        status: 'published',
        diet_id: dietId,
        theme_id: themeId,
        is_seasonal: Math.random() > 0.7,
        published_at: new Date(),
      },
    });

    if (photo) {
      await this.prisma.menuImage.create({
        data: {
          menu_id: menu.id,
          image_url: photo.urls.regular,
          alt_text: photo.alt_description || data.title,
          is_primary: true,
          display_order: 0,
        },
      });
    }

    return menu;
  }

  private async fetchPhotoSafe(query: string): Promise<UnsplashPhoto | null> {
    try {
      return await this.unsplash.getRandomPhoto(query);
    } catch {
      this.logger.warn(`Failed to fetch Unsplash photo for: ${query}`);
      return null;
    }
  }

  private async getDietId(name: string): Promise<number | null> {
    const diet = await this.prisma.diet.findFirst({ where: { name } });
    return diet?.id ?? null;
  }

  private async getThemeId(name: string): Promise<number | null> {
    const theme = await this.prisma.theme.findFirst({ where: { name } });
    return theme?.id ?? null;
  }

  private getMenuData(): MenuData[] {
    return [
      // French Cuisine
      {
        title: 'Coq au Vin',
        description: 'Classic French braised chicken',
        person_min: 2,
        price_per_person: 28.5,
        query: 'coq au vin chicken',
        theme: 'French',
      },
      {
        title: 'Boeuf Bourguignon',
        description: 'Burgundy beef stew',
        person_min: 2,
        price_per_person: 32.0,
        query: 'beef bourguignon stew',
        theme: 'French',
      },
      {
        title: 'Ratatouille Provençale',
        description: 'Fresh vegetable medley',
        person_min: 2,
        price_per_person: 18.0,
        query: 'ratatouille vegetables',
        diet: 'Vegetarian',
        theme: 'French',
      },
      {
        title: 'Duck Confit',
        description: 'Slow-cooked duck leg',
        person_min: 1,
        price_per_person: 35.0,
        query: 'duck confit crispy',
        theme: 'French',
      },
      {
        title: 'Bouillabaisse',
        description: 'Provençal fish stew',
        person_min: 2,
        price_per_person: 38.0,
        query: 'bouillabaisse seafood soup',
        theme: 'French',
      },
      // Italian Cuisine
      {
        title: 'Osso Buco',
        description: 'Braised veal shanks',
        person_min: 2,
        price_per_person: 34.0,
        query: 'osso buco veal',
        theme: 'Italian',
      },
      {
        title: 'Risotto ai Funghi',
        description: 'Creamy mushroom risotto',
        person_min: 2,
        price_per_person: 22.0,
        query: 'mushroom risotto',
        diet: 'Vegetarian',
        theme: 'Italian',
      },
      {
        title: 'Saltimbocca alla Romana',
        description: 'Veal with prosciutto',
        person_min: 2,
        price_per_person: 29.0,
        query: 'saltimbocca veal',
        theme: 'Italian',
      },
      {
        title: 'Lasagna Bolognese',
        description: 'Layered meat pasta',
        person_min: 4,
        price_per_person: 19.5,
        query: 'lasagna bolognese',
        theme: 'Italian',
      },
      {
        title: 'Gnocchi al Pesto',
        description: 'Potato dumplings with basil',
        person_min: 2,
        price_per_person: 18.0,
        query: 'gnocchi pesto',
        diet: 'Vegetarian',
        theme: 'Italian',
      },
      // Mediterranean
      {
        title: 'Grilled Sea Bass',
        description: 'Herb-crusted sea bass',
        person_min: 2,
        price_per_person: 36.0,
        query: 'grilled sea bass herbs',
        theme: 'Mediterranean',
      },
      {
        title: 'Lamb Tagine',
        description: 'Moroccan spiced lamb',
        person_min: 4,
        price_per_person: 26.0,
        query: 'lamb tagine moroccan',
        theme: 'Mediterranean',
      },
      {
        title: 'Greek Moussaka',
        description: 'Layered eggplant bake',
        person_min: 4,
        price_per_person: 21.0,
        query: 'moussaka greek',
        theme: 'Mediterranean',
      },
      {
        title: 'Falafel Platter',
        description: 'Crispy chickpea fritters',
        person_min: 2,
        price_per_person: 16.0,
        query: 'falafel platter',
        diet: 'Vegan',
        theme: 'Mediterranean',
      },
      {
        title: 'Grilled Octopus',
        description: 'Charred tender octopus',
        person_min: 2,
        price_per_person: 32.0,
        query: 'grilled octopus',
        theme: 'Mediterranean',
      },
      // Asian Fusion
      {
        title: 'Teriyaki Salmon',
        description: 'Glazed salmon fillet',
        person_min: 2,
        price_per_person: 28.0,
        query: 'teriyaki salmon',
        theme: 'Asian',
      },
      {
        title: 'Pad Thai',
        description: 'Thai rice noodles',
        person_min: 2,
        price_per_person: 17.0,
        query: 'pad thai noodles',
        theme: 'Asian',
      },
      {
        title: 'Korean BBQ Platter',
        description: 'Assorted grilled meats',
        person_min: 4,
        price_per_person: 30.0,
        query: 'korean bbq meat',
        theme: 'Asian',
      },
      {
        title: 'Vegetable Tempura',
        description: 'Crispy battered vegetables',
        person_min: 2,
        price_per_person: 15.0,
        query: 'vegetable tempura',
        diet: 'Vegetarian',
        theme: 'Asian',
      },
      {
        title: 'Pho Bo',
        description: 'Vietnamese beef noodle soup',
        person_min: 1,
        price_per_person: 16.0,
        query: 'pho vietnamese soup',
        theme: 'Asian',
      },
      // American/Modern
      {
        title: 'BBQ Ribs Platter',
        description: 'Slow-smoked pork ribs',
        person_min: 4,
        price_per_person: 25.0,
        query: 'bbq ribs smoky',
        theme: 'American',
      },
      {
        title: 'Surf and Turf',
        description: 'Steak with lobster tail',
        person_min: 2,
        price_per_person: 55.0,
        query: 'surf turf steak lobster',
        theme: 'American',
      },
      {
        title: 'Cajun Shrimp Boil',
        description: 'Spicy seafood feast',
        person_min: 4,
        price_per_person: 28.0,
        query: 'cajun shrimp boil',
        theme: 'American',
      },
      {
        title: 'Mac and Cheese Deluxe',
        description: 'Truffle mac and cheese',
        person_min: 2,
        price_per_person: 18.0,
        query: 'mac cheese truffle',
        diet: 'Vegetarian',
        theme: 'American',
      },
      {
        title: 'Fried Chicken Feast',
        description: 'Southern fried chicken',
        person_min: 4,
        price_per_person: 20.0,
        query: 'southern fried chicken',
        theme: 'American',
      },
      // Healthy Options
      {
        title: 'Buddha Bowl',
        description: 'Nourishing grain bowl',
        person_min: 1,
        price_per_person: 14.0,
        query: 'buddha bowl healthy',
        diet: 'Vegan',
      },
      {
        title: 'Grilled Chicken Salad',
        description: 'Fresh garden salad',
        person_min: 1,
        price_per_person: 16.0,
        query: 'grilled chicken salad',
      },
      {
        title: 'Quinoa Stuffed Peppers',
        description: 'Protein-rich peppers',
        person_min: 2,
        price_per_person: 17.0,
        query: 'stuffed peppers quinoa',
        diet: 'Vegan',
      },
      {
        title: 'Salmon Poke Bowl',
        description: 'Hawaiian-style fish bowl',
        person_min: 1,
        price_per_person: 19.0,
        query: 'salmon poke bowl',
      },
      {
        title: 'Mediterranean Platter',
        description: 'Hummus, falafel, salads',
        person_min: 2,
        price_per_person: 18.0,
        query: 'mediterranean platter hummus',
        diet: 'Vegetarian',
      },
      // Seasonal/Special
      {
        title: 'Truffle Risotto',
        description: 'Black truffle arborio',
        person_min: 2,
        price_per_person: 42.0,
        query: 'truffle risotto',
        diet: 'Vegetarian',
      },
      {
        title: 'Wagyu Beef Tasting',
        description: 'Premium beef selection',
        person_min: 2,
        price_per_person: 85.0,
        query: 'wagyu beef steak',
      },
      {
        title: 'Seafood Tower',
        description: 'Oysters, crab, lobster',
        person_min: 4,
        price_per_person: 65.0,
        query: 'seafood tower oyster',
      },
      {
        title: 'Tasting Menu Experience',
        description: '7-course chef selection',
        person_min: 2,
        price_per_person: 95.0,
        query: 'fine dining tasting menu',
      },
      {
        title: 'Sunday Roast',
        description: 'Traditional roast dinner',
        person_min: 4,
        price_per_person: 24.0,
        query: 'sunday roast dinner',
      },
    ];
  }
}
