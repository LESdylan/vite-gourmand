import { Users, Euro, Package, Info } from 'lucide-react';
import { Menu } from '../data/menus';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MenuCardProps {
  menu: Menu;
  onDetailClick: (menu: Menu) => void;
  view?: 'grid' | 'list';
}

export default function MenuCard({ menu, onDetailClick, view = 'grid' }: MenuCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

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

  if (view === 'list') {
    // Vue liste (type UberEats/Deliveroo sur mobile)
    return (
      <div
        className="flex gap-3 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
        onClick={() => onDetailClick(menu)}
      >
        {/* Image */}
        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
          <ImageWithFallback
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Titre */}
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-0.5">
            {menu.name}
          </h3>

          {/* Theme badge */}
          <div className="mb-1">
            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
              {menu.theme}
            </span>
          </div>

          {/* Description tronquée */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {menu.description}
          </p>

          {/* Footer info */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={14} />
                {menu.minPersons}+ pers.
              </span>
              {menu.stockQuantity <= 10 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Package size={14} />
                  {menu.stockQuantity} rest.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-600 text-sm">
                {menu.pricePerPerson.toFixed(2)}€
              </span>
              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors flex items-center gap-1">
                <Info size={12} />
                Détails
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue grille (desktop)
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-200">
        <ImageWithFallback
          src={menu.image}
          alt={menu.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Stock Warning Overlay */}
        {menu.stockQuantity <= 10 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <Package size={14} />
            {menu.stockQuantity} restants
          </div>
        )}

        {/* Theme Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-700 shadow-md">
          {menu.theme}
        </div>

        {/* Stock depleted */}
        {menu.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg">
              ÉPUISÉ
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Titre */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {menu.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
          {menu.description}
        </p>

        {/* Dietary Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {menu.dietary.slice(0, 3).map((diet) => (
            <span
              key={diet}
              className={`px-2 py-1 rounded-full text-xs font-medium ${getDietaryBadgeColor(diet)}`}
            >
              {diet}
            </span>
          ))}
          {menu.dietary.length > 3 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{menu.dietary.length - 3}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <Users size={16} />
            {menu.minPersons} - {menu.maxPersons} pers.
          </span>
          <span className="flex items-center gap-1 font-semibold text-blue-600">
            <Euro size={16} />
            {menu.pricePerPerson.toFixed(2)}€ / pers.
          </span>
        </div>

        {/* Button */}
        <button
          onClick={() => onDetailClick(menu)}
          disabled={menu.stockQuantity === 0}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            menu.stockQuantity === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {menu.stockQuantity === 0 ? 'Indisponible' : 'Voir les détails'}
        </button>
      </div>
    </div>
  );
}
