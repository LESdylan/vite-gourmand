import { X, Users, Euro, Package, AlertCircle, ShoppingCart, Clock } from 'lucide-react';
import { Menu } from '../data/menus';
import { getDishById } from '../data/dishes';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface MenuDetailModalProps {
  menu: Menu;
  onClose: () => void;
  onOrder?: (menu: Menu) => void;
}

export default function MenuDetailModal({ menu, onClose, onOrder }: MenuDetailModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getDietaryBadgeColor = (diet: string) => {
    const colors: Record<string, string> = {
      vegan: 'bg-green-100 text-green-800',
      végétarien: 'bg-emerald-100 text-emerald-800',
      'sans-gluten': 'bg-amber-100 text-amber-800',
      'sans-lactose': 'bg-purple-100 text-purple-800',
      halal: 'bg-blue-100 text-blue-800',
      casher: 'bg-indigo-100 text-indigo-800',
      bio: 'bg-lime-100 text-lime-800',
      classique: 'bg-gray-100 text-gray-800'
    };
    return colors[diet] || 'bg-gray-100 text-gray-800';
  };

  // Calculer le temps de préparation total
  const totalPrepTime = [
    ...menu.composition.entreeDishes,
    ...menu.composition.mainDishes,
    ...menu.composition.dessertDishes
  ].reduce((total, dishId) => {
    const dish = getDishById(dishId);
    return total + (dish?.preparationTime || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header Image */}
        <div className="relative h-64 md:h-80 bg-gray-200">
          <ImageWithFallback
            src={menu.image}
            alt={menu.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-colors z-10"
          >
            <X size={24} className="text-gray-900" />
          </button>

          {/* Theme Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="font-bold text-blue-700">{menu.theme}</span>
          </div>

          {/* Stock Warning */}
          {menu.stockQuantity <= 10 && (
            <div className="absolute bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Package size={18} />
              <span className="font-semibold">Plus que {menu.stockQuantity} disponibles</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Title and Price */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {menu.name}
              </h2>
              <p className="text-lg text-gray-600">
                {menu.description}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 text-center flex-shrink-0">
              <p className="text-4xl font-bold text-blue-600 mb-1">
                {menu.pricePerPerson.toFixed(2)}€
              </p>
              <p className="text-sm text-gray-600">par personne</p>
            </div>
          </div>

          {/* Dietary Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {menu.dietary.map((diet) => (
              <span
                key={diet}
                className={`px-4 py-2 rounded-full text-sm font-medium ${getDietaryBadgeColor(diet)}`}
              >
                {diet}
              </span>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 flex items-center gap-4">
              <Users size={32} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Personnes</p>
                <p className="text-lg font-bold text-blue-900">
                  {menu.minPersons} - {menu.maxPersons}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 flex items-center gap-4">
              <Package size={32} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-700 font-medium">Disponibles</p>
                <p className="text-lg font-bold text-green-900">
                  {menu.stockQuantity} menus
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 flex items-center gap-4">
              <Clock size={32} className="text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-purple-700 font-medium">Préparation</p>
                <p className="text-lg font-bold text-purple-900">
                  ~{Math.ceil(totalPrepTime / 60)}h
                </p>
              </div>
            </div>
          </div>

          {/* Composition du Menu */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Composition du menu
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Entrées */}
              {menu.composition.entreeDishes.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-blue-600 mb-4 pb-2 border-b-2 border-blue-200">
                    Entrées
                  </h4>
                  <div className="space-y-4">
                    {menu.composition.entreeDishes.map(dishId => {
                      const dish = getDishById(dishId);
                      if (!dish) return null;
                      return (
                        <div key={dishId} className="group">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {dish.name}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {dish.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {dish.portionSize}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Plats */}
              {menu.composition.mainDishes.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-green-600 mb-4 pb-2 border-b-2 border-green-200">
                    Plats principaux
                  </h4>
                  <div className="space-y-4">
                    {menu.composition.mainDishes.map(dishId => {
                      const dish = getDishById(dishId);
                      if (!dish) return null;
                      return (
                        <div key={dishId} className="group">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                {dish.name}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {dish.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {dish.portionSize}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Desserts */}
              {menu.composition.dessertDishes.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-purple-600 mb-4 pb-2 border-b-2 border-purple-200">
                    Desserts
                  </h4>
                  <div className="space-y-4">
                    {menu.composition.dessertDishes.map(dishId => {
                      const dish = getDishById(dishId);
                      if (!dish) return null;
                      return (
                        <div key={dishId} className="group">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {dish.name}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {dish.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {dish.portionSize}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Allergènes */}
          {menu.allergens.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 mb-2">Allergènes présents</p>
                  <p className="text-sm text-yellow-800">
                    {menu.allergens.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes de livraison */}
          {menu.deliveryNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <p className="font-bold text-blue-900 mb-2">Informations de livraison</p>
              <p className="text-sm text-blue-800">
                {menu.deliveryNotes}
              </p>
            </div>
          )}

          {/* Pricing Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="font-bold text-gray-900 mb-4">Détails tarifaires</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Prix par personne</span>
                <span className="font-semibold text-gray-900">{menu.pricePerPerson.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum {menu.minPersons} personnes</span>
                <span className="font-semibold text-gray-900">{(menu.pricePerPerson * menu.minPersons).toFixed(2)}€</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-green-700">
                  <span className="font-medium">Réduction 10% si {menu.minPersons + 5}+ personnes</span>
                  <span className="font-semibold">-10%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                * Frais de livraison : 5€ à Bordeaux, 5€ + 0,59€/km hors Bordeaux
              </div>
            </div>
          </div>

          {/* Order Button */}
          <button
            onClick={() => onOrder?.(menu)}
            disabled={menu.stockQuantity === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              menu.stockQuantity === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {menu.stockQuantity === 0 ? (
              <>
                <Package size={24} />
                Menu épuisé
              </>
            ) : (
              <>
                <ShoppingCart size={24} />
                Commander ce menu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
