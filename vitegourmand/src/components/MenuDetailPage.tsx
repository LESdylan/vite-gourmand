import React, { useState } from 'react';
import { ArrowLeft, Users, Euro, AlertCircle, Utensils, Info, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { getMenuById } from '../data/menus';
import { getDishById } from '../data/dishes';
import type { Page, User } from '../App';

type MenuDetailPageProps = {
  menuId: string;
  setCurrentPage: (page: Page) => void;
  user: User;
};

export default function MenuDetailPage({ menuId, setCurrentPage, user }: MenuDetailPageProps) {
  // Load menu from local data
  const menu = getMenuById(menuId);

  const handleOrderClick = () => {
    if (!user) {
      setCurrentPage({ type: 'login' });
      return;
    }
    setCurrentPage({ type: 'order', menuId: menu?.id });
  };

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu non trouvé</h2>
          <Button onClick={() => setCurrentPage({ type: 'menus' })}>
            Retour aux menus
          </Button>
        </div>
      </div>
    );
  }

  // Get all dishes from menu composition
  const entreeDishes = (menu.composition?.entreeDishes || []).map(id => getDishById(id)).filter(Boolean);
  const mainDishes = (menu.composition?.mainDishes || []).map(id => getDishById(id)).filter(Boolean);
  const dessertDishes = (menu.composition?.dessertDishes || []).map(id => getDishById(id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          onClick={() => setCurrentPage({ type: 'menus' })}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux menus
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {menu.image && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative h-96">
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Title and Description */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-4">{menu.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-base">{menu.theme}</Badge>
                      {menu.dietary && menu.dietary.map(diet => (
                        <Badge key={diet} variant="outline" className="text-base capitalize">{diet}</Badge>
                      ))}
                      {menu.stockQuantity <= 5 && menu.stockQuantity > 0 && (
                        <Badge variant="destructive">
                          {menu.stockQuantity} restant{menu.stockQuantity !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">{menu.description}</p>
              </CardContent>
            </Card>

            {/* Dishes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-orange-600" />
                  Composition du menu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {entreeDishes.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">Entrées</h3>
                    <div className="space-y-2">
                      {entreeDishes.map((dish: any) => (
                        <div key={dish.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{dish.name}</p>
                            {dish.description && (
                              <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                            )}
                            {dish.allergens && dish.allergens.length > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Allergènes: {dish.allergens.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mainDishes.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">Plats principaux</h3>
                    <div className="space-y-2">
                      {mainDishes.map((dish: any) => (
                        <div key={dish.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{dish.name}</p>
                            {dish.description && (
                              <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                            )}
                            {dish.allergens && dish.allergens.length > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Allergènes: {dish.allergens.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dessertDishes.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">Desserts</h3>
                    <div className="space-y-2">
                      {dessertDishes.map((dish: any) => (
                        <div key={dish.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{dish.name}</p>
                            {dish.description && (
                              <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                            )}
                            {dish.allergens && dish.allergens.length > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Allergènes: {dish.allergens.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {menu.allergens && menu.allergens.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Allergènes présents dans ce menu:</strong> {menu.allergens.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Delivery Notes */}
            {menu.deliveryNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-orange-600" />
                    Informations de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{menu.deliveryNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <Card className="border-2 border-orange-600">
                <CardHeader>
                  <CardTitle className="text-2xl">Tarification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-700">Prix par personne</span>
                    <span className="text-3xl font-bold text-orange-600">
                      {menu.pricePerPerson.toFixed(2)}€
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center text-gray-700 mb-2">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Minimum: {menu.minPersons} personnes</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Maximum: {menu.maxPersons} personnes</span>
                    </div>
                  </div>

                  {menu.stockQuantity > 0 ? (
                    <Button 
                      onClick={handleOrderClick}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      size="lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Commander ce menu
                    </Button>
                  ) : (
                    <Button disabled className="w-full" size="lg">
                      Rupture de stock
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations pratiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                    <p className="text-gray-700">
                      Commande à passer au moins 48h à l'avance
                    </p>
                  </div>
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                    <p className="text-gray-700">
                      Livraison possible dans un rayon de 50km autour de Bordeaux
                    </p>
                  </div>
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                    <p className="text-gray-700">
                      Possibilité d'adapter le menu selon vos besoins (nous contacter)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
