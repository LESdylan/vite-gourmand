import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  Users, Euro, Calendar, AlertTriangle, ShoppingCart, 
  ArrowLeft, Leaf, Clock, Info, ChevronRight,
  UtensilsCrossed, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const themeLabels = {
  noel: 'Noël',
  paques: 'Pâques',
  classique: 'Classique',
  evenement: 'Événement',
};

const regimeLabels = {
  classique: 'Classique',
  vegetarien: 'Végétarien',
  vegan: 'Vegan',
  sans_gluten: 'Sans gluten',
  halal: 'Halal',
};

const dishTypeLabels = {
  entree: 'Entrées',
  plat: 'Plats',
  dessert: 'Desserts',
};

export default function MenuDetail() {
  const [menu, setMenu] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const menuId = urlParams.get('id');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuData, allDishes] = await Promise.all([
          base44.entities.Menu.filter({ id: menuId }),
          base44.entities.Dish.list()
        ]);
        
        if (menuData.length > 0) {
          setMenu(menuData[0]);
          const menuDishes = allDishes.filter(d => d.menu_ids?.includes(menuId));
          setDishes(menuDishes);
        }

        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        } catch (e) {
          setUser(null);
        }
      } catch (e) {
        console.error('Erreur:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [menuId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">Menu non trouvé</h2>
          <Link to={createPageUrl('Menus')}>
            <Button>Retour aux menus</Button>
          </Link>
        </div>
      </div>
    );
  }

  const groupedDishes = dishes.reduce((acc, dish) => {
    if (!acc[dish.type]) acc[dish.type] = [];
    acc[dish.type].push(dish);
    return acc;
  }, {});

  const handleOrder = () => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl(`Order?menuId=${menu.id}`));
    } else {
      window.location.href = createPageUrl(`Order?menuId=${menu.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to={createPageUrl('Menus')}>
          <Button variant="ghost" className="text-[#722F37] hover:bg-[#722F37]/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux menus
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {menu.images && menu.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {menu.images.map((img, idx) => (
                    <CarouselItem key={idx}>
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                        <img 
                          src={img} 
                          alt={`${menu.title} - Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            ) : (
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
                <UtensilsCrossed className="w-20 h-20 text-gray-400" />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#722F37] text-white">{themeLabels[menu.theme]}</Badge>
              <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                <Leaf className="w-3 h-3 mr-1" />
                {regimeLabels[menu.regime]}
              </Badge>
              {menu.stock !== undefined && menu.stock <= 5 && (
                <Badge className="bg-orange-500 text-white">
                  Plus que {menu.stock} disponible{menu.stock > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-4">{menu.title}</h1>
              <p className="text-[#2C2C2C]/70 text-lg leading-relaxed">{menu.description}</p>
            </div>

            {/* Price & Persons */}
            <div className="flex flex-wrap gap-4">
              <Card className="flex-1 min-w-[140px]">
                <CardContent className="p-4 text-center">
                  <Euro className="w-6 h-6 mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-2xl font-bold text-[#722F37]">{menu.base_price}€</p>
                  <p className="text-xs text-gray-500">Prix de base</p>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[140px]">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-2xl font-bold text-[#722F37]">{menu.min_persons}</p>
                  <p className="text-xs text-gray-500">Personnes min.</p>
                </CardContent>
              </Card>
              {menu.advance_days && (
                <Card className="flex-1 min-w-[140px]">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto text-[#D4AF37] mb-2" />
                    <p className="text-2xl font-bold text-[#722F37]">{menu.advance_days}j</p>
                    <p className="text-xs text-gray-500">À l'avance</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Conditions - IMPORTANT */}
            {menu.conditions && (
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-800 mb-1">Conditions importantes</h3>
                      <p className="text-orange-700 text-sm">{menu.conditions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Button */}
            <Button 
              size="lg" 
              className="w-full bg-[#722F37] hover:bg-[#8B4049] text-white py-6 text-lg"
              onClick={handleOrder}
              disabled={menu.stock === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {menu.stock === 0 ? 'Stock épuisé' : 'Commander ce menu'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>

            {!user && (
              <p className="text-center text-sm text-[#2C2C2C]/60">
                <Info className="w-4 h-4 inline mr-1" />
                Vous devrez vous connecter pour commander
              </p>
            )}
          </motion.div>
        </div>

        {/* Dishes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-8 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-[#722F37]" />
            Composition du menu
          </h2>

          {['entree', 'plat', 'dessert'].map((type) => {
            const typeDishes = groupedDishes[type];
            if (!typeDishes || typeDishes.length === 0) return null;

            return (
              <div key={type} className="mb-10">
                <h3 className="text-lg font-semibold text-[#722F37] mb-4 pb-2 border-b border-[#722F37]/20">
                  {dishTypeLabels[type]}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeDishes.map((dish) => (
                    <Card key={dish.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {dish.image_url && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={dish.image_url} 
                                alt={dish.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#2C2C2C]">{dish.name}</h4>
                            {dish.description && (
                              <p className="text-sm text-[#2C2C2C]/60 mt-1 line-clamp-2">
                                {dish.description}
                              </p>
                            )}
                            {dish.allergens && dish.allergens.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {dish.allergens.map((a, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    {a}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(groupedDishes).length === 0 && (
            <p className="text-center text-[#2C2C2C]/60 py-8">
              La composition détaillée de ce menu sera bientôt disponible.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}