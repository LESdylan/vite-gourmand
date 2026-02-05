import { useState, useMemo } from 'react';
import { Search, Filter, X, SlidersHorizontal, Grid3x3, List, ChevronDown } from 'lucide-react';
import { menus, getAllThemes, getMenusByTheme, getMenusByDietary, getMenusByPriceRange, getMenuById } from '../data/menus';
import { DietaryType } from '../data/dishes';
import MenuCard from './MenuCard';
import MenuDetailModal from './MenuDetailModal';
import type { Menu } from '../data/menus';

interface MenuCatalogProps {
  onMenuOrder: (menu: Menu) => void;
}

export default function MenuCatalog({ onMenuOrder }: MenuCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<DietaryType[]>([]);
  const [minPersons, setMinPersons] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const themes = getAllThemes();
  const dietaryOptions: DietaryType[] = ['classique', 'végétarien', 'vegan', 'sans-gluten', 'sans-lactose', 'halal', 'casher', 'bio'];

  // Filtrage des menus
  const filteredMenus = useMemo(() => {
    return menus.filter(menu => {
      // Recherche par nom ou description
      const matchesSearch = searchQuery === '' || 
        menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menu.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre par thème
      const matchesTheme = selectedThemes.length === 0 || 
        selectedThemes.includes(menu.theme);

      // Filtre par régime alimentaire
      const matchesDietary = selectedDietary.length === 0 ||
        selectedDietary.some(diet => menu.dietary.includes(diet));

      // Filtre par nombre de personnes
      const matchesPersons = minPersons === 0 || menu.minPersons <= minPersons;

      // Filtre par prix
      const matchesPrice = menu.pricePerPerson <= maxPrice;

      // Stock disponible
      const inStock = menu.stockQuantity > 0;

      return matchesSearch && matchesTheme && matchesDietary && matchesPersons && matchesPrice && inStock;
    });
  }, [searchQuery, selectedThemes, selectedDietary, minPersons, maxPrice]);

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const toggleDietary = (dietary: DietaryType) => {
    setSelectedDietary(prev =>
      prev.includes(dietary) ? prev.filter(d => d !== dietary) : [...prev, dietary]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedThemes([]);
    setSelectedDietary([]);
    setMinPersons(0);
    setMaxPrice(200);
  };

  const activeFiltersCount = selectedThemes.length + selectedDietary.length + 
    (minPersons > 0 ? 1 : 0) + (maxPrice < 200 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nos Menus
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez notre sélection de {menus.length} menus pour tous vos événements
          </p>
        </div>

        {/* Search and View Mode */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal size={20} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 rounded-full text-sm font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid3x3 size={20} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List size={20} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter size={24} />
                Filtres avancés
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <X size={16} />
                Réinitialiser
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thèmes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Thématiques
                </label>
                <div className="flex flex-wrap gap-2">
                  {themes.map(theme => (
                    <button
                      key={theme}
                      onClick={() => toggleTheme(theme)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedThemes.includes(theme)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Régimes alimentaires */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Régimes alimentaires
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(dietary => (
                    <button
                      key={dietary}
                      onClick={() => toggleDietary(dietary)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedDietary.includes(dietary)
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dietary}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de personnes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Nombre minimum de personnes : {minPersons > 0 ? minPersons : 'Tous'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minPersons}
                  onChange={(e) => setMinPersons(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tous</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Prix maximum */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Prix maximum par personne : {maxPrice}€
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0€</span>
                  <span>100€</span>
                  <span>200€</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-gray-900">{filteredMenus.length}</span> menu{filteredMenus.length > 1 ? 's' : ''} trouvé{filteredMenus.length > 1 ? 's' : ''}
          </p>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedThemes.map(theme => (
                <span key={theme} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                  {theme}
                  <button onClick={() => toggleTheme(theme)} className="hover:text-blue-900">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {selectedDietary.map(dietary => (
                <span key={dietary} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                  {dietary}
                  <button onClick={() => toggleDietary(dietary)} className="hover:text-green-900">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Menu Grid/List */}
        {filteredMenus.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-3'
          }>
            {filteredMenus.map(menu => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onDetailClick={setSelectedMenu}
                view={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucun menu trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez d'ajuster vos filtres de recherche
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Menu Detail Modal */}
      {selectedMenu && (
        <MenuDetailModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
          onOrder={onMenuOrder}
        />
      )}
    </div>
  );
}
